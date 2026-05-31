# Assets Index

Every image and icon used by the app, where it lives in this repo, and how to use it in the React Native / Expo project.

---

## 1. What's in the repo today

```
src/imports/
├── heyder_aliyev-2.jpg          ← CURRENT login/signup hero (used)
├── heyder_aliyev-1.jpg          ← prior hero (unused, identical)
├── heyder_aliyev*.jpg           ← older duplicates (cleanup candidates)
├── image-1.png … image-41.png   ← user-uploaded reference screenshots
├── WhatsApp_Image_*.jpeg        ← user-attached reference shots
└── pasted_text/
    └── narimanov-ops-ui-design.md   ← original design brief

public/
└── hero.jpg                     ← legacy copy of the hero (still referenced as fallback)
```

**Used in code** (verified):

- `src/imports/heyder_aliyev-2.jpg` — imported by `LoginScreen.tsx` and `SignUpScreen.tsx` as the hero.

**Not used in code:**

- Every `image-NN.png` and `WhatsApp_Image_*.jpeg` — these were attachments in chat for reference only. They are NOT part of the running UI.

---

## 2. Asset folder for the React Native project

Create the following structure in the new Expo repo:

```
narimanov-ops/
└── assets/
    ├── icons/
    │   ├── icon.png                      # 1024×1024, app icon
    │   ├── icon-adaptive-foreground.png  # 1024×1024, Android adaptive
    │   └── splash.png                    # 1284×2778, splash image
    ├── images/
    │   ├── hero-heydar-aliyev.jpg        # ← copy heyder_aliyev-2.jpg here
    │   ├── map-placeholder.png           # optional, if you want a static map fallback
    │   └── logo-mark.png                 # optional, raster brand mark
    └── fonts/
        └── (Inter is loaded via @expo-google-fonts/inter, no static files needed)
```

**Required to ship:**
- `icons/icon.png` (1024×1024, opaque, no transparency)
- `icons/icon-adaptive-foreground.png` (1024×1024, transparent, padded — the inner 720×720 holds visible content)
- `icons/splash.png` (recommended 1284×2778, can be a dark-blue background with the brand logo centered)
- `images/hero-heydar-aliyev.jpg`

Everything else is optional or runtime-loaded.

---

## 3. Asset → screen usage map

| Asset | Where it appears | RN reference |
|---|---|---|
| `hero-heydar-aliyev.jpg` | Login, Sign Up hero region (top 310 px, radius bottom 36) | `require("../../assets/images/hero-heydar-aliyev.jpg")` |
| **Issue photos** | Bottom sheet thumbnail, list cards, report detail hero | **Remote Unsplash URLs** stored in `mockData.ts` — no local file needed |
| **Map tiles** | User Map, Admin Map | Streamed by `react-native-maps` via `<UrlTile>` (ESRI). No local file. |
| **Map pin glyphs** | Map markers | Drawn programmatically with `lucide-react-native` `MapPin` inside `<Marker>` — no asset. |
| **App icon** | Home-screen launcher | `app.json → icon` field. |
| **Splash** | Cold start | `app.json → splash.image`. |
| **Avatars** | Drawer header, Profile, AI chat | None on disk — generated from initials inline (`getInitials(name)`). |

---

## 4. Remote images (issue photos)

From `mockData.ts`:

```ts
export const ISSUE_PHOTOS = [
  'https://images.unsplash.com/photo-1779179015285-120aaa822b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1579114213255-d8d82bfff681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/flagged/photo-1572213426852-0e4ed8f41ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

// Used by mockIssues, mockAIDetections, mockMyIssues.
```

