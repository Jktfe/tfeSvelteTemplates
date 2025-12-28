# Timeline - Technical Logic Explainer

## Overview

Timeline is an **animated event timeline component** powered by anime.js. It displays events/milestones in a chronological sequence with smooth entrance animations, supporting both vertical and horizontal layouts.

## The Flow: Animation Lifecycle

```
[Component Mounts]
       ↓
[Check reduced motion preference]
       ↓
[Set up IntersectionObserver]
       ↓
[Timeline scrolls into view?]
       │
       ├── No → Wait (items hidden with opacity: 0)
       │
       └── Yes → [Trigger animateEntrance()]
                        ↓
            [anime.js animates each item]
                        ↓
                  [hasAnimated = true]
                        ↓
                [Animation complete!]
```

## Key Concepts

### 1. Scroll-Triggered Animation

Animation only starts when the timeline enters the viewport:

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !hasAnimated) {
      animateEntrance();
    }
  },
  { threshold: 0.1 }  // Trigger when 10% visible
);
```

### 2. Anime.js v4 Integration

The component uses anime.js v4's named exports:

```typescript
// v4 syntax (current)
import { animate, stagger } from 'animejs';

animate(items, {
  opacity: [0, 1],
  translateX: [-50, 0],
  duration: 600,
  delay: stagger(100),  // 100ms between each item
  ease: 'outQuad'
});
```

### 3. Animation Types

| Type | Effect | CSS Properties |
|------|--------|----------------|
| `fade` | Items fade in | `opacity: 0 → 1` |
| `slide` | Items slide from sides | `translateX + opacity` |
| `scale` | Items grow in | `scale: 0.8 → 1 + opacity` |
| `none` | No animation | Items visible immediately |

### 4. Alternating Alignment

For vertical timelines, items can alternate sides:

```typescript
function getAlignmentClass(index: number): string {
  if (alignment === 'alternate') {
    return index % 2 === 0 ? 'align-left' : 'align-right';
  }
  return `align-${alignment}`;
}
```

Visual result:
```
    [Event 1] ●
              ● [Event 2]
    [Event 3] ●
              ● [Event 4]
```

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `timelineRef` | `HTMLDivElement` | Reference for observer |
| `hasAnimated` | `boolean` | Prevent re-animation |
| `prefersReducedMotion` | `boolean` | Accessibility check |

## Props Quick Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `TimelineEvent[]` | required | Event data array |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `alignment` | `'left' \| 'right' \| 'alternate'` | `'alternate'` | Item positioning |
| `animation` | `'fade' \| 'slide' \| 'scale' \| 'none'` | `'slide'` | Entrance animation |
| `animationDuration` | `number` | `600` | Animation length (ms) |
| `animationDelay` | `number` | `100` | Stagger delay (ms) |
| `lineColor` | `string` | `'#e2e8f0'` | Connecting line colour |
| `markerColor` | `string` | `'#146ef5'` | Default dot colour |
| `showProgress` | `boolean` | `false` | Show completion line |
| `dateFormat` | `function \| 'relative'` | default | Date formatting |
| `onEventClick` | `(event) => void` | - | Click handler |

## TimelineEvent Interface

```typescript
interface TimelineEvent {
  id: string | number;    // Unique identifier
  date: Date | string;    // When it happened
  title: string;          // Event heading
  description?: string;   // Optional details
  icon?: string;          // Emoji/icon on marker
  color?: string;         // Custom marker colour
  completed?: boolean;    // Show check mark
  href?: string;          // Make title a link
}
```

## Date Formatting Options

| Option | Example Output |
|--------|---------------|
| Default | "15 Jan 2024" |
| `'relative'` | "2 days ago", "Tomorrow" |
| Custom function | Whatever you return |

```typescript
// Relative dates
<Timeline dateFormat="relative" />

// Custom format
<Timeline dateFormat={(date) => date.toLocaleDateString('de-DE')} />
```

## Progress Indicator

When `showProgress={true}`, a filled line shows completion:

```
Progress line:  ████████░░░░░░░░
                ↑ completed events

progressPercentage = (completedCount / totalCount) * 100
```

The progress line animates after all items have appeared.

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Semantic structure | `role="list"` with `role="listitem"` |
| Keyboard nav | Tab to navigate, Enter/Space to activate |
| Focus indicator | Visible outline on focus |
| Screen readers | `aria-label` on timeline and time elements |
| Reduced motion | Animations disabled, items shown immediately |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move to next event |
| `Shift+Tab` | Move to previous event |
| `Enter` | Activate event (if clickable) |
| `Space` | Activate event (if clickable) |

## CSS Custom Properties

The component uses CSS custom properties for easy theming:

```css
.timeline {
  --line-color: #e2e8f0;
  --marker-color: #146ef5;
  --progress-percent: 33%;
}
```

## Responsive Behaviour

On mobile (< 768px), vertical timelines:
- Force left alignment (no alternating)
- Line moves to left edge
- Smaller markers

## Common Patterns

### Company Milestones

```svelte
<Timeline
  events={companyHistory}
  orientation="vertical"
  alignment="alternate"
  showProgress={true}
/>
```

### Project Roadmap

```svelte
<Timeline
  events={projectPhases}
  orientation="horizontal"
  dateFormat="relative"
  onEventClick={showPhaseDetails}
/>
```

### Simple History

```svelte
<Timeline
  events={historyEvents}
  alignment="left"
  animation="fade"
/>
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `animejs` | ^4.2.2 | Staggered entrance animations |

**Why anime.js?** The staggered, sequenced animations with easing would require significant code to implement natively. Anime.js provides this with a small footprint and excellent performance.

## Edge Cases Handled

| Scenario | Behaviour |
|----------|-----------|
| Empty events array | Timeline renders but empty |
| Single event | No alternating needed |
| Reduced motion | Items visible immediately |
| Events without dates | Uses current date |
| Very long descriptions | CSS handles overflow |

## Known Warnings

None expected. All CSS selectors are used, and anime.js import is clean in v4.
