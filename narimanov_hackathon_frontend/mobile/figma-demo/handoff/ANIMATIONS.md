# Animations — Spec & RN Mapping

Every animation in the prototype, with the exact spring / easing values, mapped to **Reanimated 3** (and `moti` where simpler). All values are also exported from `tokens.ts` under `motion.*`.

**Stack:**
- `react-native-reanimated` v3
- `react-native-gesture-handler` v2
- `@gorhom/bottom-sheet` for the slide-up
- Optional: `moti` — its `from/animate/exit` API is a 1:1 of `motion/react`, so the web JSX ports almost verbatim.

---

## 1. Screen transitions

**Web spec:** opacity 0 + x 18 → opacity 1 + x 0; exit reverses; duration **280 ms**; easing cubic-bezier `(0.22, 1, 0.36, 1)` (expo-out).

**RN — React Navigation Stack:**

```ts
// in navigationOptions
import { TransitionPresets } from "@react-navigation/stack";

<Stack.Screen
  name="MyReports"
  component={MyReportsScreen}
  options={{
    transitionSpec: {
      open:  { animation: "timing", config: { duration: 280, easing: Easing.bezier(0.22, 1, 0.36, 1) } },
      close: { animation: "timing", config: { duration: 220, easing: Easing.bezier(0.22, 1, 0.36, 1) } },
    },
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        opacity: current.progress,
        transform: [{
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        }],
      },
    }),
  }}
/>
```

Or with **native-stack** (better perf): `animation: 'fade_from_bottom'` gives a similar feel.

---

## 2. Button press effect

**Web spec:** `whileTap={{ scale: 0.96 }}` (cards 0.98, tiles 0.97).

**RN — `TapButton` from COMPONENTS.md:**

```ts
const s = useSharedValue(1);
const SPRING_BUTTON = { stiffness: 500, damping: 24, mass: 0.6 };

onPressIn:  s.value = withSpring(0.96, SPRING_BUTTON)
onPressOut: s.value = withSpring(1,    SPRING_BUTTON)

style: { transform: [{ scale: s.value }] }
```

**Targets:**
- 0.96 — primary CTAs, header icon buttons
- 0.97 — chips, segment toggles, drawer tiles
- 0.98 — list cards
- 0.92 — small round 36 px icon buttons (more pronounced)

---

## 3. Bottom sheet (slide-up, drag-to-dismiss)

**Web spec:** spring `{ stiffness: 360, damping: 34, mass: 0.9 }`, drag down dismiss at `offset > 100 px` or `velocity > 500 px/s`. Backdrop fade `0 → 1` in 220 ms.

**RN — `@gorhom/bottom-sheet` natively models this**. Spring and gesture work out of the box. Match feel:

```tsx
<BottomSheet
  ref={sheetRef}
  snapPoints={["72%"]}
  enablePanDownToClose
  animationConfigs={{ stiffness: 360, damping: 34, mass: 0.9 }}
  backdropComponent={(props) => (
    <BottomSheetBackdrop {...props}
      appearsOnIndex={0} disappearsOnIndex={-1}
      opacity={0.35}
      pressBehavior="close" />
  )}
/>
```

No need to wire drag-to-dismiss manually — `enablePanDownToClose` does it.

---

## 4. Modal animations (action sheets, confirm dialogs)

**Web spec:** small modals fade + scale up `{ opacity: 0→1, scale: 0.96→1 }` over 200 ms.

**RN:**

```tsx
<Animated.View
  entering={FadeInDown.springify().damping(20).stiffness(280)}
  exiting={FadeOut.duration(160)}>
  …
</Animated.View>
```

Wrap the modal in a `Modal` with `transparent` and `animationType="none"` so Reanimated owns the motion.

---

## 5. Hamburger drawer slide-in

**Web spec:** `translateX: -310 → 0`, duration 300 ms, easing `(0.25, 0.46, 0.45, 0.94)` (smooth cubic). Backdrop fades 220 ms.

**RN — React Navigation Drawer**: configure on the Drawer.Navigator:

```ts
<Drawer.Navigator
  screenOptions={{
    drawerType: "front",
    drawerStyle: { width: 290 },
    overlayColor: "rgba(8,18,45,0.6)",
    // RN Navigation v6 uses a built-in transition; tune via gesture:
    drawerActiveBackgroundColor: "transparent",
  }}
  drawerContent={(p) => <HamburgerMenu {...p} />}
/>
```

If you need exact timing, install `react-native-drawer-layout` and animate `translateX` manually with the same Reanimated spec.

---

## 6. Card press + list stagger

