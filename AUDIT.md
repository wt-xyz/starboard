# Starboard vs GMX - UI/UX Styling Audit

> **Reference**: GMX (https://app.gmx.io/#/trade/long)
> **Subject**: Starboard (https://starboard-flame.vercel.app)
> **Goal**: Identify visual and UX gaps to bring Starboard's look & feel in line with GMX
> **Context**: See [CONTEXT.md](./CONTEXT.md) for full audit context, rules, and technical details

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Overall Layout & Page Structure](#1-overall-layout--page-structure)
3. [Header & Navigation](#2-header--navigation)
4. [Trade Box / Order Entry](#3-trade-box--order-entry)
5. [Chart Area](#4-chart-area)
6. [Positions & Orders Table](#5-positions--orders-table)
7. [Color Palette & Theming](#6-color-palette--theming)
8. [Typography](#7-typography)
9. [Buttons & Interactive Elements](#8-buttons--interactive-elements)
10. [Inputs & Form Controls](#9-inputs--form-controls)
11. [Modals & Overlays](#10-modals--overlays)
12. [Recommendations Summary](#recommendations-summary)

---

## Executive Summary

This audit identified **86 findings** across 11 UI/UX areas comparing Starboard to GMX.

| Severity | Count | Description                                                                                                                    |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| **P0**   | 8     | Critical gaps that make Starboard look unfinished (missing chart header, no custom font, monospace numbers, cramped trade box) |
| **P1**   | 24    | High-impact differences affecting perceived quality (spacing, tab styling, disabled states, animations)                        |
| **P2**   | 38    | Subtle differences a power user would notice (border-radius, colors, slider dimensions)                                        |
| **P3**   | 16    | Minor polish items (letter-spacing, backdrop blur, close icon size)                                                            |

### Top 5 Highest-Impact Changes

1. **Replace `monospace` with a proper font system** (P0) -- 38+ files use raw `monospace` for numbers, making the app look like a code editor. Add a custom font + `font-variant-numeric: tabular-nums` globally.
2. **Add a desktop chart header** (P0) -- No market info (price, 24h change, volume, OI) visible on desktop at all. GMX shows 7+ data points.
3. **Fix the trade box spacing and input patterns** (P0) -- Inputs are cramped (6px gaps), fee rows are tiny (12px font), submit button has wrong border-radius (4px vs system 8px).
4. **Normalize border-radius to 8px everywhere** (P1) -- Currently 4px, 6px, and 8px are used inconsistently. GMX uses 8px uniformly.
5. **Create centralized design tokens** (P1) -- No type scale, hover colors hardcoded in 6+ files, 7 different letter-spacing values, 5 border opacity levels. All need consolidation.

### Areas Where Starboard Is Better Than GMX

- `resize: vertical` on chart (user-resizable chart height)
- 16px root font-size (respects browser accessibility settings; GMX uses 10px)
- Internal input labels (modern stacked label pattern)
- Better placeholder text contrast
- Sheet/modal close button has focus ring for accessibility
- Mobile position cards with prominent PnL display

---

## 1. Overall Layout & Page Structure

### 1.1 Grid Structure - Trade Box Width

**Severity**: P0
**GMX**: Flexbox layout. Left column (chart) grows with `flex grow`. Right column (tradebox) is fixed `w-[40rem]` (640px). Positions table sits below chart only. File: `SyntheticsPage.tsx:397`.
**Starboard**: CSS Grid layout. `gridTemplateColumns: 'minmax(0, 1fr) 400px'`. Bottom section spans full width (`gridColumn: '1 / -1'`). Gap: `0.5rem` (8px). File: `Dashboard.css.ts:8`.
**Gap**: Starboard's order entry is 400px vs GMX's 640px -- 240px narrower. The bottom section spanning full width is a different visual pattern.
**Recommendation**: Consider increasing order entry column to at least 420px. The full-width bottom section is a valid choice for pro trading UIs.
**Files to modify**: `frontend/src/pages/Dashboard/src/Dashboard.css.ts`

### 1.2 Padding and Content Margins

**Severity**: P1
**GMX**: Consistent 8px padding/gap system throughout. Trade page: `gap-8 pt-0`. File: `AppPageLayout.tsx:36-37`.
**Starboard**: Page padding `1rem` (16px), inter-cell gap `0.5rem` (8px), order entry internal padding `0.75rem` (12px). Three different base spacings.
**Gap**: Inconsistent spacing tiers (8px, 12px, 16px) vs GMX's uniform 8px.
**Recommendation**: Standardize to tighter spacing for a pro trading feel. Reduce page padding to `0.5rem` or increase gap to `1rem`.
**Files to modify**: `frontend/src/pages/Dashboard/src/Dashboard.css.ts`

### 1.3 Background Layering and Surface Elevation

**Severity**: P1
**GMX**: 3-tier surface hierarchy: Page `#090A14` -> Card `#121421` -> Input `#1E2033`. Header has a gradient shadow via `::after` pseudo-element.
**Starboard**: 2-tier hierarchy: Page `#151419` -> Card `#1B1B1E`. Very low contrast between layers (~6 lightness points). No Level 2 for inputs. Header has only a 1px border.
**Gap**: Missing input-level surface color. Header lacks depth shadow. All Level 1 surfaces (chart, tradebox, positions) share identical `gluonGrey` with no differentiation.
**Recommendation**: Add a Level 2 surface color (`~#222225`). Add `boxShadow: '0 1px 8px rgba(0,0,0,0.3)'` to header. Normalize border-radius across all panels.
**Files to modify**: `frontend/src/styles/colors.ts`, `DashboardHeader.css.ts`, `Dashboard.css.ts`

### 1.4 Border Radius Inconsistency Across Panels

**Severity**: P2
**GMX**: All panels use consistent `rounded-8` (8px border-radius). Chart, tradebox, and positions table all 8px.
**Starboard**: Chart section: 8px. Order entry section: **0px**. Exchange lists: **0px**. Only the chart has rounded corners.
**Gap**: Chart looks like a "card" but other sections look like flat dividers.
**Recommendation**: Apply `borderRadius: '0.5rem'` to `orderEntrySection` and ExchangeLists `container`.
**Files to modify**: `Dashboard.css.ts:63`, `ExchangeLists.css.ts:11`

### 1.5 Chart Height Scaling for High-Res Displays

**Severity**: P2
**GMX**: Responsive min-heights: 536px default, 780px at 2560px+, 1140px at 4K. File: `TVChart.scss:98-117`.
**Starboard**: `minHeight: 460px`, `height: calc(100vh - 5rem - 280px)`. No high-DPI breakpoints. `resize: vertical` (nice feature GMX lacks).
**Recommendation**: Add `@media (min-width: 2560px) { minHeight: 780px }` and `@media (min-width: 3840px) { minHeight: 1100px }`.
**Files to modify**: `Dashboard.css.ts`

### 1.6 Scroll Behavior

**Severity**: P2
**GMX**: Page-level scroll for entire content area. Single scroll context.
**Starboard**: Each section manages its own `overflow: auto` -- chart, order entry, and positions each have independent scroll. Can cause scroll trapping.
**Recommendation**: Set chart to `overflow: hidden` (TV handles its own scroll). Keep order entry scrollable. Consider page-level scroll for the left column + bottom.
**Files to modify**: `Dashboard.css.ts`

---

## 2. Header & Navigation

### 2.1 Header Density and Information Hierarchy

**Severity**: P1
**GMX**: Header is minimal -- just 3-4 right-aligned buttons (wallet, one-click, network, hamburger). Navigation lives in the sidebar. Clear separation of concerns.
**Starboard**: Header packs logo + asset selector + 4 market stats + network selector + wallet button into a single 64px bar. Stats section has `overflow: auto` which means horizontal scrolling in a header (poor UX).
**Gap**: Starboard header tries to do too much. Information hierarchy is flat -- everything competes for attention.
**Recommendation**: Move market stats (OI, Volume, Funding) to the main page content area or a sub-header bar. Keep only `AssetSelect` and `AssetCurrentPrice` in the header. Below 1280px, hide secondary stats.
**Files to modify**: `DashboardHeader.tsx`, `DashboardHeader.css.ts`

### 2.2 Wallet Connect Button Styling

**Severity**: P1
**GMX**: Connected state: `Button variant="secondary"` with `bg #23263b`, `border-radius: 8px`, no border. Includes ENS-aware avatar + truncated address + chevron. Dropdown on click.
**Starboard**: Connected state: pill shape (`border-radius: 9999px`), `1px solid rgba(251,251,251,0.2)` border, `bg #1B1B1E` (blends into header). Opens a full modal instead of dropdown.
**Gap**: Pill shape differs from system 8px. Border adds visual noise. Background matches header (invisible). Modal is heavier UX than dropdown.
**Recommendation**: Change to `borderRadius: 0.5rem`, remove border, change bg to `#262626` for contrast. Consider dropdown for quick actions (copy, disconnect).
**Files to modify**: `ConnectWalletButton.css.ts`

### 2.3 Network Selector Styling

**Severity**: P2
**GMX**: `Button variant="secondary"` -- filled bg `#23263b`, **no border**, 8px radius. Shows chain icon + chevron. Dropdown has `backdrop-filter: blur(50px)`, semi-transparent bg.
**Starboard**: `bg #262626`, **1px solid border**, 6px radius. Shows text label + "NETWORK" prefix. Opaque dropdown bg.
**Gap**: Border adds noise, radius is off (6px), "NETWORK" label is unnecessary, no backdrop-blur on dropdown.
**Recommendation**: Remove border, change to 8px radius, remove "NETWORK" label, add `backdropFilter: blur(40px)` to dropdown.
**Files to modify**: `NetworkSwitcher.css.ts`

### 2.4 Market Stats Font Treatment

**Severity**: P2
**GMX**: No market stats in header. All stats in page content.
**Starboard**: Stat labels at 10px. Values use `fontFamily: monospace`. Price uses `fontFamily: monospace` at 16px.
**Gap**: 10px labels are below readable minimums. Monospace font clashes with the rest of the UI.
**Recommendation**: Increase stat labels to 11px. Replace `monospace` with system font + `fontVariantNumeric: 'tabular-nums'`.
**Files to modify**: `_MarketStatsBase.css.ts`, `AssetCurrentPrice.css.ts`

### 2.5 Dropdown Panel Consistency

**Severity**: P2
**GMX**: All dropdowns share: `backdrop-filter: blur(50px)`, semi-transparent bg, `0.5px border`, `8px radius`, consistent item styling.
**Starboard**: Dropdowns vary: no backdrop-blur, opaque bg, 1px borders, 4px item radius (vs 8px panel radius). No active indicator for current selection.
**Recommendation**: Add backdrop-blur, unify borders to 0.5px, match item radius to panel radius, add selected-state indicator.
**Files to modify**: `NetworkSwitcher.css.ts`, `radix-overrides.css.ts`

### 2.6 Missing Navigation System

**Severity**: P0 (structural, but acceptable for single-page MVP)
**GMX**: Full 7-item sidebar navigation with icons, active states, and responsive collapse.
**Starboard**: No page navigation. Single-page app with no links to other sections.
**Gap**: As Starboard adds pages (Earn, Stats, Referrals), navigation will need to be built.
**Recommendation**: No immediate action for MVP. When multi-page navigation is needed, consider header-inline links rather than sidebar to maximize chart width.
**Files to modify**: Future work.

---

## 3. Trade Box / Order Entry

_This is the highest priority comparison area._

### 3.1 Container Missing Border-Radius

**Severity**: P0
**GMX**: Outer wrapper `rounded-8` (8px). Two separate panels (form + fee summary) with `bg-slate-900`, separated by 8px gap.
**Starboard**: `borderRadius: 0`. Single flat panel. `bg: #1B1B1E`, `padding: 0.75rem`.
**Gap**: No rounded corners. No visual separation between form and fee summary.
**Recommendation**: Add `borderRadius: '8px'`. Visually separate OrderSummary into its own bordered container.
**Files to modify**: `Dashboard.css.ts`, `OrderSummary.css.ts`

### 3.2 Long/Short Tab Bar Pattern

**Severity**: P0
**GMX**: Segmented control inside `bg-slate-800` (`#1e2033`) container with `rounded-8`. Active Long = green bg tint + green 2.5px bottom border. Active Short = red bg tint + red border.
**Starboard**: Flat tabs on transparent bg with `borderBottom: 2px solid`. Active Long = green text + 20% green bg + green bottom border. No enclosing container.
**Gap**: GMX's enclosed segmented control looks more polished. Starboard's 20% alpha bg tints are too strong.
**Recommendation**: Wrap tabs in a container with `bg slateGrey`, `borderRadius: 8px`. Reduce active bg alpha to 8%. Add trade mode sub-tabs (Market/Limit) when implemented.
**Files to modify**: `OrderSideSwitch.css.ts`, `OrderSideSwitch.tsx`

### 3.3 Input Fields - Focus State and Font

**Severity**: P0
**GMX**: `border-radius: 8px`. Focus: `border-color: #7885FF` (blue) -- neutral accent. No glow shadow. System font for input text.
**Starboard**: `border-radius: 6px`. Focus: `border-color: #F56E0F` (orange) + `boxShadow: 0 0 0 3px rgba(245,110,15,0.15)`. `fontFamily: monospace` for input text.
**Gap**: Orange focus ring creates visual noise (same color as CTA). 3px glow is heavy. Monospace in inputs looks like a code editor. 6px radius is off-system.
**Recommendation**: Change radius to 8px. Use neutral focus color or reduce glow to 1px. Remove `monospace` from inputs. Increase padding to `8px 12px`.
**Files to modify**: `SizeInput.css.ts`

### 3.4 Fee Breakdown Rows Too Small and Cramped

**Severity**: P0
**GMX**: Fee rows: 14px font, 14px gap between rows, `items-baseline` alignment. Expandable "Execution details" section in its own bordered container.
**Starboard**: Fee rows: **12px font**, **6px gap**, `alignItems: center`. All fees flat with just a top border separator.
**Gap**: Starboard fee text is 2px smaller and gaps are less than half of GMX's. Extremely cramped.
**Recommendation**: Increase font to 14px. Increase gap to 12-14px. Wrap in bordered container with `borderRadius: 8px`, `border: 0.5px`. Add expandable/collapsible pattern.
**Files to modify**: `OrderSummary.css.ts`

### 3.5 Submit Button Sizing and Styling

**Severity**: P0
**GMX**: `min-height: 40px`, `padding: 18px 24px`, `font-size: 16px`, `border-radius: 8px`. Disabled: specific dark bg + muted text (no opacity).
**Starboard**: `padding: 12px 16px`, `font-size: 14px`, `border-radius: 4px`. Long and Short buttons are **both orange** (no color differentiation). Disabled: `opacity: 0.5`.
**Gap**: Button is smaller, has wrong border-radius (4px!), no directional color coding, opacity-based disabled is washed out.
**Recommendation**: Increase padding to `16px 24px`, font to 16px, radius to 8px. Consider green for Long / red for Short. Replace `opacity: 0.5` disabled with dedicated bg/text colors.
**Files to modify**: `SubmitButton.css.ts`, `SubmitPositionButton.css.ts`

### 3.6 Max/Half Button Styling

**Severity**: P1
**GMX**: Filled pill (`bg-slate-600`, `rounded-full`). Visible and easy to click.
**Starboard**: Ghost outlined button, 10px text, 4px radius, uppercase "MAX"/"HALF".
**Gap**: Starboard buttons are tiny and hard to see. Uppercase text shouts.
**Recommendation**: Switch to filled pill style: `bg slateGrey`, `borderRadius: 9999px`, `fontSize: 12px`. Remove uppercase.
**Files to modify**: `SizeInput.css.ts`

### 3.7 Input Label Layout

**Severity**: P1
**GMX**: Label inside the input container (self-contained card). Top row: label + info. Middle: input. Bottom: USD value + balance.
**Starboard**: Label outside the container above it. Fragmented appearance.
**Gap**: GMX's pattern is a self-contained input card. Starboard's is disconnected.
**Recommendation**: Move label inside the container. Restructure to 3-row card pattern.
**Files to modify**: `SizeInput.tsx`, `SizeInput.css.ts`

### 3.8 Leverage Selector Polish

**Severity**: P1
**GMX**: Compact inline field in header row. Opens as a floating popover. Clean slider with small thumb.
**Starboard**: Always-visible full-width slider. 18px thumb with heavy orange glow (3px border + 2px shadow). Label buttons at 10px.
**Gap**: Takes more vertical space. Thumb glow is heavy. Labels are tiny.
**Recommendation**: Reduce thumb shadow. Increase label font to 11-12px. Remove `monospace` from leverage input. Consider collapsible.
**Files to modify**: `LeverageSlider.css.ts`

### 3.9 Overall Vertical Rhythm

**Severity**: P1
**GMX**: Clear spacing tiers: 4px (tight), 8px (related), 12px (sections), 14px (rows).
**Starboard**: Everything uses 4-8px. Inner SizeInput gap: 2px. OrderSummary gap: 6px. No hierarchy.
**Gap**: Starboard is uniformly cramped with no breathing room between sections.
**Recommendation**: Adopt tiered system. Increase container gap to 12px. SizeInput internal to 4px. OrderSummary rows to 12px.
**Files to modify**: `DashboardOrderEntryForm.css.ts`, `SizeInput.css.ts`, `OrderSummary.css.ts`

### 3.10 Monospace Font Throughout Trade Box

**Severity**: P1
**GMX**: System font with `.numbers` utility (`letter-spacing: 0.03em`). No monospace anywhere.
**Starboard**: `fontFamily: 'monospace'` on: input text, USD values, leverage display, balance display, leverage input, OrderSummary values.
**Gap**: Terminal/code editor feel clashes with modern trading interface.
**Recommendation**: Remove all `fontFamily: 'monospace'`. Use system font + `letterSpacing: 0.03em` + `whiteSpace: nowrap`.
**Files to modify**: `SizeInput.css.ts`, `LeverageSlider.css.ts`, `OrderSummary.css.ts`

### 3.11 Slippage Tolerance UI

**Severity**: P1
**GMX**: Part of expandable "Execution details" section. Standard input styling.
**Starboard**: Inline in OrderSummary. Buttons at 10px font, 1px border, 4px radius. Custom input at `width: 4ch`, 10px font. Orange active state.
**Gap**: Extremely small and hard to interact with.
**Recommendation**: Increase font to 12px, padding to `4px 8px`. Use neutral active state. Consider dedicated settings section.
**Files to modify**: `OrderSummary.css.ts`

### 3.12 Warning/Info Banner Component Missing

**Severity**: P2
**GMX**: `ColorfulBanner` component: `rounded-8`, `border-left: 2px solid [color]`, `padding: 12px`, variants for blue/yellow/red/green.
**Starboard**: No banner component. Only inline error text (`color: #ff4444`, 12px).
**Recommendation**: Create reusable `AlertBanner` component with left-border accent pattern.
**Files to modify**: New component needed.

### 3.13 Token/Asset Badge and Collateral Selector

**Severity**: P2
**GMX**: 20px token icon + 20px font name. Interactive dropdown for token selection. Collateral selector in header row.
**Starboard**: Text-only badge, 13px font, no icon, static (not interactive). No collateral selector.
**Recommendation**: Add token icons. Increase badge font. Add interactivity when multi-collateral is supported.
**Files to modify**: `SizeInput.tsx`, `SizeInput.css.ts`

---

## 4. Chart Area

### 4.1 Desktop Chart Header - Missing Entirely

**Severity**: P0
**GMX**: `ChartHeader` shows: market selector dropdown, current price, 24h change %, 24h volume, open interest (long/short split), available liquidity, net rate/hr. Horizontally scrollable with fade gradients. Labels: 11px uppercase. File: `ChartHeader.tsx:193-457`.
**Starboard**: **No chart header on desktop at all.** `MobileMarketHeader` only renders below 1024px. On desktop, the TradingView chart occupies the entire section with zero market info.
**Gap**: Users on desktop have no price, no 24h stats, no OI, no funding rate visible -- must rely on TradingView's built-in symbol display alone.
**Recommendation**: Create a `DesktopMarketHeader` component rendered above the chart. Include: asset selector, current price, 24h change, volume, OI, funding rate.
**Files to modify**: New `DesktopMarketHeader.tsx` + `.css.ts`. Modify `Dashboard.tsx`.

### 4.2 TradingView Candle Colors Not Customized

**Severity**: P1
**GMX**: Explicitly sets candle up/down colors: green `#0FDE8D`, red `#FF506A`. Wick colors match. Border drawing disabled. Dynamic price line color changes based on candle direction.
**Starboard**: **No candle color customization.** Uses TradingView defaults (green `#089981`, red `#F23645`). Creates visual inconsistency with Starboard's own `success`/`error` colors.
**Recommendation**: Add `mainSeriesProperties.candleStyle` overrides using `colors.success` and `colors.error`.
**Files to modify**: `TradingChart.tsx`

### 4.3 Grid Line Style

**Severity**: P1
**GMX**: Dashed grid lines (`style: 2`). Color: `#363A5960`. Industry standard.
**Starboard**: Solid grid lines (`style: 0`). Color: `rgba(251,251,251,0.08)`.
**Recommendation**: Change to `style: 2` (dashed).
**Files to modify**: `TradingChart.tsx`

### 4.4 TradingView Feature Configuration

**Severity**: P1
**GMX**: Disables 16+ features for a clean chart: header_compare, symbol_search, header_undo_redo, header_saveload, etc. Enables crosshair_menu, items_favoriting.
**Starboard**: Only disables 3 features. Leaves symbol search, compare mode, undo/redo, save/load enabled -- adding irrelevant clutter.
**Recommendation**: Disable: `volume_force_overlay`, `create_volume_indicator_by_default`, `header_compare`, `symbol_search_hot_key`, `header_quick_search`, `display_market_status`, `header_symbol_search`, `popup_hints`, `symbol_info`, `edit_buttons_in_legend`, `header_undo_redo`, `header_saveload`. Enable: `chart_crosshair_menu`, `items_favoriting`.
**Files to modify**: `TradingChart.tsx`

### 4.5 Mobile Chart Header Content

**Severity**: P1
**GMX**: Expandable design. Compact by default (price + 24h change), expand for volume/OI/liquidity. Labels: 11px.
**Starboard**: All stats shown flat. Labels at 10px, monospace values. Abbreviated labels ("Vol", "OI", "Fund").
**Recommendation**: Increase font to 11px. Replace monospace. Use more descriptive labels. Consider expandable pattern.
**Files to modify**: `MobileMarketHeader.css.ts`, `MobileMarketHeader.tsx`

### 4.6 TradingView Colors.css Mismatch

**Severity**: P2
**GMX**: All TradingView CSS variables reference the design system colors.
**Starboard**: `colors.css` sets `--color-accent: #6966FF` (purple!) -- not Starboard's brand color. Layer colors (`#181825`, `#212124`) don't match actual palette. Runtime blob overrides to `#F56E0F` but may not load first.
**Recommendation**: Update `colors.css` to `--color-accent: #F56E0F`. Set layers to `--color-layer-1: #151419`, `--color-layer-2: #1B1B1E`, `--color-layer-3: #262626`.
**Files to modify**: `public/tradingview/colors.css`, `TradingChart.tsx`

### 4.7 Mobile Scale Font Too Small

**Severity**: P2
**GMX**: Does not reduce TradingView scale font below default.
**Starboard**: Sets mobile `scalesProperties.fontSize: 6` -- **6 pixels**. Below minimum readability.
**Recommendation**: Increase to at least 9.
**Files to modify**: `TradingChart.tsx`

---

## 5. Positions & Orders Table

### 5.1 Table Container - Card-Per-Row vs Seamless Table

**Severity**: P1
**GMX**: `borderCollapse` seamless table. No row borders. Alternating row backgrounds (`#1E203380`). Container: `rounded-8 bg-slate-900`.
**Starboard**: `borderCollapse: 'separate'`, `borderSpacing: '0 0.125rem'` (2px row gaps). **Each cell has its own 1px border** with rounded corners per row. Container: `borderRadius: 0`.
**Gap**: Fundamentally different visual approach. Starboard's card-per-row is heavy and complex.
**Recommendation**: Switch to `borderCollapse: collapse`. Remove per-cell borders. Add subtle row separator (`borderBottom: 1px solid rgba(251,251,251,0.05)`). Add container `borderRadius: 8px`.
**Files to modify**: `Root.css.ts`, `Cell.css.ts`, `ExchangeLists.css.ts`

### 5.2 Tab Bar Font Size and Padding

**Severity**: P1
**GMX**: Tab text: 14px, padding: `px-20 pb-9 pt-11`, underline: 2.5px blue. Tab bar border: `0.5px`.
**Starboard**: Tab text: **12px**, padding: `0.5rem 0.75rem`, underline: 2px orange. Tab bar border: `1px`.
**Gap**: Starboard tabs are noticeably smaller and tighter.
**Recommendation**: Increase to 14px, increase padding, 2.5px underline, 0.5px separator.
**Files to modify**: `ExchangeLists.css.ts`

### 5.3 Row Styling

**Severity**: P1
**GMX**: No row separators. Subtle alternating backgrounds. Immediate hover (no transition). Data font: 13px.
**Starboard**: Per-cell borders. No alternating colors. Hard shift from `#1B1B1E` to `#262626` on hover with 0.2s transition. Data font: **12px**.
**Gap**: Starboard rows are heavier (bordered) yet data is smaller (12px).
**Recommendation**: Remove per-cell borders. Add subtle alternating rows. Reduce hover contrast. Increase data font to 13px.
**Files to modify**: `Row.css.ts`, `Cell.css.ts`, `Root.css.ts`

### 5.4 Action Buttons

**Severity**: P1
**GMX**: Ghost `Button` component variants. "Market" and "TWAP" close buttons + kebab dropdown with 8 options. `PositionSeller` modal for confirmation.
**Starboard**: Raw red text "Close" button. Uses **`window.confirm()`** for confirmation (native browser dialog!). Generic hamburger icon button.
**Gap**: `window.confirm()` is a critical UX anti-pattern. Raw button styling is inconsistent.
**Recommendation**: Replace `window.confirm()` with proper modal. Use component library button. Add more action options.
**Files to modify**: `PositionsTable.tsx`, `PositionsTable.css.ts`

### 5.5 Column Headers

**Severity**: P2
**GMX**: 11px, weight 500, letter-spacing `0.08em`, color `#a0a3c4`. Asymmetric padding (20px left for first column). Last column right-aligned.
**Starboard**: 10px, weight 600, letter-spacing `0.05em`, color `#878787`. Uniform 10px padding. All left-aligned. Sticky (nice feature GMX lacks).
**Recommendation**: Increase to 11px, reduce weight to 500, increase letter-spacing to 0.08em. Add asymmetric first/last column padding.
**Files to modify**: `Header.css.ts`

### 5.6 PnL Display Size

**Severity**: P2
**GMX**: PnL secondary line: `text-body-small` (12px).
**Starboard**: PnL secondary: `0.625rem` **(10px)**. Very small.
**Recommendation**: Increase to 12px.
**Files to modify**: `NetValueCell.css.ts`

### 5.7 Number Typography in Table

**Severity**: P2
**GMX**: System font + `letter-spacing: 0.03em` + `white-space: nowrap`.
**Starboard**: `fontFamily: 'monospace'` for all values in the table.
**Recommendation**: Replace with system font + `letterSpacing: 0.03em`.
**Files to modify**: `Cell.css.ts`, `PositionStats.css.ts`, `PositionPnL.css.ts`

### 5.8 Mobile Card Layout

**Severity**: P1
**GMX**: Label-value rows in cards. 2-column grid above 800px. Full action buttons (Market, TWAP, dropdown).
**Starboard**: Centered PnL hero display + compact stats grid. Single column only. Only a small icon button for actions.
**Gap**: No 2-column layout for tablets. Limited action buttons.
**Recommendation**: Add 2-column grid at 800px+. Add visible "Close" text button. Keep the prominent PnL pattern (it's better UX).
**Files to modify**: `PositionsList.css.ts`, `PositionCard.tsx`

### 5.9 Empty State

**Severity**: P2
**GMX**: `min-height: 164px`, centered text, background matches table.
**Starboard**: `min-height: 64px`. No loading state indicator.
**Recommendation**: Increase to ~160px. Add loading state.
**Files to modify**: `PositionsList.css.ts`, `ExchangeLists.css.ts`

### 5.10 Scroll Overflow

**Severity**: P2
**GMX**: Custom `TableScrollFadeContainer` with gradient fades and chevron arrows. Table `min-width: 1180px`.
**Starboard**: Raw `overflow: auto`. No visual cue that content exists offscreen. No min-width.
**Recommendation**: Add `minWidth: 1100px`. Implement scroll fade indicators or CSS gradient overlay.
**Files to modify**: `ExchangeLists.css.ts`, `Root.css.ts`

### 5.11 Tooltip Information Density

**Severity**: P3
**GMX**: Every data cell has detailed tooltip (Net Value shows: initial collateral, PnL, borrow fee, funding fees, price impact, close fee, UI fee).
**Starboard**: No tooltips on any table cell values.
**Recommendation**: Add tooltips to cell values as fee/position features are implemented.
**Files to modify**: Row component files (future work).

---

## 6. Color Palette & Theming

### 6.1 Background Layer Hierarchy - Insufficient Depth

**Severity**: P1
**GMX**: 5-layer system: `#090A14` -> `#121421` -> `#1E2033` -> `#1E2033` (input) -> `rgba(160,163,196,0.10)` (hover). Blue-tinted greys.
**Starboard**: 4-layer system: `#151419` -> `#1B1B1E` -> `#262626` -> `whiteAlpha` variants. Warm neutral greys.
**Gap**: One fewer layer. `darkVoid` to `gluonGrey` contrast is extremely low (~6 lightness delta). No input-level surface.
**Recommendation**: Add a 5th token between `gluonGrey` and `slateGrey` (e.g., `#212124`). Add semi-transparent elevated surface (`rgba(251,251,251,0.03)`).
**Files to modify**: `frontend/src/styles/colors.ts`

### 6.2 Missing Disabled/Inactive Text Token

**Severity**: P1
**GMX**: 4-tier text hierarchy: primary `#ffffff`, secondary `#a0a3c4`, muted `#a0a3c4`, inactive `#3E4361`.
**Starboard**: 3-tier only: `snow` `#FBFBFB`, `dustyGrey` `#878787`, placeholder `dustyGreyAlpha[50]`. Disabled states use `opacity: 0.5-0.6` instead of a semantic token.
**Recommendation**: Add `disabled: 'rgba(251,251,251,0.25)'` or `'#3A3A3A'` token. Replace per-component opacity rules.
**Files to modify**: `frontend/src/styles/colors.ts`

### 6.3 Inconsistent Semantic Colors

**Severity**: P2
**GMX**: Distinctive brand colors: green `#0FDE8D`, red `#FF506A`, yellow `#F3B50C`. Background tints for each.
**Starboard**: Generic Tailwind defaults: green `#22c55e`, red `#ef4444`. **No warning token in colors.ts.** Hardcoded `#ff4444` and `#ff6b6b` for errors in some files (inconsistent with `colors.error`).
**Recommendation**: Add `warning: '#f59e0b'` to colors. Add `successBg`, `errorBg`, `warningBg` alpha tokens. Replace hardcoded error reds.
**Files to modify**: `colors.ts`, `SizeInput.css.ts`, `ExchangeLists.css.ts`, `toastify.css.ts`

### 6.4 Border Opacity Inconsistency

**Severity**: P2
**GMX**: 3 opacity tiers: `0.05`, `0.1`, `0.2`.
**Starboard**: 5+ opacity values: `whiteAlpha[5]`, `[8]`, `[10]`, `[20]`, `[30]` plus solid `slateGrey`.
**Recommendation**: Standardize on 3: `border-subtle` (5%), `border-default` (10%), `border-strong` (20%). Merge `whiteAlpha[8]` into `whiteAlpha[10]`.
**Files to modify**: `colors.ts`, various `.css.ts` files using `whiteAlpha[8]`

### 6.5 Hover Colors Hardcoded

**Severity**: P2
**GMX**: Centralized tokens: `button-primaryHover: #2a3de5`, `button-primaryActive: #2536cd`.
**Starboard**: `#E05D0A` hover and `#CC5209` active hardcoded in **6+ separate files**.
**Recommendation**: Add `liquidLavaHover: '#E05D0A'`, `liquidLavaActive: '#CC5209'` to `colors.ts`. Replace all hardcoded instances.
**Files to modify**: `colors.ts`, `ConnectWalletButton.css.ts`, `WalletModal.css.ts`, `SubmitPositionButton.css.ts`, `SubmitButton.css.ts` (multiple)

### 6.6 No CSS Variable Layer

**Severity**: P1
**GMX**: 3-layer system: source tokens -> CSS variables -> Tailwind utilities. Supports runtime theme switching.
**Starboard**: 1-layer: static JS imports baked at build time. No CSS variables. No theme switching infrastructure.
**Gap**: If light mode is ever needed, entire approach needs restructuring.
**Recommendation**: Acceptable for dark-only MVP. Consider `createGlobalTheme` from Vanilla Extract if theme switching is planned. More immediately, create semantic aliases (`theme.bg.page`, `theme.text.primary`).
**Files to modify**: `colors.ts`

---

## 7. Typography

### 7.1 No Custom Font + Raw Monospace Everywhere

**Severity**: P0
**GMX**: Custom "TTHoves" font (400/500 weights). Composite "Relative" font-face that uses Roboto for digits (U+30-39) and Inter for decimal separators. Carefully chosen for financial data legibility.
**Starboard**: **No custom font at all** (system font stack from Radix Themes). **38+ files** use raw `fontFamily: 'monospace'` for numbers -- resolves to Courier New/Monaco depending on OS. Looks like a code editor, not a trading platform.
**Gap**: This is the single most impactful typography gap. Monospace creates a jarring terminal aesthetic that clashes with the modern UI.
**Recommendation**: (1) Choose and load a custom font (Inter, Geist, or similar). (2) Add global `font-variant-numeric: tabular-nums lining-nums` to root CSS. (3) Replace ALL 38+ `fontFamily: 'monospace'` instances with the system font + tabular-nums.
**Files to modify**: `index.html`, `index.css`, 38+ `.css.ts` files

### 7.2 No Centralized Type Scale

**Severity**: P1
**GMX**: 7-step type scale defined in Tailwind config: h1(32px), h2(24px), h3(20px), body-large(16px), body-medium(14px), body-small(12px), caption(11px). CSS variables for each.
**Starboard**: **10 different font sizes** scattered inline across the codebase. Inconsistencies like `0.688rem` and `0.6875rem` for the same semantic purpose. No centralized definition. No CSS variables.
**Recommendation**: Create `frontend/src/styles/typography.ts` with: h1(32px), h2(18px), body(14px), bodySmall(13px), caption(12px), label(11px), micro(10px).
**Files to modify**: New `typography.ts`, 30+ `.css.ts` files

### 7.3 Overuse of Font Weight 600

**Severity**: P2
**GMX**: Primarily 400 (body) and 500 (emphasis). Bold (700) almost never used.
**Starboard**: Weight 600 used for: headings, asset names, stat values, button text, badges, timestamps -- the most common weight. When everything is semi-bold, nothing stands out.
**Recommendation**: Reduce 600 usage. Reserve for primary actions/headings. Switch most to 500.
**Files to modify**: ~25 `.css.ts` files

### 7.4 Missing Line Height Definitions

**Severity**: P2
**GMX**: Explicit line heights for every type step: h1(110%), body-large(21px), body-medium(17.5px), body-small(16px), caption(14px).
**Starboard**: Most components omit `lineHeight` entirely, relying on browser defaults (~1.2). Too tight for body text.
**Recommendation**: Add line heights to the proposed type scale: `1.1` for headings, `1.4` for body, `1.5` for small/caption.
**Files to modify**: Proposed `typography.ts`, component files

### 7.5 Tabular Nums Not Set Globally

**Severity**: P1
**GMX**: `font-variant-numeric: tabular-nums lining-nums` set on `:root`. ALL numbers everywhere use fixed-width digits by default.
**Starboard**: Only 1 instance of `fontVariantNumeric: 'tabular-nums'` in the entire codebase (AssetRow.css.ts). Uses `monospace` as a crude workaround instead.
**Recommendation**: Add `font-variant-numeric: tabular-nums lining-nums` to global CSS. This single change removes the need for monospace on number values.
**Files to modify**: `index.css`

### 7.6 Letter Spacing Inconsistency

**Severity**: P3
**GMX**: 3 standardized values: `-0.016em` (headings), `0.03em` (numbers), `0.08em` (captions/labels).
**Starboard**: 7 different values scattered: `0.01em`, `0.02em`, `0.025em`, `0.03em`, `0.05em`, `-0.01em`, `0.01em`.
**Recommendation**: Standardize to 3: `tight: -0.01em`, `normal: 0`, `wide: 0.03em`.
**Files to modify**: Various `.css.ts` files

---

## 8. Buttons & Interactive Elements

### 8.1 Border-Radius Inconsistency

**Severity**: P1
**GMX**: All buttons: 8px. Always.
**Starboard**: IncreasePosition SubmitButton: **4px**. ConnectWallet: 8px. DecreasePosition: 8px. MintButton: 8px. Internal inconsistency.
**Recommendation**: Change all to 8px.
**Files to modify**: `SubmitButton.css.ts`, `SubmitPositionButton.css.ts`

### 8.2 Disabled State - Opacity Inconsistency

**Severity**: P1
**GMX**: Disabled uses dedicated dark bg (`#1e2033`) + muted text (`#646a8f`). No opacity change.
**Starboard**: Some buttons: `opacity: 0.5`. Others: `opacity: 0.6`. No background/text color change.
**Gap**: Opacity-only disabled is washed out and inconsistent (0.5 vs 0.6).
**Recommendation**: Standardize to 0.5 minimum. Better: add explicit disabled bg + text tokens.
**Files to modify**: `WalletModal.css.ts`

### 8.3 No Shared Button Component

**Severity**: P2
**GMX**: Centralized `Button` with variants: primary, primary-action, secondary, ghost, link.
**Starboard**: Every button is individually styled in its own `.css.ts` file. 8+ separate button implementations.
**Recommendation**: Create a centralized button recipe with `@vanilla-extract/recipes`: `primary` (liquidLava), `secondary` (transparent + border), `ghost` (transparent), `danger`.
**Files to modify**: New `components/ui/button.css.ts` + `button.tsx`

### 8.4 Font Weight Inconsistency in Buttons

**Severity**: P2
**GMX**: All buttons: weight 500.
**Starboard**: IncreasePosition: 600. DecreasePosition: 500. ConnectWallet: 600. MintButton: 500.
**Recommendation**: Pick one (600 recommended for Starboard's bolder language) and apply everywhere.
**Files to modify**: Various `SubmitButton.css.ts` files

### 8.5 Missing Checkbox and Toggle Switch

**Severity**: P2
**GMX**: Dedicated Checkbox (14x14, 4px radius, blue checked) and ToggleSwitch (36px track, 18px thumb, blue checked, 300ms transition).
**Starboard**: Neither component exists.
**Recommendation**: Create using Radix primitives. Checked state: liquidLava.
**Files to modify**: New `components/ui/checkbox.tsx`, `components/ui/toggle-switch.tsx`

### 8.6 Missing Tooltip Component

**Severity**: P2
**GMX**: Full Tooltip with `@floating-ui/react`: 8px radius, `padding: 10px`, backdrop-blur(14px), gradient bg, arrow support.
**Starboard**: No tooltip component (only 1 instance of basic Radix Tooltip in the entire app).
**Recommendation**: Create Tooltip component. Style: `bg gluonGrey`, `border: 1px solid whiteAlpha[10]`, `borderRadius: 8px`, `boxShadow`.
**Files to modify**: New `components/ui/tooltip.tsx` + `.css.ts`

### 8.7 Hover Transition Timing

**Severity**: P3
**GMX**: No transition on buttons. Instant hover.
**Starboard**: Mix of `0.15s` and `0.2s`. Inconsistent.
**Recommendation**: Standardize to `0.15s ease`.
**Files to modify**: Various `.css.ts` files

---

## 9. Inputs & Form Controls

### 9.1 Input Border-Radius

**Severity**: P1
**GMX**: All inputs: `border-radius: 8px`.
**Starboard**: SizeInput: `6px`. AmountInput: `6px`. Off-system.
**Recommendation**: Change to 8px.
**Files to modify**: `SizeInput.css.ts`, `AmountInput.css.ts`

### 9.2 Slider Track Height Inconsistency

**Severity**: P2
**GMX**: rc-slider track: 8px.
**Starboard**: SizePercentageSlider: 6px. LeverageSlider: **4px**. Internal inconsistency.
**Recommendation**: Standardize to 6px.
**Files to modify**: `LeverageSlider.css.ts`

### 9.3 Select/Dropdown Missing Panel Border-Radius

**Severity**: P2
**GMX**: Dropdown panels: 8px radius. Items: 8px radius.
**Starboard**: AssetSelect popover has no explicit border-radius on content. Trigger: 6px radius.
**Recommendation**: Add `borderRadius: 8px` to popover content. Change trigger to 8px.
**Files to modify**: `AssetSelect.css.ts`

---

## 10. Modals & Overlays

### 10.1 Sheet/Modal Animation Too Slow

**Severity**: P1
**GMX**: 200ms open, 150ms close. Snappy.
**Starboard**: **500ms open**, 300ms close. 2.5x slower than GMX. Feels sluggish.
**Recommendation**: Reduce to `0.2s ease-out` open, `0.15s ease-in` close.
**Files to modify**: `sheet.css.ts`

### 10.2 Backdrop Overlay Inconsistency

**Severity**: P2
**GMX**: Desktop modal: `rgba(9,10,20,0.5)`. Mobile: `rgba(0,0,0,0.7)`.
**Starboard**: Dialog: `rgba(0,0,0,0.7)`. Sheet: `rgba(0,0,0,0.5)`. Inconsistent between own components.
**Recommendation**: Standardize Sheet overlay to `rgba(0,0,0,0.6)`.
**Files to modify**: `sheet.css.ts`

### 10.3 Dialog Content Padding Inconsistency

**Severity**: P2
**GMX**: Adaptive 16px/20px consistently.
**Starboard**: WalletModal: 20px. DecreasePositionDialog: 24px.
**Recommendation**: Standardize to 20px.
**Files to modify**: `DecreasePositionDialog.css.ts`

### 10.4 Sheet Border Uses Hardcoded Tailwind Color

**Severity**: P3
**GMX**: N/A.
**Starboard**: Sheet panels use `borderLeft: '1px solid #374151'` -- a Tailwind gray that doesn't match the design system.
**Recommendation**: Replace `#374151` with `colors.whiteAlpha[10]`.
**Files to modify**: `sheet.css.ts` (lines 101, 127, 151, 171)

---

## Recommendations Summary

### Quick Wins (< 1 day each)

| #   | Change                                                          | Impact                                    | Files                                      |
| --- | --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| 1   | Add global `font-variant-numeric: tabular-nums lining-nums`     | Eliminates need for monospace on numbers  | `index.css`                                |
| 2   | Normalize all `borderRadius` to 8px                             | Visual consistency across entire app      | ~10 `.css.ts` files                        |
| 3   | Add `borderRadius: 8px` to order entry section + exchange lists | Panels look like cards, not flat dividers | `Dashboard.css.ts`, `ExchangeLists.css.ts` |
| 4   | Change TradingView grid to dashed (`style: 2`)                  | Professional chart appearance             | `TradingChart.tsx`                         |
| 5   | Add candle color customization                                  | Chart matches design system               | `TradingChart.tsx`                         |
| 6   | Disable unnecessary TradingView features                        | Cleaner chart toolbar                     | `TradingChart.tsx`                         |
| 7   | Fix TradingView `colors.css` accent/layer colors                | Chart theme matches app                   | `public/tradingview/colors.css`            |
| 8   | Reduce sheet/modal animation to 200ms/150ms                     | Snappy interactions                       | `sheet.css.ts`                             |
| 9   | Add hover color tokens to `colors.ts`                           | Stop hardcoding `#E05D0A` in 6+ files     | `colors.ts` + 6 files                      |
| 10  | Replace `window.confirm()` with modal                           | Critical UX fix                           | `PositionsTable.tsx`                       |
| 11  | Fix submit button border-radius (4px -> 8px)                    | Button matches system                     | `SubmitButton.css.ts`                      |
| 12  | Replace hardcoded `#374151` in sheet borders                    | Design system consistency                 | `sheet.css.ts`                             |

### Medium Effort (1-3 days each)

| #   | Change                                                                     | Impact                                | Files                                                                       |
| --- | -------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Replace all 38+ `fontFamily: 'monospace'` with system font                 | Eliminates code-editor aesthetic      | 38+ `.css.ts` files                                                         |
| 2   | Create centralized typography scale                                        | Consistent text sizing everywhere     | New `typography.ts` + 30+ files                                             |
| 3   | Increase trade box spacing (gaps, padding, font sizes)                     | Trade box feels spacious, not cramped | `OrderSummary.css.ts`, `SizeInput.css.ts`, `DashboardOrderEntryForm.css.ts` |
| 4   | Restructure SizeInput as 3-row card (label inside)                         | Matches GMX input card pattern        | `SizeInput.tsx` + `.css.ts`                                                 |
| 5   | Create shared button recipe with variants                                  | Consistent buttons, no duplication    | New `button.css.ts` + `button.tsx`                                          |
| 6   | Restyle positions table (remove per-cell borders, add alternating rows)    | Cleaner, more professional table      | `Root.css.ts`, `Cell.css.ts`, `Row.css.ts`                                  |
| 7   | Add token icons to position cells and input badges                         | Visual richness                       | `SizeInput.tsx`, `PositionCell.tsx`                                         |
| 8   | Expand color tokens (disabled text, warning, bg tints, input surface)      | Complete design system                | `colors.ts`                                                                 |
| 9   | Update tab bars (positions table + Long/Short) with correct sizing/padding | Tabs feel proportional                | `ExchangeLists.css.ts`, `OrderSideSwitch.css.ts`                            |

### Large Effort (3+ days each)

| #   | Change                                                                   | Impact                                                | Files                                                      |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------- |
| 1   | **Create desktop chart header** (price, 24h change, OI, volume, funding) | Fills the biggest P0 gap on desktop                   | New `DesktopMarketHeader.tsx` + `.css.ts`, `Dashboard.tsx` |
| 2   | Choose and integrate a custom brand font                                 | Distinctive identity, not generic system font         | `index.html`, `index.css`, potentially all text styling    |
| 3   | Build Tooltip component system                                           | Enables information density via hover                 | New `tooltip.tsx` + `.css.ts`, all table cells             |
| 4   | Build AlertBanner/Warning component                                      | Contextual feedback for high leverage, slippage, etc. | New component + integration in trade forms                 |
| 5   | Build Checkbox and ToggleSwitch components                               | Complete form control library                         | New components                                             |
| 6   | Implement horizontal scroll fade for tables                              | Polished table overflow UX                            | New utility component                                      |
| 7   | Refactor header: move stats to page content, add sub-header              | Less cramped header, better hierarchy                 | `DashboardHeader.tsx`, `Dashboard.tsx`                     |
