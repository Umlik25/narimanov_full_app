# Design Tokens — City Grind

This is the human-readable spec. The machine-readable version lives in **`tokens.ts`** (drop into `src/theme/tokens.ts` in RN).

---

## 1. Color palette

### Brand
| Token | Hex | Used for |
|---|---|---|
| `primary` | `#0B5CFF` | CTAs, links, active map pin, citizen role |
| `primaryDark` | `#1a3a8f` | Gradient end of primary |
| `primaryDeep` | `#08122D` | Headers, primary text, status-bar |
| `primaryNight` | `#0B1120` | Login/signup background behind hero |

### Roles & states
| Token | Hex | Meaning |
|---|---|---|
| `admin` | `#7C3AED` | Admin role, AI features, AI Review |
| `adminDark` | `#5B21B6` | Admin gradient end |
| `warning` | `#F97316` | Assigned / In progress / Medium priority |
| `success` | `#16A34A` | Resolved |
| `danger` | `#E53935` | Overdue / Logout / Errors |
| `dangerAlt` | `#EF4444` | High priority |
| `dangerDeep` | `#DC2626` | Critical priority |

### Neutrals
| Token | Hex |
|---|---|
| `surface` | `#F5F7FB` (app bg) |
| `surfaceAlt` | `#F9FAFB` (input bg) |
| `white` | `#FFFFFF` |
| `divider` | `#EFF2F7` |
| `borderLight` | `#F0F0F0` |
| `borderMid` | `#E5E7EB` |
| `textPrimary` | `#08122D` |
| `textSecondary` | `#6B7280` |
| `textMuted` | `#9CA3AF` |
| `textPlaceholder` | `#C0C0C0` |

### Soft tints (icon backgrounds, inactive chips)
`tintBlue #EEF3FF` · `tintPurple #F3EEFF` · `tintOrange #FFF4ED` · `tintGreen #EDFAF3` · `tintGray #F3F4F6` · `tintAdmin #EDE9FE` · `tintDanger #FEE2E2`

### Overlays
- Hamburger backdrop: `rgba(8,18,45,0.6)` + 6px blur
- Bottom-sheet backdrop: `rgba(8,18,45,0.35)` + 2px blur
- Glass on dark headers: `rgba(255,255,255,0.12–0.25)`

---

## 2. Status & priority color map (mirror of `mockData.ts`)

```
new          → #0B5CFF (blue)
ai_review    → #7C3AED (purple)
assigned     → #F97316 (orange)
in_progress  → #F97316 (orange)
resolved     → #16A34A (green)
overdue      → #E53935 (red)
rejected     → #9CA3AF (gray)

low          → #9CA3AF
medium       → #F97316
high         → #EF4444
critical     → #DC2626
```

---

## 3. Gradients (use `expo-linear-gradient`)

| Name | Stops | Direction | Used on |
|---|---|---|---|
| `brand` | `#0B5CFF → #1a3a8f` | 135° | Primary CTA buttons, brand logo box |
| `header` | `#08122D → #0B5CFF` | 135° | Dark page headers |
| `drawerTop` | `#08122D → #0B2A8A → #1248E8` | 150° | Hamburger menu header |
| `admin` | `#7C3AED → #5B21B6` | 135° | Admin role chip |
| `citizen` | `#0B5CFF → #1a3a8f` | 135° | Citizen role chip |

---

## 4. Typography

**Font family**: `Inter` (load with `expo-google-fonts/inter`).

### Weights actually used
| Token | CSS weight | Used for |
|---|---|---|
| `regular` | 400 | Body text, captions |
| `medium` | 500 | Inactive nav labels, list metadata |
| `semibold` | 600 | Buttons in lists, badges, chips |
| `bold` | 700 | Headers, active nav, primary buttons |
| `extrabold` | 800 | Brand title, hero headlines |

### Type scale
```
9   xxs   version label, micro-captions
10  xs    role chip, drawer metadata
11  sm    UPPERCASE section labels, badges
12  base  small body, tab labels, secondary
13  md    nav-item text, links, helper text
14  lg    input text, body
15  xl    section heading inside cards
16  2xl   primary CTA label, screen sub-title
17  3xl   bottom-sheet title
18  4xl   screen title in header
22  5xl   brand title "City Grind"
26  6xl   "Welcome back" hero text
```

