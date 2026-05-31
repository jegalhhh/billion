-- v1.9 마이그레이션
-- Supabase SQL Editor에서 실행하세요.

-- 1. accounts: start_date 추가 (저축 시작일 — D+/D- 계산 기준)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS start_date DATE;

-- 2. transactions: type 추가 ('deposit' | 'withdrawal' | 'withdrawal_cancel')
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT
  CHECK (type IN ('deposit', 'withdrawal', 'withdrawal_cancel'));

-- 3. weekly_performance 테이블 (수행건수 수기 입력)
CREATE TABLE IF NOT EXISTS weekly_performance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_label  TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_label)
);

ALTER TABLE weekly_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_own" ON weekly_performance;
CREATE POLICY "user_own" ON weekly_performance
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. unexpected_expenses 테이블 (뜻밖의 큰지출)
CREATE TABLE IF NOT EXISTS unexpected_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,
  description  TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE unexpected_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_own" ON unexpected_expenses;
CREATE POLICY "user_own" ON unexpected_expenses
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
