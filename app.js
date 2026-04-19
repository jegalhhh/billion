import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Supabase 클라이언트 ────────────────────────────────────────────────────
// .env.local 값을 직접 여기에 붙여넣으세요 (Vercel은 환경변수로 자동 주입)
const SUPABASE_URL = window.__SUPABASE_URL__ || "https://mpeabikmyzheqlqrpgze.supabase.co";
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZWFiaWtteXpoZXFscXJwZ3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTAxNjQsImV4cCI6MjA5MjE2NjE2NH0.qRLrThtQlAdG03fd1xNf5Ww45NYlqWgR__b0z6t5gsI";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── KST 유틸 ──────────────────────────────────────────────────────────────
function todayKST() {
  return new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, "-").replace(".", "");
}

function nowTimeKST() {
  return new Date().toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export function calcWeekLabel(dateStr, weekStartDay) {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const wd = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const diff = (wd - weekStartDay + 7) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  const yr = start.getFullYear();
  const jan1 = new Date(yr, 0, 1);
  const weekNum = Math.ceil(
    ((start - jan1) / 86400000 + jan1.getDay() + 1) / 7
  );
  const dayNames = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  return `${yr}-W${String(weekNum).padStart(2,"0")}-${dayNames[weekStartDay]}`;
}

function weekDateRange(weekStartDay, offset = 0) {
  const todayStr = todayKST();
  const today = new Date(todayStr + "T00:00:00+09:00");
  const wd = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const diff = (wd - weekStartDay + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - diff + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) =>
    `${String(d.getMonth() + 1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return { startStr: fmt(start), endStr: fmt(end), startISO: toISO(start), endISO: toISO(end) };
}

function dailyHint(savings, weekGoal, weekEndISO, weekStartDay) {
  const today = new Date(todayKST() + "T00:00:00+09:00");
  const end = new Date(weekEndISO + "T00:00:00+09:00");
  const remaining = Math.max(Math.floor((end - today) / 86400000) + 1, 1);
  const needed = weekGoal - savings;
  if (needed <= 0) {
    return { achieved: true, remainingDays: remaining, dailySpendable: Math.floor(-needed / remaining) };
  }
  return { achieved: false, remainingDays: remaining, dailyAmount: Math.ceil(needed / remaining) };
}

function fmt(n) {
  return Number(n).toLocaleString("ko-KR") + "원";
}

// ── 상태 ──────────────────────────────────────────────────────────────────
let currentUser = null;
let currentAccount = null;
let weekOffset = 0;
let realtimeSub = null;
let isSignUp = false;

// ── 인증 ──────────────────────────────────────────────────────────────────
sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    showDashboard();
  } else {
    currentUser = null;
    showAuth();
  }
});

window.handleAuth = async function () {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errEl = document.getElementById("auth-error");
  const infoEl = document.getElementById("auth-info");
  errEl.classList.add("hidden");
  infoEl.classList.add("hidden");

  if (isSignUp) {
    const username = document.getElementById("auth-username").value.trim();
    if (!username) { showAuthError("아이디를 입력해주세요."); return; }
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) { showAuthError(error.message); return; }
    // profiles 삽입
    await sb.from("profiles").insert({ user_id: data.user.id, username });
    infoEl.textContent = "가입 확인 이메일을 보냈어요. 확인 후 로그인하세요.";
    infoEl.classList.remove("hidden");
  } else {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) { showAuthError("이메일 또는 비밀번호가 올바르지 않아요."); }
  }
};

window.toggleMode = function () {
  isSignUp = !isSignUp;
  document.getElementById("toggle-label").textContent = isSignUp ? "로그인으로 돌아가기" : "회원가입";
  document.getElementById("auth-submit").textContent = isSignUp ? "회원가입" : "로그인";
  document.getElementById("auth-signup-extra").classList.toggle("hidden", !isSignUp);
};

window.forgotPassword = async function () {
  const email = document.getElementById("auth-email").value.trim();
  if (!email) { showAuthError("이메일을 먼저 입력해주세요."); return; }
  await sb.auth.resetPasswordForEmail(email);
  const infoEl = document.getElementById("auth-info");
  infoEl.textContent = "비밀번호 재설정 이메일을 보냈어요.";
  infoEl.classList.remove("hidden");
};

window.signOut = async function () {
  await sb.auth.signOut();
};

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ── 화면 전환 ──────────────────────────────────────────────────────────────
function showAuth() {
  document.getElementById("auth-screen").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("bottom-bar").classList.add("hidden");
  if (realtimeSub) { sb.removeChannel(realtimeSub); realtimeSub = null; }
}

async function showDashboard() {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("bottom-bar").classList.remove("hidden");

  await loadAccount();
  if (!currentAccount) {
    window.location.href = "setup.html";
    return;
  }
  await renderDashboard();
  subscribeRealtime();
}

// ── 계좌 로드 ──────────────────────────────────────────────────────────────
async function loadAccount() {
  const { data } = await sb
    .from("accounts")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  currentAccount = data;
}

// ── 대시보드 렌더링 ────────────────────────────────────────────────────────
async function renderDashboard() {
  if (!currentAccount) return;
  const acc = currentAccount;
  const { startStr, endStr, startISO, endISO } = weekDateRange(acc.week_start_day, weekOffset);
  const weekLabel = calcWeekLabel(startISO, acc.week_start_day);
  const isCurrentWeek = weekOffset === 0;

  // 주간 네비
  document.getElementById("week-range").textContent = `${startStr} ~ ${endStr}`;
  document.getElementById("week-label-text").textContent = isCurrentWeek ? "이번 주" : `${-weekOffset}주 전`;
  document.getElementById("next-week-btn").style.opacity = isCurrentWeek ? "0.3" : "1";
  document.getElementById("next-week-btn").style.pointerEvents = isCurrentWeek ? "none" : "auto";
  document.getElementById("tx-list-title").textContent = `${startStr} ~ ${endStr} 거래 내역`;

  // 거래 내역 조회
  const { data: txs } = await sb
    .from("transactions")
    .select("*")
    .eq("account_id", acc.id)
    .gte("trade_date", startISO)
    .lte("trade_date", endISO)
    .order("trade_date", { ascending: false })
    .order("trade_time", { ascending: false });

  // 집계
  let income = 0, expense = 0;
  for (const tx of (txs || [])) {
    if (tx.is_confirmed === 0) continue;
    if (tx.amount > 0) income += tx.amount;
    else expense += Math.abs(tx.amount);
  }
  const savings = income - expense;

  // 최신 잔액
  const { data: lastTx } = await sb
    .from("transactions")
    .select("balance")
    .eq("account_id", acc.id)
    .eq("is_confirmed", 1)
    .order("trade_date", { ascending: false })
    .order("trade_time", { ascending: false })
    .limit(1)
    .maybeSingle();
  const currentBalance = lastTx?.balance ?? acc.initial_balance;

  // 최종 목표 진척도
  const finalRate = acc.final_goal_amount > 0
    ? Math.min(Math.round(currentBalance / acc.final_goal_amount * 100), 100) : 0;
  document.getElementById("final-goal-text").textContent =
    `${fmt(currentBalance)} / ${fmt(acc.final_goal_amount)} (${finalRate}%)`;
  document.getElementById("final-bar").style.width = `${finalRate}%`;

  // 주간 저축
  const goal = acc.week_goal_amount;
  const rate = goal > 0 ? Math.min(Math.round(savings / goal * 100), 100) : 0;
  const barEl = document.getElementById("week-bar");
  barEl.style.width = `${rate}%`;
  barEl.className = `progress-bar ${rate >= 100 ? "bg-emerald-500" : rate >= 50 ? "bg-sky-500" : "bg-amber-400"}`;

  document.getElementById("week-savings").textContent = fmt(savings);
  document.getElementById("week-savings").className =
    `text-2xl font-bold ${savings >= 0 ? "text-sky-600" : "text-red-500"}`;
  document.getElementById("week-goal-text").textContent = fmt(goal);
  document.getElementById("week-rate").textContent = `${rate}%`;
  document.getElementById("week-rate").className =
    `text-sm font-bold ${rate >= 100 ? "text-emerald-600" : rate >= 50 ? "text-sky-600" : "text-amber-500"}`;
  document.getElementById("week-income").textContent = `+${fmt(income)}`;
  document.getElementById("week-expense").textContent = `-${fmt(expense)}`;

  // 일일 힌트
  const hintEl = document.getElementById("hint-card");
  if (isCurrentWeek) {
    const hint = dailyHint(savings, goal, endISO, acc.week_start_day);
    if (hint.achieved) {
      hintEl.innerHTML = `
        <div class="banner banner-success">
          <span class="text-2xl">🎉</span>
          <div>
            <p class="text-xs font-semibold text-emerald-700">이번 주 목표 달성!</p>
            ${hint.dailySpendable > 0
              ? `<p class="text-sm font-bold text-emerald-700">하루 ${fmt(hint.dailySpendable)}까지 써도 돼요</p>
                 <p class="text-xs text-emerald-500 mt-0.5">남은 ${hint.remainingDays}일 기준</p>`
              : `<p class="text-sm text-emerald-700">남은 ${hint.remainingDays}일도 아껴써요</p>`}
          </div>
        </div>`;
    } else {
      hintEl.innerHTML = `
        <div class="banner banner-warn">
          <span class="text-2xl">📊</span>
          <div>
            <p class="text-xs text-amber-600">남은 ${hint.remainingDays}일 동안 하루 평균</p>
            <p class="text-base font-bold text-amber-800">${fmt(hint.dailyAmount)} 저축</p>
            <p class="text-xs text-amber-500 mt-0.5">하면 이번 주 목표를 달성할 수 있어요</p>
          </div>
        </div>`;
    }
    hintEl.classList.remove("hidden");
  } else {
    hintEl.classList.add("hidden");
  }

  // 잔액 불일치 경고
  const hasUnconfirmed = txs?.some((t) => t.source === "unconfirmed");
  document.getElementById("balance-warn").classList.toggle("hidden", !hasUnconfirmed);

  // 거래 목록 렌더링
  renderTxList(txs || []);
}

function renderTxList(txs) {
  const ul = document.getElementById("tx-list");
  if (!txs.length) {
    ul.innerHTML = `<li class="py-12 text-center">
      <p class="text-4xl mb-3">📭</p>
      <p class="text-sm text-slate-400">거래 내역이 없어요</p>
    </li>`;
    return;
  }
  ul.innerHTML = txs.map((tx) => {
    const isUnconfirmed = tx.is_confirmed === 0;
    const sign = tx.amount >= 0 ? "+" : "";
    return `<li class="tx-item${isUnconfirmed ? " unconfirmed" : ""}"
                onclick="${isUnconfirmed ? `openUnconfirmed('${tx.id}', ${Math.abs(tx.amount)}, '${tx.counterpart}', '${tx.trade_date}', '${tx.trade_time}', ${tx.amount > 0 ? 1 : -1})` : ""}">
      <div class="min-w-0 mr-3">
        <p class="text-sm font-medium text-slate-800 truncate">
          ${isUnconfirmed ? "⚠️ " : ""}${tx.counterpart || tx.description || "—"}
        </p>
        <p class="tx-meta">${tx.trade_date} ${tx.trade_time?.slice(0,5) || ""}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="tx-amount ${tx.amount >= 0 ? "pos" : "neg"}">${sign}${fmt(tx.amount)}</p>
        <p class="tx-balance">잔액 ${fmt(tx.balance)}</p>
      </div>
    </li>`;
  }).join("");
}

// ── 주간 네비 ──────────────────────────────────────────────────────────────
window.prevWeek = function () { weekOffset--; renderDashboard(); };
window.nextWeek = function () { if (weekOffset < 0) { weekOffset++; renderDashboard(); } };

// ── Realtime ──────────────────────────────────────────────────────────────
function subscribeRealtime() {
  if (!currentUser || !currentAccount) return;
  realtimeSub = sb
    .channel("transactions-" + currentUser.id)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "transactions",
      filter: `user_id=eq.${currentUser.id}`,
    }, () => { renderDashboard(); })
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "transactions",
      filter: `user_id=eq.${currentUser.id}`,
    }, () => { renderDashboard(); })
    .subscribe();
}

// ── 미확인 내역 수정 ────────────────────────────────────────────────────────
window.openUnconfirmed = function (id, absAmount, counterpart, date, time, typeSign) {
  document.getElementById("uc-id").value = id;
  document.getElementById("uc-amount").value = absAmount;
  document.getElementById("uc-counterpart").value = counterpart;
  document.getElementById("uc-date").value = date;
  document.getElementById("uc-time").value = time;
  document.getElementById("uc-type").value = typeSign > 0 ? "1" : "-1";
  document.getElementById("modal-unconfirmed").classList.remove("hidden");
};

window.closeUnconfirmed = function (e) {
  if (e.target.id === "modal-unconfirmed") document.getElementById("modal-unconfirmed").classList.add("hidden");
};

window.confirmUnconfirmed = async function () {
  const id = document.getElementById("uc-id").value;
  const typeSign = parseInt(document.getElementById("uc-type").value);
  const absAmount = parseInt(document.getElementById("uc-amount").value);
  const counterpart = document.getElementById("uc-counterpart").value;
  const date = document.getElementById("uc-date").value;
  const time = document.getElementById("uc-time").value;
  const weekLabel = calcWeekLabel(date, currentAccount.week_start_day);

  await sb.from("transactions").update({
    amount: typeSign * absAmount,
    counterpart,
    description: counterpart,
    trade_date: date,
    trade_time: time,
    week_label: weekLabel,
    is_confirmed: 1,
    source: "manual",
  }).eq("id", id);

  document.getElementById("modal-unconfirmed").classList.add("hidden");
  renderDashboard();
};

// ── 수동 거래 입력 ──────────────────────────────────────────────────────────
window.openManual = function () {
  const today = todayKST();
  const nowTime = nowTimeKST();
  document.getElementById("manual-date").value = today;
  document.getElementById("manual-time").value = nowTime;
  document.getElementById("manual-amount").value = "";
  document.getElementById("manual-counterpart").value = "";
  document.getElementById("manual-balance").value = "";
  document.getElementById("modal-manual").classList.remove("hidden");
};

window.closeManual = function (e) {
  if (e.target.id === "modal-manual") document.getElementById("modal-manual").classList.add("hidden");
};

window.submitManual = async function () {
  const typeSign = parseInt(document.getElementById("manual-type").value);
  const absAmount = parseInt(document.getElementById("manual-amount").value);
  const counterpart = document.getElementById("manual-counterpart").value || "";
  const date = document.getElementById("manual-date").value;
  const time = document.getElementById("manual-time").value;
  const balanceInput = document.getElementById("manual-balance").value;

  if (!absAmount || !date || !time) return;

  // 잔액: 직접 입력 없으면 마지막 잔액 + 금액
  let balance = balanceInput ? parseInt(balanceInput) : null;
  if (balance === null) {
    const { data: lastTx } = await sb
      .from("transactions").select("balance")
      .eq("account_id", currentAccount.id)
      .order("trade_date", { ascending: false })
      .order("trade_time", { ascending: false })
      .limit(1).maybeSingle();
    balance = (lastTx?.balance ?? currentAccount.initial_balance) + typeSign * absAmount;
  }

  const weekLabel = calcWeekLabel(date, currentAccount.week_start_day);

  await sb.from("transactions").insert({
    account_id: currentAccount.id,
    user_id: currentUser.id,
    trade_date: date,
    trade_time: time,
    amount: typeSign * absAmount,
    balance,
    counterpart,
    description: counterpart,
    raw: null,
    week_label: weekLabel,
    is_confirmed: 1,
    source: "manual",
  });

  document.getElementById("modal-manual").classList.add("hidden");
  renderDashboard();
};

// ── setup.html 전용 ────────────────────────────────────────────────────────
export async function initSetup() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = "index.html"; return; }
  currentUser = session.user;

  const { data: acc } = await sb
    .from("accounts").select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();

  if (acc) {
    document.getElementById("bank-code").value = acc.bank_code;
    document.getElementById("alias").value = acc.alias;
    document.getElementById("initial-balance").value = acc.initial_balance;
    document.getElementById("final-goal").value = acc.final_goal_amount;
    document.getElementById("week-goal").value = acc.week_goal_amount;
    document.getElementById("week-start-day").value = acc.week_start_day;
  }

  const { data: profile } = await sb
    .from("profiles").select("username")
    .eq("user_id", currentUser.id).maybeSingle();
  if (profile) document.getElementById("setup-username").value = profile.username;
}

export async function saveSetup() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  currentUser = session.user;

  const bankCode = document.getElementById("bank-code").value;
  const alias = document.getElementById("alias").value.trim();
  const initialBalance = parseInt(document.getElementById("initial-balance").value) || 0;
  const finalGoal = parseInt(document.getElementById("final-goal").value) || 0;
  const weekGoal = parseInt(document.getElementById("week-goal").value) || 0;
  const weekStartDay = parseInt(document.getElementById("week-start-day").value);
  const username = document.getElementById("setup-username").value.trim();
  const errEl = document.getElementById("setup-error");
  const succEl = document.getElementById("setup-success");
  errEl.classList.add("hidden");
  succEl.classList.add("hidden");

  // 계좌 upsert
  const { data: existing } = await sb
    .from("accounts").select("id")
    .eq("user_id", currentUser.id).limit(1).maybeSingle();

  if (existing) {
    await sb.from("accounts").update({
      bank_code: bankCode, alias, initial_balance: initialBalance,
      final_goal_amount: finalGoal, week_goal_amount: weekGoal, week_start_day: weekStartDay,
    }).eq("id", existing.id);
  } else {
    await sb.from("accounts").insert({
      user_id: currentUser.id, bank_code: bankCode, alias,
      initial_balance: initialBalance, final_goal_amount: finalGoal,
      week_goal_amount: weekGoal, week_start_day: weekStartDay,
    });
  }

  // username upsert
  if (username) {
    const { data: prof } = await sb
      .from("profiles").select("user_id").eq("user_id", currentUser.id).maybeSingle();
    if (prof) {
      await sb.from("profiles").update({ username }).eq("user_id", currentUser.id);
    } else {
      const { error } = await sb.from("profiles").insert({ user_id: currentUser.id, username });
      if (error) {
        errEl.textContent = "아이디가 이미 사용 중이에요.";
        errEl.classList.remove("hidden");
        return;
      }
    }
  }

  succEl.textContent = "저장되었어요!";
  succEl.classList.remove("hidden");
  setTimeout(() => { window.location.href = "index.html"; }, 800);
}
