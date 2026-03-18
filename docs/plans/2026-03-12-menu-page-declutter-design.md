# Menu Page Declutter Design

**Date:** 2026-03-12
**Goal:** Make the public restaurant menu page more useful by reducing visual clutter and improving scannability.

## Problems

1. Cards show too much metadata (calories, allergens, pairs-well, action buttons) making them hard to scan
2. Hero section pushes menu content below the fold with large 3D/AR CTAs
3. Image placeholders (blurry colored blobs with text) look broken
4. "Pairs well with" duplicated as both text badges and image thumbnails
5. 3D/AR and Share buttons on every card add noise

## Design Decisions

### Card Content — Progressive Disclosure

**Keep on card:** name, price, description (2-line clamp), up to 2 tags
**Move to detail sheet only:** calories, spice level, allergens, pairs-well

The detail sheet (`ItemDetailsSheet`) already renders all this info, so nothing is lost. Users tap a card for the full picture.

### Hero — Compact

Remove the large "View signature dish in 3D" and "How AR works" buttons from the hero. These niche features push the actual menu far down the page. The 3D viewer remains accessible from the detail sheet.

### Image Placeholders — Clean Up

Replace blurry colored blobs with a cleaner placeholder: subtle gradient background with a small utensils/plate icon and dish name, using brand color at low opacity.

### Card Action Buttons — Remove from Cards

Remove "3D/AR" and "SHARE" buttons from card bottoms. The whole card is tappable to open the detail sheet where these actions live.

### No Layout Changes

Cards stay single-column with current responsive behavior. This keeps the change focused and avoids breaking the customization panel's layout presets.

## Files to Modify

1. `src/components/common/DishCardContent.tsx` — Hide calories, spice, allergens, pairs-well sections
2. `src/pages/templates/RestaurantMenu.tsx` — Remove hero CTAs, clean up card action buttons passed as children, improve image placeholder rendering
3. `src/components/common/DishCardShell.tsx` — Improve placeholder image styling when no real image exists

## Out of Scope

- Grid layout changes (2-column)
- Full visual redesign (typography, colors)
- Edit mode UX improvements
- Component extraction/refactoring
