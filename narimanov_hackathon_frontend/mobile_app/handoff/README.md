# City Grind — Developer Handoff (v47)

Complete React Native / Expo handoff package. Start here.

## Reading order

1. **`HANDOFF.md`** — overview, navigation map, all 16 screens spec'd
2. **`DESIGN_TOKENS.md`** + **`tokens.ts`** — colors, typography, spacing, radius, shadows, motion (drop `tokens.ts` straight into `src/theme/`)
3. **`COMPONENTS.md`** — 13 reusable RN components with copy-paste code
4. **`INTERACTIONS.md`** — every user flow as state transitions
5. **`ANIMATIONS.md`** — motion values mapped to Reanimated 3
6. **`RN_PORTING_GUIDE.md`** — element-by-element web → RN conversion, libraries, gotchas, port order
7. **`ASSETS.md`** — image / icon inventory + cleanup list
8. **`screenshots/`** — you fill this folder manually (see checklist in HANDOFF.md)

## Quick start for the Expo repo

```bash
npx create-expo-app narimanov-ops -t blank-typescript
cd narimanov-ops
# install deps — see RN_PORTING_GUIDE.md §6 for the full list
```

Then:
1. Copy `handoff/tokens.ts` → `src/theme/tokens.ts`
2. Copy `src/app/components/mockData.ts` → `src/data/mockData.ts`
3. Copy `src/imports/heyder_aliyev-2.jpg` → `assets/images/hero-heydar-aliyev.jpg`
4. Build components from `COMPONENTS.md` (theme + base components first)
5. Build screens from `HANDOFF.md` in the order listed in `RN_PORTING_GUIDE.md §10`

## Frame & target

- Designed for **390 × 844** (iPhone 14 Pro)
- Supports both portrait orientations on iOS and Android
- Light theme only (v1)
- Two roles: Citizen and Admin
