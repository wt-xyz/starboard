# Theme System Migration: Vanilla Extract + OKLCH

## Philosophy

**Vanilla Extract is our styling system.** Tailwind exists only because Radix UI depends on it — it should never appear in our code. All theming, all tokens, all styles go through Vanilla Extract's `createThemeContract` + `createTheme`, with colors defined in the modern OKLCH color space.

## Why This Approach

| Criteria             | Score                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| New deps             | **None** — `createThemeContract` is in `@vanilla-extract/css` (already installed v1.18.0) |
| Runtime cost         | **Zero** — compiles to CSS custom properties at build time                                |
| Type safety          | **Full** — TypeScript enforces every theme fills every token                              |
| Color math           | **Modern** — OKLCH + `color-mix()` derives variants from base colors                      |
| Multi-theme          | **Built-in** — one class swap on root changes everything                                  |
| Tailwind involvement | **None** — Tailwind stays in its cage, used only by Radix internals                       |

## Why OKLCH

OKLCH is a perceptually uniform color space. Unlike hex/RGB/HSL, lightness 50% actually _looks_ 50% bright. This means:

- You define a few **base hues** and derive entire palettes mathematically
- `color-mix()` generates alpha variants from a single base — change the base, everything updates
- No more maintaining 12 hand-picked `rgba()` values per color
- 92%+ browser support as of 2025, used by Tailwind v4 internally

```
oklch(L% C H / alpha)
      │  │ │
      │  │ └─ Hue angle (0-360) — what color
      │  └─── Chroma (0-0.4) — how vivid
      └────── Lightness (0%-100%) — how bright
```

---

## Current State

Colors are a static TypeScript object with hardcoded hex/rgba values:

```ts
// frontend/src/styles/colors.ts
export const colors = {
  darkVoid: '#151419',
  liquidLava: '#F56E0F',
  gluonGrey: '#1B1B1E',
  slateGrey: '#262626',
  dustyGrey: '#878787',
  snow: '#FBFBFB',
  success: '#22c55e',
  error: '#ef4444',
  liquidLavaAlpha: { 10: 'rgba(...)', 15: 'rgba(...)', ... },
  whiteAlpha: { 5: 'rgba(...)', 10: 'rgba(...)', ... },
};
```

**Problems:**

- Every color is hardcoded — no way to swap themes without editing every file
- Alpha variants are pre-computed — change a base color and you must update 6+ rgba values manually
- Names are cosmetic (`gluonGrey`) not semantic (`cardBg`) — a component doesn't know _why_ it uses that color

---

## Target State: 3 New Files

### 1. `frontend/src/styles/theme.contract.css.ts` — The Contract

Defines **what tokens exist**. Empty strings are placeholders — TypeScript enforces that every theme fills every one.

