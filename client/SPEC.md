# Activity Tracker App - Technical Specification

## Overview

A modern activity tracking application built with React, TypeScript, Tailwind CSS v4, and shadcn/ui components. The app allows users to log activities, view analytics, and compare performance over time.

## Tech Stack

- **Framework:** React with TypeScript and React Router v7 in framrework mode
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Charts:** shadcn/ui's chart components (built on Recharts)
- **Build Tool:** Vite
- **State Management:** Local component state + jotai for state shared across components
- **Sever state:** @tanstack/query for data fetching
- **Backend:** already implemented in api folder, using Azure Functions and Firebase

---

## Authentication & Loading

### Loading Screen

**Purpose:** Initial app load state

**Features:**

- Animated "AT" logo (text-based) in rounded square with primary color
- Pulsating scale/opacity animation (2-second cycle)
- Three animated dots loading indicator below logo
- "Loading your activities..." text
- Adapts to light/dark theme

**Interactions:**

- No user interaction
- Automatically transitions to Login or Main App based on auth state

### Login Screen

**Purpose:** User authentication (mock implementation)

**Features:**

- Centered card layout with "AT" logo
- "Activity Tracker" branding
- Google Sign-In button (mock)
- Email/Password form inputs
- Toggle between Sign In and Sign Up modes
- Responsive design

**UI Elements:**

- Logo: "AT" text in rounded square with primary background
- Title: "Activity Tracker"
- Description: "Sign in to continue" or "Create your account to start tracking"
- Google button with icon
- Divider with "or" text
- Email input field
- Password input field
- Primary action button: "Sign In" or "Create Account"
- Toggle link: "Don't have an account? Sign up" / "Already have an account? Sign in"

**Interactions:**

- Click Google button → Mock login → Navigate to app
- Submit email/password form → Mock login → Navigate to app
- Click toggle link → Switch between Sign In and Sign Up modes
- Authentication state stored in localStorage
- No actual validation (mock auth)

---

## Main Application Layout

### Sidebar Navigation

Always visible on left side.

**Components:**

**Header:**

- AT logo icon
- "Activity Tracker" title
- "Track your progress" subtitle
- Theme toggle button (Sun/Moon icon)

**Navigation Menu:**

- Dashboard (Home icon)
- Charts (BarChart3 icon)
- Activity List (ListChecks icon)
- Compare (GitCompare icon)
- Settings (Settings icon)

**Footer:**

- User avatar (User icon in circle)
- Username: "Stanisław Wilczyński"
- User status: "Active user"
- Sign Out button (LogOut icon)

**Interactions:**

- Click menu item → Navigate to page (active state highlighted)
- Click theme toggle → Switch between light/dark mode
- Click Sign Out → Clear auth → Return to login screen

---

## Page 1: Dashboard

### Purpose

Quick activity logging and overview.

### Layout

- Header with "Dashboard" title
- Quick add activity form (prominent card)
- Recent activities list

### Quick Add Activity Form

Card with input fields:

- Activity Name (text input, required)
- Date (date picker, defaults to today)
- Category (dropdown/combobox, optional)
- Description (textarea, optional)
- Intensity (select: Low/Medium/High, optional)
- Time Spent (number input in minutes, optional)
- Add Activity button (primary)

**Interactions:**

- Fill form fields
- Click Add Activity → Create new activity → Show toast notification → Reset form
- New activity appears at top of recent activities list

### Recent Activities

List showing last 5-10 activities:

- Activity name
- Date
- Category badge (if present)
- Quick view of details

**Interactions:**

- Click activity → Navigate to Activity List page (filtered/focused)

---

## Page 2: Charts

### Purpose

Visual analytics of activity data over time.

### Header Controls

- Page title: "Charts"
- Date range picker (from/to dates)

### Chart Sections

#### 1. Activity Frequency Chart

Bar chart showing activities per day:

- X-axis: Dates within selected range
- Y-axis: Number of activities
- Bars colored by primary theme color
- Tooltip showing exact count on hover

#### 2. Category Distribution

Pie/Donut chart:

- Shows percentage breakdown by category
- Color-coded segments
- Legend with category names
- Tooltip with count and percentage

#### 3. Intensity Distribution

Bar chart (if intensity data exists):

- Categories: Low, Medium, High
- Shows count of activities per intensity level
- Color-coded bars

#### 4. Time Spent Analysis

Line or bar chart (if time data exists):

- Shows total minutes spent per day/week
- Can aggregate by category

**Interactions:**

- Select date range → Charts update to show data for that period
- Hover over chart elements → Show detailed tooltips
- Charts are responsive and resize with window

---

## Page 3: Activity List

### Purpose

Complete activity management and viewing.

### Header Controls

- Page title: "Activity List"
- Date range picker
- Search/filter controls (optional)
- Delete All button (destructive, with confirmation)

### Activity Table

**Columns:**

- Date (sortable)
- Activity Name
- Category (badge with color)
- Details (single column combining):
  - Description (if present)
  - Intensity level (if present)
  - Time spent (if present)
- Actions (Edit | Delete)

**Display:**

- Sorted by date (newest first)
- Inactive activities marked differently (muted color or badge)
- Responsive table design
- Pagination or infinite scroll for large datasets

**Interactions:**

- Click Edit → Open edit dialog
- Click Delete → Confirm → Remove activity → Show toast
- Click Delete All → Confirmation dialog → Clear all activities
- Date range filter updates visible activities
- Empty state shown when no activities

### Edit Activity Dialog

Modal with form:

- All same fields as Add Activity form
- Pre-populated with current values
- Save and Cancel buttons

**Interactions:**

- Modify any field
- Click Save → Update activity → Close dialog → Show toast
- Click Cancel or X → Close without saving

---

