# Dashboard Improvements Report

**Page:** `/portal/dashboard` (Customer Dashboard)
**Date:** 2026-03-04

---

## 1. BUGS / ISSUES

### 1.1 "IN_PROGRESS" status displayed with underscore
- **Severity:** High (user-facing)
- **Location:** `ProjectCards.tsx:148` — `{project.status}` is rendered raw
- **Problem:** The status badge shows `IN_PROGRESS` instead of "In Progress". All statuses are displayed as raw enum values (DELIVERED, APPROVED, PENDING, IN_PROGRESS) in all-caps with underscores.
- **Fix:** Add a display formatter that converts status keys to human-readable labels (e.g. `in_progress` → "In Progress", `delivered` → "Delivered").

### 1.2 Missing status style for `in_progress`
- **Severity:** Medium
- **Location:** `ProjectCards.tsx:18-49` — `PROJECT_STATUS_MAP` has no `in_progress` key
- **Problem:** The status map defines styles for `approved`, `processing`, `qa`, `pending`, `delivered`, and `archived` — but not `in_progress`. This causes the "In Progress" card to fall back to the generic grey style instead of getting a distinct color (e.g. blue or amber).
- **Fix:** Add an `in_progress` entry to `PROJECT_STATUS_MAP` with an appropriate color (suggest amber/orange to convey active work).

### 1.3 Notification badge says "9+" but aria-label says "12 unread"
- **Severity:** Low (a11y inconsistency)
- **Location:** Accessible tree shows `"Notifications (12 unread)"` but the visible badge text is `"9+"`
- **Fix:** Sync the aria-label with the visual badge, or make the badge show "12" if there are 12 unread.

### 1.4 "Dessert Showcase 2026" card has 0 items and no thumbnails
- **Severity:** Low (data/UX)
- **Problem:** The PENDING card shows "0 items" with an empty hero area (just a small stacked layers icon). This looks broken or like a loading failure to users.
- **Fix:** Add an empty state illustration or a clear message like "No items captured yet" with a CTA to start capture.

---

## 2. MOBILE RESPONSIVENESS

### 2.1 Header navigation is truncated on mobile
- **Severity:** High
- **Problem:** At 375px width, the nav items are cut off. "Dashboard" is missing, only "Bill" (truncated "Billing") is partially visible. The "Get a Free Quote" button is replaced by just a camera icon with no label, which is unclear.
- **Fix:** On mobile, collapse the nav into a bottom tab bar or a hamburger menu. The current horizontal overflow approach doesn't work well.

### 2.2 "Edit Menu" button text wraps awkwardly on mobile
- **Severity:** Medium
- **Problem:** The "Edit Menu" button breaks into two lines ("Edit" / "Menu") on mobile viewports, looking unpolished.
- **Fix:** Either shorten the label to just an icon on small screens, or use `whitespace-nowrap` and reduce padding.

### 2.3 Action buttons (pencil, QR code) drop below on mobile
- **Severity:** Low
- **Problem:** The edit and QR icon buttons wrap to a second row on mobile, creating an uneven layout.
- **Fix:** Consolidate into a "more actions" overflow menu (three-dot button) on small screens.

---

## 3. UX IMPROVEMENTS

### 3.1 No welcome message or summary dashboard
- **Problem:** The dashboard opens directly to the project cards list with no greeting, summary stats, or orientation. A user logging in has no quick overview of their account status.
- **Suggestion:** Add a concise welcome strip at the top with:
  - Greeting with the restaurant/business name
  - Quick stats: total projects, total 3D assets, total views
  - Next action hint (e.g. "You have 1 pending project awaiting review")

### 3.2 Analytics section feels like a dead end
- **Problem:** The Analytics dropdown opens to reveal a locked/upgrade panel. This takes up significant screen space to tell the user they can't use it. The crown icon and "Premium" badge are unclear about what plan they're on.
- **Suggestion:**
  - Show a compact teaser with 1-2 blurred sample charts instead of a large empty panel
  - Move the upgrade prompt to a smaller banner or the settings page
  - If this feature is never available on the free plan, consider removing it from the dashboard entirely to avoid frustration

### 3.3 Duplicate "Get a Free Quote" buttons
- **Problem:** There are two "Get a Free Quote" buttons visible — one in the header nav bar and one next to the "Menu" heading. This is redundant and clutters the interface.
- **Fix:** Remove the one next to "Menu" since the header CTA is persistent.

### 3.4 No filtering or sorting for project cards
- **Problem:** All 4 projects are shown in a flat list with no way to filter by status (Delivered, Pending, In Progress) or sort by date/views.
- **Suggestion:** Add filter chips above the grid (All / Delivered / In Progress / Pending) and a sort dropdown (Newest / Most Views).

### 3.5 No search functionality
- **Problem:** If a customer has many menus/projects, there's no way to search.
- **Suggestion:** Add a search input above the project grid for customers with 5+ projects.