```ts
import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    // Surfaces (5-layer elevation hierarchy — audit 1.3, 6.1)
    pageBg: '', // deepest background
    cardBg: '', // cards, panels, table containers
    surfaceElevated: '', // raised areas within cards (between card and input)
    inputBg: '', // inputs, interactive wells
    surfaceHover: '', // hover/focus highlight

    // Text hierarchy (4-tier — audit 6.2)
    textPrimary: '',
    textSecondary: '',
    textMuted: '',
    textDisabled: '', // replaces per-component opacity: 0.5/0.6

    // Brand accent (with active state — audit 6.5)
    primary: '',
    primaryHover: '',
    primaryActive: '', // :active pressed state
    primarySubtle: '', // low-chroma tint for surfaces

    // Semantic (with subtle bg tints — audit 6.3)
    success: '',
    successHover: '',
    successSubtle: '', // tinted bg for long/success indicators
    error: '',
    errorHover: '',
    errorSubtle: '', // tinted bg for short/error indicators
    warning: '',
    warningSubtle: '', // tinted bg for warning banners

    // Disabled surfaces (audit 8.2)
    surfaceDisabled: '', // disabled button/input bg

    // Borders (3-tier — audit 6.4)
    // Note: borderSubtle (5% white) is ~1.2:1 contrast — acceptable only for decorative
    // borders that are NOT the sole indicator of a UI boundary (WCAG 1.4.11).
    // Use borderDefault (10%) or borderStrong (20%) where the border is the only
    // visual separator between interactive components.
    borderSubtle: '', // 5%  — decorative only
    borderDefault: '', // 10% — standard (functional boundaries)
    borderStrong: '', // 20% — emphasis

    // Overlay
    overlay: '',

    // Focus ring (WCAG 2.4.7, 2.4.11, 2.4.12)
    focusRing: '', // visible focus indicator color (3:1 contrast vs adjacent)
  },

  // Focus indicator dimensions (WCAG 2.4.12 — minimum 2px perimeter)
  focus: {
    ringWidth: '', // outline width — minimum 2px
    ringOffset: '', // outline-offset — space between element and ring
  },

  // Minimum interactive target size (WCAG 2.5.8)
  a11y: {
    minTargetSize: '', // 44px recommended (AAA), 24px minimum (AA)
  },

  // Semantic radius tokens (audit 1.4, 3.1, 8.1, 9.1, 9.3 — everything 8px)
  radius: {
    button: '', // all buttons
    input: '', // all inputs, selects
    card: '', // cards, panels, table containers
    panel: '', // modals, sheets, popovers
    full: '', // pills, badges
  },

  // Font — body only, no monospace (audit 7.1)
  // Number alignment is handled by global font-variant-numeric: tabular-nums
  font: {
    body: '',
  },

  // Type scale (audit 7.2, 7.3, 7.4, 7.6)
  fontSize: {
    h1: '', // 32px — page headings
    h2: '', // 24px — section headings
    h3: '', // 20px — sub-headings
    bodyLg: '', // 16px — prominent body, submit buttons
    body: '', // 14px — default body
    bodySm: '', // 13px — compact body, table data
    caption: '', // 12px — captions, small labels
    label: '', // 11px — uppercase labels, column headers
    micro: '', // 10px — DECORATIVE ONLY: timestamps, badges. Never for interactive or informational text.
  },
  fontWeight: {
    normal: '', // 400 — body text
    medium: '', // 500 — emphasis, buttons (audit 7.3, 8.4)
    semibold: '', // 600 — headings, primary actions only
  },
  lineHeight: {
    tight: '', // 1.1 — headings
    normal: '', // 1.4 — body text
    relaxed: '', // 1.5 — small/caption text
  },
  letterSpacing: {
    tight: '', // -0.01em — headings
    normal: '', // 0 — body
    wide: '', // 0.03em — numbers, labels
  },

  // Spacing — 4-point grid (audit 3.9)
  space: {
    '2xs': '', // 2px
    xs: '', // 4px
    sm: '', // 8px
    md: '', // 12px — section gaps (audit needs this)
    lg: '', // 16px
    xl: '', // 24px
    '2xl': '', // 32px
  },

  // Transitions (audit 8.7, 10.1)
  transition: {
    fast: '', // 100ms — micro-interactions
    normal: '', // 150ms — hovers, focus (audit: standardize to 0.15s)
    slow: '', // 300ms — modals, sheets
  },
});
```

### 2. `frontend/src/styles/theme.starboard.css.ts` — Current Starboard Theme

