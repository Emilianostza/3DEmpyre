# Menu Page Improvements — `/project/:id/menu`

**Audited on:** 2026-03-04
**Page:** Bistro 55 public menu (`/project/PRJ-001/menu`)
**Component:** `src/pages/templates/RestaurantMenu.tsx` (~252KB single file)

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| P0 | Bug / broken UX — fix immediately |
| P1 | High impact — significantly hurts UX or conversions |
| P2 | Medium impact — noticeable polish issue |
| P3 | Nice-to-have — refinement |

---

## Bugs & Functional Issues

### 1. All card images are SVG placeholders (P0)
Every menu item image is a `data:image/svg+xml` placeholder — the olive/brown rectangles visible on each card. The 3D models load fine, but the static fallback images are never real photos. When a user hovers, the image fades out to reveal the 3D model, but first impression is a dull placeholder.
- **Fix:** Ensure real food photos are loaded as the `image` field, or generate attractive placeholder thumbnails from the 3D model.

### 2. Hidden 1×1 orphan `<model-viewer>` in the DOM (P2)
There's a 7th `<model-viewer>` element at 1×1px sitting outside any card — likely a preload element or leftover from the detail overlay. It's not visible but adds unnecessary DOM weight.
- **Fix:** Only mount when the detail panel is open, or remove if unused.

### 3. "Desserts" tab gets clipped on mobile (P1)
On 375px mobile, the third tab ("Desserts") gets cut off showing only "De" when scrolled to the Starters section. The tab bar scrolls horizontally but there's no visual indicator that more tabs exist.
- **Fix:** Add a subtle fade/gradient on the right edge of the tab bar to hint at horizontal scroll, or use `scrollIntoView` to auto-center the active tab.

---

## Typography & Readability