### 3.6 Card actions lack clear hierarchy
- **Problem:** Each card has 4 action buttons (Open, Edit Menu, pencil icon, QR icon) but it's unclear what the difference is between "Edit Menu" and the pencil icon. Users may not understand the distinction.
- **Suggestion:**
  - Make "Open" the primary action (view the 3D menu)
  - Combine "Edit Menu" and the pencil into one "Edit" action
  - Move QR code to a dropdown/overflow menu

### 3.7 Time format is confusing
- **Problem:** Timestamps show "5D AGO", "3D AGO", "1D AGO" which reads like dimensions (3D/5D) rather than time on a 3D-focused platform. This is especially confusing given the product is literally about "3D."
- **Fix:** Use "5 days ago", "3 days ago" or "5d ago" (lowercase) to avoid visual confusion.

---

## 4. VISUAL / DESIGN IMPROVEMENTS

### 4.1 Card hero images are too dark and low contrast
- **Problem:** The food thumbnail images in the hero section are displayed at 60% opacity (`opacity-60`), making them appear washed out and low quality against the dark background. This undermines the visual appeal of a product that's selling high-quality 3D captures.
- **Fix:** Increase opacity to 80-90% and use a subtle bottom gradient overlay for text readability instead.

### 4.2 Status badge dot animation is distracting
- **Problem:** Every status badge dot has `animate-pulse`, even for completed statuses like "Delivered". A pulsing dot on a delivered project implies ongoing activity.
- **Fix:** Only animate the dot for active statuses (In Progress, Processing). Remove animation from Delivered, Approved, Pending.

### 4.3 Cards are very tall — too much vertical space per card
- **Problem:** Each card takes ~400-500px of vertical height. With 4 cards in a 2-column grid, users must scroll significantly. The large hero area (h-48 / h-56) combined with generous padding (p-6 / p-8) makes each card feel bloated.
- **Fix:** Consider a more compact card design:
  - Reduce hero height to h-32 / h-40
  - Tighten body padding to p-4 / p-6
  - Or offer a list/compact view toggle

### 4.4 No visual distinction between project types
- **Problem:** All cards look identical in structure regardless of their status or content. A "Delivered" project with 12,390 views should feel more prominent than a "Pending" one with 0 items.
- **Suggestion:** Use subtle left-border colors matching the status, or highlight the most-viewed project as a "featured" card.

### 4.5 Page title "Dashboard" is sr-only
- **Problem:** There's no visible page title. Users arriving at this page have no visible heading confirming where they are (only the nav highlight).
- **Fix:** Show a visible "Dashboard" or "Your Menus" heading, or at minimum a breadcrumb.

---

## 5. ACCESSIBILITY

### 5.1 Cards are not keyboard-interactive as a whole
- **Problem:** The entire card appears clickable (hover effects, translate-y) but isn't actually a link or button. Users must tab to individual action buttons within.
- **Fix:** Either make the card itself a link (to the project view) or remove the hover effects that suggest the whole card is clickable.

### 5.2 Icon-only buttons lack visible labels
- **Problem:** The pencil and QR code icon buttons have `title` attributes but no visible text. Some users may not understand what they do.
- **Fix:** Add visible labels on larger viewports, or use tooltips that appear on hover/focus.

### 5.3 Color contrast on status badges
- **Problem:** Some status badge colors (especially "Pending" with grey-on-grey in dark mode) may not meet WCAG AA contrast requirements.
- **Fix:** Audit badge contrast ratios and ensure 4.5:1 minimum for text.

---

## 6. PERFORMANCE

### 6.1 All images load eagerly
- **Problem:** While `loading="lazy"` is set on thumbnails, all 4 cards are above-the-fold on desktop, so lazy loading won't help. However, if the list grows, consider virtualization.

### 6.2 Framer Motion page transitions on every route
- **Problem:** `AnimatePresence` with `pageVariants` runs on every route change within the portal. This adds slight latency to navigation.
- **Suggestion:** Consider removing or simplifying the animation for returning users who navigate quickly between Dashboard/Billing/Settings.

---

## Priority Summary

| Priority | Item | Impact |
|----------|------|--------|
| P0 | Fix "IN_PROGRESS" underscore display | User-facing bug |
| P0 | Fix mobile header nav truncation | Broken on mobile |
| P1 | Add `in_progress` to status map | Missing styling |
| P1 | Fix time format confusion (3D vs 3 days) | Confusing on a 3D platform |
| P1 | Reduce duplicate "Get a Free Quote" CTA | Clutter |
| P2 | Add welcome strip / summary stats | UX polish |
| P2 | Improve card image opacity | Visual quality |
| P2 | Stop pulse animation on delivered status | Visual noise |
| P2 | Clarify card action button hierarchy | UX clarity |
| P3 | Add filtering/sorting | Feature request |
| P3 | Improve empty state for 0-item projects | UX polish |
| P3 | Accessibility audit on contrast/keyboard | Compliance |