```ts
import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

// ── Base hues in OKLCH ──────────────────────────────────
// These are the source colors. Everything else derives from them.
const base = {
  primary: 'oklch(65% 0.22 35)', // liquidLava orange
  success: 'oklch(64% 0.17 155)', // green
  error: 'oklch(58% 0.22 25)', // red
  warning: 'oklch(78% 0.16 85)', // yellow
  surface: 'oklch(12% 0.01 300)', // cool dark grey (hue 300 = slight purple)
  text: 'oklch(98% 0.005 0)', // near-white
} as const;

export const starboardTheme = createTheme(vars, {
  color: {
    // Surfaces — 5-layer elevation (audit 1.3, 6.1)
    pageBg: 'oklch(10% 0.01 300)', // deepest
    cardBg: 'oklch(13% 0.01 300)', // panels
    surfaceElevated: 'oklch(15% 0.008 300)', // raised areas within cards
    inputBg: 'oklch(17% 0.005 300)', // input wells
    surfaceHover: 'oklch(20% 0.005 300)', // hover highlight

    // Text — 4-tier hierarchy (audit 6.2)
    // Contrast ratios verified against cardBg (oklch 13%):
    textPrimary: base.text, // ~15.5:1 on cardBg ✓ AA
    textSecondary: 'oklch(62% 0.01 300)', // ~5.8:1 on cardBg  ✓ AA (bumped from 58% to pass 4.5:1)
    textMuted: 'oklch(48% 0.01 300)', // ~3.5:1 on cardBg  ✓ AA large text only
    textDisabled: 'oklch(35% 0.005 300)', // ~1.8:1 on cardBg  — intentionally low (disabled = non-interactive)

    // Brand — with active state (audit 6.5)
    primary: base.primary,
    primaryHover: 'oklch(58% 0.22 35)',
    primaryActive: 'oklch(52% 0.22 35)', // :active pressed
    primarySubtle: 'oklch(20% 0.04 35)',

    // Semantic — with subtle bg tints (audit 6.3)
    success: base.success,
    successHover: 'oklch(58% 0.17 155)',
    successSubtle: 'oklch(20% 0.04 155)', // long/success tinted bg
    error: base.error,
    errorHover: 'oklch(52% 0.22 25)',
    errorSubtle: 'oklch(20% 0.04 25)', // short/error tinted bg
    warning: base.warning,
    warningSubtle: 'oklch(25% 0.04 85)', // warning banner bg

    // Disabled surfaces (audit 8.2)
    surfaceDisabled: 'oklch(17% 0.005 300)',

    // Borders — 3-tier (audit 6.4)
    borderSubtle: 'color-mix(in oklch, white 5%, transparent)',
    borderDefault: 'color-mix(in oklch, white 10%, transparent)',
    borderStrong: 'color-mix(in oklch, white 20%, transparent)',

    // Overlay
    overlay: 'oklch(0% 0 0 / 70%)',

    // Focus ring — solid blue, 3:1+ contrast against all surfaces
    focusRing: 'oklch(65% 0.20 260)', // ~#4A7AFF — passes 3:1 on pageBg through surfaceHover
  },

  // Focus indicator dimensions (WCAG 2.4.12)
  focus: {
    ringWidth: '2px',
    ringOffset: '2px',
  },

  // Minimum interactive target size (WCAG 2.5.8)
  a11y: {
    minTargetSize: '44px',
  },

  // Semantic radius — all 8px except pills (audit 1.4, 3.1, 8.1, 9.1)
  radius: {
    button: '8px',
    input: '8px',
    card: '8px',
    panel: '12px',
    full: '9999px',
  },

  font: {
    body: 'system-ui, -apple-system, sans-serif',
  },

  // Type scale (audit 7.2)
  fontSize: {
    h1: '2rem', // 32px
    h2: '1.5rem', // 24px
    h3: '1.25rem', // 20px
    bodyLg: '1rem', // 16px
    body: '0.875rem', // 14px
    bodySm: '0.8125rem', // 13px
    caption: '0.75rem', // 12px
    label: '0.6875rem', // 11px
    micro: '0.625rem', // 10px — DECORATIVE ONLY
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: '1.1',
    normal: '1.4',
    relaxed: '1.5',
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.03em',
  },

  // 4-point spacing grid (audit 3.9)
  space: {
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  // Transition durations (audit 8.7, 10.1)
  transition: {
    fast: '100ms',
    normal: '150ms',
    slow: '300ms',
  },
});
```

### 3. `frontend/src/styles/theme.gmx.css.ts` — GMX-Aligned Theme

