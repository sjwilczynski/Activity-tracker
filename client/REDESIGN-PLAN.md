# Activity Tracker Redesign Plan

## Architecture Overview

**Current:** React 18 + React Router v7 (framework mode) + MUI 5/Emotion + Chart.js + Firebase Auth + React Query + Jotai + @tanstack/react-form. Bundle limit: 365 kB. Monorepo: `/client` (Vite frontend) + `/api` (Azure Functions + Firebase RTDB).

**Target:** Same architecture, replacing UI layer: Tailwind CSS v4 + shadcn/ui (Radix primitives) + Recharts + Lucide icons + Sonner toasts. CSS-only animations. Native `<input type="date">` replaces MUI date pickers. Font: Bricolage Grotesque.

**Data model (current):** `Activity { name, active: boolean, date }`, `Category { name, active: boolean, description, subcategories? }`. New fields (description, intensity, timeSpent, category reference) added only in checkpoint 8 with backend work.

**Color system:** Category-based colors with lighter/darker variants per activity. Until categories are linked to activities (CP8), use per-activity-name hash as fallback. 5 CSS chart variables (`--chart-1` through `--chart-5`) as seed palette.

## Key Decisions

- Keep current data model during UI migration; new fields added with backend work (CP8)
- CSS animations only (no framer-motion)
- Update Storybook stories per checkpoint
- MUI and Tailwind coexist during migration (`StyledEngineProvider injectFirst` avoids conflicts)
- "Log Activity with Details" dialog (intensity/timeSpent/description) deferred to CP8
- Category-based color palette with per-activity hash fallback

## Reference Files

- Design guide: `/home/stachu/dyskD/ubuntu/programy/github/prototypes/redesign-guide/DESIGN-GUIDE.md`
- Design screenshots: `/home/stachu/dyskD/ubuntu/programy/github/prototypes/redesign-guide/*.png`
- Prototype: `/home/stachu/dyskD/ubuntu/programy/github/prototypes/src/designs/design0/`
- Spec: `client/SPEC.md`

---

## Checkpoints

### CP0: Foundation Setup

- [x] Install deps: `tailwindcss @tailwindcss/vite lucide-react recharts sonner class-variance-authority clsx tailwind-merge`
- [x] Add `@tailwindcss/vite` plugin to `client/vite.config.ts`
- [x] Create `client/src/app/globals.css` — `@import "tailwindcss"`, Bricolage Grotesque font, full CSS theme variables (light `:root` + `.dark`) per design guide, chart color vars, background gradient
- [x] Create `client/src/utils/cn.ts` — `cn()` utility (clsx + tailwind-merge)
- [x] Create `client/components.json` — shadcn/ui config (style: new-york, rsc: false, `@/*` aliases)
- [x] Add `@/*` path alias to `client/tsconfig.json`
- [x] Import `globals.css` in `src/app/root.tsx`, replace Roboto font link with Bricolage Grotesque
- [x] Import `globals.css` in `.storybook/preview.ts`, update `.storybook/preview-head.html` font
- [x] Bridge theme: modify `StylesProvider.tsx` to also toggle `document.documentElement.classList` `dark` class
- [x] Create `client/src/utils/colors.ts` — color utility: per-activity hash color generator, category-to-color mapping, lighter/darker variant functions using HSL. Seed palette from `--chart-1` through `--chart-5`.
- [x] Verify: app looks identical, Tailwind classes work, Storybook renders

> **Knip exceptions added** in `knip.json` for unused CP0 deps/files. Remove from `ignoreDependencies`/`ignore` as each CP starts using them:
>
> - CP1: `lucide-react` (icons), `class-variance-authority` + `clsx` + `tailwind-merge` (shadcn components use `cn()` → also remove `src/utils/cn.ts` from ignore)
> - CP3: `sonner` (toasts), `recharts` (if used early) — also remove `src/utils/colors.ts` from ignore when first imported
> - CP5: `recharts` (charts)
> - CP7: `tailwindcss` (no longer dev-only concern after MUI removal, but can stay in devDeps ignore)

### CP1: Login + Loading Screen

