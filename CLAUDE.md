# Billion — CLAUDE.md

## 프로젝트 개요

1억 저축 목표 트래커. 카카오뱅크 iOS 푸시 알림을 자동 수신·파싱해 주간 저축 현황을 실시간으로 보여주는 모바일 웹 앱.

## 기술 스택

- **프론트엔드:** Vanilla HTML + CSS + JS — Vercel CDN 서빙
- **인증:** Supabase Auth (이메일+비밀번호)
- **DB:** Supabase PostgreSQL + RLS
- **실시간:** Supabase Realtime (postgres_changes INSERT/UPDATE)
- **푸시 파싱:** Supabase Edge Functions (Deno/TypeScript)
- **배포:** Vercel (프론트) + Supabase (백엔드)
- **휴면 방지:** Vercel Cron — 매일 09:00 UTC `/api/healthcheck`

## 주요 파일

| 파일 | 역할 |
|------|------|
| `app.js` | Supabase 클라이언트, Auth, Realtime, 대시보드 렌더링, 수동 거래 입력 |
| `supabase/functions/push/index.ts` | Edge Function — 카카오뱅크 푸시 파싱, 잔액 불일치 감지, DB INSERT |
| `api/healthcheck.js` | Vercel Cron 핸들러 — Supabase 휴면 방지 쿼리 |
| `vercel.json` | Cron Job 설정 |
| `design.md` | 디자인 시스템 명세 — 색상, 타이포그래피, 컴포넌트 토큰 |

## 디자인 시스템

**작업 전 반드시 `design.md`를 읽을 것.** 색상·타이포그래피·컴포넌트는 모두 이 파일의 토큰을 기준으로 한다.

- Primary: Midnight Forest Emerald (`#0e8c63`)
- Accent: Bullion Gold (`#e0a93c`) — 목표 달성 시에만 사용
- Positive: `#2563eb` — 초과달성/플러스 금액 전용 (success 녹색과 혼용 금지)
- 폰트: Pretendard 전용, 숫자는 `tnum` 적용
- 유리형태(glassmorphism) 카드 — `surface` + backdrop-filter

## DB 스키마 요약

### accounts
`id, user_id, bank_code, alias, account_last4, initial_balance, final_goal_amount, week_goal_amount, week_start_day, created_at`

### transactions
`id, account_id, user_id, trade_date, trade_time, amount, balance, counterpart, description, raw, week_label, is_confirmed, source, created_at`
- `amount` 양수=입금, 음수=출금
- `is_confirmed` 0=미확인, 1=확인
- `source` push / manual / unconfirmed
- UNIQUE: `(account_id, trade_date, trade_time, amount)`

### profiles
`user_id, username` — iOS 단축어 sender 값 저장, Edge Function에서 user_id 조회 기준

## 개발 규칙

- 날짜/시간은 **KST(Asia/Seoul)** 기준
- 모든 DB 접근은 **RLS** 전제 — user_id 필터 명시
- 잔액 불일치 감지: `lastTx.balance + amount` vs 수신 잔액 비교
- 중복 푸시: `ON CONFLICT DO NOTHING` (UNIQUE 제약 활용)
- 파싱 실패: DB 저장 없이 `{ ok: false, reason: "parse_failed" }` 반환
- 다중 계좌: `account_last4`로 매칭, 없으면 최신 계좌로 fallback
