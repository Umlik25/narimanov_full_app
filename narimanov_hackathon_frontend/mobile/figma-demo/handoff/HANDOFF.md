# City Grind — Developer Handoff (v47)

> **District Operations Platform for Narimanov, Baku.** Mobile UI shipped as a working web prototype. This document is the source of truth for porting to **React Native + Expo**.

**Frame size:** all screens designed for **390 × 844** (iPhone 14 Pro logical viewport).
**Stack target:** Expo SDK 50+, React Native 0.74+, TypeScript, React Navigation, Reanimated 3, Gesture Handler 2.

Companion files:
- `tokens.ts` / `DESIGN_TOKENS.md` — colors, type, spacing, shadows, motion
- `COMPONENTS.md` — reusable component catalog
- `INTERACTIONS.md` — every user flow with state transitions
- `ANIMATIONS.md` — motion specs mapped to Reanimated
- `RN_PORTING_GUIDE.md` — per-element web → native conversions
- `ASSETS.md` — image / icon index
- `screenshots/` — populated manually by capturing each screen

---

## 1. App overview

Two roles:
- **Citizen (User)** — reports issues, tracks own reports, talks to AI assistant
- **Admin** — reviews AI detections, manages all issues, runs analytics & operations

Map-first layout. Both roles open onto a Leaflet map (ESRI satellite tiles) centered on Narimanov district. Issues appear as colored pins; tapping one opens a bottom sheet with quick actions.

---

## 2. Navigation map

```
                 ┌─────────┐         ┌─────────┐
       Login ──▶ │ User    │         │ Admin   │ ◀── Login (Admin role)
                 │  Map    │         │  Map    │
                 └────┬────┘         └────┬────┘
                      │                   │
        ┌─────────────┼─────────┐   ┌─────┼─────────────┐
        ▼             ▼         ▼   ▼     ▼             ▼
   Report Issue   My Reports  AI ◀─┤├─▶ AI Review   All Issues
        │             │      Chat              │         │
        ▼             ▼                        ▼         ▼
   (returns       Report                    Issue      Issue
    to My         Details                   Details    Details
    Reports)         │                        │         │
                     │                        ▼         ▼
                     │                  Operations  Analytics
                     │
        ┌────────────┼──────────────┐
        ▼            ▼              ▼
    Profile     Hamburger       Issue Bottom Sheet
                Menu            (anchored to Map)
        │
        ▼
    Switch role / Logout
```

**Navigation lib:** use `@react-navigation/native` with a **Stack** for screen-to-screen, a **Modal** group for bottom-sheet and profile-like screens that should slide up, and a **Drawer** for the hamburger menu.

Suggested structure:

```tsx
<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {!isAuthed ? (
      <>
        <Stack.Screen name="Login"  component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </>
    ) : (
      <Stack.Screen name="App" component={AppDrawer} />
    )}
  </Stack.Navigator>
</NavigationContainer>

// AppDrawer (custom drawer == HamburgerMenu)
<Drawer.Navigator drawerContent={HamburgerMenu}>
  <Drawer.Screen name="Map" component={MapStack} />
</Drawer.Navigator>

// MapStack
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Map" component={MapScreen} />
  <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
  <Stack.Screen name="MyReports" component={MyReportsScreen} />
  <Stack.Screen name="ReportDetails" component={UserReportDetails} />
  <Stack.Screen name="AdminIssueDetails" component={AdminIssueDetails} />
  <Stack.Screen name="AIReview" component={AdminAIReview} />
  <Stack.Screen name="AllIssues" component={AdminAllIssues} />
  <Stack.Screen name="Operations" component={AdminOperations} />
  <Stack.Screen name="Analytics" component={AdminAnalytics} />
  <Stack.Screen name="AIChat" component={AIChatScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
</Stack.Navigator>
```

The issue bottom sheet is **not a screen** — it's a `@gorhom/bottom-sheet` mounted inside the Map screen.

---

## 3. The 16 screens

