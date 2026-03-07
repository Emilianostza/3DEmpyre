# Cmd+K Global Search Palette Design

**Date:** 2026-02-22
**Status:** Approved

## Overview

Spotlight-style global search palette triggered by Cmd+K (Mac) / Ctrl+K (Win). Searches across pages, menu items, projects, assets, and quick actions.

## Architecture

### New Files

| File                                | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `src/components/CommandPalette.tsx` | Main search palette UI component                |
| `src/hooks/useCommandPalette.ts`    | Keyboard shortcut + open/close state management |

### Modified Files

| File         | Change                                                  |
| ------------ | ------------------------------------------------------- |
| `App.tsx`    | Mount `<CommandPalette />` at app root level            |
| `Layout.tsx` | Add search icon button in header that opens the palette |

## UI Design

- Centered modal, 640px max-width
- Dark glass: `bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl`
- Input at top with search icon, auto-focused, placeholder "Search pages, items, projects..."
- Results grouped by category with section headers
- Keyboard navigation: Arrow Up/Down to move, Enter to select, Escape to close
- Max 8 results per category
- Each result shows: icon + title + subtitle + category badge
- Empty state: "No results found" with suggestions

## Search Categories

1. **Pages** — Static routes (Home, Pricing, Blog, etc.)
2. **Menu Items** — Items from INITIAL_ITEMS data
3. **Projects** — From mock project data
4. **Assets** — From mock asset data
5. **Actions** — Toggle dark mode, Switch language, etc.

## Search Algorithm

Simple case-insensitive `includes()` matching against title + description fields. No external fuzzy search library needed — YAGNI.

## Animations

- Backdrop: `modalOverlay` preset (fade in/out)
- Panel: `modalContent` preset (scale + fade + spring)
- Results: stagger reveal (60ms per item)
- Result hover: subtle background highlight

## Keyboard Shortcuts

| Key                 | Action           |
| ------------------- | ---------------- |
| `Cmd/Ctrl + K`      | Open palette     |
| `Escape`            | Close palette    |
| `Arrow Up/Down`     | Navigate results |
| `Enter`             | Select result    |
| `Cmd/Ctrl + number` | Jump to category |

## Accessibility

- `role="dialog"` + `aria-modal="true"` on palette
- `role="combobox"` on input
- `role="listbox"` on results
- `aria-activedescendant` tracks selected result
- Focus trapped inside palette while open
- Reduced motion: instant transitions

## Implementation Order

1. Create useCommandPalette hook (keyboard shortcut + state)
2. Build CommandPalette component with search input
3. Add static pages search data
4. Add result rendering with categories
5. Add keyboard navigation (arrow keys + enter)
6. Wire into App.tsx and Layout.tsx
7. Add animations with motion presets
8. Test accessibility and keyboard flow