**Web spec:** each card entrance `{ opacity: 0, y: 12 } → { opacity: 1, y: 0 }`, 280 ms, with **40 ms delay per index** (35 ms in AllIssues).

**RN — Reanimated `entering`:**

```tsx
import Animated, { FadeInDown } from "react-native-reanimated";

<FlatList
  data={issues}
  keyExtractor={(it) => it.id}
  renderItem={({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280).easing(Easing.bezier(0.22, 1, 0.36, 1))}>
      <IssueCard issue={item} onPress={…} />
    </Animated.View>
  )}
/>
```

> **Perf tip:** Only animate items that are currently visible. For long lists, wrap entries with `Animated.View` only for the first 12 items, or use `getItemLayout` to keep `FlatList` responsive. Once an item has appeared, drop the entering prop on re-renders.

---

## 7. AI chat — bubble entrance + typing dots

**Bubble entrance:** opacity 0→1, y 8→0, 220 ms.

```tsx
<Animated.View entering={FadeInUp.duration(220)}>{bubble}</Animated.View>
```

**Typing dots:** three dots, each translating Y by ±3 px in a loop with 120 ms stagger:

```tsx
const y0 = useSharedValue(0);
useEffect(() => {
  y0.value = withRepeat(withSequence(
    withTiming(-3, { duration: 240 }),
    withTiming(0,  { duration: 240 }),
  ), -1, true);
}, []);
// Dot 1: y0; Dot 2: same with .delay(120); Dot 3: with .delay(240).
```

---

## 8. Map marker tap pulse (optional polish)

When a marker is tapped, before the sheet animates in, pulse the marker:

```ts
markerScale.value = withSequence(
  withTiming(1.2, { duration: 140 }),
  withSpring(1,  { stiffness: 320, damping: 18 }),
);
```

Use `Marker.Animated` from `react-native-maps` and apply the scale.

---

## 9. Search bar reveal

**Web spec:** translateY `-80 → 0`, opacity `0 → 1`, 220 ms.

```tsx
<Animated.View
  entering={FadeInDown.duration(220)}
  exiting={FadeOutUp.duration(180)}>
  <SearchBar />
</Animated.View>
```

---

## 10. Status chip color change

When status updates, transition the bg color over 200 ms.

```tsx
const bg = useDerivedValue(() =>
  withTiming(statusColors[status], { duration: 200 })
);
const animStyle = useAnimatedStyle(() => ({ backgroundColor: bg.value }));
```

(Reanimated 3 supports animating colors directly.)

---

## 11. Progress bar (Operations cards)

Animate the fill width from `0 → progress%` once the card enters viewport.

```tsx
const w = useSharedValue(0);
useEffect(() => { w.value = withTiming(progress, { duration: 600 }); }, [progress]);
const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));
```

---

## 12. Skeleton / loading shimmer

For lists loading from Supabase:

```tsx
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const x = useSharedValue(-100);
useEffect(() => { x.value = withRepeat(withTiming(300, { duration: 1100 }), -1, false); }, []);
```

Apply as overlay on a gray-toned placeholder.

---

## 13. Performance rules

- **Always use `react-native-reanimated`** (UI-thread driven). Avoid `Animated.timing` on JS-driven properties for anything other than layout-effect props.
- **Use `useNativeDriver: true`** if you fall back to the legacy `Animated` API (rare).
- **Don't animate `width` / `height`** unless you really need to — animate `scale` or `transform` instead. Width-animation is allowed in our spec only for the Operations progress bar (small, infrequent).
- **List entries**: cap the staggered entry to the initial mount. Use `useState({ animated: true })` flipped to `false` after the first render to avoid re-animating on scroll.
- **Reduce motion**: respect `AccessibilityInfo.isReduceMotionEnabled()`. When true, replace springs with `withTiming` at 120 ms and remove staggers.

---

## 14. Motion tokens (quick reference)

```ts
// From tokens.ts
motion.easing.standard   // [0.22, 1, 0.36, 1]   — screen, list, modal
motion.easing.smooth     // [0.25, 0.46, 0.45, 0.94] — drawer

motion.duration.fast     // 180 ms — micro
motion.duration.base     // 220 ms — chips, backdrop fades
motion.duration.screen   // 280 ms — screen transitions
motion.duration.drawer   // 300 ms — drawer slide

motion.spring.sheet      // { stiffness: 360, damping: 34, mass: 0.9 }
motion.spring.button     // { stiffness: 500, damping: 24, mass: 0.6 }

motion.press.tile        // { scale: 0.97 }
motion.press.card        // { scale: 0.98 }
motion.press.button      // { scale: 0.96 }
```