- [ ] Add shadcn components: `button`, `input`, `label`, `separator`, `card`
- [ ] Rewrite `src/auth/Login.tsx`: MUI → shadcn Card/Button/Input/Separator + Tailwind. Google icon → inline SVG. Gradient heading per design guide. Toggle sign-in/sign-up mode.
- [ ] Rewrite `src/components/states/Loading.tsx`: MUI `CircularProgress` → CSS-animated "AT" logo with breathing scale/opacity animation + bouncing dots. Keep `role="progressbar"` for test compat.
- [ ] Update `src/components/states/HydrateFallback.tsx`: brand color `#5085BE`, background `#FAF5EE`
- [ ] Update `src/auth/Login.stories.tsx`
- [ ] Verify: Login stories pass, login page matches design screenshots (light + dark)

### CP2: Background + Navigation

- [ ] Add shadcn components: `sidebar`, `avatar`, `tooltip`, `sheet`, `dropdown-menu`
- [ ] Rewrite `src/app/routes/_layout.tsx`: MUI `styled` grid → shadcn `SidebarProvider` + `SidebarInset`
- [ ] Rewrite `src/components/navigation/Navigation.tsx`: MUI Drawer → shadcn `Sidebar` with header (AT logo, title, "Track your progress" subtitle, theme toggle), menu items with Lucide icons (Home, BarChart3, ListChecks, GitCompare, Settings), user footer (avatar, name, sign-out)
- [ ] Delete `src/components/navigation/NavigationDrawer.tsx` (shadcn Sidebar handles mobile via Sheet)
- [ ] Rewrite `src/components/navigation/LinkList.tsx`: MUI List → `SidebarMenuItem`/`SidebarMenuButton`. Active item: primary gradient bg, white text, rounded-xl, blue-tint shadow.
- [ ] Rewrite `src/components/appContainer/AppBar.tsx`: MUI AppBar → Tailwind sticky header (mobile only). Gradient title text.
- [ ] Rewrite all `src/components/appContainer/buttons/*.tsx`: MUI icons → Lucide, MUI IconButton/Tooltip/Menu → shadcn Button/Tooltip/DropdownMenu
- [ ] Rewrite `src/pages/PagesContainer.tsx`: MUI `styled` → Tailwind
- [ ] Update stories
- [ ] Verify: sidebar renders on desktop, mobile header on mobile, theme toggle works, all pages still render

### CP3: Dashboard (Welcome)

- [ ] Add shadcn components: `sonner`, `command`, `popover`, `select`
- [ ] Replace feedback system: delete `FeedbackAlert.tsx` + `FeedbackAlertGroup.tsx`, add `<Toaster />` in root layout, create `useFeedbackToast` hook. Update all consumers (AddActivityForm, Profile, RowInReadMode, RowInEditMode, FileUploadForm).
- [ ] Rewrite `src/pages/Welcome.tsx`: MUI → Tailwind. Add stat cards (Total Activities, This Week, This Month, Last Activity) with `--chart-N` colored left borders + bloom-hover. Date stamp with uppercase tracking. Recent activities list with activity-color icons.
- [ ] Rewrite `src/components/forms/AddActivityForm/AddActivityForm.tsx`: MUI → shadcn Button + Tailwind. Quick-add form only (date + activity select + log button). No "Add with Details" button yet (deferred to CP8).
- [ ] Rewrite `src/components/forms/adapters/CategoryAutocomplete.tsx`: MUI Autocomplete → shadcn `Command` + `Popover` combobox. Same prop interface for @tanstack/react-form compat. Group options by category.
- [ ] Rewrite `src/components/forms/adapters/DatePicker.tsx`: MUI DatePicker → native `<input type="date">` with Tailwind + Lucide Calendar icon + day-of-week helper text
- [ ] Update `src/pages/Welcome.stories.tsx` (toast instead of Snackbar)
- [ ] Verify: quick-add works end-to-end, stories pass, toasts appear

### CP4: Activity List

