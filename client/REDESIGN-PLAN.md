# Activity Tracker Redesign Plan

## Architecture Overview

**Current:** React 18 + React Router v7 (framework mode) + MUI 5/Emotion + Chart.js + Firebase Auth + React Query + Jotai + @tanstack/react-form. Bundle limit: 365 kB. Monorepo: `/client` (Vite frontend) + `/api` (Azure Functions + Firebase RTDB).

**Target:** Same architecture, replacing UI layer: Tailwind CSS v4 + shadcn/ui (Radix primitives) + Chart.js v4 + Lucide icons + Sonner toasts. CSS-only animations. Native `<input type="date">` replaces MUI date pickers. Font: Bricolage Grotesque.

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
> - CP3: `sonner` (toasts)
> - CP5: ~~`recharts`~~ (decided to keep Chart.js instead — removed from ignoreDependencies)
> - CP7: `tailwindcss` (no longer dev-only concern after MUI removal, but can stay in devDeps ignore)

### CP1: Login + Loading Screen

- [x] Add shadcn components: `button`, `input`, `label`, `separator`, `card`
- [x] Rewrite `src/auth/Login.tsx`: MUI → shadcn Card/Button/Input/Separator + Tailwind. Google icon → inline SVG. Gradient heading per design guide. Toggle sign-in/sign-up mode.
- [x] Rewrite `src/components/states/Loading.tsx`: MUI `CircularProgress` → CSS-animated bouncing dots only. Keep `role="progressbar"` for test compat.
- [x] Update `src/components/states/HydrateFallback.tsx`: brand color `#5085BE`, background `#FAF5EE`
- [x] Update `src/auth/Login.stories.tsx`
- [x] Verify: Login stories pass, login page matches design screenshots (light + dark)

### CP2: Background + Navigation

- [x] Add shadcn components: `sidebar`, `tooltip`, `sheet`, `skeleton` (+ `use-mobile` hook, `tw-animate-css`)
- [x] Rewrite `src/app/routes/_layout.tsx`: MUI `styled` grid → shadcn `SidebarProvider` + `SidebarInset`
- [x] Create `src/components/navigation/AppSidebar.tsx`: shadcn `Sidebar` with header (AT logo, title, "Track your progress" subtitle, theme toggle), nav items with Lucide icons (Home, BarChart3, ListChecks, Settings), user footer (initials avatar, name, sign-out). Active item: inline gradient bg, white text, rounded-xl, blue-tint shadow.
- [x] Create `src/components/navigation/MobileHeader.tsx`: Tailwind sticky header (mobile only) with `SidebarTrigger` + page title.
- [x] Delete old navigation: `Navigation.tsx`, `NavigationDrawer.tsx`, `LinkList.tsx`, `useNavigationState.ts`, `AppBar.tsx`, all `appContainer/buttons/*.tsx` (6 files)
- [x] Rewrite `src/pages/PagesContainer.tsx`: MUI `styled` → Tailwind
- [x] Update stories (`AppSidebar.stories.tsx`)
- [x] Verify: sidebar renders on desktop, mobile header on mobile, theme toggle works, all pages still render

### CP3: Dashboard (Welcome)

- [x] Add shadcn components: `sonner`, `command`, `popover`, `dialog`
- [x] Replace feedback system: delete `FeedbackAlert.tsx` + `FeedbackAlertGroup.tsx`, add `<Toaster />` in root layout, create `useFeedbackToast` hook. Update all consumers (AddActivityForm, Profile, RowInReadMode, RowInEditMode, FileUploadForm).
- [x] Rewrite `src/pages/Welcome.tsx`: MUI → Tailwind. Add stat cards (Total Activities, Last 7 Days, Last 30 Days, Last Activity) with `--chart-N` colored left borders + bloom-hover. Date stamp with uppercase tracking. Recent activities list with activity-color icons.
- [x] Rewrite `src/components/forms/AddActivityForm/AddActivityForm.tsx`: MUI → shadcn Button + Tailwind. Quick-add form only (date + activity select + log button). No "Add with Details" button yet (deferred to CP8).
- [x] Rewrite `src/components/forms/adapters/CategoryAutocomplete.tsx`: MUI Autocomplete → shadcn `Command` + `Popover` combobox. Same prop interface for @tanstack/react-form compat. Group options by category.
- [x] Rewrite `src/components/forms/adapters/DatePicker.tsx`: MUI DatePicker → native `<input type="date">` with Tailwind + Lucide Calendar icon + day-of-week helper text
- [x] Update `src/pages/Welcome.stories.tsx` (toast instead of Snackbar)
- [x] Verify: quick-add works end-to-end, stories pass, toasts appear