```ts
import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

// ── GMX base hues in OKLCH ──────────────────────────────
// GMX uses blue-tinted dark backgrounds (hue ~270 = blue-violet)
const base = {
  primary: 'oklch(65% 0.22 35)', // Keep Starboard's brand orange
  success: 'oklch(76% 0.18 165)', // GMX #0FDE8D — minty green
  error: 'oklch(63% 0.20 12)', // GMX #FF506A — coral red
  warning: 'oklch(78% 0.15 85)', // GMX #F3B50C — amber
  surface: 'oklch(13% 0.03 270)', // blue-tinted dark
  text: 'oklch(100% 0 0)', // pure white
} as const;

export const gmxTheme = createTheme(vars, {
  color: {
    // Surfaces — 5-layer blue-tinted grey (GMX signature look)
    pageBg: 'oklch(8% 0.03 270)', // #090A14
    cardBg: 'oklch(13% 0.03 270)', // #16182E
    surfaceElevated: 'oklch(15% 0.03 270)', // between card and input
    inputBg: 'oklch(17% 0.03 270)', // #1E2033
    surfaceHover: 'oklch(20% 0.03 270)', // #23263B

    // Text — 4-tier hierarchy
    // Contrast ratios verified against cardBg (oklch 13%, ~#16182E):
    textPrimary: base.text, // ~16.5:1 on cardBg ✓ AA
    textSecondary: 'oklch(70% 0.03 270)', // ~6.2:1 on cardBg  ✓ AA  (#a0a3c4)
    textMuted: 'oklch(50% 0.04 270)', // ~3.2:1 on cardBg  ✓ AA large text only (#696D96)
    textDisabled: 'oklch(30% 0.04 270)', // ~1.6:1 on cardBg  — intentionally low (#3E4361)

    // Brand — with active state
    primary: base.primary,
    primaryHover: 'oklch(58% 0.22 35)',
    primaryActive: 'oklch(52% 0.22 35)',
    primarySubtle: 'oklch(20% 0.05 35)',

    // Semantic — with subtle bg tints
    success: base.success,
    successHover: 'oklch(70% 0.18 165)',
    successSubtle: 'oklch(20% 0.04 165)',
    error: base.error,
    errorHover: 'oklch(57% 0.20 12)',
    errorSubtle: 'oklch(20% 0.04 12)',
    warning: base.warning,
    warningSubtle: 'oklch(25% 0.04 85)',

    // Disabled surfaces
    surfaceDisabled: 'oklch(17% 0.03 270)', // #1e2033

    // Borders — GMX uses visible blue-tinted borders
    borderSubtle: 'oklch(25% 0.04 270 / 50%)', // faint blue
    borderDefault: 'oklch(30% 0.05 270)', // #333661
    borderStrong: 'oklch(33% 0.05 270)', // #363a59

    // Overlay
    overlay: 'oklch(0% 0 0 / 70%)',

    // Focus ring — solid blue, 3:1+ contrast against all surfaces
    focusRing: 'oklch(60% 0.18 260)', // slightly dimmer blue on GMX's blue-tinted surfaces
  },

  // Focus indicator dimensions (WCAG 2.4.12)
  focus: {
    ringWidth: '2px',
    ringOffset: '2px',
  },

  // Minimum interactive target size (WCAG 2.5.8)
  a11y: {
    minTargetSize: '44px',
  },

  // Semantic radius — GMX uses 8px everywhere
  radius: {
    button: '8px',
    input: '8px',
    card: '8px',
    panel: '8px',
    full: '9999px',
  },

  font: {
    body: 'system-ui, -apple-system, sans-serif',
  },

  // Type scale — GMX uses rem based on 10px root (we keep 16px root)
  fontSize: {
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    bodyLg: '1rem',
    body: '0.875rem',
    bodySm: '0.8125rem',
    caption: '0.75rem',
    label: '0.6875rem',
    micro: '0.625rem', // DECORATIVE ONLY
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: '1.1',
    normal: '1.4',
    relaxed: '1.5',
  },
  letterSpacing: {
    tight: '-0.016em', // GMX heading value
    normal: '0',
    wide: '0.03em', // GMX number/label value
  },

  // 4-point spacing grid
  space: {
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  // Transition durations
  transition: {
    fast: '100ms',
    normal: '150ms',
    slow: '300ms',
  },
});
```

