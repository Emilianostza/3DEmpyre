# Page Transitions & Animations Design

**Date:** 2026-02-22
**Status:** Approved
**Library:** Framer Motion

## Overview

Add premium page transitions and micro-interactions using Framer Motion. Pages use a direction-aware slide+scale pattern. Components get spring-based hover/tap feedback, staggered card reveals, and animated modals/toasts.

## Architecture

### New Files

| File                                         | Purpose                                                       |
| -------------------------------------------- | ------------------------------------------------------------- |
| `src/components/motion/PageTransition.tsx`   | Slide+Scale wrapper for route pages                           |
| `src/components/motion/AnimatedOutlet.tsx`   | AnimatePresence + Outlet wrapper for route transitions        |
| `src/components/motion/StaggerContainer.tsx` | Reusable stagger parent (cards, lists)                        |
| `src/components/motion/StaggerItem.tsx`      | Reusable stagger child with fade-up                           |
| `src/components/motion/presets.ts`           | Shared animation variants, springs, and accessibility helpers |

### Modified Files

| File                        | Change                                             |
| --------------------------- | -------------------------------------------------- |
| `App.tsx`                   | Replace Routes area with AnimatedOutlet            |
| `RestaurantMenu.tsx`        | MenuSection cards get StaggerItem wrapper          |
| `Toast.tsx`                 | Replace CSS animation with motion.div spring slide |
| `Layout.tsx`                | Navigation dropdown gets AnimatePresence           |
| Portal dashboard components | Number counters use motion animated values         |
| `vite.config.ts`            | Add vendor-motion chunk for code splitting         |

## Motion Presets

### Page Transitions (Slide + Scale)

```
Forward navigation:
  Enter:  x: 100% → 0, scale: 0.95 → 1, opacity: 0 → 1  (400ms spring)
  Exit:   x: 0 → -30%, scale: 1 → 0.95, opacity: 1 → 0  (400ms spring)

Back navigation:
  Enter:  x: -100% → 0, scale: 0.95 → 1, opacity: 0 → 1  (400ms spring)
  Exit:   x: 0 → 30%, scale: 1 → 0.95, opacity: 1 → 0  (400ms spring)
```

### Component Animations

| Animation    | Enter                              | Exit                 | Duration     |
| ------------ | ---------------------------------- | -------------------- | ------------ |
| Card stagger | Fade up (y: 20→0), 50ms delay/card | —                    | 300ms each   |
| Modal/sheet  | Slide up + spring overshoot        | Slide down + fade    | 500ms spring |
| Toast        | Slide from right + spring          | Slide right + shrink | 300ms spring |
| Dropdown     | ScaleY(0→1) + fade                 | ScaleY(1→0) + fade   | 200ms spring |
| Button hover | Scale 1.05                         | —                    | 150ms spring |
| Button tap   | Scale 0.95                         | —                    | 100ms spring |

### Spring Configs

```typescript
const springs = {
  page: { type: 'spring', stiffness: 300, damping: 30 },
  snappy: { type: 'spring', stiffness: 500, damping: 35 },
  gentle: { type: 'spring', stiffness: 200, damping: 25 },
  bounce: { type: 'spring', stiffness: 400, damping: 15 },
};
```

## Accessibility

- All animations check `useReducedMotion()` from Framer Motion
- When `prefers-reduced-motion: reduce`, animations are instant (duration: 0)
- No spinning, parallax, or vestibular-triggering patterns
- Existing `prefers-reduced-motion` check in ScrollToTop.tsx is preserved

## Bundle Impact

- `framer-motion`: ~30KB gzipped
- Code-split into `vendor-motion` Vite chunk
- Only loaded on first animated component render (lazy compatible)

## Implementation Order

1. Install framer-motion + create presets.ts
2. Build PageTransition + AnimatedOutlet components
3. Wire into App.tsx route transitions
4. Build StaggerContainer + StaggerItem
5. Apply stagger to RestaurantMenu card sections
6. Animate Toast component
7. Animate Layout dropdown
8. Add button hover/tap interactions
9. Animate modal/sheet transitions
10. Add portal dashboard number counters
11. Test all transitions + verify prefers-reduced-motion
12. Run full verification (tsc + tests + build)
