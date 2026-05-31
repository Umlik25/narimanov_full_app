# Interactions — Step-by-step Flows

Every interactive flow as a state-transition spec. Use this to write the navigation actions and reducers.

**Notation**
- `[Screen]` — destination
- `state.x = …` — local React/Zustand state update
- `nav.push|replace|pop` — React Navigation action

---

## 1. Login as User

1. App opens on `[Login]` (no auth in storage).
2. User taps **Citizen** in RoleToggle → `state.role = 'user'` (already default).
3. User types email + password.
4. Tap **Sign In** → `whileTap scale 0.96`.
5. (Backend call — for now mock instantly resolves.)
6. `state.role = 'user'`, save to auth context / `AsyncStorage`.
7. `nav.replace('Map')` — drawer opens on User Map.

**Error states (RN should support):** empty fields → red border on the offending input (`colors.danger`) + helper text below.

---

## 2. Login as Admin

Same as flow 1 but user taps **Admin** in RoleToggle. Selected color flips to `colors.admin`. Lands on Admin Map variant.

---

## 3. Open hamburger menu

From any screen with a `Menu` icon in the header:

1. Tap **Menu** → `nav.dispatch(DrawerActions.openDrawer())`.
2. Backdrop fades from `0 → 1` over 220 ms.
3. Drawer translates from `x: -310 → 0` over 300 ms with `Easing.bezier(0.25, 0.46, 0.45, 0.94)`.
4. Tap any nav tile → tile press shrinks to 0.97 → `nav.navigate(targetScreen)` → drawer closes (built-in).
5. Tap **Logout** → confirm modal → on confirm: clear auth → `nav.replace('Login')`.
6. Tap backdrop OR swipe drawer left edge → close drawer.

---

## 4. Open AI Assistant

1. From Map: tap the **Bot** FAB (bottom-right, gradient.admin).
2. `nav.push('AIChat', { role })`.
3. Screen enters with default stack transition (slide + fade — see ANIMATIONS).
4. First message (assistant) animates in immediately if context is fresh: "Hi! How can I help you with City Grind today?"
5. Suggestion chips appear below.

---

## 5. Tap map marker

1. User taps any pin on the `MapView`.
2. `onMarkerPress(issue)` → `state.selectedIssue = issue`.
3. `sheetRef.current?.expand()` — bottom sheet animates to its `72%` snap point.
4. Backdrop appears (`opacity 0.35`).
5. Marker visually highlights (slight scale + glow) — purely visual; data not changed.

---

## 6. Open issue bottom sheet (then dismiss)

**Open:** see flow 5.

**Dismiss options:**
- Tap **X** → `sheetRef.current?.close()`.
- Tap the backdrop → same.
- Swipe down beyond the 100 px threshold OR velocity > 500 px/s → `enablePanDownToClose` triggers close automatically.

On close: `state.selectedIssue = null`.

---

## 7. Submit a report

From `[Report Issue]`:

1. Pick a category tile → tile gains primary border + tint, others dim.
2. Tap "Add photo" → `expo-image-picker` modal → camera or library.
3. Returned URI → `state.photoUri = uri`; preview shown with X to remove.
4. Type title (required) + description (required).
5. Toggle "Use my location" → `expo-location` fetches → reverse geocode via Nominatim → set `state.location`. Toggle off → manual entry textbox.
6. Pick priority (radio).
7. Tap **Submit Report** → button shows spinner → mock 600 ms wait.
8. Success toast (or in-screen success card with checkmark) → `nav.replace('MyReports')`.

**Validation:** missing required fields → shake the offending field + inline error.

---

## 8. Open report details

From My Reports list:

1. Tap a card → `whileTap scale 0.98`.
2. `nav.push('ReportDetails', { issueId: issue.id })`.
3. Screen transitions in. Hero image loads with a fade.
4. Timeline items stagger in (40 ms cascade per item).
5. Back chevron → `nav.pop()`.

---

## 9. Approve AI detection

From `[AdminAIReview]`:

1. Tap ✅ **Approve** on a card.
2. Show confirm modal: "Approve as new issue?" + Detection summary + **Cancel** / **Approve**.
3. On Approve:
   - Generate new `Issue` from detection.
   - Add to `issues` store, status `assigned` (or `new`).
   - Remove the detection card from the list (animate out — fade + slide right).
   - Toast: "✅ Approved — Issue ISS-NNN created".

---

## 10. Reject AI detection

1. Tap ❌ **Reject**.
2. Modal: textarea for optional reason + **Cancel** / **Reject**.
3. On Reject:
   - Mark detection `rejected: true` in store.
   - Animate the card out (fade + slide left).
   - Toast: "❌ Detection rejected".

---

## 11. Merge AI detection

1. Tap 🔀 **Merge**.
2. Modal: list of issues within 100 m radius of detection (sorted by distance).
3. Tap one → confirm: "Merge detection into ISS-NNN?"
4. On confirm:
   - Append a timeline entry to the target issue: `"AI detection AI-NNN merged"`.
   - Increase priority by one step if detection priority > current.
   - Remove detection.
   - Toast: "🔀 Merged into ISS-NNN".

---

## 12. Assign issue

From `[AdminIssueDetails]`:

1. Tap **Assign Department** → modal with list: Road Repair / Sanitation / Electricity / Public Works / Green Space / Infrastructure / Emergency.
2. Tap one → confirm.
3. Update issue: `assignedTo = department`, `status = 'assigned'`, append timeline entry.
4. Modal closes, status chip transitions to orange.

---

## 13. Change status

1. Tap **Change Status** → action sheet (use `@gorhom/bottom-sheet` with a small snap point).
2. Options visible by current status — e.g. assigned → in_progress / resolved / overdue / rejected.
3. Tap option → update + timeline entry.
4. Sheet closes, status chip in header animates color change (200 ms tween).

---

## 14. Open profile

From hamburger menu:

1. Tap **Profile** tile.
2. `nav.navigate('Profile')`. Drawer closes.
3. Screen enters with stack transition.
4. Avatar, name, role chip render. Account info card stagger-enters (40 ms cascade).

---

## 15. Logout

Two entry points: drawer "Logout" tile, or Profile "Logout" button.

1. Tap **Logout**.
2. Confirm dialog: "Sign out?" with **Cancel** / **Sign out** (danger).
3. On confirm:
   - Clear `AsyncStorage.auth`.
   - Reset Zustand stores to defaults.
   - `nav.reset({ routes: [{ name: 'Login' }] })`.

---

## 16. Switch role (demo only)

From Profile "DEMO MODE":

1. Tap the opposite role chip.
2. Update auth context `role`.
3. `nav.replace('Map')` so the drawer rebuilds with the new group set.
4. The map re-centers and re-loads pins for the new role (Admin gets AI-review pins, etc.).

---

## 17. Map search

1. Tap **Search** icon in header.
2. Search bar slides down (`translateY: -80 → 0`, 220 ms).
3. As user types, debounce 300 ms → `fetchNominatim(q)` + match local landmarks dictionary.
4. Results drop-list appears below search input (max 6).
5. Tap a result → map flies to `[lat, lng]` with `mapRef.animateToRegion`.
6. Close search → results clear, bar slides up.

---

## 18. AI chat — send message

1. Type → `state.input`.
2. Tap **Send** (or keyboard return on iOS):
   - Append `{ from: 'user', text }` to messages.
   - Clear input.
   - `state.isTyping = true`.
   - Mock 1.2 s delay → push assistant message.
   - `state.isTyping = false`.
3. List auto-scrolls to bottom (`FlatList.scrollToEnd({ animated: true })`).
4. Typing indicator (`TypingDots`) shown above latest user bubble while `isTyping`.

---

## 19. Edge cases & gotchas

- **Back hardware button (Android)** — always `nav.pop()`. On root screens (Map, Login) → exit app (default).
- **Deep-link to a specific issue** — `narimanovops://issue/ISS-001`. Resolve to `ReportDetails` or `AdminIssueDetails` depending on role.
- **Offline** — show a thin yellow banner at top: "Offline — actions will sync when reconnected." Disable Submit Report.
- **Token expiry** — interceptor for Supabase → if 401, drop to Login.
