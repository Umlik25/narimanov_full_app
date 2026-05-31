# React Native / Expo Porting Guide

Per-element conversion table + per-screen porting notes for moving the web prototype to **Expo SDK 50+ / RN 0.74+**.

Read this alongside `HANDOFF.md` (what each screen contains) and `COMPONENTS.md` (the reusable building blocks).

---

## 1. Element-by-element conversion table

| Web (current) | RN equivalent | Notes |
|---|---|---|
| `<div>` | `<View>` | Default `display: flex`, `flexDirection: column`. |
| `<span>` / `<p>` | `<Text>` | Text **must** be wrapped in `<Text>`. No raw strings inside `<View>`. |
| `<button>` | `<Pressable>` + animation wrapper (`TapButton`) | Use the `TapButton` from `COMPONENTS.md`. |
| `<img src=…>` | `<Image source={{ uri }}>` from `expo-image` | Better caching + faster. Local: `require("../assets/x.jpg")`. |
| CSS `linear-gradient(...)` | `<LinearGradient>` from `expo-linear-gradient` | Wraps children — gradient is a component, not a style. |
| CSS `backdrop-filter: blur(…)` | `<BlurView>` from `expo-blur` | Use sparingly — performance-sensitive. |
| CSS `box-shadow` | `shadowColor / shadowOpacity / shadowRadius / shadowOffset` (iOS) + `elevation` (Android) | All tokenized in `shadows.*`. |
| CSS `position: absolute; inset: 0;` | `StyleSheet.absoluteFillObject` | Identical behavior. |
| CSS `overflow: hidden` on rounded element | `borderRadius` + `overflow: 'hidden'` on the parent `<View>` | Required for image clipping. |
| `motion/react` `<motion.div>` | `Animated.View` (Reanimated) **or** `<MotiView>` from `moti` | `moti` API is a 1:1 of `motion/react` — use it to keep JSX nearly identical. |
| `whileTap={{ scale }}` | `useSharedValue` + `withSpring` in `TapButton` | Or `<MotiPressable animate={({ pressed }) => ({ scale: pressed ? 0.96 : 1 })}>`. |
| `<AnimatePresence>` | Reanimated `entering` / `exiting` props | Or `<AnimatePresence>` from `moti`. |
| `onClick` | `onPress` | |
| `onChange` (input) | `onChangeText` | TextInput passes the string directly. |
| `style={{ ... }}` | Same — but **no** `px` suffixes, no `vh`/`vw`, no `%` on `gap` | RN takes raw numbers. Percentages allowed on width/height/flex-basis. |
| `className="…"` (Tailwind) | `className="…"` with **NativeWind v4** | Same class strings work. Some classes (`backdrop-blur-*`, `aspect-*`) need RN equivalents. |
| Leaflet `<MapContainer>` | `<MapView>` from `react-native-maps` | ESRI tiles via `<UrlTile>`. |
| `lucide-react` | `lucide-react-native` | Same icon names. Pass `color`, `size`, `strokeWidth` as props. |
| Emoji string in `<span>` | Emoji string in `<Text>` | Renders fine cross-platform. |
| `useState` / `useEffect` | Same | React is React. |
| `useRef<HTMLDivElement>` | `useRef<View>` (or specific RN ref types) | |
| Fetching (`fetch`) | `fetch` — identical | |
| `localStorage` | `@react-native-async-storage/async-storage` | Async, not sync. |

---

## 2. Things to **drop** from the web build

These are web-only artifacts; do not port them:

1. The **outer phone-frame `<div>`** in `App.tsx` (`width: 390, borderRadius: 40, boxShadow…`) — the real device IS the frame.
2. The **status-bar notch `<div>`** — use `<StatusBar>` from `expo-status-bar` instead.
3. `touchAction: 'none'`, `userSelect: 'none'`, `cursor: 'pointer'` — meaningless in RN.
4. All CSS hover states (`active:scale-…`, `hover:bg-…`).
5. `index.html` and `public/` static assets — RN uses `require()` or `expo-asset`.
6. **Vite-only `figma:asset`** imports — switch to local `require("../assets/…")` or remote URLs.
7. `outline: none` on inputs — RN inputs have no outline by default.

