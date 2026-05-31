---
version: alpha
name: Billion — Make 100M
description: >-
  A premium, money-toned savings tracker for iOS web. Deep Emerald primary with
  a Gold accent, frosted glassmorphic surfaces over a soft emerald/gold ambient
  field, and a ring as the canonical progress metaphor. Korean-first typography
  set in Pretendard.
colors:
  # ── Brand ──
  primary: "#0e8c63"          # Midnight Forest Emerald
  primary-strong: "#0a5f44"   # deepest emerald — gradient end / pressed
  primary-soft: "#bfe3d2"     # pale emerald — inactive bars, faint fills
  primary-tint: "#eafaf3"     # near-white emerald wash — chips, info cards
  # ── Accent (the "money" gold) ──
  accent: "#e0a93c"           # Bullion Gold
  accent-strong: "#b07d12"    # deep gold — text on light
  accent-light: "#f6cf6e"     # light gold — highlights on dark/gradient
  accent-soft: "#fbf2dc"      # gold wash — success banner ground
  # ── Neutrals / surfaces ──
  background: "#e9ece6"       # ambient field base (blobs layered over it)
  surface: "#ffffff94"        # glass card fill (white @ 0.58 alpha)
  surface-border: "#ffffffb3" # glass top-edge highlight (white @ 0.70 alpha)
  surface-solid: "#ffffff"    # opaque fill — inputs, controls, status header chips
  on-surface: "#0f1f18"       # ink — headlines, primary figures
  on-surface-variant: "#64748b" # slate — labels, secondary text
  on-surface-muted: "#94a3a0" # muted sage — captions, metadata, timestamps
  on-primary: "#ffffff"       # text/icons on emerald gradient
  outline: "#e2e6e3"          # input borders, hairline dividers
  scrim: "#0f1e1673"          # modal backdrop (deep green @ 0.45 alpha)
  # ── Semantic ──
  success: "#16a34a"          # income, positive amounts
  error: "#ef4444"            # expense, negative amounts
  warning: "#d98a1f"          # unconfirmed / behind-pace amber
  positive: "#2563eb"         # 초과달성/플러스 금액 — 파란색
typography:
  display-xl:
    fontFamily: Pretendard
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.03em
    fontFeature: "'tnum' 1"
  display-lg:
    fontFamily: Pretendard
    fontSize: 30px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.02em
    fontFeature: "'tnum' 1"
  headline-lg:
    fontFamily: Pretendard
    fontSize: 27px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Pretendard
    fontSize: 21px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.015em
  title-md:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: -0.01em
  metric-lg:
    fontFamily: Pretendard
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.01em
    fontFeature: "'tnum' 1"
  body-lg:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
  body-md:
    fontFamily: Pretendard
    fontSize: 14.5px
    fontWeight: 600
    lineHeight: 1.45
  body-sm:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
  label-md:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
  label-caps:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.08em
  caption:
    fontFamily: Pretendard
    fontSize: 11.5px
    fontWeight: 500
    lineHeight: 1.4
    fontFeature: "'tnum' 1"