- [ ] Add shadcn components: `table`, `alert-dialog`, `badge`
- [ ] Create new `DateRangePicker` component: shadcn Dialog with Quick Presets (Last Week/Month/Year) + Custom Range (from/to native date inputs) + Apply button. Replaces inline `DateFilterForm`. Reference: prototype's `date-range-picker.tsx`.
- [ ] Rewrite `src/pages/ActivityList.tsx`: use new DateRangePicker, search input, "Delete All" button with AlertDialog confirmation
- [ ] Rewrite `src/components/table/SummaryTable.tsx`: MUI Table → shadcn Table. Month-grouped rows with tinted header bars (uppercase, bold tracking). Custom pagination.
- [ ] Rewrite `src/components/table/EditableTableRow/RowInReadMode.tsx`: Lucide `Trash2`/`Pencil`. Inline actions hidden by default (`opacity-0 group-hover:opacity-100`). Activity color icons. Intensity badges.
- [ ] Rewrite `src/components/table/EditableTableRow/RowInEditMode.tsx`: MUI + Emotion → shadcn + Tailwind. Edit dialog with shadcn Dialog.
- [ ] Rewrite `src/components/forms/DateFilterForm/` → replace with DateRangePicker or adapt
- [ ] Update stories
- [ ] Verify: CRUD works, month grouping, search, date range filtering, stories pass

### CP5: Charts

- [ ] Add shadcn component: `chart` (Recharts wrapper)
- [ ] Rewrite `src/components/visualization/Charts/BarChart.tsx`: Chart.js → Recharts `BarChart`. Activity-specific colors from color utility. Rounded top corners.
- [ ] Rewrite `src/components/visualization/SummaryCharts/SummaryPieChart.tsx`: → Recharts `PieChart` with dual `Pie` rings (inner: active/inactive, outer: by-type). Colors from color utility.
- [ ] Rewrite `src/components/visualization/SummaryCharts/SummaryBarChart.tsx`: → Recharts `ComposedChart` (Bar + ReferenceLine for thresholds)
- [ ] Rewrite `src/components/visualization/ChartWrapper.tsx`: MUI styled → Tailwind
- [ ] Rewrite `src/components/visualization/utils.ts`: Chart.js data format → Recharts format. Remove `@ctrl/tinycolor`. Use color utility from `utils/colors.ts`.
- [ ] Rewrite `src/pages/Charts.tsx`: Remove Chart.js `register()`. Use DateRangePicker (from CP4). Summary stat cards with chart colors.
- [ ] Update stories, remove `Chart.defaults.animation = false` from storybook config
- [ ] Verify: all charts render with correct data, tooltips, responsive, stories pass

### CP6: Settings (Profile) — expanded with new features

- [ ] Add shadcn components: `tabs` (dialog/alert-dialog already added)
- [ ] Rewrite `src/pages/Profile.tsx` as **Settings page** with Tabs interface (max-w-4xl):
  - **Categories tab**: table of categories (name, type badge, edit/delete actions). "Add Category" button → Dialog (name input + active/inactive Select). Edit category → Dialog (rename + change type). Delete → AlertDialog confirmation.
  - **Activity Names tab**: table of unique activity names (name, count, category Select for assignment, edit action). Edit → Dialog to rename all activities with that name.
  - Existing features preserved: export/import JSON, theme toggle
- [ ] Rewrite `src/components/ModalDialog.tsx`: MUI Dialog → shadcn `Dialog`. Lucide `X` close.
- [ ] Rewrite `src/components/forms/FileUploadForm.tsx`: MUI → shadcn + Tailwind
- [ ] Rewrite `src/components/forms/adapters/FileInput.tsx`: MUI → shadcn + Lucide `Info`
- [ ] Rewrite `src/components/states/ErrorView.tsx`: Lucide `AlertCircle` + Tailwind
- [ ] Rewrite `src/components/states/NoActivitiesPage.tsx`: MUI styled → Tailwind
- [ ] Rewrite `src/components/states/RouteErrorBoundary.tsx`: MUI → shadcn Button + Tailwind
- [ ] Update stories
- [ ] Verify: category CRUD works (add/edit/delete), activity rename works, category assignment works, export/import works

