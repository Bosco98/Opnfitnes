# FitnessPal — Engineering Conventions

Client-side PWA. React + TypeScript + Vite + custom CSS. No backend, no auth.
All state in `localStorage`. Workouts generated via the user's own OpenRouter key.
Read `plan.md` for product scope, `PRODUCT.md` / `DESIGN.md` for design intent.

## Architecture: Atomic Design

```
src/components/
  atoms/      one job, no app logic, no data fetching (Button, IconTile, Card…)
  molecules/  small compositions of atoms (SelectableGrid, StepNav, MetricCard…)
  organisms/  feature-level compositions with state wiring (WorkoutWizard, TabBar…)
  templates/  page/screen layout shells (Screen, TabScreen)
src/pages/    the three tabs (Workout, Analysis, Settings)
src/hooks/    stateful logic, one concern each (useSettings, useTimer…)
src/lib/      pure functions + side-effect adapters (storage, openrouter, analytics)
src/types/    shared types
src/styles/   tokens.css (design system) + base.css
```

Each component lives in its own folder: `Component.tsx` + `Component.css`,
re-exported from `index.ts`. Variants are props (`variant`, `size`, `tone`),
never copy-pasted components.

## Code guidelines (karpathy / DRY / SRP / loosely SOLID)

- **SRP:** one reason to change per file. UI renders; hooks hold state; lib is
  logic. Components never call `fetch` or touch `localStorage` directly — they go
  through a hook or a lib adapter.
- **DRY:** the four wizard inputs share one `SelectableGrid`. Charts share one
  SVG primitive set. Storage goes through one typed `createStore` factory.
- **Surgical changes:** match surrounding style; smallest diff that works. Don't
  reach for a library where ~30 lines of CSS/SVG do the job (charts are custom).
- **Make assumptions explicit:** validate/parse all `localStorage` reads and LLM
  JSON; never trust shape. Define success as: typechecks, builds, runs, looks
  right at 375px and desktop.
- **No premature abstraction.** Abstract on the second real use, not the first.

## Conventions

- Styling: CSS files + CSS variables from `tokens.css`. No CSS-in-JS, no utility
  framework. Class names: `block__element--modifier` (loose BEM).
- Imports use the `@/` alias for `src`.
- Icons: `lucide-react`, one consistent stroke style.
- Dates: native `Date`; history pruned to rolling 30 days on startup.
- Accessibility is non-negotiable: see PRODUCT.md. Test both themes.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` — types only
