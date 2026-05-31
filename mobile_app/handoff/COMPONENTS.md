# Reusable Components — RN Catalog

Every screen is built from ~12 reusable pieces. Build these first; assemble screens from them.

Every component below is given as a copy-paste-able **React Native + Reanimated + NativeWind** sketch. Pull tokens from `tokens.ts`.

---

## 1. `<TapButton>` — Pressable with scale animation

The universal interactive wrapper. Every button, card, chip, and tile uses this.

```tsx
import { Pressable, PressableProps } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { motion } from "../theme/tokens";

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface TapButtonProps extends PressableProps {
  scaleTo?: number;     // default 0.96
  spring?: typeof motion.spring.button;
  children: React.ReactNode;
}

export const TapButton: React.FC<TapButtonProps> = ({
  scaleTo = motion.press.button.scale,
  spring = motion.spring.button,
  children,
  ...rest
}) => {
  const s = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimPressable
      onPressIn={() => (s.value = withSpring(scaleTo, spring))}
      onPressOut={() => (s.value = withSpring(1, spring))}
      style={animStyle}
      {...rest}
    >
      {children}
    </AnimPressable>
  );
};
```

**Variants:** override `scaleTo` per use — `0.96` for buttons, `0.97` for chips/tiles, `0.98` for cards.

---

## 2. `<PrimaryCTA>` — gradient button

Used: Login "Sign In", Sign Up "Create Account", Report "Submit Report", every primary action.

```tsx
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { gradients, radius, layout, shadows, typography } from "../theme/tokens";

export function PrimaryCTA({ label, icon, onPress, variant = "brand" }: {
  label: string; icon?: React.ReactNode; onPress: () => void;
  variant?: "brand" | "admin" | "danger" | "success";
}) {
  const gradient = gradients[variant] ?? gradients.brand;
  return (
    <TapButton onPress={onPress} style={[shadows.cta, { borderRadius: radius["3xl"] }]}>
      <LinearGradient
        colors={gradient.colors} start={gradient.start} end={gradient.end}
        style={{
          height: layout.ctaHeight,
          borderRadius: radius["3xl"],
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          gap: 8, paddingHorizontal: 20,
        }}
      >
        <Text style={{
          color: "white",
          fontFamily: typography.family,
          fontWeight: typography.weights.bold as any,
          fontSize: typography.size["2xl"],
          letterSpacing: typography.tracking.normal,
        }}>{label}</Text>
        {icon ?? <ChevronRight size={19} color="white" />}
      </LinearGradient>
    </TapButton>
  );
}
```

**Variants:** `brand` (default), `admin` (purple gradient), `danger` (solid red), `success` (solid green).

---

## 3. `<SecondaryButton>` — neutral filled

Used in bottom-sheet quick actions, "Track Status", "Add Comment", etc.

```tsx
<TapButton onPress={onPress}>
  <View style={{
    height: 44, paddingHorizontal: 16, borderRadius: radius["2xl"],
    backgroundColor: colors.tintGray,                  // or specific tint
    alignItems: "center", justifyContent: "center",
  }}>
    <Text style={{ color: colors.textPrimary, fontFamily: typography.family,
                   fontWeight: typography.weights.semibold as any, fontSize: typography.size.md }}>
      {label}
    </Text>
  </View>
</TapButton>
```

**Variants by tint color:**
- Default → `tintGray`
- Assign → `warning`
- AI Review → `admin`
- Resolved → `success`

---

## 4. `<IconButton>` — round 36 px

Used in every header for back / menu / search / close.

```tsx
export function IconButton({ icon, onPress, variant = "glass" }: {
  icon: React.ReactNode; onPress: () => void;
  variant?: "glass" | "light" | "danger";
}) {
  const bg = {
    glass: "rgba(255,255,255,0.20)",
    light: colors.tintGray,
    danger: colors.tintDanger,
  }[variant];
  return (
    <TapButton onPress={onPress} scaleTo={0.92}>
      <View style={{
        width: layout.iconButtonSize, height: layout.iconButtonSize,
        borderRadius: radius.pill,
        backgroundColor: bg,
        alignItems: "center", justifyContent: "center",
      }}>{icon}</View>
    </TapButton>
  );
}
```

---

## 5. `<Input>` — labeled, icon-leading text field

Used in Login, Sign Up, Report Issue.

```tsx
export function Input({
  label, icon, value, onChangeText, placeholder, secure, rightAccessory,
}: {
  label?: string; icon?: React.ReactNode; value: string;
  onChangeText: (v: string) => void; placeholder?: string; secure?: boolean;
  rightAccessory?: React.ReactNode;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text style={{
          fontFamily: typography.family, fontWeight: typography.weights.bold as any,
          fontSize: typography.size.sm, color: colors.textSecondary,
          letterSpacing: typography.tracking.wide, textTransform: "uppercase", marginBottom: 8,
        }}>{label}</Text>
      )}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 16, height: layout.inputHeight, borderRadius: radius["2xl"],
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1.5,
        borderColor: focused ? colors.primary : colors.borderLight,
      }}>
        {icon}
        <TextInput
          style={{ flex: 1, fontFamily: typography.family, fontSize: typography.size.lg, color: colors.textPrimary }}
          placeholder={placeholder} placeholderTextColor={colors.textPlaceholder}
          value={value} onChangeText={onChangeText} secureTextEntry={secure}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        {rightAccessory}
      </View>
    </View>
  );
}
```