---

## How Alpha Variants Work (No More Pre-Computed rgba)

The old way required maintaining separate values for every opacity level:

```ts
// OLD: 6 values to maintain per color
liquidLavaAlpha: {
  10: 'rgba(245,110,15,0.10)',
  15: 'rgba(245,110,15,0.15)',
  20: 'rgba(245,110,15,0.20)',
  30: 'rgba(245,110,15,0.30)',
}
```

With OKLCH + `color-mix()`, derive them inline wherever needed:

```ts
// NEW: derive on the spot from the theme variable
export const card = style({
  // 15% of the primary color mixed with transparent
  backgroundColor: `color-mix(in oklch, ${vars.color.primary} 15%, transparent)`,

  // Or use the OKLCH alpha channel directly
  boxShadow: `0 0 0 3px oklch(from ${vars.color.primary} l c h / 15%)`,
});
```

If you find yourself repeating the same alpha pattern, create a tiny helper:

```ts
// frontend/src/styles/alpha.ts
export const alpha = (colorVar: string, percent: number) =>
  `color-mix(in oklch, ${colorVar} ${percent}%, transparent)`;

// Usage:
import { alpha } from '@/styles/alpha';
backgroundColor: alpha(vars.color.primary, 15),
```

This means the theme contract **doesn't need alpha tokens at all** — components derive them from base colors. Change the base → every alpha updates automatically.

---

## Applying the Theme

### In `main.tsx`

```tsx
import { Theme } from '@radix-ui/themes';
import { gmxTheme } from './styles/theme.gmx.css';

createRoot(document.getElementById('root')!).render(
  <Theme appearance="dark">
    <div className={gmxTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </Theme>
);
```

One class on one div. Swap `gmxTheme` for `starboardTheme` to switch everything.

### Global Typography Reset (audit 7.1, 7.5)

In your theme file (or a shared `global.css.ts`), add a root-level style that kills the need for monospace on numbers:

```ts
// frontend/src/styles/global.css.ts
import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

// ── Typography baseline ────────────────────────────────
globalStyle(':root', {
  fontFamily: vars.font.body,
  fontVariantNumeric: 'tabular-nums lining-nums', // fixed-width digits everywhere
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

// ── Focus ring default (WCAG 2.4.7, 2.4.12) ──────────
// Every interactive element gets a visible focus indicator.
// Components can override, but the baseline is always there.
globalStyle(':focus-visible', {
  outline: `${vars.focus.ringWidth} solid ${vars.color.focusRing}`,
  outlineOffset: vars.focus.ringOffset,
});

// ── Reduced motion (WCAG 2.3.3) ───────────────────────
// Users who experience vestibular disorders can disable animations.
// This zeroes out all transitions and animations globally.
globalStyle('@media (prefers-reduced-motion: reduce)', {});
// Note: Vanilla Extract doesn't support @media in globalStyle directly.
// Use a raw CSS file or globalStyle on individual selectors:
```

For the reduced-motion override, add a companion plain CSS rule in `index.css` (or a `.css.ts` using `globalStyle` per selector):