For each screen: purpose, layout regions, key data, and role differences. Pair with `screenshots/NN-name.png` for visual reference.

> **Convention:** "Header" = the dark gradient or hero region at the top. "Sheet" = the white rounded container the rest of the content sits in.

---

### 3.1 Login (`01-login.png`)

**Purpose:** sign in as Citizen or Admin.

| Region | Contents |
|---|---|
| Hero (height 310, radius 0 0 36 36) | Heydar Aliyev Center photo + dark gradient overlay; bottom-left brand row (50×50 gradient logo box with `MapPin`, "City Grind", "District Operations Platform · Baku") |
| Form sheet (radius 28 28 0 0, shadow-sheet) | Drag handle pill · "Welcome back" + role chip · Role toggle (Citizen / Admin segmented control) · Email/phone input · Password input with eye-toggle · "Forgot password?" link · CTA "Sign In ›" · "Don't have an account? Sign up" |

**State:** `email`, `password`, `role: 'user' | 'admin'`, `showPw`, `focusedField`.

**Actions:**
- Sign In → call `onLogin(role)` → navigate to `Map` (User or Admin variant).
- Sign up link → `SignUp` screen.

**Role differences:** none on this screen except the role toggle's selected color (`#0B5CFF` user, `#7C3AED` admin) and the matching chip in the header.

---

### 3.2 Sign Up (`02-signup.png`)

**Purpose:** new citizen registration.

Same skeleton as Login: hero + form sheet. Form fields:
- Full Name (`User` icon)
- Phone (`Phone` icon) — Azerbaijan format placeholder `+994 …`
- Email (`Mail` icon)
- Password (`Lock` icon, eye toggle)
- CTA: "Create Account ›"
- Back chevron in top-left over hero
- "Already have an account? Sign in"

**Actions:** Create Account → `onSignUp()` → navigate to User Map (Citizen role assumed).

---

### 3.3 User Map (`03-user-map.png`)

**Purpose:** primary surface for citizens. Browse local issues on a satellite map.

| Region | Contents |
|---|---|
| Top overlay row (z-index above map) | Round 36px buttons (`Menu`, `Search`, `SlidersHorizontal`) in glass white circles; "Narimanov" title centered |
| Map (full-bleed) | Leaflet w/ ESRI World_Imagery tiles, centered on `40.4087, 49.8675`, zoom 14; pins colored by status |
| Search bar (when open) | Slides down from top: rounded pill, icon, input — uses Nominatim + local landmarks |
| FAB row (bottom-right, above tab bar / safe-area) | `Plus` (Report Issue, gradient.brand, shadow.cta), `Bot` (AI Chat, gradient.admin, shadow.cta) |

**State:** `selectedIssue`, `showMenu`, `showSearch`, `mapCenter`, `mapZoom`.

**Actions:**
- Marker tap → set `selectedIssue` → bottom sheet animates up.
- FAB `+` → `ReportIssue`.
- FAB `Bot` → `AIChat`.
- `Menu` → open drawer.
- `Search` → toggle search bar.

---

### 3.4 Admin Map (`10-admin-map.png`)

Same skeleton as User Map. **Differences:**
- Pin coloring includes AI-review purple pins (`#7C3AED`).
- Bottom sheet shows admin actions (Assign, Change Status, Review AI).
- Top-right adds a small badge with unread AI detections count.
- The role chip in the drawer header reads "Admin" + admin gradient.

---

### 3.5 Issue Bottom Sheet (`17-issue-bottom-sheet.png` — bonus capture)

**Mounted on Map screens.** Slides up from the bottom when a marker is tapped.