---

## 3. Things to **add** that the web build doesn't have

1. **Safe-area handling** — wrap the root in `<SafeAreaProvider>` and use `useSafeAreaInsets()` inside headers (replace the hard-coded `paddingTop: 48` with `insets.top + 12`).
2. **`KeyboardAvoidingView`** around composer screens (Login, SignUp, ReportIssue, AIChat).
3. **`<StatusBar style="light">`** on dark-headed screens, `"dark"` on light screens. Use `expo-status-bar`.
4. **Permissions** — `expo-location`, `expo-image-picker`, `expo-notifications` need runtime permission requests with rationale dialogs.
5. **Hardware back button (Android)** — `useFocusEffect` + `BackHandler.addEventListener('hardwareBackPress', …)`.
6. **Splash screen** — `expo-splash-screen` with the Heydar Aliyev hero image.
7. **App icons / adaptive icon** for Android, plus iOS icon set.

---

## 4. Project skeleton

```
narimanov-ops/
├── app.json                 # Expo config (name, slug, icons, splash, plugins)
├── babel.config.js          # add `react-native-reanimated/plugin` (must be last)
├── metro.config.js          # default
├── tsconfig.json
├── App.tsx                  # only mounts NavigationContainer + providers
├── src/
│   ├── theme/
│   │   ├── tokens.ts        # ← drop from handoff/
│   │   └── fonts.ts         # Inter font loader
│   ├── navigation/
│   │   ├── RootStack.tsx
│   │   ├── AppDrawer.tsx
│   │   └── HamburgerMenu.tsx
│   ├── components/          # see COMPONENTS.md
│   ├── screens/             # see HANDOFF.md
│   ├── data/
│   │   ├── mockData.ts      # straight port
│   │   ├── supabase.ts      # client init
│   │   └── hooks.ts         # useIssues, useDetections, useTasks
│   ├── utils/
│   │   ├── location.ts      # Nominatim wrapper
│   │   └── analytics.ts
│   └── context/
│       └── AuthContext.tsx
├── assets/                  # ← see ASSETS.md
└── ...
```

---

## 5. Per-screen porting notes

For each of the 16 screens, what to use natively. Pair with `HANDOFF.md §3`.

### 5.1 Login & 5.2 Sign Up

- Hero: `<Image source={require("../../../assets/images/heydar_aliyev.jpg")}>` with `contentFit="cover"`.
  Overlay: `<LinearGradient colors={['rgba(8,18,45,0.5)','rgba(8,18,45,0.05)','rgba(8,18,45,0.82)']}>`.
- Form container: a `<View>` with `KeyboardAvoidingView` wrapper.
- Inputs: `<Input>` component from `COMPONENTS.md`.
- Role toggle: `<RoleToggle>` component.
- CTA: `<PrimaryCTA>`.
- **Hero radius:** RN clips children only if the parent has `overflow: 'hidden'` + `borderRadius`.

### 5.3 / 5.4 Map (User + Admin)

```tsx
import MapView, { Marker, UrlTile } from "react-native-maps";

<MapView
  provider={undefined}                                 // use default (not Google) so UrlTile works
  initialRegion={{ latitude: 40.4087, longitude: 49.8675, latitudeDelta: 0.018, longitudeDelta: 0.018 }}
  mapType="none"                                       // we override tiles
  style={StyleSheet.absoluteFillObject}
>
  <UrlTile
    urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    maximumZ={19}
  />
  {issues.map(i => (
    <Marker key={i.id}
            coordinate={{ latitude: i.lat, longitude: i.lng }}
            onPress={() => openSheet(i)}>
      <CustomPin status={i.status} />
    </Marker>
  ))}
</MapView>
```

Header overlay is a `<View>` positioned `absoluteFill` with `top: insets.top + 8`. FABs likewise.

**Role differences:** branch on `role === 'admin'` to add purple AI-review markers and a small unread-count badge.

