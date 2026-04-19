-- ── accounts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_code         TEXT NOT NULL DEFAULT 'KAKAO',
  alias             TEXT NOT NULL DEFAULT '',
  initial_balance   INTEGER NOT NULL DEFAULT 0,
  final_goal_amount INTEGER NOT NULL DEFAULT 0,
  week_goal_amount  INTEGER NOT NULL DEFAULT 0,
  week_start_day    INTEGER NOT NULL DEFAULT 0, -- 0=월, 6=일
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts: 본인만 조회" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "accounts: 본인만 삽입" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts: 본인만 수정" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- ── transactions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_date   DATE NOT NULL,
  trade_time   TEXT NOT NULL,
  amount       INTEGER NOT NULL,       -- 양수=입금, 음수=출금
  balance      INTEGER NOT NULL,       -- 거래 후 잔액 (마이너스 통장 음수 가능)
  counterpart  TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  raw          TEXT,                   -- 푸시 원문 전체
  week_label   TEXT NOT NULL DEFAULT '',
  is_confirmed INTEGER NOT NULL DEFAULT 1, -- 0: 미확인, 1: 확인됨
  source       TEXT NOT NULL DEFAULT 'push', -- push | manual | unconfirmed | parse_failed
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (account_id, trade_date, trade_time, amount)
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions: 본인만 조회" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions: 본인만 삽입" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions: 본인만 수정" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Edge Function (service_role)이 sender→user_id 조회 시 RLS 우회 가능하도록
-- (Edge Function은 SUPABASE_SERVICE_ROLE_KEY를 사용하므로 RLS 적용 안 됨 — 별도 정책 불필요)

-- ── username 컬럼 (iOS 단축어 sender 조회용) ────────────────────────────────
-- auth.users에 username을 직접 추가할 수 없으므로 accounts.alias를 username으로 활용
-- 대신 별도 profiles 테이블로 username → user_id 매핑을 관리
CREATE TABLE IF NOT EXISTS profiles (
  user_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: 본인만 조회" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles: 본인만 삽입" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles: 본인만 수정" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Edge Function이 service_role로 profiles.username → user_id 조회 (RLS 우회)