| Region | Contents |
|---|---|
| Drag handle | 40×4 px gray pill, centered |
| Header row | Category emoji · `ID` text · optional `AI` chip (purple tint) · `X` close (top-right) · Title (17pt bold) |
| Photo | 144 px tall, radius 16, `object-fit: cover` |
| Badge row | Status pill · Priority pill · Category pill |
| Meta | Location · ReportedAt · ReportedBy (each with leading lucide icon) |
| Description | 14 pt gray paragraph |
| Actions (user role) | Primary "View Details ›" (gradient.brand) · Secondary row: Track Status · Add Comment |
| Actions (admin role) | Primary "View Details ›" · Secondary row: Assign (orange) · Change Status (gray) · Review AI (purple, only if `source === 'ai'`) |

**Behavior:** drag down to dismiss (threshold 100 px offset or 500 px/s velocity). Background dim `rgba(8,18,45,0.35)`. See `ANIMATIONS.md`.

---

### 3.6 Report Issue (`04-report-issue.png`)

**Purpose:** citizen creates a new issue.

| Region | Contents |
|---|---|
| Header (gradient.header) | Back chevron · "Report an Issue" · subtitle "Help improve Narimanov" |
| Body (scroll) | Category grid (3×3 of emoji+label tiles, selected highlights primary) · Photo capture area (camera icon, "Add photo" — opens `expo-image-picker`) · Title input · Description textarea · Location row ("Use my location" toggle + map snippet) · Priority radio (Low / Medium / High / Critical) |
| Footer (sticky) | CTA "Submit Report" (gradient.brand) |

**State:** `category`, `photoUri`, `title`, `description`, `useLocation`, `priority`.

**Actions:** Submit → `POST` to backend (mock now) → toast / success state → navigate to `MyReports`.

---

### 3.7 My Reports (`05-my-reports.png`)

**Purpose:** list of issues this citizen has filed.

| Region | Contents |
|---|---|
| Header (gradient.header) | Back · "My Reports" · Menu · Stats row: Total / In Progress / Resolved (white-on-15%-glass cards) |
| List | Cards (radius 16, shadow.card) showing: thumbnail (80×80, radius from card), id, status chip, title, location row, reportedAt, category, "Track Progress →" footer chip |

**State:** read-only mock data.
**Animation:** cards stagger in (40 ms cascade, 12 px upward fade).

**Actions:** card tap → `UserReportDetails`. Header back → Map.

---

### 3.8 User Report Details (`06-user-report-details.png`)

**Purpose:** read-only timeline of a single citizen-filed issue.

| Region | Contents |
|---|---|
| Hero (image) | Issue photo, 220 px, dark gradient overlay, back chevron + status chip overlay |
| Sheet (radius 28 28 0 0) | Title · Badge row (status/priority/category) · Description · Location card (with mini map static image or `MapView` thumbnail) · **Timeline** (vertical timeline list: dot + time + action + by) · "Add Comment" + "Track Progress" buttons |

**Actions:** Back → MyReports.

---

### 3.9 Admin Issue Details (`11-admin-issue-details.png`)

Same skeleton as the user variant but with **admin action cluster** after the timeline:

- **Assign Department** (full-width gradient.admin or orange CTA)
- **Change Status** dropdown (modal)
- **Set Deadline** (date picker)
- **Add Internal Note** (textarea modal)
- **Mark Resolved** (success-color CTA)
- If `source === 'ai'`: extra "Review AI Detection" link → AIReview screen for this detection.

---

### 3.10 Admin AI Review (`12-admin-ai-review.png`)

**Purpose:** approve / merge / reject AI-detected issues before they enter the queue.

| Region | Contents |
|---|---|
| Header (gradient.header) | Back · "AI Detections" · count badge |
| Filter chips | Status: All / Pending / Approved / Rejected |
| List of detection cards | Photo (120 px square left) · ID · Confidence % (bold) · Category emoji+label · Priority chip · Location · "Detected at …" · Action row: ✅ Approve (success) / 🔀 Merge (admin purple) / ❌ Reject (danger) — all show in confirm modal |

**State:** `filter`, currently visible detection action results local.
**Actions:**
- Approve → creates real `Issue` from detection → toast "Approved → Issue ISS-NNN created".
- Merge → opens picker modal of nearby (≤ 100 m) existing issues → confirm.
- Reject → confirm modal with reason input (optional).