### CP4: Activity List

- [x] Add shadcn components: `alert-dialog` (table/badge not needed — design uses flex rows and styled spans)
- [x] Create new `DateRangePicker` component: shadcn Dialog with Quick Presets (Last Week/Month/Year) + Custom Range (from/to native date inputs) + Apply button with invalid range validation. Replaces inline `DateFilterForm`. Used by both ActivityList and Charts.
- [x] Create `utils/activity-icons.tsx`: `getActivityIcon()` + `formatDate()` helpers
- [x] Rewrite `src/pages/ActivityList.tsx`: DateRangePicker, search input, Export/Upload/Delete All buttons (each extracted to self-contained components)
- [x] Rewrite `src/components/table/SummaryTable.tsx`: MUI Table → card-based month-grouped flex rows with custom Tailwind pagination
- [x] Rewrite `src/components/table/EditableTableRow/RowInReadMode.tsx`: Lucide `Trash2`/`Pencil`. Actions hidden by default (`opacity-0 group-hover:opacity-100`). Activity color icons. Extracted `MobileActivityCard` for mobile view.
- [x] Rewrite `src/components/table/EditableTableRow/RowInEditMode.tsx` → renamed to `EditActivityDialog.tsx`: Dialog-based editing with TanStack form
- [x] Delete `DateFilterForm.tsx`, `FormButtons.tsx`, `ModalDialog.tsx`, `DownloadLink.tsx`. Clean up unused exports.
- [x] Simplify Profile page: removed upload/export/delete-all (moved to ActivityList)
- [x] Update stories (45 tests pass)
- [x] Verify: CRUD works, month grouping, search, date range filtering, build clean, knip clean

### CP5: Charts

> **Decision:** Kept Chart.js (bumped v3.9→v4.5) + react-chartjs-2 (v4.3→v5.3) + @ctrl/tinycolor (v3.4→v4.2) instead of migrating to Recharts. Recharts added ~30kb gzipped — not worth the bundle cost. Chart.js v4 migration was seamless with no breaking changes for our usage.

- [x] Bump chart.js 3.9→4.5, react-chartjs-2 4.3→5.3, @ctrl/tinycolor 3.4→4.2
- [x] Rewrite `src/components/visualization/Charts/BarChart.tsx`: category-grouped stacked bars. One bar per category, activities stacked within. Custom tooltip shows activity name. Rounded top corners (`borderRadius: 6`).
- [x] Rewrite `src/components/visualization/SummaryCharts/SummaryPieChart.tsx`: 3-ring pie chart (inner: active/inactive, middle: per-category, outer: per-activity). Custom tooltip title/label callbacks for correct per-ring labels. Legend hidden on mobile.
- [x] Delete `src/components/visualization/SummaryCharts/SummaryBarChart.tsx` (not in prototype design)
- [x] Delete `src/components/visualization/ChartWrapper.tsx` (replaced by Card wrappers)
- [x] Rewrite `src/components/visualization/utils.ts`: `buildCategoryColorInfo()` shared helper, `getActivityColor()`, `getStackedBarChartData()`, `getPieChartData()`. 10-color active palette + red inactive + grey "other". Colors stable across filtering (computed from all data, not filtered).
- [x] Rewrite `src/pages/Charts.tsx`: gradient heading, Card wrappers, 3 summary stat cards (Total/Unique/Most Popular active-only) with bloom-hover + primary-colored borders, DateRangePicker, empty-filtered-state card.
- [x] Clean up `src/utils/colors.ts`: removed hardcoded activity-color map, getCategoryColor, lightenColor, darkenColor, withOpacity, HSL functions. Now only exports hash-based `getActivityColor()` with 10-color palette.
- [x] Update stories (7 tests pass), knip clean
- [x] Verify: all charts render with correct data, tooltips, responsive, build clean

### CP6: Settings (Profile) — expanded with new features

