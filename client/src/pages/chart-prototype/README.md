# Chart library prototype

Throwaway evaluation of whether TanStack Charts improves this app's visuals,
accessibility, and code. This is not a production migration.

## Run

From the repository root:

```sh
bun run --cwd client chart-prototype
```

Open <http://127.0.0.1:3010/charts?variant=clarity>. The normal app shell runs
with mock authentication and MSW data, without a live account or API. Sample
records are deterministic and end on October 24, 2026. Controls and mock changes
are not persisted to a database.

To compare charts against a real signed-in account instead, start `bun run dev`
and open <http://localhost:3000/charts>. Local development opens the TanStack parity
view by default; the bottom switcher still provides the old and clarity views.
This view uses all activity names from that account, omits demo-only scenario controls, and derives comparison
periods from the account's recorded years and latest recorded month.

The bottom switcher changes `?variant=` without resetting the controls:

| Variant    | Purpose                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `baseline` | Existing Chart.js bars and pie, plus the existing comparison configuration                                           |
| `parity`   | Existing chart layout with TanStack, a compact multi-column pie legend, and partial-period comparison indicators     |
| `clarity`  | Ranked horizontal bars, separate category/status summaries, patterned comparison lines, and explicit partial periods |

Try the long-name, single-activity, inactive-only, and empty scenarios; grouped
and flat mode; date ranges; two or seven comparison periods; light/dark themes;
and a narrow viewport. Arrow-key switching is intentionally disabled while a
plot or form control has focus.

## Verdict

**The selected direction is B's familiar layout with C's partial-period
indicators.** The custom pie is viable when the legend uses horizontal space
instead of stretching the card. C remains an alternative design exploration,
not the chosen layout. Both TanStack variants distinguish incomplete periods
and omit future buckets rather than plotting misleading zeros.

The code is not uniformly shorter. Typed activity/ring rows remove Chart.js
dataset casts and numeric ring-index decisions, and can feed both charts and
tables. Conversely, TanStack requires more explicit scale, mark, curve, and
legend configuration. Its real advantage here is keyboard point exploration
and live value announcements, not automatically cleaner React.

A matched production replacement using the actual parity components saved about
**13.5 kB gzip / 3.5% of application JavaScript**. The shared chart chunk was
about **54.0 kB instead of 64.7 kB gzip**. This is a replacement-build estimate;
the A/B/C demo loads both libraries and is not itself a small-bundle migration.

Automated accessibility checks found no WCAG A/AA violations in the TanStack
prototype region across the evaluated desktop/mobile/light/dark/dense cases.
The baseline region had light-theme muted-text contrast failures. The scoped
contrast fixes, exact data tables, and clearer explanations are design work,
not benefits unique to TanStack. No manual screen-reader audit was performed.

## Parity boundaries and implementation lessons

- Counts, stable activity colors, ring weights, and existing comparison bucket
  calculations are checked against the current chart data builders.
- Curves use monotone interpolation rather than Chart.js's exact tension curve.
  Legend styling, SVG animation, and theme-aware ring borders are not pixel-identical.
- Activity legend filtering recomputes all pie rings consistently. Mobile users
  can expand a keyboard-accessible legend instead of losing it entirely.
- The clarity variant intentionally changes the layout and palette. Both
  TanStack variants handle partial periods, retain zero baselines, and keep a
  stable time domain when a series is hidden.
- Use configured scale **instances** for fixed domains. A scale factory infers
  its domain from the data, even if its returned scale was configured with zero.
  The prototype caught and corrected a misleading truncated comparison axis.
- SVG `fill` is a paint string or accessor, not a field-name shorthand.
- Keep optional prototype search fields optional in the route validator so
  existing navigation does not gain a required `search` argument.
- Give adjacent counts and percentages spoken units; CSS spacing alone does
  not distinguish them for assistive technology.
- Scope fixture-name filters and sample-data labels to the dedicated sample
  runner. Applying a default demo scenario to live records can hide every
  activity even when the API returned valid data.
- Bound desktop legends to the chart height and let compact entries form
  multiple columns. A narrow, unbounded flex legend made a 30-entry pie row
  grow to 1,254 pixels even though the SVG was only 400 pixels high.
- The prototype renderer and runner are development-only. Production JavaScript
  excludes them; source scanning can still include their Tailwind utilities on
  this throwaway branch.

## Refinement after trying real data

The preferred direction is B's existing chart layout, with C's partial-period
labeling and dashed incomplete-series line. B is now the default local view.
Its pie legend uses the available horizontal space for compact columns and
scrolls internally only when necessary; it no longer stretches the chart card.
