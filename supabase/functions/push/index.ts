import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface PushBody {
  raw: string;
  sender: string;
}

interface ParsedTx {
  trade_date: string;   // YYYY-MM-DD
  trade_time: string;   // HH:MM
  amount: number;       // 양수=입금, 음수=출금
  balance: number;
  counterpart: string;
}

/** 카카오뱅크 7줄 포맷 파싱 */
function parse(raw: string): ParsedTx | null {
  const lines = raw.trim().split("\n").map((l) => l.trim());
  // 최소 7줄 필요
  if (lines.length < 7) return null;

  // 4번째 줄: "MM/DD HH:MM"
  const dateTimeMatch = lines[3].match(/^(\d{2})\/(\d{2})\s+(\d{2}:\d{2})/);
  if (!dateTimeMatch) return null;
  const [, mm, dd, time] = dateTimeMatch;
  const year = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric" }).slice(0, 4);
  const trade_date = `${year}-${mm}-${dd}`;
  const trade_time = time;

  // 5번째 줄: "입금 1,234원" 또는 "출금 1,234원"
  const txMatch = lines[4].match(/^(입금|출금)\s*([\d,]+)원/);
  if (!txMatch) return null;
  const isDeposit = txMatch[1] === "입금";
  const rawAmount = parseInt(txMatch[2].replace(/,/g, ""), 10);
  const amount = isDeposit ? rawAmount : -rawAmount;

  // 7번째 줄: "잔액 -1,234,567원" (음수 가능)
  const balMatch = lines[6].match(/잔액\s*([-\d,]+)원/);
  if (!balMatch) return null;
  const balance = parseInt(balMatch[1].replace(/,/g, ""), 10);

  // 6번째 줄: 상대방 이름
  const counterpart = lines[5] || "";

  return { trade_date, trade_time, amount, balance, counterpart };
}

/** 현재 연도 KST 기준 week_label 계산 */
function calcWeekLabel(tradeDateStr: string, weekStartDay: number): string {
  const d = new Date(tradeDateStr + "T00:00:00+09:00");
  const wd = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=월,6=일
  const diff = (wd - weekStartDay + 7) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  const yr = monday.getFullYear();
  // ISO week number of that Monday
  const jan1 = new Date(yr, 0, 1);
  const weekNum = Math.ceil(((monday.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const startDayName = dayNames[weekStartDay];
  return `${yr}-W${String(weekNum).padStart(2, "0")}-${startDayName}`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: PushBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { raw, sender } = body;
  if (!raw || !sender) {
    return new Response(JSON.stringify({ error: "raw and sender are required" }), { status: 400 });
  }

  // sender(username) → user_id + account_id 조회
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", sender)
    .maybeSingle();

  if (profileErr || !profile) {
    return new Response(JSON.stringify({ error: "sender not found" }), { status: 401 });
  }
  const { user_id } = profile;

  const { data: account, error: accErr } = await supabase
    .from("accounts")
    .select("id, week_start_day")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (accErr || !account) {
    return new Response(JSON.stringify({ error: "account not found" }), { status: 404 });
  }
  const account_id = account.id;
  const week_start_day: number = account.week_start_day ?? 0;

  // 파싱
  const parsed = parse(raw);

  if (!parsed) {
    // 파싱 실패 — raw 원문 저장
    const today = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }).slice(0, 10).replace(/\. /g, "-").replace(".", "");
    await supabase.from("transactions").insert({
      account_id,
      user_id,
      trade_date: today,
      trade_time: "00:00",
      amount: 0,
      balance: 0,
      counterpart: "",
      description: "",
      raw,
      week_label: "",
      is_confirmed: 0,
      source: "parse_failed",
    }).on("conflict", "do-nothing");
    return new Response(JSON.stringify({ ok: false, reason: "parse_failed" }), { status: 200 });
  }

  const { trade_date, trade_time, amount, balance, counterpart } = parsed;
  const week_label = calcWeekLabel(trade_date, week_start_day);

  // 잔액 불일치 감지: 마지막 거래의 잔액과 비교
  const { data: lastTx } = await supabase
    .from("transactions")
    .select("balance, trade_date, trade_time")
    .eq("account_id", account_id)
    .eq("source", "push")
    .order("trade_date", { ascending: false })
    .order("trade_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastTx) {
    const expectedBalance = lastTx.balance + amount;
    if (Math.abs(expectedBalance - balance) > 0) {
      // 불일치 — 미확인 내역 생성 (금액: 실제잔액 - 예상잔액)
      const gap = balance - expectedBalance;
      const unconfirmedWeekLabel = calcWeekLabel(trade_date, week_start_day);
      await supabase.from("transactions").insert({
        account_id,
        user_id,
        trade_date,
        trade_time: trade_time.replace(":", "") + "00", // 같은 시각 앞에 삽입용 임시 처리
        amount: gap,
        balance: expectedBalance + gap,
        counterpart: "미확인 내역",
        description: "잔액 불일치 — 자동 생성",
        raw: null,
        week_label: unconfirmedWeekLabel,
        is_confirmed: 0,
        source: "unconfirmed",
      });
    }
  }

  // 본 거래 INSERT (UNIQUE 충돌 시 DO NOTHING)
  const { error: insertErr } = await supabase.from("transactions").insert({
    account_id,
    user_id,
    trade_date,
    trade_time,
    amount,
    balance,
    counterpart,
    description: counterpart,
    raw,
    week_label,
    is_confirmed: 1,
    source: "push",
  });

  if (insertErr && insertErr.code !== "23505") {
    return new Response(JSON.stringify({ error: insertErr.message }), { status: 500 });
  }

  const skipped = insertErr?.code === "23505";
  return new Response(JSON.stringify({ ok: true, skipped }), { status: 200 });
});