### CP7: MUI Removal + Cleanup

- [ ] Remove deps: `@mui/material @mui/system @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled chart.js react-chartjs-2 @ctrl/tinycolor`
- [ ] Delete `src/components/styles/StylesProvider.tsx`. Replace with simple ThemeProvider that toggles `dark` class + exposes Jotai atoms.
- [ ] Remove `StylesProvider` from `_layout.tsx`, `login.tsx`, `mocks/decorators.tsx`
- [ ] Remove Roboto font from `root.tsx` and `index.html`
- [ ] Remove Chart.js config from `.storybook/preview.ts`
- [ ] `bun install` clean
- [ ] Verify: `bun run --filter '*' build` succeeds
- [ ] Verify: `bun run size-limit` — bundle under 365 kB (expect ~240-265 kB)
- [ ] Verify: `cd client && bun run test` — all stories pass
- [ ] Clean up `knip.json`: remove all CP0 entries from `ignoreDependencies` and `ignore` in the client workspace. Run `bun run knip` to confirm no leftover exceptions.

### CP8: Backend Changes + Compare Page + Detail Fields

- [ ] **API**: Add optional fields to Activity type in `api/utils/types.ts`: `description?: string`, `intensity?: "low" | "medium" | "high"`, `timeSpent?: number`
- [ ] **API**: Update validation in `api/validation/validators.ts` for new fields
- [ ] **API**: Update `client/src/data/types.ts` to match
- [ ] **API**: API tests for new fields
- [ ] **Dashboard**: Add "Add with Details" button → Dialog with date, activity name, intensity Select, time spent input, description Textarea (as shown in design screenshots)
- [ ] **Activity List**: Show description/intensity/timeSpent in detail columns, intensity badges
- [ ] **Edit dialog**: Include all new fields
- [ ] **Color system**: Now that categories are properly linked to activities, switch from hash fallback to category-based colors with per-activity variants
- [ ] **Compare page**: New `src/app/routes/compare.tsx` with:
  - Comparison type toggle (Month vs Year)
  - Multi-period selection (up to 7 periods with color coding)
  - Metric cards (total activities, most active day/month, most common activity)
  - Recharts `LineChart` for comparison over time
- [ ] Add "Compare" nav item with Lucide `GitCompare` icon
- [ ] Storybook stories for Compare page and updated Dashboard/ActivityList
- [ ] Verify: new fields persist through API, Compare page renders, all tests pass

---

## MUI Usage Inventory (31 files)

- **CP1:** `auth/Login.tsx`, `states/Loading.tsx`, `states/HydrateFallback.tsx`
- **CP2:** `routes/_layout.tsx`, `navigation/Navigation.tsx`, `navigation/NavigationDrawer.tsx`, `navigation/LinkList.tsx`, `appContainer/AppBar.tsx`, `appContainer/buttons/*.tsx` (6 files), `pages/PagesContainer.tsx`
- **CP3:** `pages/Welcome.tsx`, `forms/AddActivityForm/AddActivityForm.tsx`, `forms/adapters/CategoryAutocomplete.tsx`, `forms/adapters/DatePicker.tsx`, `states/FeedbackAlert.tsx`, `states/FeedbackAlertGroup.tsx`
- **CP4:** `pages/ActivityList.tsx`, `table/SummaryTable.tsx`, `table/EditableTableRow/RowInReadMode.tsx`, `table/EditableTableRow/RowInEditMode.tsx`, `forms/DateFilterForm/DateFilterForm.tsx`, `forms/DateFilterForm/FormButtons.tsx`
- **CP5:** `visualization/ChartWrapper.tsx`, `visualization/Charts/BarChart.tsx`, `visualization/SummaryCharts/*.tsx`, `visualization/utils.ts`
- **CP6:** `pages/Profile.tsx`, `ModalDialog.tsx`, `forms/FileUploadForm.tsx`, `forms/adapters/FileInput.tsx`, `states/ErrorView.tsx`, `states/NoActivitiesPage.tsx`, `states/RouteErrorBoundary.tsx`
- **CP7:** `styles/StylesProvider.tsx`