rounded:
  sm: 9px       # chips, small action buttons, icon tiles' inner
  md: 13px      # inputs, selects
  lg: 16px      # primary buttons, banners
  xl: 20px      # cards, list containers
  2xl: 22px     # hero weekly card
  sheet: 26px   # bottom-sheet top corners
  full: 9999px  # rings, progress tracks, pills, grabber
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  gutter: 12px        # gap between stacked cards
  screen-margin: 16px # dashboard content inset
  form-margin: 18px   # setup / sheet inset
  device-width: 390   # iPhone artboard width (unitless px)
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    height: 54px
    padding: 0 16px
  button-primary-pressed:
    backgroundColor: "{colors.primary-strong}"
  button-secondary:
    backgroundColor: "{colors.surface-solid}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 50px
  chip-action:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 6px 11px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  card-hero:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.xl}"
  input:
    backgroundColor: "{colors.surface-solid}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 13px 15px
  input-focus:
    backgroundColor: "{colors.surface-solid}"
  progress-ring:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.primary}"
    size: 120px
  progress-ring-complete:
    textColor: "{colors.accent}"
  progress-track:
    backgroundColor: "{colors.outline}"
    rounded: "{rounded.full}"
  banner-warning:
    backgroundColor: "#fef6e7"
    textColor: "{colors.warning}"
    rounded: "{rounded.lg}"
  banner-success:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.lg}"
  list-row:
    backgroundColor: "#00000000"
    textColor: "{colors.on-surface}"
    padding: 12px 18px
  list-row-unconfirmed:
    backgroundColor: "#fffaf0"
  list-row-cancelled:
    backgroundColor: "#00000000"
    iconTileColor: "#fef6e7"
    iconTileTextColor: "{colors.warning}"
    amountColor: "{colors.on-surface-muted}"
    captionText: "취소"
    captionColor: "{colors.warning}"
    설명: 출금취소 트랜잭션 row — amber 아이콘 타일, 금액은 회색, 우측 하단 "취소" 캡션
  stepper:
    backgroundColor: "{colors.surface-solid}"
    textColor: "{colors.on-surface}"
    typography: "{typography.metric-lg}"
    rounded: "{rounded.lg}"
    height: 52px
    buttonSize: 44px
    buttonColor: "{colors.primary-tint}"
    buttonTextColor: "{colors.primary-strong}"
    설명: 수행건수 수기 입력용 — [ − ] 숫자 [ + ] 형태, 양 끝 버튼은 primary-tint 배경
  expense-trigger-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    border: "1.5px dashed {colors.outline}"
    height: 50px
    설명: 뜻밖의 큰지출 바텀시트 트리거 버튼 — 점선 테두리, "＋ 큰 지출 입력" 레이블
  modal-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: 10px 20px 30px
  app-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
---

# Billion — DESIGN.md

## Overview

**Billion** is a weekly-savings tracker whose single job is to make a long, abstract
goal — ₩100,000,000 — feel close, tangible, and a little bit aspirational. The
personality is **quiet wealth**: confident, calm, and premium, never loud or
gamified. Think private-banking restraint crossed with the friendliness of a
Korean fintech.

The product is **mobile-first and Korean-first**, designed inside an iPhone
artboard (390pt wide). Every screen is one focused task: log in, read this week's
progress, adjust the goal. Numbers are the heroes — they get the largest type,
tabular figures, and the most contrast. Everything else recedes.

The surface treatment is **glassmorphism**: frosted, semi-transparent cards float
over a soft ambient field of emerald and gold light. The effect should read as
expensive glass over warm metal, not as a flashy gradient. Restraint is the rule —
glass is the stage, the emerald and the gold are the performers.

## Colors

The palette is a single confident **Emerald** brand, a precious-metal **Gold**
accent reserved for achievement and money, and a quiet sage-tinted neutral set.