**Fallback URL** (web build's onError handler):
```
https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600
```

**RN implementation:**

```tsx
import { Image } from "expo-image";

<Image
  source={{ uri: issue.photo }}
  placeholder={require("../../assets/images/photo-placeholder.png")}  // small blurhash or gray block
  contentFit="cover"
  transition={200}
  recyclingKey={issue.id}
  onError={() => {/* swap to ISSUE_PHOTOS[4] */}}
/>
```

For production, **don't depend on Unsplash hot-linking** — Supabase Storage bucket `issue-photos` is the right home; replace URLs at write time.

---

## 5. Icons (no static files)

All icons come from **`lucide-react-native`** (same names as the web `lucide-react`). The full list used by the app:

```
ArrowLeft · Bell · Bot · BarChart2 · Calendar · Camera · ChevronLeft · ChevronRight
Clock · Edit2 · Eye · EyeOff · FileText · Filter · List · Loader · Lock · LogOut
Map · MapPin · MapPinned · Menu · Mail · Navigation · Phone · Plus · Search · Send
Settings · Shield · SlidersHorizontal · User · X · Activity
```

Pass props for styling:

```tsx
<MapPin size={24} color="#0B5CFF" strokeWidth={2.5} />
```

No need to bundle SVGs — they are inlined by the library.

---

## 6. Fonts

The single font family used is **Inter**, weights 400 / 500 / 600 / 700 / 800.

**Install:**
```bash
npx expo install expo-font @expo-google-fonts/inter
```

**Load in App.tsx:**

```tsx
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });
  if (!loaded) return null;
  return <RootStack />;
}
```

Then in styles use `fontFamily: "Inter_700Bold"`, etc. (Reference these by weight name; raw `fontWeight: '700'` may not apply Inter on Android.)

---

## 7. Emoji as inline icons

The category markers and a few inline indicators are **emoji strings**, not assets:

```
🚧 road       💡 lighting    🗑️ trash       🌊 flooding
🏗️ infra     🌳 greenery    📌 other
👤 citizen    🛡️ admin
✅ approve   ❌ reject       🔀 merge
```

Render in `<Text>`; rendering is cross-platform.

---

## 8. Cleanup before zipping the project

Before downloading the Figma Make export, delete or move:

```
src/imports/image-1.png … image-41.png      ← chat-attached references
src/imports/WhatsApp_Image_*.jpeg           ← chat-attached references
src/imports/heyder_aliyev-1.jpg             ← duplicate, unused
src/imports/heyder_aliyev.jpg               ← duplicate, unused
src/imports/heyder_aliyev_center*.jpg       ← duplicate, unused
src/imports/heyder_aliyev_hero.jpg          ← duplicate, unused
src/imports/trend_heydar_aliyev_center*.jpg ← duplicate, unused
public/hero.jpg                              ← legacy fallback, no longer referenced
```

**Keep:**
- `src/imports/heyder_aliyev-2.jpg` (active hero) — copy this to `assets/images/hero-heydar-aliyev.jpg` in the new Expo project.
- `src/imports/pasted_text/narimanov-ops-ui-design.md` (original design brief — useful reference).

---

## 9. Where to put the screenshots you capture

```
handoff/
└── screenshots/
    ├── 01-login.png
    ├── 02-signup.png
    ├── 03-user-map.png
    ├── 04-report-issue.png
    ├── 05-my-reports.png
    ├── 06-user-report-details.png
    ├── 07-ai-chat-user.png
    ├── 08-profile-user.png
    ├── 09-hamburger-user.png
    ├── 10-admin-map.png
    ├── 11-admin-issue-details.png
    ├── 12-admin-ai-review.png
    ├── 13-admin-all-issues.png
    ├── 14-admin-operations.png
    ├── 15-admin-analytics.png
    ├── 16-hamburger-admin.png
    ├── 17-issue-bottom-sheet.png   (optional bonus)
    └── 18-profile-admin.png        (optional bonus)
```

When the project is zipped (via Figma Make's export), these screenshots will be inside the bundle for Codex to inspect.

---

## 10. Summary checklist for Codex

When recreating the app in RN/Expo, Codex should pull:

- [ ] **Design tokens** from `handoff/tokens.ts` → copy to `src/theme/tokens.ts`
- [ ] **Hero image** from `src/imports/heyder_aliyev-2.jpg` → copy to `assets/images/hero-heydar-aliyev.jpg`
- [ ] **Mock data** from `src/app/components/mockData.ts` → copy verbatim to `src/data/mockData.ts`
- [ ] **Screen specs** from `handoff/HANDOFF.md`
- [ ] **Component implementations** from `handoff/COMPONENTS.md`
- [ ] **Flows** from `handoff/INTERACTIONS.md`
- [ ] **Animation values** from `handoff/ANIMATIONS.md`
- [ ] **Conversion table & gotchas** from `handoff/RN_PORTING_GUIDE.md`
- [ ] **Visual reference** from `handoff/screenshots/*.png` (after manual capture)

Everything else (icons, fonts, issue photos, map tiles) is fetched at runtime via libraries / URLs — no static assets required.