```css
/* frontend/src/styles/reduced-motion.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This single file respects every user's OS-level "reduce motion" setting. No per-component work needed — it blanket-overrides all animation/transition durations.

### What these global rules do

| Rule                       | Purpose                                                          | WCAG           |
| -------------------------- | ---------------------------------------------------------------- | -------------- |
| `tabular-nums lining-nums` | Fixed-width digits everywhere, kills need for monospace          | Audit 7.1, 7.5 |
| `:focus-visible` outline   | Every interactive element gets a 2px focus ring by default       | 2.4.7, 2.4.12  |
| `prefers-reduced-motion`   | Disables all animation/transitions for vestibular disorder users | 2.3.3          |

**Migration action for monospace:** Replace all 38+ instances of `fontFamily: 'monospace'` with nothing. The global rule handles alignment. If a component also needs `letterSpacing: vars.letterSpacing.wide` for extra number clarity, add that explicitly.

---

## Component Migration

Replace `colors.xxx` with `vars.color.xxx` in `.css.ts` files:

```diff
- import { colors } from '@/styles/colors';
+ import { vars } from '@/styles/theme.contract.css';

  export const card = style({
-   backgroundColor: colors.gluonGrey,
+   backgroundColor: vars.color.cardBg,
-   border: `1px solid ${colors.whiteAlpha[10]}`,
+   border: `1px solid ${vars.color.borderDefault}`,
-   color: colors.snow,
+   color: vars.color.textPrimary,
  });
```

For alpha values that used to come from the colors object:

```diff
- backgroundColor: colors.liquidLavaAlpha[15],
+ backgroundColor: `color-mix(in oklch, ${vars.color.primary} 15%, transparent)`,
```

Or with the helper:

```diff
+ import { alpha } from '@/styles/alpha';
- backgroundColor: colors.liquidLavaAlpha[15],
+ backgroundColor: alpha(vars.color.primary, 15),
```

### Semantic naming migration map

#### Colors

| Old                                      | New                                               | Rationale                                    |
| ---------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `colors.darkVoid`                        | `vars.color.pageBg`                               | Semantic: page background                    |
| `colors.gluonGrey`                       | `vars.color.cardBg`                               | Semantic: card/panel surface                 |
| `colors.slateGrey`                       | `vars.color.inputBg` or `vars.color.surfaceHover` | Context-dependent                            |
| _(no equivalent)_                        | `vars.color.surfaceElevated`                      | New: raised area within cards                |
| `colors.snow`                            | `vars.color.textPrimary`                          | Semantic: primary text                       |
| `colors.dustyGrey`                       | `vars.color.textSecondary`                        | Semantic: secondary text                     |
| `opacity: 0.5` / `opacity: 0.6` on text  | `vars.color.textDisabled`                         | Replaces ad-hoc opacity (audit 6.2)          |
| `colors.liquidLava`                      | `vars.color.primary`                              | Semantic: primary action                     |
| `#E05D0A` (hardcoded in 6+ files)        | `vars.color.primaryHover`                         | Centralized hover token (audit 6.5)          |
| `#CC5209` (hardcoded in 6+ files)        | `vars.color.primaryActive`                        | Centralized active/pressed token (audit 6.5) |
| `colors.success`                         | `vars.color.success`                              | 1:1                                          |
| `colors.error`                           | `vars.color.error`                                | 1:1                                          |
| _(no equivalent)_                        | `vars.color.warning`                              | New: warning states (audit 6.3)              |
| _(no equivalent)_                        | `vars.color.successSubtle`                        | New: long/success tinted bg (audit 6.3)      |
| _(no equivalent)_                        | `vars.color.errorSubtle`                          | New: short/error tinted bg (audit 6.3)       |
| _(no equivalent)_                        | `vars.color.warningSubtle`                        | New: warning banner bg (audit 6.3)           |
| _(no equivalent)_                        | `vars.color.surfaceDisabled`                      | New: disabled button/input bg (audit 8.2)    |
| `colors.whiteAlpha[5]`                   | `vars.color.borderSubtle`                         | Semantic: faint border                       |
| `colors.whiteAlpha[8]`                   | `vars.color.borderDefault`                        | Merge into 10% tier (audit 6.4)              |
| `colors.whiteAlpha[10]`                  | `vars.color.borderDefault`                        | Semantic: standard border                    |
| `colors.whiteAlpha[20]`                  | `vars.color.borderStrong`                         | Semantic: emphasis border                    |
| `colors.whiteAlpha[30]`                  | `vars.color.borderStrong`                         | Merge into 20% tier (audit 6.4)              |
| `#374151` (Tailwind gray in sheet)       | `vars.color.borderDefault`                        | Replace rogue Tailwind color (audit 10.4)    |
| `rgba(0,0,0,0.7)` (dialog overlay)       | `vars.color.overlay`                              | Standardize overlay (audit 10.2)             |
| `rgba(0,0,0,0.5)` (sheet overlay)        | `vars.color.overlay`                              | Standardize overlay (audit 10.2)             |
| `#ff4444` / `#ff6b6b` (hardcoded errors) | `vars.color.error`                                | Replace rogue error reds (audit 6.3)         |
| `colors.liquidLavaAlpha[N]`              | `alpha(vars.color.primary, N)`                    | Derived — no token needed                    |
| `colors.dustyGreyAlpha[N]`               | `alpha(vars.color.textSecondary, N)`              | Derived — no token needed                    |