- [x] Add shadcn components: `tabs`, `table`, `select`, `badge` (dialog/alert-dialog already added)
- [x] Rewrite `src/pages/Profile.tsx` → `src/pages/Settings.tsx` as **Settings page** with Tabs interface (max-w-4xl):
  - **Categories tab**: table of categories (name, type badge, edit/delete actions). "Add Category" button → Dialog (name input + active/inactive Select). Edit category → Dialog (rename + change type). Delete → AlertDialog confirmation. All dialogs use self-contained DialogTrigger for proper focus restoration.
  - **Activity Names tab**: table of unique activity names (name, count, category Select for assignment, edit action). Edit → Dialog to rename all activities with that name. Category Select correctly shows current category by matching activity name to category/subcategory names.
  - **Charts tab**: "Group by category" toggle (Jotai atom in `StylesProvider.tsx`). When enabled, charts show category-grouped stacked bars and 3-ring pie (current behavior). When disabled, each activity shown as individual bar/pie segment without category grouping — flat variants `getFlatBarChartData` and `getFlatPieChartData` added to `visualization/utils.ts`.
  - Existing features preserved: export/import JSON (on ActivityList page), theme toggle (in sidebar)
- [x] Route renamed: `profile` → `settings` (route file, routes.ts, sidebar nav, NoActivitiesPage link)
- [x] File split: `Settings.tsx` (orchestrator) + `settings/CategoriesTab.tsx` + `settings/ActivityNamesTab.tsx` + `settings/ChartsTab.tsx`
- [x] Client `Category` type updated to include `id` field (returned by API via `mapToList`)
- [x] Rewrite `src/components/ModalDialog.tsx`: MUI Dialog → shadcn `Dialog`. Lucide `X` close. _(deleted — no longer needed)_
- [x] Rewrite `src/components/forms/FileUploadForm.tsx`: MUI → shadcn + Tailwind _(done in CP4)_
- [x] Rewrite `src/components/forms/adapters/FileInput.tsx`: MUI → shadcn + Lucide `Info` _(done in CP4)_
- [x] Rewrite `src/components/states/ErrorView.tsx`: Lucide `AlertCircle` + Tailwind
- [x] Rewrite `src/components/states/NoActivitiesPage.tsx`: MUI styled → Tailwind
- [x] Rewrite `src/components/states/RouteErrorBoundary.tsx`: MUI → shadcn Button + Tailwind
- [x] Update stories (3 stories: Default, ActivityNamesTab, ChartsTab — 49 total tests pass)
- [x] Verify: build clean, knip clean, all 49 tests pass

### CP7: MUI Removal + Cleanup

- [x] Remove deps: `@mui/material @mui/system @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled` _(MUI + Emotion removed; chart.js + react-chartjs-2 + @ctrl/tinycolor kept and bumped in CP5)_
- [x] Delete `src/components/styles/StylesProvider.tsx`. Replace with simple ThemeProvider that toggles `dark` class + exposes Jotai atoms. _(stripped MUI, kept dark class toggle + jotai atoms — StylesProvider is still needed, not removed)_
- [x] Remove `StylesProvider` from `_layout.tsx`, `login.tsx`, `mocks/decorators.tsx` _(N/A — StylesProvider still needed for dark mode + groupByCategory atom)_
- [x] Remove Roboto font from `root.tsx`, `index.html`, and `.storybook/preview-head.html`
- [x] Keep Chart.js config in `.storybook/preview.ts` _(needed for test stability — `Chart.defaults.animation = false`)_
- [x] Fix storybook `/profile` → `/settings` mock route in `preview.ts`
- [x] Fix `NoActivitiesPage` links (upload → `/activity-list`, quick add → `/welcome`)
- [x] Fix `ActivityNamesTab` empty state with proper links
- [x] `bun install` clean
- [x] Verify: `bun run --filter '*' build` succeeds
- [x] Verify: `bun run size-limit` — bundle under 365 kB (expect ~240-265 kB)
- [x] Verify: `cd client && bun run test` — all stories pass
- [x] Clean up `knip.json`: remove all CP0 entries from `ignoreDependencies` and `ignore` in the client workspace. Run `bun run knip` to confirm no leftover exceptions.

### CP8: Backend Restructuring + New Features

**Data model changes:**