### 5.5 Issue Bottom Sheet

Use `@gorhom/bottom-sheet`. See `COMPONENTS.md §9` and `ANIMATIONS.md §3`. Content body is a regular set of `<View>`s + `<Image>`s + badges + `<PrimaryCTA>` / `<SecondaryButton>`.

### 5.6 Report Issue

- Category grid: `<View flexDirection="row" flexWrap="wrap" gap={12}>` with 3 columns. Each tile is a `<TapButton>` (`scaleTo 0.97`) showing emoji + label, with a primary border when selected.
- Photo capture: `<TapButton onPress={openImagePicker}>` → `expo-image-picker`. Once an image exists, preview with `<Image>` + small `X` to clear.
- Description: `<TextInput multiline numberOfLines={5}>`.
- Location toggle: `<Switch>`.
- Priority radios: a row of 4 chips; selected uses `priorityColors[p]` background.
- Footer CTA: pin to bottom with `<View style={{ paddingBottom: insets.bottom + 12 }}>`.

### 5.7 My Reports

- `<FlatList data={issues} keyExtractor renderItem={…}>`.
- Renderer: `<IssueCard>` from `COMPONENTS.md` with `index` prop for stagger.
- Header is a `<ScreenHeader>` with the stats row injected via `children`.

### 5.8 / 5.9 Report Details (User + Admin)

- Hero `<Image>` (220 px) + dark gradient + back chevron + status chip overlay.
- Below is a `<ScrollView>` containing badges, description, location card, timeline, and (admin only) the action cluster.
- Location card: `<MapView>` snippet at 100 px height, `pointerEvents="none"` so it's not interactive; tap to expand opens a modal `<MapView>` fullscreen.

### 5.10 AI Review

- `<FlatList data={detections}>`.
- Renderer: `<DetectionCard>` (`COMPONENTS.md` — variant of IssueCard with square image left + action row).
- Approve/Reject/Merge actions trigger modals (use `<Modal transparent>` + Reanimated entering).

### 5.11 Admin Operations

- Tab switcher: segmented control (use `RoleToggle` styling adapted to 4 options).
- `<FlatList>` of task cards.
- Progress bar: `<View>` background gray + animated child `<Animated.View>` with width-based fill (see `ANIMATIONS.md §11`).

### 5.12 Admin Analytics

- Use **`react-native-gifted-charts`** (`PieChart`, `BarChart`, `LineChart`) — simplest dependency.
- KPI cards: 2×2 grid of `<View>`s with shadow.
- Time-range chip opens a small `<BottomSheet>` with options.

### 5.13 All Issues

- `<TextInput>` in header for search.
- `<ScrollView horizontal>` of filter chips (or `FlatList horizontal`).
- `<FlatList>` of `<IssueCard>` (compact variant, 80 px photo).

### 5.14 AI Chat

- `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`.
- `<FlatList inverted data={messages.slice().reverse()}>` — `inverted` flips the list so newest messages stay at the bottom and scrolling works naturally.
- Composer pinned at bottom (`<View style={{ paddingBottom: insets.bottom }}>`).
- Use `TypingDots` (see `COMPONENTS.md §13`).

### 5.15 Hamburger Menu (User + Admin)

Custom drawer:

```tsx
<Drawer.Navigator
  drawerContent={(props) => <HamburgerMenu {...props} role={role} />}
  screenOptions={{
    drawerStyle: { width: 290, backgroundColor: "transparent" },
    overlayColor: "rgba(8,18,45,0.6)",
    drawerType: "front",
  }}
>
  <Drawer.Screen name="Map" component={MapStack} />
</Drawer.Navigator>
```

`HamburgerMenu` renders the white panel with right-edge radius 32, the gradient top, and the nav tile list (see `COMPONENTS.md §10`). Two group variants by role.

### 5.16 Profile

- `<ScreenHeader>` + avatar + Edit icon.
- Three cards: Account Info, Settings, Demo Role Switcher.
- Logout button at bottom.

---

