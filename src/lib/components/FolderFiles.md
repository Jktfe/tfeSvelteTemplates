# FolderFiles - Technical Logic Explainer

## Overview

FolderFiles is a **3D filing cabinet** component with CSS transforms, native HTML5 drag-and-drop, and mobile-friendly tap-to-select. It demonstrates complex interaction patterns without any external libraries.

## The Metaphor

Think of a real filing cabinet:
- **Folders** = Colored tabs sticking out
- **Hover** = Folders beneath drop down (cascade reveal)
- **Click** = Opens folder to show contents
- **Modal** = Sorting papers on your desk (two panels)

## Key Interactions

### Desktop Flow
```
Hover folder tab → Cascade reveal animation
         ↓
    Click folder
         ↓
    Modal opens
         ↓
Drag files between panels
```

### Mobile Flow (Two-Tap Pattern)
```
First tap → Show cascade + tooltip
         ↓
Second tap (same folder) → Open modal
         ↓
Tap files to select → Use action bar buttons
```

## CSS 3D Transforms

The cabinet depth uses perspective:

```css
.cabinet {
  perspective: 1000px;  /* Creates depth */
  transform-style: preserve-3d;
}

.folder {
  transform: rotateX(-5deg);  /* Tilted back */
  transform-origin: bottom center;
}

.folder.cascaded {
  transform: translateY(40px) rotateX(0deg);  /* Drops down flat */
}
```

## Drag-and-Drop (HTML5 Native)

No libraries needed! Using native browser APIs:

```typescript
// Start drag
function handleDragStart(e: DragEvent, item: FileItem) {
  draggedItem = item;
  e.dataTransfer.effectAllowed = 'move';
}

// Drop on panel
function handleDrop(e: DragEvent, targetPanel: 'left' | 'right') {
  e.preventDefault();
  if (!draggedItem) return;

  // Remove from source panel
  sourcePanel = sourcePanel.filter(i => i.id !== draggedItem.id);
  // Add to target panel
  targetPanel = [...targetPanel, draggedItem];

  draggedItem = null;
}
```

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `hoveredIndex` | `number \| null` | Which folder shows cascade |
| `openFolder` | `Folder \| null` | Currently open folder (modal) |
| `leftPanelItems` | `FileItem[]` | "Selected" panel contents |
| `rightPanelItems` | `FileItem[]` | "All Items" panel contents |
| `draggedItem` | `FileItem \| null` | Currently dragging |
| `dragOverPanel` | `'left' \| 'right' \| null` | Drop target highlight |
| `isTouchDevice` | `boolean` | Mobile detection |
| `selectedItems` | `Set<number>` | Mobile multi-select |
| `mobilePreviewIndex` | `number \| null` | Two-tap state |

## Mobile Detection Logic

```typescript
// Detect real mobile (not laptop with touchscreen)
const coarsePointer = matchMedia('(pointer: coarse)').matches;  // Finger input
const isMobileWidth = window.innerWidth <= 768;
isTouchDevice = coarsePointer && isMobileWidth;
```

## Scroll Lock Coordination

Uses `$lib/scrollLock` to prevent body scroll when modal is open:

```typescript
function openModal() {
  unlockScroll = lockScroll();  // Returns cleanup function
}

function closeModal() {
  unlockScroll?.();  // Restore scroll
}
```

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `folders` | `Folder[]` | `[]` | Folder definitions |
| `files` | `FileItem[]` | `[]` | File items with folderId |

## Data Structures

```typescript
interface Folder {
  id: number;
  label: string;
  color: string;  // e.g., '#ef4444' (red)
}

interface FileItem {
  id: number;
  folderId: number;  // Which folder contains this
  title: string;
  description?: string;
}
```

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Focus trap | Tab cycles in modal |
| Role | `role="listbox"` for panels |
| Keyboard | Enter to move items |
| Escape | Closes modal |

## Known Warnings (Safe to Ignore)

Several a11y warnings are intentionally suppressed:
- `a11y_no_noninteractive_element_interactions` - Listbox items need click handlers
- `a11y_click_events_have_key_events` - Handled via `onkeydown` on same element
- `a11y_no_static_element_interactions` - Container click clears mobile state

## Performance Notes

- **No virtual scrolling** - Works well up to ~100 files per folder
- **CSS transitions** - Hardware accelerated transforms
- **Event delegation** - Drag events bubble to panel container