- `active` removed from `ActivityRecord` — derived from `category.active` at read time
- `subcategories` replaced by `activityNames: string[]` on Category
- Categories stored as map (push keys) instead of array (fixes null holes on deletion)
- **`Category.activityNames` is the single source of truth** — `categoryId` is NOT stored on activity records. Server computes `categoryId` + `active` when returning activities by joining with categories' `activityNames`
- New optional fields on activities: `description`, `intensity`, `timeSpent`

**Key architectural decision: single source of truth for category mapping**

The name→category mapping lives exclusively in `Category.activityNames`. This eliminates the sync bug where deleting a category and reassigning would lose `activityNames` on the target, causing charts to show "other". Consequences:
- Bulk operations (assign/reassign) only touch `activityNames` on categories — no activity record updates needed
- Server enriches activities with computed `categoryId` + `active` before returning to client
- Client `useActivities` no longer depends on `useCategories` — no client-side `enrichWithActive`

**Target Firebase structure:**

```
/users/{userId}/
  activity/      → { [pushKey]: { name, date, description?, intensity?, timeSpent? } }
  categories/    → { [pushKey]: { name, active, description, activityNames: string[] } }
  preferences/   → { groupByCategory: boolean }
```

**Target TypeScript types:**

```ts
// API — stored in Firebase (no categoryId)
type ActivityRecord = {
  date: string;
  name: string;
  description?: string;
  intensity?: "low" | "medium" | "high";
  timeSpent?: number;
};
// API — returned by getActivities (enriched with computed fields)
type EnrichedActivityRecord = ActivityRecord & {
  categoryId: string;
  active: boolean;
};
type Category = {
  name: string;
  active: boolean;
  description: string;
  activityNames: string[];
};
// Client: ActivityRecordWithId = EnrichedActivityRecord & { id: string } (server provides categoryId + active)
```

#### PR 1: Database restructuring + types + migration

- [x] **Migration script** (`api/scripts/migrate.ts` + `migration-logic.ts`): one-off script for all users
  - [x] Convert categories array → push-key map (skip nulls)
  - [x] Convert `subcategories: [{name, description}]` → `activityNames: string[]`
  - [x] Categories without subcategories get `activityNames: [category.name]`
  - [x] Remove old numeric `id` field from categories
  - [x] For each activity, name-match to find category → set `categoryId`
  - [x] Remove `active` field from activity records
  - [x] Write back atomically
  - [x] Local test script (`migrate-local-test.ts`) shares logic with Firebase runner
- [x] **Update API types** (`api/utils/types.ts`): `ActivityRecord` (remove `active` and `categoryId` — stored type), add `EnrichedActivityRecord` (computed `categoryId` + `active`), `Category` (`activityNames` instead of `subcategories`), remove `Subcategory` type
- [x] **Update validators** (`api/validation/validators.ts`): new `validateIntensity`, `validateTimeSpent`, `validateCategoryId`. Update `validateActivityRecord` (no `active`, no `categoryId` in storage output, add optional fields). Update `validateCategory` (`activityNames` array of strings). Add `validateAddActivityNameBody`
- [x] **Update existing endpoints**: `addActivities`/`editActivity` accept new fields without `active`. `addCategory`/`editCategory` accept `activityNames`. `getActivities` enriches with computed `categoryId` + `active` from categories
- [x] **Simplify bulk operations**: `bulkReassignCategory`/`bulkAssignCategory` operate only on `Category.activityNames` (no activity record updates). `bulkRenameActivities` also updates `activityNames`. `deleteActivitiesByCategory` looks up names from category
- [x] **New endpoint**: `POST /api/categories/{categoryId}/activity-names` — adds an activity name to a category
- [x] **Default categories constant** (`api/utils/defaultCategories.ts`): English, generic, Garmin-like list (Running, Cycling, Swimming, Gym, Team Sports, Other, Rest/Recovery). Used for new user initialization
- [x] **New user initialization**: moved to onboarding PR (PR 4)
- [x] **Client type updates** (`client/src/data/types.ts`): match API types. `ActivityRecordWithIdServer` includes `active` from server. `useActivities` no longer enriches — server provides everything
- [x] **Client: remove `enrichWithActive`** from `useActivities()` — server now provides `categoryId` + `active` directly. `useActivities` no longer depends on `useCategories`
- [x] **Client: update `useAvailableCategories()`** — build options from `category.activityNames` instead of subcategories
- [x] **Remove `findCategoryForActivity`** name-matching — server handles mapping
- [x] **Client: Settings UI** — `CategoriesTab` shows activity names per category as badges. `ActivityNamesTab` has "Add Activity Name" button + dialog to create names and assign to categories
- [x] **Tests**: validator tests for new fields (92 tests), firebaseDB tests (12 tests — reassign, assign, rename, addActivityNameToCategory, deleteActivitiesByCategory, getActivities enrichment), migration tested locally on real data export. Settings stories (54 client tests)
- [x] **Verify**: `cd api && bun run test` (114 pass), `cd client && bun run test` (54 pass), `bun run --filter '*' build`