### 4. Critically small font sizes — 9px tags and labels (P1)
Multiple elements use `text-[9px]` which is below WCAG minimum readability:
- Tags (Raw, Chef's Pick, Vegetarian, etc.) — **9px**
- Calories label — **9px**
- Allergens label and pills — **9px**
- "Pairs well with" label — **9px**
- **Fix:** Bump all these to at least `text-[11px]` (ideally `text-xs` / 12px). Tags can go to `text-[10px]` minimum.

### 5. Hero metadata too small on mobile (P2)
"Contemporary European · Old Town", "Open now", and "Mon–Sun 12:00–23:00" are all 10px on mobile — difficult to read on a dark gradient background.
- **Fix:** Use `text-xs sm:text-sm` (12px base) for these critical restaurant details.

### 6. Calorie values use mono font at 10px (P2)
The `font-mono` calorie badge (`380 kcal`) is 10px — mono fonts are inherently harder to read at small sizes.
- **Fix:** Use `text-xs` (12px) or switch to `font-sans` for calorie values.

---

## Mobile UX

### 7. No scroll-to-top button (P2)
The page is very long on mobile (6 cards × ~550px each = ~4400px content). After scrolling through desserts, there's no way to quickly return to the top or hero section.
- **Fix:** Add a floating "scroll to top" button that appears after scrolling past the hero.

### 8. Category tabs lack scroll affordance (P1)
The horizontal tab bar has no visual cue that it scrolls. On phones with 3+ categories, users won't discover they can swipe to see more tabs.
- **Fix:** Add a right-edge gradient fade mask, or add left/right arrow indicators when tabs overflow.

### 9. Card 3D preview area is short on mobile (P2)
The 3D model viewer area on cards is 192px tall on mobile — the 3D models appear small and cramped. Compare with the full-screen detail panel where models look great.
- **Fix:** Increase mobile card 3D preview to `h-56` (224px) or `h-64` (256px) for better first impression.

### 10. Large gap between last card and "Powered by" footer (P3)
There's a big empty space (~150px) between the last menu card (Crème Brûlée) and the "Powered by 3D Empyre" text. Feels unfinished.
- **Fix:** Reduce bottom padding, or add a "Back to top" link / restaurant contact info in this space.

---

## Detail Panel (Item Overlay)

### 11. Detail panel is almost invisible on desktop screenshots (P1)
The full-screen detail panel uses `bg-zinc-950/95` — a 95% opacity near-black overlay on a near-black page. All content is white text on nearly black. While technically readable in a real browser, the contrast between the panel and the background page is almost zero, making it feel like nothing loaded.
- **Fix:** Use `bg-zinc-900/98` or add a subtle lighter card background (`bg-zinc-900`) for the content area to create visual separation.

### 12. Detail panel: no swipe gesture support on mobile (P2)
The left/right navigation arrows work, but on mobile there's no swipe-to-navigate between menu items. This is expected behavior on a food menu app.
- **Fix:** Add touch swipe detection to navigate between items (left = previous, right = next).

### 13. Detail panel: "Back" button is small (P2)
The "Back" button in the detail header is a small pill at top-left. On mobile, it's easy to miss — users might not know how to close the detail view.
- **Fix:** Make the button larger, or allow tapping the header area / swiping down to close.

---

## Visual & Design

### 14. Card borders are nearly invisible (`border-white/5`) (P2)
Card borders use 5% white opacity — practically invisible against the dark background. Cards blend into the page, losing visual structure.
- **Fix:** Increase to `border-white/10` or `border-white/15` for subtle but visible card boundaries.

### 15. Section heading font is very decorative (P3)
Section headings ("Starters", "Main Courses", "Desserts") use an extremely stylized italic serif font that may not match all restaurant brands. It's hardcoded in the component.
- **Fix:** This is tied to the `font-black` + likely custom font-face. Consider making heading style configurable per menu, or using a more neutral default.

### 16. "Powered by 3D Empyre" footer is too subtle (P3)
The attribution is `text-stone-600` (rgb 87,83,78) on a near-black background — extremely low contrast, almost hidden.
- **Fix:** If you want branding visibility, bump to `text-stone-500` and consider adding a small logo. If intentionally subtle, it's fine.

### 17. No visual distinction between categories in the scroll (P2)
When scrolling through all items, there's no divider or visual break between Starters → Main Courses → Desserts sections. The section headings help, but the cards look identical across categories.
- **Fix:** Add a subtle horizontal rule, color accent, or spacing increase between category sections.

---

## Accessibility

### 18. Allergen pills have low contrast (P1)
Allergen badges use `text-red-400` on `bg-red-500/10` — red on near-black with only 10% opacity background. Critical health information should have higher contrast.
- **Fix:** Increase allergen badge background to `bg-red-500/20` and text to `text-red-300` for better visibility.

### 19. "Pairs well with" pills also low contrast (P2)
Same issue — `text-amber-400` on `bg-amber-500/10`. The amber text is harder to read on dark backgrounds.
- **Fix:** Bump to `bg-amber-500/20`.

### 20. No keyboard focus indicators visible (P2)
Tab-navigating through the page shows no visible focus rings on cards or buttons. The `outline-none` utility is likely stripping default focus styles.
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-brand-500` to interactive elements.

---

## Performance

### 21. 7 `<model-viewer>` instances loaded simultaneously (P1)
All 6 menu item 3D models + 1 orphan are mounted in the DOM at page load. Each `<model-viewer>` downloads a `.glb` file and initializes WebGL. On mobile, this is heavy — can cause jank and high memory usage.
- **Fix:** Use intersection observer to lazy-mount `<model-viewer>` only when cards scroll into view, or defer loading until hover/tap.

### 22. Single file is ~252KB (P2)
`RestaurantMenu.tsx` contains the entire menu system — card, detail panel, overlay, customization, asset management, all in one file. This hurts maintainability and makes code splitting harder.
- **Fix:** Extract `MenuItemCard`, `ItemDetailsSheet`, `ModelViewerOverlay`, `AssetManagementModal`, and `CustomizationPanel` into separate files.

---

## Summary — Priority Table

| # | Issue | Priority | Effort |
|---|-------|----------|--------|
| 1 | Placeholder images on all cards | P0 | Low (data fix) |
| 3 | Desserts tab clipped on mobile | P1 | Low |
| 4 | 9px font sizes on tags/labels | P1 | Low |
| 8 | Tab bar no scroll affordance | P1 | Low |
| 11 | Detail panel invisible on dark bg | P1 | Low |
| 18 | Allergen pills low contrast | P1 | Low |
| 21 | All model-viewers loaded at once | P1 | Medium |
| 2 | Orphan 1×1 model-viewer | P2 | Low |
| 5 | Hero metadata too small | P2 | Low |
| 6 | Calorie mono font too small | P2 | Low |
| 7 | No scroll-to-top button | P2 | Low |
| 9 | Card 3D preview too short | P2 | Low |
| 12 | No swipe gestures in detail panel | P2 | Medium |
| 13 | Back button too small | P2 | Low |
| 14 | Card borders invisible | P2 | Low |
| 17 | No visual category separation | P2 | Low |
| 19 | Pairing pills low contrast | P2 | Low |
| 20 | No keyboard focus indicators | P2 | Low |
| 22 | Giant single-file component | P2 | High |
| 10 | Gap before footer | P3 | Low |
| 15 | Decorative section headings | P3 | Low |
| 16 | Powered-by footer too subtle | P3 | Low |