### Tracking (letter-spacing)
- `-0.6` on 26pt+ display text
- `-0.5` on 22pt display
- `-0.2` on buttons
- `+0.5` (uppercase 11pt section labels)

### Line heights
- `1.1` headings, `1.25` snug, `1.5` body, `1.6` long-form description

---

## 5. Spacing scale

Pseudo 4-pt grid (exact values used in code):

```
0  4  6  8  10  12  14  16  18  20  24  26  28  32  40  48
```

**Conventions**
- Screen horizontal padding: **20**
- Inside cards: **12–16**
- Between stacked sections: **20–24**
- Top inset for headers (safe-area-ish): **48** (use `useSafeAreaInsets()` in RN, plus 12)
- Gap between chips/buttons: **8–12**

---

## 6. Border radius

| Token | Value | Used for |
|---|---|---|
| `sm` | 6 | Tiny chips |
| `md` | 10 | Square icon buttons inside header glass |
| `lg` | 12 | Drawer nav tile icon background |
| `xl` | 14 | Status chips in drawer |
| `2xl` | 16 | Inputs, role-chip badges, photo thumbs |
| `3xl` | 18 | CTA buttons |
| `4xl` | 20 | Section cards |
| `card` | 22 | Bottom-sheet photo |
| `sheetTop` | 28 | Top corners of bottom sheet & login form |
| `drawer` | 32 | Outer right corner of hamburger drawer |
| `hero` | 36 | Bottom corners of login hero |
| `pill` | 999 | Badges, round 36-px icon buttons |

---

## 7. Shadow / elevation tokens

| Token | iOS spec | Android `elevation` | Used for |
|---|---|---|---|
| `card` | y1 r4 #000 @ 8% | 2 | List cards |
| `chip` | y2 r10 #000 @ 10% | 3 | Filter chips, FAB |
| `cta` | y8 r28 #0B5CFF @ 40% | 8 | Primary CTAs |
| `sheet` | y-4 r40 #000 @ 18% | 16 | Bottom sheets |
| `drawer` | x12 r60 #000 @ 40% | 20 | Hamburger drawer |
| `pin` | y4 r24 #0B5CFF @ 50% | 6 | Active map pin |

---

## 8. Iconography

Use **`lucide-react-native`** — same icon names as the web build. Icons referenced:

```
MapPin · Lock · User · Eye · EyeOff · Shield · ChevronRight · ChevronLeft
ArrowLeft · Menu · Plus · Bot · Navigation · Search · SlidersHorizontal
X · Map · FileText · LogOut · List · BarChart2 · Settings · Eye
Phone · Mail · Bell · Edit2 · Clock · Camera · MapPinned · Send
Loader · Filter · Calendar · Activity
```

Standard sizes used: **11, 13, 14, 15, 16, 18, 24, 32** (px).
Default stroke width `2`; logo MapPin uses `2.5`.

Emojis used as inline category markers (keep them — they render fine in RN):
`🚧 💡 🗑️ 🌊 🏗️ 🌳 📌 👤 🛡️`

---

## 9. Quick visual map (where each token lives)

```
LOGIN
├── bg #0B1120 (primaryNight)
├── hero image, height 310, radius 36 36 0 0 (bottom)
├── form sheet:   bg white, radius 28 28 0 0, shadow.sheet
├── role toggle:  bg surface, radius 18, active item bg white + shadow
├── inputs:       bg surfaceAlt, radius 16, border #F0F0F0 → primary on focus
└── CTA:          gradient.brand, radius 18, height 56, shadow.cta

MAP (user + admin)
├── header glass row (icons in rgba(255,255,255,0.20) circles, radius pill)
├── search/filter chips: bg white, radius pill, shadow.chip
└── map pins: gradient + shadow.pin

BOTTOM SHEET
├── radius 24 24 0 0, shadow.sheet
├── drag handle: 40×4 #D1D5DB pill
├── badges: status/priority/category pills (radius pill)
└── photo: radius 16

DRAWER
├── width 290, outer-right radius 32
├── header gradient.drawerTop, ornamental blurred circles
└── nav tiles: 36×36 icon box (radius 12), tinted bg per category

REPORT / DETAILS / ADMIN PAGES
└── header gradient.header, content on surface, cards radius 16, shadow.card
```