#### PR 2: New endpoints (export/import, bulk ops, preferences)

- [x] **Export endpoint** (`GET /api/export`): returns `{ activities, categories, preferences }` (full user data from Firebase)
- [x] **Import endpoint** (`POST /api/import`): accepts `{ activities, categories, preferences? }`, **replaces** entire user data. Handles old format (array categories, `active` on activities) by converting on import
- [x] **Bulk rename** (`POST /api/activities/rename`): `{ oldName, newName }` — updates all matching activity records AND `Category.activityNames`
- [x] **Bulk assign category** (`POST /api/activities/assign-category`): `{ activityName, categoryId }` — moves name between categories' `activityNames` (no activity record changes)
- [x] **Bulk reassign category** (`POST /api/activities/reassign-category`): `{ fromCategoryId, toCategoryId }` — moves ALL names from source to target category's `activityNames`
- [x] **Delete by category** (`POST /api/activities/delete-by-category`): `{ categoryId }` — deletes activity records whose name is in the category's `activityNames`
- [x] **Add activity name to category** (`POST /api/categories/{categoryId}/activity-names`): `{ activityName }` — validates uniqueness across categories
- [x] **User preferences** (`GET/PUT /api/preferences`): `{ groupByCategory, funAnimations, isLightTheme }`. Persists to `/users/{userId}/preferences`
- [x] **Client: export** — `useExportUserData` calls `GET /api/export`, downloads full JSON
- [x] **Client: import** — `FileUploadForm` accepts full user data format (backward compat with activities-only)
- [x] **Category deletion handling**: delete dialog with (A) delete all activities or (B) reassign to another category
- [x] **Client: bulk ops** — rename button + category select in `ActivityNamesTab.tsx`, "Add Activity Name" button + dialog, wired to intents in `settings.tsx`
- [x] **Client: preferences** — `StylesProvider.tsx` loads `groupByCategory` from API, persists via PUT. `useUserPreferences` hook
- [x] **Tests**: firebaseDB tests (12), validator tests (92), Settings stories with interactions (54 client tests)
- [x] **Verify**: `cd api && bun run test` (114 pass), `cd client && bun run test` (54 pass), `bun run --filter '*' build`

#### PR 3: Frontend features (detail fields, Compare page)

- [x] **Add Activity with Details dialog**: "Add with Details" button on Dashboard → Dialog (date, activity name combobox, category, description textarea, intensity select, time spent input)
- [x] **Activity List detail columns**: show description/intensity/timeSpent in rows. Intensity as colored badge
- [x] **Edit dialog**: include all new fields in `EditActivityDialog.tsx`
- [x] **Color system**: verify category-based chart colors (`buildCategoryColorInfo()`) remain correct after backend linking
- [x] **Compare page** (`client/src/pages/Compare.tsx` + route): Month vs Year toggle, period selectors, metric cards, Chart.js line chart. "Compare" nav item with `GitCompare` icon in sidebar. URL-persisted periods via searchParams. Inactive-category activities filtered out.
- [x] **Stories**: Compare page, AddActivityForm with details, ActivityList with detail columns
- [x] **Verify**: `cd client && bun run test` (59 pass), lint clean, knip clean
- [x] **Bug fixes**: restored `intent=add` handler in welcome route (PR2 regression), fixed Chart.js dark mode contrast with `useChartColors` hook
- [x] **ESLint**: added `eslint-plugin-react` (recommended + jsx-runtime) and `eslint-plugin-react-hooks` (rules-of-hooks + exhaustive-deps as error)

