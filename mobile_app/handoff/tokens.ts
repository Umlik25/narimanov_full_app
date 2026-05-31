/**
 * City Grind — Design Tokens
 * Drop this file into your React Native / Expo project as `src/theme/tokens.ts`.
 * All values are extracted 1:1 from the working web prototype (v47).
 *
 * Usage in RN:
 *   import { colors, spacing, radius, typography, shadows } from "./theme/tokens";
 *   <View style={{ backgroundColor: colors.surface, padding: spacing.lg }}>
 */

// ─────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────
export const colors = {
  // Brand
  primary: "#0B5CFF",            // brand blue — buttons, links, active map pin
  primaryDark: "#1a3a8f",        // gradient end
  primaryDeep: "#08122D",        // header/nav-bar background, primary text
  primaryNight: "#0B1120",       // login screen background (behind hero)

  // Accents (also used as status / priority colors)
  admin: "#7C3AED",              // admin role, AI features
  adminDark: "#5B21B6",
  warning: "#F97316",            // assigned / in-progress / medium priority
  success: "#16A34A",            // resolved / low priority good state
  danger: "#E53935",             // overdue / logout / errors
  dangerAlt: "#EF4444",          // high priority
  dangerDeep: "#DC2626",         // critical priority

  // Neutrals
  surface: "#F5F7FB",            // app background (light)
  surfaceAlt: "#F9FAFB",         // input background
  white: "#FFFFFF",
  divider: "#EFF2F7",
  borderLight: "#F0F0F0",
  borderMid: "#E5E7EB",
  textPrimary: "#08122D",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textPlaceholder: "#C0C0C0",
  textDisabled: "#D0D8E4",
  textFaint: "#C4CDDC",

  // Soft tinted backgrounds (used for icon containers, inactive chips)
  tintBlue: "#EEF3FF",
  tintPurple: "#F3EEFF",
  tintOrange: "#FFF4ED",
  tintGreen: "#EDFAF3",
  tintGray: "#F3F4F6",
  tintAdmin: "#EDE9FE",
  tintDanger: "#FEE2E2",

  // Overlays
  scrim: "rgba(8,18,45,0.6)",       // hamburger backdrop
  scrimLight: "rgba(8,18,45,0.35)", // bottom-sheet backdrop
  glassWhite: "rgba(255,255,255,0.12)",
  glassWhiteStrong: "rgba(255,255,255,0.20)",
} as const;

// ─────────────────────────────────────────────────────────────
// STATUS / PRIORITY MAPS (mirror mockData.ts exactly)
// ─────────────────────────────────────────────────────────────
export const statusColors = {
  new: colors.primary,
  ai_review: colors.admin,
  assigned: colors.warning,
  in_progress: colors.warning,
  resolved: colors.success,
  overdue: colors.danger,
  rejected: "#9CA3AF",
} as const;

export const priorityColors = {
  low: "#9CA3AF",
  medium: colors.warning,
  high: colors.dangerAlt,
  critical: colors.dangerDeep,
} as const;

// ─────────────────────────────────────────────────────────────
// GRADIENTS (use with expo-linear-gradient)
// ─────────────────────────────────────────────────────────────
export const gradients = {
  brand:     { colors: ["#0B5CFF", "#1a3a8f"],          start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  header:    { colors: ["#08122D", "#0B5CFF"],          start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  drawerTop: { colors: ["#08122D", "#0B2A8A", "#1248E8"], start: { x: 0, y: 0 }, end: { x: 0.5, y: 1 } },
  admin:     { colors: ["#7C3AED", "#5B21B6"],          start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  citizen:   { colors: ["#0B5CFF", "#1a3a8f"],          start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────
// Family: Inter (use `expo-google-fonts/inter` — load all weights below)
export const typography = {
  family: "Inter",
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  // Type scale — every size is referenced somewhere in the app
  size: {
    xxs: 9,    // version label
    xs: 10,    // captions, role chip
    sm: 11,    // section labels (uppercase)
    base: 12,  // small body, secondary
    md: 13,    // body, nav labels
    lg: 14,    // input text, buttons in lists
    xl: 15,    // section headings
    "2xl": 16, // primary CTA button label, screen title small
    "3xl": 17, // sheet titles
    "4xl": 18, // screen titles
    "5xl": 22, // brand title
    "6xl": 26, // welcome headings
  },
  // Letter spacing — for tightened display text
  tracking: {
    tight: -0.6,
    snug: -0.5,
    normal: -0.2,
    wide: 0.5,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SPACING (4-pt grid where possible)
// ─────────────────────────────────────────────────────────────
export const spacing = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 12,
  xl: 14,
  "2xl": 16,
  "3xl": 18,
  "4xl": 20,
  "5xl": 24,
  "6xl": 26,
  "7xl": 28,
  "8xl": 32,
  "9xl": 40,
  "10xl": 48,
} as const;

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 14,
  "2xl": 16,
  "3xl": 18,
  "4xl": 20,
  card: 22,
  sheet: 24,
  sheetTop: 28,
  hero: 36,
  drawer: 32,
  pill: 999,
} as const;

// ─────────────────────────────────────────────────────────────
// SHADOWS / ELEVATION
// RN-ready: every entry maps directly to View style props.
// On Android, also set `elevation`.
// ─────────────────────────────────────────────────────────────
export const shadows = {
  none: {},

  // Subtle card shadow (list cards)
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  // Floating button / chip
  chip: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Primary CTA
  cta: {
    shadowColor: "#0B5CFF",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  // Bottom sheet (negative Y — RN respects it)
  sheet: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },

  // Drawer (right edge)
  drawer: {
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 60,
    shadowOffset: { width: 12, height: 0 },
    elevation: 20,
  },

  // Map pin / active icon
  pin: {
    shadowColor: "#0B5CFF",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// MOTION / ANIMATION TOKENS
// Use with Reanimated 3.  See ANIMATIONS.md for full mapping.
// ─────────────────────────────────────────────────────────────
export const motion = {
  // Easing for timing-based animations
  easing: {
    standard: [0.22, 1, 0.36, 1] as const,   // expo-out — screen transitions
    smooth:   [0.25, 0.46, 0.45, 0.94] as const, // cubic-bezier — drawer
  },
  duration: {
    fast: 180,
    base: 220,
    screen: 280,
    drawer: 300,
  },
  // Spring presets
  spring: {
    sheet:  { stiffness: 360, damping: 34, mass: 0.9 },
    button: { stiffness: 500, damping: 24, mass: 0.6 },
  },
  // Whichever component is tapped uses these scale targets
  press: {
    tile:   { scale: 0.97 },
    card:   { scale: 0.98 },
    button: { scale: 0.96 },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS (mobile)
// ─────────────────────────────────────────────────────────────
export const layout = {
  screenPaddingX: 20,             // matches `px-5` in the prototype
  headerPaddingTop: 48,           // safe-area-ish top inset
  iconButtonSize: 36,             // round header buttons
  navIconBoxSize: 36,             // drawer tile icon container
  inputHeight: 54,
  ctaHeight: 56,
  drawerWidth: 290,
  heroHeight: 310,                // login/signup top image
} as const;

export type Tokens = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: typeof motion;
  gradients: typeof gradients;
  statusColors: typeof statusColors;
  priorityColors: typeof priorityColors;
  layout: typeof layout;
};

export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  motion,
  gradients,
  statusColors,
  priorityColors,
  layout,
} as Tokens;