---

### 3.11 Admin Operations (`14-admin-operations.png`)

**Purpose:** task board for departments.

| Region | Contents |
|---|---|
| Header | Back · "Operations" · filter icon |
| Tabs | Pending / In Progress / Overdue / Completed (segmented control, pill highlight) |
| List | Task cards: title · department chip · priority chip · responsible (avatar+name) · progress bar (animated fill) · deadline ("Due in N days" — red if overdue) · `…` menu |

**Actions:** card tap → AdminIssueDetails for the issue. `…` menu → reassign / postpone / mark complete.

---

### 3.12 Admin Analytics (`15-admin-analytics.png`)

**Purpose:** KPIs + charts.

| Region | Contents |
|---|---|
| Header | Back · "Analytics" · time-range chip (Last 7 days ▾) |
| KPI grid | 2×2 cards: Total Reports, Resolved %, Avg Resolution Time, AI Detections |
| Charts | (1) Reports by category — donut · (2) Status distribution — horizontal bars · (3) Trend — line chart (last 30 days). Use **`react-native-svg`** + `victory-native` or `react-native-gifted-charts`. |
| Top issues | List of 5 longest-overdue cards |

**Actions:** Time range chip opens modal selector.

---

### 3.13 All Issues (Admin) (`13-admin-all-issues.png`)

**Purpose:** searchable, filterable global list.

| Region | Contents |
|---|---|
| Header (gradient.header) | Back · "All Issues" · count · search input (white-on-glass) |
| Filter chips row | All / New / AI Review / Assigned / In Progress / Overdue / Resolved (horizontal scroll) |
| Card list | Each card: 80×80 photo · id · status pill · title · priority pill · category · footer row (location + reportedAt) |

**State:** `search`, `filterStatus`.
**Animation:** staggered card entrance (35 ms cascade).
**Actions:** card tap → AdminIssueDetails.

---

### 3.14 AI Chat (`07-ai-chat-user.png`)

**Purpose:** conversational helper — citizens ask "how do I report a pothole?", admins ask "summarize today's reports".

| Region | Contents |
|---|---|
| Header (gradient.admin or .header) | Back · `Bot` icon + "AI Assistant" + role tag · status dot ("online") |
| Suggestion chips (visible when empty) | 3 example queries |
| Message stream | Bubbles: user (right, primary bg, white text), assistant (left, white bg, dark text), avatar 24 px circle. Time stamp below each. Typing indicator: 3 bouncing dots. |
| Composer (sticky bottom, safe area) | Text input · paperclip icon · `Send` button (gradient.admin) |

**State:** `messages[]`, `input`, `isTyping`.
**Animation:** new message bubbles fade+slide in (200 ms). Composer rises with keyboard (`KeyboardAvoidingView`).

---

### 3.15 Hamburger Menu — User (`09-hamburger-user.png`) and Admin (`16-hamburger-admin.png`)

**Width 290, slides in from the left.** Outer right corners `radius 32`. Backdrop is `scrim` + 6px blur.

| Region | Contents |
|---|---|
| Header (gradient.drawerTop) | Avatar (initials, 46×46, glass border) · Name · Role chip (citizen blue / admin purple) · "Narimanov" sublabel · `X` close button (top-right glass) · Two decorative blurred circles |
| Nav groups | Tiles separated by 1 px `#EFF2F7` dividers. Each tile: 36×36 tinted icon box + label + `ChevronRight`. Active tile: tinted bg gradient + bold label + glowing dot indicator. |
| Footer | Divider · Logout tile (red icon box, red label) · Version label `CITY GRIND · v1.0.0` (9pt, letter-spaced) |

**User group order:**
1. Map
2. Report Issue · My Reports
3. AI Assistant · Profile

**Admin group order:**
1. Map
2. AI Review · All Issues · Operations · Analytics
3. AI Assistant · Profile

---

### 3.16 Profile (`08-profile-user.png` and `18-profile-admin.png`)

