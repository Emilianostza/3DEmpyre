# Menu Page Declutter — Implementation Plan

**Design doc:** `2026-03-12-menu-page-declutter-design.md`

## Step 1: Declutter DishCardContent

**File:** `src/components/common/DishCardContent.tsx`

- Remove the calories section (lines 130-139)
- Remove the spice level section (lines 142-158)
- Remove the allergens section (lines 161-175)
- Remove the pairs-well section (lines 178-192)
- Keep: name+price header, description, tags (already capped at 3, reduce to 2)
- Remove unused props from interface: `calories`, `spiceLevel`, `allergens`, `pairsWell` and related `fieldVisibility` entries — BUT keep them in the interface for backward compat (just don't render them)

**Verify:** Cards should now show only name, price, description, and 2 tags.

## Step 2: Remove Hero CTAs

**File:** `src/pages/templates/RestaurantMenu.tsx`

- Find the MenuHero component definition (~line 692)
- Remove or hide the "View signature dish in 3D" button (large orange CTA)
- Remove or hide the "How AR works" button
- Keep the rest of the hero (title, hours, hero image)
- This will make the menu content visible much sooner on page load

**Verify:** Hero should be compact — just restaurant name, hours badge, and hero image.

## Step 3: Remove Card Action Buttons

**File:** `src/pages/templates/RestaurantMenu.tsx`

- Find where MenuItemCard renders children (the 3D/AR and Share buttons)
- These are passed as children to DishCardContent via DishCardShell
- Remove or comment out the action buttons (View 3D, Share) from the card rendering
- Keep the card fully tappable (onClick to open ItemDetailsSheet)

**Verify:** Cards should have no buttons at the bottom — clean content only.

## Step 4: Improve Image Placeholders

**File:** `src/components/common/DishCardShell.tsx`

- Find the placeholder rendering when no image/model exists
- Replace the blurry colored blob + text overlay with:
  - A subtle gradient using brand color at 10-15% opacity
  - A centered small utensils/plate SVG icon (use an inline SVG or emoji fallback)
  - Dish name in muted text below the icon
- Keep the aspect ratio and sizing the same

**Verify:** Cards without images should show a clean, intentional placeholder instead of a broken-looking blob.

## Step 5: Visual Verification

- Scroll through all categories (Starters, Main Courses, Desserts)
- Open a dish detail sheet — confirm calories, allergens, pairs-well still show there
- Check edit mode still works (toggle edit, verify cards still functional)
- Test search functionality
- Verify customization panel presets still apply correctly