---

## 6. `<RoleToggle>` — segmented control

Used in Login (Citizen/Admin) and Profile (Demo role switch).

```tsx
export function RoleToggle({ value, onChange }: { value: "user" | "admin"; onChange: (v: "user" | "admin") => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, padding: 4, backgroundColor: colors.surface, borderRadius: 18 }}>
      {(["user", "admin"] as const).map(r => {
        const active = value === r;
        const activeColor = r === "admin" ? colors.admin : colors.primary;
        return (
          <TapButton key={r} onPress={() => onChange(r)} style={{ flex: 1 }}>
            <View style={[{
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
              paddingVertical: 11, borderRadius: 14,
              backgroundColor: active ? "white" : "transparent",
            }, active && shadows.chip]}>
              {r === "user" ? <User size={15} color={active ? activeColor : colors.textMuted} />
                            : <Shield size={15} color={active ? activeColor : colors.textMuted} />}
              <Text style={{
                fontFamily: typography.family, fontWeight: typography.weights.semibold as any,
                fontSize: typography.size.md,
                color: active ? activeColor : colors.textMuted,
              }}>{r === "user" ? "Citizen User" : "Admin"}</Text>
            </View>
          </TapButton>
        );
      })}
    </View>
  );
}
```

---

## 7. `<StatusBadge>` / `<PriorityBadge>` / `<CategoryBadge>` — pills

```tsx
export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <View style={{
      paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill,
      backgroundColor: statusColors[status],
    }}>
      <Text style={{ color: "white", fontFamily: typography.family,
                     fontWeight: typography.weights.semibold as any, fontSize: typography.size.base }}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
// PriorityBadge: same shape, `priorityColors[priority]` bg, `PRIORITY_LABELS[priority]` text.
// CategoryBadge: bg `colors.tintGray`, text `colors.textSecondary`, emoji + label.
```

---

## 8. `<IssueCard>` — list item

Two variants — **compact** (My Reports, All Issues, 80–96 px photo on the left, content on the right) and **detection** (AI Review, square image left + content + action row at bottom).

```tsx
export function IssueCard({ issue, onPress, index = 0, photoSize = 96 }: {
  issue: Issue; onPress: () => void; index?: number; photoSize?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <TapButton onPress={onPress} scaleTo={0.98}>
        <View style={[{
          backgroundColor: "white", borderRadius: radius["2xl"], overflow: "hidden",
        }, shadows.card]}>
          <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: issue.photo }}
                   style={{ width: photoSize, height: photoSize }}
                   contentFit="cover" />
            <View style={{ flex: 1, padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={metaStyle}>{issue.id}</Text>
                <StatusBadge status={issue.status} />
              </View>
              <Text style={titleStyle}>{issue.title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MapPin size={11} color={colors.textMuted} />
                <Text style={metaStyle}>{issue.location}</Text>
              </View>
              {/* …category + reportedAt */}
            </View>
          </View>
        </View>
      </TapButton>
    </Animated.View>
  );
}
```

---

## 9. `<BottomSheet>` — slide-up modal with drag-to-dismiss

Use `@gorhom/bottom-sheet`. The library handles spring, gesture, and snap points natively.

```tsx
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const sheetRef = useRef<BottomSheet>(null);
const snapPoints = useMemo(() => ["72%"], []);

<BottomSheet
  ref={sheetRef}
  snapPoints={snapPoints}
  enablePanDownToClose
  backdropComponent={(p) =>
    <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.35} />}
  handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40, height: 4 }}
  backgroundStyle={{
    backgroundColor: "white",
    borderTopLeftRadius: radius.sheetTop, borderTopRightRadius: radius.sheetTop,
    ...shadows.sheet,
  }}
>
  <IssueSheetContent issue={selectedIssue} role={role} />
</BottomSheet>
```

Open with `sheetRef.current?.expand()`, close with `sheetRef.current?.close()`.

---

## 10. `<DrawerHeader>` + `<NavTile>` — Hamburger pieces

```tsx
function NavTile({ icon, label, color, tint, active, onPress }: {
  icon: React.ReactNode; label: string; color: string; tint: string;
  active: boolean; onPress: () => void;
}) {
  return (
    <TapButton onPress={onPress} scaleTo={0.97}>
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 11,
        padding: 8, borderRadius: 13, marginBottom: 1,
        backgroundColor: active ? `${color}16` : "transparent",
      }}>
        <View style={[{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: active ? color : tint,
          alignItems: "center", justifyContent: "center",
        }, active && { shadowColor: color, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }]}>
          {React.cloneElement(icon as any, { color: active ? "white" : color })}
        </View>
        <Text style={{
          flex: 1, fontFamily: typography.family,
          fontWeight: active ? typography.weights.bold as any : typography.weights.medium as any,
          fontSize: typography.size.md, color: active ? color : "#1E2A3B",
        }}>{label}</Text>
        {active
          ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color,
                           shadowColor: color, shadowOpacity: 1, shadowRadius: 5 }} />
          : <ChevronRight size={13} color={colors.textDisabled} />}
      </View>
    </TapButton>
  );
}
```