## 6. Library install commands (Expo)

```bash
# 1. Init
npx create-expo-app narimanov-ops -t blank-typescript
cd narimanov-ops

# 2. Navigation
npx expo install react-native-screens react-native-safe-area-context
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/drawer

# 3. Reanimated + Gesture Handler (required by drawer/sheet)
npx expo install react-native-reanimated react-native-gesture-handler

# 4. UI / motion
npm i moti                                # motion-react clone
npm i @gorhom/bottom-sheet
npx expo install expo-linear-gradient expo-blur
npm i nativewind
npm i tailwindcss@3.4.0 --save-dev

# 5. Icons
npm i lucide-react-native react-native-svg

# 6. Maps + media
npx expo install react-native-maps expo-image expo-image-picker expo-location

# 7. Storage / push
npx expo install @react-native-async-storage/async-storage expo-notifications

# 8. Charts
npm i react-native-gifted-charts

# 9. Fonts
npx expo install expo-font @expo-google-fonts/inter

# 10. Backend (when ready)
npm i @supabase/supabase-js
```

**Required config:**

`babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin",   // MUST be last
    ],
  };
};
```

`tailwind.config.js`:

```js
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
};
```

Wrap root:

```tsx
// App.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <RootStack />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 7. Mock-data port (smallest possible change)

`src/app/components/mockData.ts` (web) → `src/data/mockData.ts` (RN) — **copy verbatim**. No TypeScript changes. Photo URLs work as-is with `expo-image`.

The web's `STATUS_COLORS` / `PRIORITY_COLORS` should be re-exported from `tokens.ts` so there's one source of truth.

---

## 8. Common pitfalls (read before starting)

1. **Reanimated plugin must be last** in `babel.config.js`. If you forget, animations error silently.
2. **Text must be in `<Text>`** — even a single space. Crashes otherwise.
3. **`gap` works** in modern RN (0.71+) but if you target older, use margins.
4. **No CSS variables** — pull every color from `tokens.ts`.
5. **No `z-index` without `position`** — set `position: 'absolute'` (or `relative`) first.
6. **Images need explicit dimensions** unless inside a sized parent.
7. **`overflow: 'hidden'` doesn't clip shadows on iOS** — that's why bottom sheets need their own shadowed wrapper outside the clipped content.
8. **Keyboard avoiding behavior** differs by OS — use `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.
9. **`expo-image-picker`** returns `assets[0].uri` (v14+) — not the v13 root `uri`. Use the modern API.
10. **MapView ESRI tiles** — set `provider={undefined}` (NOT `'google'`) so `UrlTile` actually renders.

---

## 9. Definition of port-complete (per screen)

A screen is "done" when:

- [ ] Tokens used everywhere (no inline hex).
- [ ] Safe-area respected on top + bottom.
- [ ] All buttons have `whileTap` (or `TapButton`) feedback.
- [ ] `entering` animations on list items.
- [ ] Screen transition is smooth (no jank).
- [ ] No `console.warn` on mount (RN flags many issues here).
- [ ] Works on both iOS sim and Android emu.
- [ ] Keyboard doesn't cover any input.
- [ ] Dark status bar / light status bar set explicitly.
- [ ] Visual diff vs `screenshots/NN-name.png` is within tolerance.

---

## 10. Recommended order to port

1. **Week 1** — Theme + tokens + `<TapButton>` / `<PrimaryCTA>` / `<IconButton>` / `<Input>` / `<RoleToggle>`.
2. **Week 1** — Auth: Login + SignUp.
3. **Week 2** — Map (User) + Issue Bottom Sheet + Hamburger drawer.
4. **Week 2** — Map (Admin) + role-conditional UI.
5. **Week 3** — Report Issue + My Reports + Report Details (User).
6. **Week 3** — Admin Issue Details + AI Review + All Issues.
7. **Week 4** — Operations + Analytics.
8. **Week 4** — AI Chat + Profile.
9. **Week 5** — Polish: animations, edge cases, error states.
10. **Week 6** — Supabase integration, push notifications, ship.