## Page 4: Compare

### Purpose

Compare activity performance across different time periods.

### Header Controls

- Page title: "Compare"
- Comparison type toggle: Month vs Year
- Period selectors (dropdowns for month/year selection)

### Month Comparison Mode

Compare two months:

- Month 1 selector (month + year)
- Month 2 selector (month + year)
- Side-by-side metrics cards:
  - Total activities
  - Most active day
  - Most common activity
  - Total time spent (if data available)
- Line chart showing daily comparison
  - Two lines (one per month)
  - X-axis: Day of month (1-31)
  - Y-axis: Activity count
  - Legend identifying each month

### Year Comparison Mode

Compare two years:

- Year 1 selector
- Year 2 selector
- Side-by-side metrics cards:
  - Total activities
  - Most active month
  - Average activities per month
  - Total time spent
- Line chart showing monthly comparison
  - Two lines (one per year)
  - X-axis: Month (Jan-Dec)
  - Y-axis: Activity count
  - Legend identifying each year

**Interactions:**

- Toggle comparison type → Switch between month/year views
- Select periods → Charts and metrics update
- Hover over chart lines → Show detailed tooltips
- Metrics cards highlight differences (increase/decrease)

---

## Page 5: Settings

### Purpose

Manage categories and app configuration.

### Layout

Tabbed interface or sections for different settings.

### Category Management

**Active Categories Section:**

- List of active categories
- Each category shows:
  - Name
  - Activity count using this category
  - Edit and Delete buttons

**Inactive Categories Section:**

- "Inactive" category (built-in)
- Cannot be deleted
- Used for sick days, rest days, etc.

**Add Category Form:**

- Category name input
- Type selector: Active / Inactive
- Add Category button

**Interactions:**

- Add new category → Appears in list → Available in activity forms
- Edit category → Modal to rename → Save updates
- Delete category → Confirmation dialog → Remove (if no activities use it, or reassign)

### Activity Category Assignment

Bulk operations (optional):

- Reassign activities from one category to another
- Useful when merging or reorganizing categories

### Theme Settings

- Light mode
- Dark mode
- System default

**Interactions:**

- Already available via sidebar toggle
- Could add more theme customization here

---

## Data Model

### Activity Type

```ts
{
  id: string;              // Unique identifier
  date: string;           // ISO date format "YYYY-MM-DD"
  name: string;           // Activity name (required)
  category?: string;      // Category ID (optional)
  description?: string;   // Free text description (optional)
  intensity?: "low" | "medium" | "high";  // Intensity level (optional)
  timeSpent?: number;     // Minutes (optional)
  actions?: string;       // Legacy field "EDIT | DELETE"
}
```

### Category Type

```ts
{
  id: string; // Unique identifier
  name: string; // Category name
  type: "active" | "inactive"; // Category type
}
```

### Date Range Type

```ts
{
  from: string; // ISO date "YYYY-MM-DD"
  to: string; // ISO date "YYYY-MM-DD"
}
```

---

## Example Data

### Sample Activities

- Jogging (Jan 25, intensity: medium, 45 min, "Morning run in the park, felt great!")
- Swimming (Jan 21)
- Yoga (Jan 19, intensity: low, 30 min)
- Football (multiple dates)
- Sick (Jan 15, inactive, "Flu symptoms, resting at home")

### Sample Categories

- Sports (active)
- Fitness (active)
- Inactive (inactive, built-in)

---

## User Flows

### First Time User

1. App loads → Loading screen (2s)
2. No auth found → Login screen
3. User signs in → Main app (Dashboard)
4. Add first activity
5. View in Activity List
6. Explore Charts

### Returning User

1. App loads → Loading screen (2s)
2. Auth found in localStorage → Directly to Dashboard
3. Continue tracking activities

### Daily Usage

1. Open app → Dashboard
2. Quick add today's activity
3. Review weekly progress in Charts
4. Check detailed list in Activity List

### Monthly Review

1. Navigate to Compare page
2. Compare current month vs previous month
3. Analyze trends and adjust goals

---

## Responsive Design

### Desktop (≥1024px)

- Sidebar always visible
- Charts display side-by-side when multiple
- Tables show all columns
- Forms use wider layouts

### Tablet (768px - 1023px)

- Collapsible sidebar
- Charts stack vertically
- Tables remain functional
- Forms adjust to available width

### Mobile (<768px)

- Hamburger menu for navigation
- Charts optimized for touch
- Tables scroll horizontally or convert to cards
- Forms stack vertically with full-width inputs

---

## Notifications & Feedback

### Toast Notifications

Used for:

- Activity added successfully
- Activity updated
- Activity deleted
- Category added/updated/deleted
- Error messages

### Confirmation Dialogs

Required for:

- Delete activity
- Delete all activities
- Delete category (if activities use it)
- Sign out

### Loading States

- Initial app load (loading screen)
- Form submissions (button disabled + loading indicator)
- Data fetching (skeleton screens)

---

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (WCAG AA)
- Screen reader friendly
- Form validation with clear error messages

---

## Future Enhancements (Not Implemented)

- Real backend integration with Supabase
- Real authentication
- Data export (CSV, PDF)
- Goals and achievements
- Reminders/notifications
- Social sharing
- Mobile app (React Native)
- Advanced filtering and search
- Custom chart types
- Activity templates
- Notes and attachments
- Calendar view

---

## Technical Notes

- All state managed in App.tsx root component
- Props drilling used for data flow (could migrate to Context/Redux if needed)
- Mock data persisted in component state (resets on refresh except auth)
- localStorage only used for auth state
- Date format: ISO 8601 (YYYY-MM-DD)
- Theme persisted in localStorage via ThemeProvider
- Charts use Recharts library with responsive containers
- Forms use controlled components with React state