Wrap the drawer with React Navigation's custom `drawerContent={(props) => <HamburgerMenu {...props} />}`. The drawer width should be `290` and `drawerStyle: { backgroundColor: 'transparent' }` — let your component paint the white background and the right-edge radius `32`.

---

## 11. `<ScreenHeader>` — dark gradient page top

Used on every internal screen.

```tsx
export function ScreenHeader({
  title, onBack, onMenu, right, subtitle, variant = "header", children,
}: {
  title: string; onBack?: () => void; onMenu?: () => void;
  right?: React.ReactNode; subtitle?: string;
  variant?: "header" | "admin"; children?: React.ReactNode;
}) {
  const g = gradients[variant];
  return (
    <LinearGradient colors={g.colors} start={g.start} end={g.end}
      style={{
        paddingTop: 48, paddingHorizontal: layout.screenPaddingX, paddingBottom: 20,
      }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: subtitle ? 16 : 0 }}>
        {onBack && <IconButton icon={<ArrowLeft size={18} color="white" />} onPress={onBack} />}
        <Text style={{
          marginLeft: 12, color: "white", fontFamily: typography.family,
          fontWeight: typography.weights.bold as any, fontSize: typography.size["4xl"],
        }}>{title}</Text>
        <View style={{ flex: 1 }} />
        {right}
        {onMenu && <IconButton icon={<Menu size={18} color="white" />} onPress={onMenu} />}
      </View>
      {children}
    </LinearGradient>
  );
}
```

---

## 12. `<Timeline>` — vertical history

Used in Report Details and Admin Issue Details.

```tsx
export function Timeline({ items }: { items: { time: string; action: string; by: string }[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 12 }}>
          {/* Dot + connector */}
          <View style={{ alignItems: "center" }}>
            <View style={{
              width: 12, height: 12, borderRadius: 6,
              backgroundColor: i === items.length - 1 ? colors.primary : colors.borderMid,
            }} />
            {i < items.length - 1 && (
              <View style={{ width: 2, flex: 1, backgroundColor: colors.borderMid }} />
            )}
          </View>
          {/* Content */}
          <View style={{ flex: 1, paddingBottom: 16 }}>
            <Text style={metaStyle}>{it.time}</Text>
            <Text style={titleSmStyle}>{it.action}</Text>
            <Text style={metaStyle}>by {it.by}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
```

---

## 13. `<ChatBubble>` + `<TypingDots>`

```tsx
function ChatBubble({ msg }: { msg: { from: "user" | "ai"; text: string; time: string } }) {
  const isUser = msg.from === "user";
  return (
    <Animated.View entering={FadeInUp.duration(220)}
      style={{ flexDirection: "row", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <View style={{
        maxWidth: "78%", paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: radius["2xl"],
        backgroundColor: isUser ? colors.primary : "white",
        borderTopRightRadius: isUser ? 4 : radius["2xl"],
        borderTopLeftRadius: isUser ? radius["2xl"] : 4,
        ...shadows.card,
      }}>
        <Text style={{ color: isUser ? "white" : colors.textPrimary,
                       fontFamily: typography.family, fontSize: typography.size.lg, lineHeight: 20 }}>
          {msg.text}
        </Text>
      </View>
    </Animated.View>
  );
}
```

`TypingDots`: three small circles, each with a looping `Animated.sequence` translating Y by ±3 px with 120 ms stagger.

---

## File layout suggestion

```
src/
  theme/
    tokens.ts
    typography.ts        // re-export Inter font with weight aliases
  components/
    TapButton.tsx
    PrimaryCTA.tsx
    SecondaryButton.tsx
    IconButton.tsx
    Input.tsx
    RoleToggle.tsx
    badges/ (Status, Priority, Category).tsx
    IssueCard.tsx
    BottomSheet/IssueSheetContent.tsx
    drawer/NavTile.tsx
    ScreenHeader.tsx
    Timeline.tsx
    chat/ChatBubble.tsx
    chat/TypingDots.tsx
  screens/
    auth/LoginScreen.tsx
    auth/SignUpScreen.tsx
    map/MapScreen.tsx           // both roles, role from context
    user/MyReportsScreen.tsx
    user/UserReportDetails.tsx
    user/ReportIssueScreen.tsx
    admin/AdminIssueDetails.tsx
    admin/AdminAIReview.tsx
    admin/AdminAllIssues.tsx
    admin/AdminOperations.tsx
    admin/AdminAnalytics.tsx
    shared/AIChatScreen.tsx
    shared/ProfileScreen.tsx
  navigation/
    HamburgerMenu.tsx          // custom drawer content
    types.ts
  data/
    mockData.ts                // straight port of the web file
    issues.ts                  // hooks: useIssues(), useDetections() etc.
  utils/
    location.ts                // Nominatim wrapper, geocode helpers
```
