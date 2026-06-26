# Design

## Theme

"Blueprint athletics." Cool indigo authority + a charged electric-cyan pulse on
every action. Mobile-first product UI, dense with the user's own data. Full
light and dark, driven by `prefers-color-scheme` with a manual override.

## Color (OKLCH)

Roles are theme-scoped CSS variables in `src/styles/tokens.css`. Both themes
share the same hue family (indigo ~262, accent cyan ~225).

**Dark (default in gym/evening context)**
- `--bg` near-black cool: `oklch(0.16 0.012 264)`
- `--surface` panel: `oklch(0.205 0.014 264)`
- `--surface-2` raised: `oklch(0.245 0.016 264)`
- `--ink` primary text: `oklch(0.97 0.005 264)`
- `--ink-muted` secondary: `oklch(0.74 0.015 264)` (≥4.5:1 on bg)
- `--primary` indigo: `oklch(0.66 0.16 264)`
- `--accent` electric cyan: `oklch(0.78 0.15 220)`
- `--line` borders: `oklch(0.30 0.015 264)`

**Light**
- `--bg` pure white: `oklch(1 0 0)`
- `--surface`: `oklch(0.985 0.004 264)`
- `--ink`: `oklch(0.22 0.02 264)`
- `--ink-muted`: `oklch(0.46 0.02 264)`
- `--primary`: `oklch(0.50 0.18 264)`
- `--accent`: `oklch(0.62 0.16 225)`

Semantic: `--success` green ~150, `--warn` amber ~75, `--danger` red ~25,
each with a low-chroma tint for backgrounds. Color is never the only signal.

## Typography

One family does the UI work + one for numerals.
- **UI / body:** `"Inter Variable", system-ui` — fixed rem scale (not fluid),
  ratio ~1.2.
- **Numerals / display:** `"Space Grotesk", "Inter"` for big stats, the logotype,
  timer, and metric numbers — tabular, tight but ≥ -0.03em.
- Scale: 0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25 / 3rem.

## Spacing & Radius

- Space scale (rem): 0.25 0.5 0.75 1 1.5 2 3 4.
- Radius: `--r-sm` 8px, `--r-md` 12px, `--r-lg` 16px, `--r-pill` 999px.
  Cards top out at 16px. No 24px+ on cards.
- Shadows: one defined elevation per theme, ≤8px blur. Never paired with a
  visible border on the same element.

## Motion

150–250ms, ease-out (`--ease-out-quint` cubic-bezier(0.22,1,0.36,1)). Motion
conveys state: step transitions in the wizard, selection feedback, the running
timer ring, chart entrance (staggered, once). Full `prefers-reduced-motion`
fallbacks (crossfade / instant).

## Z-index scale

`--z-base` 0 → `--z-sticky` 100 → `--z-tabbar` 200 → `--z-overlay` 300 →
`--z-modal` 400 → `--z-toast` 500.

## Components (atomic)

atoms/ → molecules/ → organisms/ → templates/. Every interactive atom ships
default / hover / focus / active / disabled / (loading where relevant). Square
selectable tiles (icon + label) are the signature pattern for the wizard;
checkmark + accent border on select, never color alone.