#### Typography

| Old                                       | New                                | Rationale                                                  |
| ----------------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `fontFamily: 'monospace'` (38+ files)     | _Remove entirely_                  | Global `tabular-nums` handles number alignment (audit 7.1) |
| Inline `fontSize: '0.75rem'` etc.         | `vars.fontSize.caption` etc.       | Use type scale tokens (audit 7.2)                          |
| `fontWeight: 600` (overused)              | `vars.fontWeight.medium` (500)     | Reserve 600 for headings only (audit 7.3)                  |
| _(no lineHeight set)_                     | `vars.lineHeight.normal` (1.4)     | Add explicit line heights (audit 7.4)                      |
| `letterSpacing: '0.05em'` etc. (7 values) | `vars.letterSpacing.wide` (0.03em) | Consolidate to 3 tiers (audit 7.6)                         |

#### Spacing, Radius, Transitions

| Old                                 | New                              | Rationale                              |
| ----------------------------------- | -------------------------------- | -------------------------------------- |
| `borderRadius: '4px'` on buttons    | `vars.radius.button` (8px)       | System-wide 8px (audit 8.1)            |
| `borderRadius: '6px'` on inputs     | `vars.radius.input` (8px)        | System-wide 8px (audit 9.1)            |
| `borderRadius: 0` on panels         | `vars.radius.card` (8px)         | Panels are cards (audit 1.4, 3.1)      |
| `gap: '6px'` (cramped fee rows)     | `vars.space.md` (12px)           | Proper breathing room (audit 3.4, 3.9) |
| `transition: '0.2s'` (inconsistent) | `vars.transition.normal` (150ms) | Standardize hover timing (audit 8.7)   |
| `500ms` modal open animation        | `vars.transition.slow` (300ms)   | Snappier modals (audit 10.1)           |

---

## Migration Strategy

### Phase 1: Scaffold (30 min)

- Create the 3 theme files (contract + starboard + gmx)
- Create the `alpha()` helper
- Create `global.css.ts` with `tabular-nums` root rule, `:focus-visible` default, and font smoothing
- Create `reduced-motion.css` with the blanket `prefers-reduced-motion` override
- Apply theme class in `main.tsx`
- Import `global.css.ts` and `reduced-motion.css` in `main.tsx`
- Keep `colors.ts` as-is — nothing breaks, both systems coexist

### Phase 2: Kill Monospace (1 hour)

- Remove all 38+ `fontFamily: 'monospace'` instances across `.css.ts` files
- The global `tabular-nums` rule from Phase 1 handles number alignment
- Where extra number clarity is needed, add `letterSpacing: vars.letterSpacing.wide`
- Verify no visual regressions in price displays, tables, order entry

### Phase 3: Migrate Components (2-3 hours)