- **Primary — Midnight Forest Emerald (#0e8c63):** The brand spine. Drives the app
  header, primary buttons, ring fills, and any "on-pace" state. Pairs with
  `primary-strong` (#0a5f44) as the darker end of every emerald gradient and the
  pressed state.
- **Accent — Bullion Gold (#e0a93c):** The money signal. Used sparingly and with
  intent: a completed goal ring, the "goal achieved" banner, the goal line on the
  trend graph, and the percentage badge on the brand mark. Gold means *you won
  this week*. `accent-strong` (#b07d12) carries gold as readable text on light.
- **Neutrals & Surfaces:** A warm sage **background** (#e9ece6) hosts the ambient
  emerald/gold blobs. Content rides on **glass surfaces** (`surface` — white at
  0.58 alpha) edged with a 1px white highlight (`surface-border`). Text steps down
  from `on-surface` ink → `on-surface-variant` slate → `on-surface-muted` sage.
- **Semantic:** `success` green for income and positive amounts, `error` red for
  expense and negative amounts, `warning` amber for unconfirmed transactions and
  behind-pace pacing.

## Typography

The system is set entirely in **Pretendard** — the de-facto premium Korean
interface face — letting weight and size, not family, carry the hierarchy. Korean
text uses `word-break: keep-all` so words never split mid-syllable.

- **Figures (`display-lg`, `metric-lg`):** Pretendard 800 with **tabular numerals**
  (`font-feature-settings: 'tnum'`) and tight tracking. Reserved for currency — the
  weekly savings total, the final-goal figure, the ring percentage. These are the
  loudest thing on any screen.
- **Headlines (`headline-lg`/`md`, `title-md`):** Pretendard 800 for screen and
  sheet titles. Negative tracking keeps large Korean glyphs feeling crafted.
- **Body (`body-lg`/`md`/`sm`):** Pretendard 500–600. Most UI labels sit at
  `body-md`; long help text drops to `body-sm`.
- **Labels & captions (`label-md`, `label-caps`, `caption`):** `label-caps` is the
  one uppercase, letter-spaced style — used only for the quiet section eyebrows
  ("계좌 정보", "저축 목표"). `caption` carries timestamps and balances in tabular
  figures.

## Layout

A single-column **mobile stack** inside a 390pt iPhone artboard. There is no
multi-column grid; rhythm comes from a **4px spacing scale** (4 / 8 / 12 / 16 / 20
/ 24).

- **Screen margins:** 16px on the dashboard, 18px on forms and sheets.
- **Card rhythm:** stacked cards are separated by a 12px `gutter`. The hero weekly
  card overlaps the app header by 8px so it appears to lift off the emerald field.
- **Header:** a full-bleed emerald gradient block carrying the final-goal progress
  and the week navigator, with safe-area top padding (≈58px) clearing the dynamic
  island.
- **Anchored bars:** primary actions (Save, Log out) live in a blurred bar pinned
  to the bottom safe area, never in the scroll flow.

## Elevation & Depth

Depth is **optical, through glass** — not heavy drop shadows.

- **Glass surfaces:** cards, sheets, and list containers use
  `backdrop-filter: blur(20px) saturate(165%)` over the `surface` fill, finished
  with a 1px `surface-border` top highlight. Soft, long shadows
  (`0 12px 36px -12px rgba(16,40,28,.24)`) ground them without hard edges.
- **Ambient field:** the background layers three radial blobs — gold top-right,
  emerald mid-left, a faint cool tint bottom-right — over `background`. This color
  variation is what makes the blur read; never place glass over a flat fill.
- **The header is the anchor:** it stays a *solid* emerald gradient so the frosted
  cards have an opaque, saturated surface to refract. A faint ₩ watermark (white at
  ~0.10 alpha) sits in its top-right.
- **Scrim:** modals dim the field with the deep-green `scrim` before the sheet
  rises.

## Shapes

Soft, continuous, and pill-forward — nothing sharp.

- **Radii** climb with size: 9px chips/icon-tiles → 13px inputs → 16px buttons &
  banners → 20px cards → 22px hero card → 26px sheet tops. Tracks, rings, and the
  sheet grabber are fully rounded (`full`).
- **The ring is the signature shape.** Weekly progress is told as a circular gauge
  (12–13px stroke, rounded caps, `outline` track) with the percentage centered
  inside. It fills emerald while on-pace and **switches to gold once it crosses
  100%**. The linear bar is the secondary, compact variant (used for the long final
  goal in the header); the 7-day trend graph is the analytical variant.
- **Icon tiles:** 38px rounded-md squares tint by transaction type — emerald-soft
  for income, neutral for expense, amber for unconfirmed.

## Components

- **Buttons.** `button-primary` is a full-width 54px emerald gradient
  (`primary` → `primary-strong`) with white `body-lg`, `lg` radius, and a soft
  emerald shadow; it scales to 0.975 on press. `button-secondary` (Log out, Back)
  is solid white with a hairline `outline` and muted text. Use exactly one primary
  button per screen.
- **Chip — action.** The "+ 직접 입력" chip uses `primary-tint` ground with
  `primary-strong` text at `rounded.sm`.
- **Cards.** `card` / `card-hero` are glass (`surface` + blur + `surface-border`),
  `xl`/`2xl` radius. The hero weekly card hosts the ring, the savings figure, and an
  income/expense footer split by a hairline.
- **Inputs.** `input` and selects are **solid white** (legibility over glass),
  1.5px `outline` border, `md` radius; on focus the border turns `primary` with a
  3px `primary` ring at ~18% alpha. Selects carry a chevron affordance.
- **Progress.** `progress-ring` (track `outline`, fill `primary`, gold when
  complete); `progress-track`/bar for compact contexts; trend bars use a dashed
  gold goal line.
- **List rows.** Transaction rows: leading tinted icon tile, counterpart + tabular
  timestamp, trailing signed amount (`success`/`error`) over a muted balance.
  Unconfirmed rows take a `#fffaf0` ground, an amber alert icon, and are tappable to
  reconcile.
- **Banners.** `banner-warning` (amber, balance mismatch), `banner-success` (gold,
  goal reached), and an amber info pacing banner ("하루 평균 … 저축").
- **Stepper.** 수행건수 수기 입력 전용. `[ − ] N [ + ]` 레이아웃으로 양 끝 44px 터치 버튼,
  중앙 숫자는 `metric-lg`. 버튼은 `primary-tint` 배경에 `primary-strong` 텍스트.
  주 마무리 시 카드 내부에 인라인 배치.
- **Expense trigger button.** 뜻밖의 큰지출 바텀시트를 여는 트리거.
  점선(`dashed`) `outline` 테두리로 "입력 가능한 영역"을 암시.
  탭하면 `modal-sheet`가 올라오며 금액·내용 입력 폼 노출.
- **List row — cancelled.** 출금취소 거래 전용 row 변형. amber 아이콘 타일로
  일반 출금과 시각적으로 구분하고, 금액을 `on-surface-muted`(회색)로 표시해
  취소된 거래임을 암시. "취소" 캡션을 우측 하단 `caption` 스타일로 표기.
- **Modal sheet.** Bottom-anchored glass sheet with a centered grabber, `sheet`
  top radius, rising over the `scrim`.
- **App header.** Solid emerald gradient, white content, final-goal bar + week
  navigator, ₩ watermark.

## Do's and Don'ts

- **Do** reserve **gold** for money wins only — a completed ring, the success
  banner, the goal line. If gold is everywhere, achievement means nothing.
- **Do** give currency figures the largest type, 800 weight, and **tabular
  numerals** so columns of numbers align.
- **Do** keep glass over the ambient color field; **don't** place frosted cards on
  a flat white background — the blur has nothing to refract and looks muddy.
- **Don't** let input fields go translucent — keep them solid white for legibility
  of amounts and account numbers.
- **Do** keep the app header a solid emerald anchor; **don't** make every surface
  glass, or the hierarchy collapses.
- **Do** use exactly one `button-primary` per screen.
- **Don't** split Korean words across lines — always set `word-break: keep-all`.
- **Don't** introduce new hues; pacing and state are expressed with the existing
  emerald / gold / amber / red roles only.
- **Do** maintain WCAG AA contrast (4.5:1) for text — verify ink and slate against
  the *lightened* glass surface, not the ambient field behind it.
- **Do** use `positive` blue (#2563eb) for surplus/over-pace amounts only;
  never use it for general UI or decorative purposes.
- **Do** display D+/D- day counters in `display-xl` — it is the largest type in
  the system and reserved exclusively for this metric.
- **Don't** use `success` green for over-pace states — green is for income/deposit
  amounts only. Over-pace uses `positive` blue.