**Purpose:** account info, settings, role switcher (demo), logout.

| Region | Contents |
|---|---|
| Header (gradient.header) | Back · "Profile" · 72×72 round avatar (glass border) + name + role chip + Edit icon |
| Account info card | Rows: Full Name / Phone / Role |
| Settings card | Rows (buttons): Notifications (with toggle), Edit Profile (with chevron) |
| Demo card | "DEMO MODE — SWITCH ROLE" + segmented control (User / Admin) — calls `onSwitchRole`. Hide this card in production. |
| Logout button | White bg, red border, red label + `LogOut` icon |

---

## 4. Data shapes (mirror of `mockData.ts`)

```ts
type IssueStatus = 'new' | 'ai_review' | 'assigned' | 'in_progress' | 'resolved' | 'overdue' | 'rejected';
type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
type IssueCategory = 'road' | 'lighting' | 'trash' | 'flooding' | 'infrastructure' | 'greenery' | 'other';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  lat: number;
  lng: number;
  reportedAt: string;     // ISO-ish "YYYY-MM-DD HH:mm"
  reportedBy: string;
  assignedTo?: string;
  deadline?: string;
  source: 'user' | 'ai' | 'camera';
  photo: string;
  timeline: { time: string; action: string; by: string }[];
}

interface AIDetection {
  id: string; image: string;
  detectedCategory: IssueCategory; confidence: number;
  priority: IssuePriority; location: string; lat: number; lng: number;
  detectedAt: string;
}

interface Task {
  id: string; issueId: string; title: string; department: string;
  priority: IssuePriority; deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  responsible: string; progress: number;
}
```

---

## 5. Backend / data layer

Current prototype uses **in-memory mock data**. For production:

- **Auth + DB + storage:** Supabase recommended (already discussed in chat). Tables: `users`, `issues`, `ai_detections`, `tasks`, `comments`. Storage bucket: `issue-photos`.
- **Map tiles:** ESRI satellite (`World_Imagery`) is free for development; for production hits, sign for an ArcGIS API key or use OpenMapTiles / MapTiler.
- **Geocoding:** Nominatim is rate-limited. Use MapTiler or Google Geocoding in production.
- **AI:** plug `@anthropic-ai/sdk` (server-side function) for the chat. For AI detections, a server cron with a vision model writes into `ai_detections`.
- **Push:** `expo-notifications` for status changes and new AI detections.

---

## 6. Definition of done (per screen)

A screen is done in RN when:

1. Visual matches the screenshot at iPhone 14 Pro (390×844) with ≤ 4 px tolerance on spacing.
2. All buttons have `whileTap` scale feedback (see `ANIMATIONS.md`).
3. Lists use `FlatList` with `keyExtractor` and the staggered entry animation.
4. Status / priority colors come from `tokens.ts` — no hard-coded hex anywhere.
5. Safe-area insets respected (notch + home indicator).
6. Works in light mode (we don't ship dark mode in v1).
7. No layout reflow when keyboard opens — composer / form scrolls with `KeyboardAvoidingView`.

---

## 7. Tech checklist for the RN repo

```
expo init narimanov-ops --template blank-typescript

# Core
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/drawer
npm i react-native-screens react-native-safe-area-context
npm i react-native-gesture-handler react-native-reanimated

# UI + motion
npm i nativewind                       # Tailwind class strings
npm i moti                             # motion/react-style animation API
npm i @gorhom/bottom-sheet
npm i expo-linear-gradient expo-blur
npm i lucide-react-native react-native-svg

# Data / images / maps
npm i expo-image expo-image-picker expo-location
npm i react-native-maps
npm i @react-native-async-storage/async-storage

# Charts
npm i react-native-gifted-charts        # or victory-native

# Fonts
npm i @expo-google-fonts/inter expo-font

# Backend (when ready)
npm i @supabase/supabase-js
```

See `RN_PORTING_GUIDE.md` for the line-by-line conversion table.