- Replace `colors.xxx` → `vars.color.xxx` file by file (see migration map)
- Replace `colors.xxxAlpha[N]` → `alpha(vars.color.xxx, N)`
- Replace hardcoded hex values (`#E05D0A`, `#CC5209`, `#ff4444`, `#374151`) with tokens
- Replace `opacity: 0.5`/`0.6` disabled patterns with `vars.color.textDisabled` / `vars.color.surfaceDisabled`
- Replace inline `fontSize`, `fontWeight`, `letterSpacing` values with type scale tokens
- Replace inconsistent `borderRadius` values with semantic `vars.radius.*` tokens
- Replace inconsistent `transition` durations with `vars.transition.*` tokens
- ~50 `.css.ts` files to update, each independently testable

### Phase 4: Migrate Radix Overrides

- Update `radix-overrides.css.ts` to use `vars.color.xxx` instead of `colors.xxx`
- Update `toastify.css.ts`, `scrollbar.css.ts` likewise

### Phase 5: Bridge TradingView (audit 4.6)

- Update `public/tradingview/colors.css` to reference the theme's CSS custom properties
- Add a `globalStyle` that syncs theme tokens to TradingView's expected variable names:
  ```ts
  globalStyle(':root', {
    vars: {
      '--color-accent': vars.color.primary,
      '--color-layer-1': vars.color.pageBg,
      '--color-layer-2': vars.color.cardBg,
      '--color-layer-3': vars.color.inputBg,
    },
  });
  ```
- This ensures the TradingView chart theme stays in sync when switching themes

### Phase 6: Cleanup

- Delete `colors.ts`
- Remove any remaining hardcoded hex/rgba values
- Run a grep for leftover `#` hex literals in `.css.ts` files
- Run a grep for leftover `fontFamily: 'monospace'` instances
- Run a grep for leftover `opacity: 0.5` / `opacity: 0.6` disabled patterns
- Verify all `rgba(0,0,0,...)` overlay values replaced with `vars.color.overlay`

### Phase 7: Accessibility Hardening

- Verify all `textSecondary` / `textMuted` meet contrast ratios against their actual backgrounds (use browser devtools or [polypane.app](https://polypane.app) contrast checker)
- Audit every interactive element for `:focus-visible` — the global rule covers most, but custom components (sliders, custom dropdowns, tabs) may need overrides
- Ensure all clickable elements meet `vars.a11y.minTargetSize` (44px) — especially: Max/Half buttons, slippage controls, leverage labels, position action buttons, close icons
- Replace all `fontSize.micro` (10px) usage on informational text with `fontSize.label` (11px) or `fontSize.caption` (12px) — micro is decorative only
- Fix TradingView mobile scale font from 6px to 9px minimum
- Ensure Long/Short indicators always have a non-color cue (text label, icon, or shape) alongside green/red
- Replace `window.confirm()` with accessible modal dialog (`role="alertdialog"`, `aria-describedby`, focus trap)
- Add `aria-label` to all icon-only buttons (close, hamburger, kebab menu)

### Phase 8: Kill `tw` prop usage (optional, recommended)

- Audit all `tw="..."` usage across components
- Move those utilities into proper Vanilla Extract `style()` definitions
- Remove `css-tw-transform.ts` plugin and `tw` prop type declarations
- Tailwind becomes invisible — only Radix's internal dependency remains

---

## Alternatives Considered

| Alternative                                  | Why not                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Tailwind `@theme`**                        | We don't want Tailwind in our code. It's a Radix dependency, not our styling system. |
| **Sprinkles** (`@vanilla-extract/sprinkles`) | Atomic utility CSS — solves a different problem (utility props, not theming)         |
| **Rainbow Sprinkles**                        | Extra dependency, overlaps with what `recipe()` already does for us                  |
| **CSS Modules + manual variables**           | No type safety, manual wiring, no build-time contract validation                     |
| **Radix Theme tokens only**                  | Too coupled to Radix components, doesn't cover our custom VE styles                  |
| **Panda CSS / Stitches**                     | Entirely different styling engine — massive migration for zero benefit               |
| **Static hex values (current approach)**     | No theming, no derivation, manual alpha maintenance                                  |