#### Separate follow-up PR: Onboarding flow

- [ ] **Onboarding screen**: shown on first login when user has no categories. Displays default category/activity list with checkboxes. User picks their categories → seeds their account
- [ ] This is a purely frontend feature using the `POST /api/user/init` or category creation endpoints from PR 1

---

## MUI Usage Inventory (31 files)

- **CP1:** `auth/Login.tsx`, `states/Loading.tsx`, `states/HydrateFallback.tsx`
- **CP2:** `routes/_layout.tsx`, `navigation/Navigation.tsx`, `navigation/NavigationDrawer.tsx`, `navigation/LinkList.tsx`, `appContainer/AppBar.tsx`, `appContainer/buttons/*.tsx` (6 files), `pages/PagesContainer.tsx`
- **CP3:** `pages/Welcome.tsx`, `forms/AddActivityForm/AddActivityForm.tsx`, `forms/adapters/CategoryAutocomplete.tsx`, `forms/adapters/DatePicker.tsx`, `states/FeedbackAlert.tsx`, `states/FeedbackAlertGroup.tsx`
- **CP4:** ~~`pages/ActivityList.tsx`~~, ~~`table/SummaryTable.tsx`~~, ~~`table/EditableTableRow/RowInReadMode.tsx`~~, ~~`table/EditableTableRow/RowInEditMode.tsx`~~, ~~`forms/DateFilterForm/DateFilterForm.tsx`~~, ~~`forms/DateFilterForm/FormButtons.tsx`~~ ✅ Done
- **CP5:** ~~`visualization/ChartWrapper.tsx`~~, ~~`visualization/Charts/BarChart.tsx`~~, ~~`visualization/SummaryCharts/*.tsx`~~, ~~`visualization/utils.ts`~~ ✅ Done (kept Chart.js v4, removed SummaryBarChart)
- **CP6:** ~~`pages/Profile.tsx`~~ → `pages/Settings.tsx`, ~~`ModalDialog.tsx`~~ (deleted in CP4), ~~`forms/FileUploadForm.tsx`~~, ~~`forms/adapters/FileInput.tsx`~~, ~~`states/ErrorView.tsx`~~, ~~`states/NoActivitiesPage.tsx`~~, ~~`states/RouteErrorBoundary.tsx`~~ ✅ Done
- **CP7:** `styles/StylesProvider.tsx`

### CP9: Cleanup + Full-App Story

- [ ] Audit `src/components/ui/sidebar.tsx`: remove unused subcomponents (e.g. `SidebarMenuSub`, `SidebarMenuSkeleton`, `SidebarRail`, `SidebarGroupAction`, etc.) that aren't imported anywhere
- [ ] Audit `src/components/ui/sheet.tsx`: remove unused exports if only `SheetContent` is used internally by sidebar
- [ ] Audit other shadcn components (`tooltip.tsx`, `skeleton.tsx`, etc.) for unused exports
- [ ] Run `bun run knip` to verify no dead code or unused dependencies remain
- [ ] Remove any knip exceptions that are no longer needed
- [ ] Enable all `eslint-plugin-react-hooks` v7 recommended rules (currently only `rules-of-hooks` and `exhaustive-deps` are enabled). Investigate React Compiler adoption — v7 includes compiler-related lint rules (`purity`, `immutability`, `refs`, etc.) that enforce compiler-compatible patterns. Evaluate enabling them incrementally and assess whether adding `babel-plugin-react-compiler` / `react-compiler-runtime` is worthwhile for this project.
- [ ] Add a full-app story that renders the complete app layout (sidebar + page content) with mocked data for visual regression testing
- [ ] For each page, add a story which renders it in dark mode and verify visual correctness (e.g. no color contrast issues, all elements visible)
- [ ] Update the repository README with screenshots/GIFs of the app (Dashboard, Activity List, Charts, Compare, Settings), architecture overview (React + Azure Functions + Firebase), key features summary, and tech stack details — sourced from `REDESIGN-PLAN.md`, `REDESIGN-DESIGN-GUIDE.md`, and other existing docs
- [ ] Split files/components exceeding 250 lines into smaller, focused modules with a reasonable folder structure (e.g. extract sub-components, utility functions, or hooks into separate files)
