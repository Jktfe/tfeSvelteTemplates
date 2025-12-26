# ExpandingCard - Technical Logic Explainer

## What Does It Do? (Plain English)

ExpandingCard is an interactive card that morphs between two layouts: a compact vertical card and an expanded horizontal card. Click anywhere on the card to toggle between states, and watch as the image, heading, and text smoothly animate to their new positions.

**Think of it like:** A business card that can unfold to reveal more information, then fold back up again!

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. SET layout = 'compact'
  2. CREATE crossfade transitions (send/receive pair)

WHEN user clicks card:
  1. IF layout === 'compact':
     - SET layout = 'expanded'
     - Compact card "sends" its elements
     - Expanded card "receives" them at new positions
  2. ELSE:
     - SET layout = 'compact'
     - Expanded card "sends" its elements
     - Compact card "receives" them at new positions

CROSSFADE MAGIC:
  1. Element in old layout gets 'send' transition with key
  2. Element in new layout gets 'receive' transition with SAME key
  3. Svelte animates element from old position → new position
  4. Duration: 400ms (smooth but snappy)
```

---

## The Crossfade Transition

Svelte's `crossfade` is the secret sauce. It creates paired transitions that make elements "fly" between layouts:

```typescript
let [send, receive] = crossfade({ duration: 400 });
```

**How the keys work:**

```
Compact Layout                    Expanded Layout
┌─────────────────┐              ┌─────────────────────────────┐
│   ┌─────────┐   │              │ ┌─────────┐                 │
│   │  Image  │   │     →→→      │ │  Image  │  Heading        │
│   │ key:'img'   │     →→→      │ │ key:'img'│  Extended text  │
│   └─────────┘   │              │ └─────────┘                 │
│   Heading       │              └─────────────────────────────┘
│   key:'heading' │
│   Short text    │
│   key:'para'    │
└─────────────────┘

Same keys = Same element, just in different positions!
Svelte handles the animation automatically.
```

---

## Layout States

### Compact Layout (Default)
```
┌─────────────────┐
│   ╔═══════════╗ │
│   ║   IMAGE   ║ │
│   ║  192×192  ║ │
│   ╚═══════════╝ │
│                 │
│   Card Title    │
│   Short text... │
└─────────────────┘
     Vertical
```

### Expanded Layout
```
┌───────────────────────────────────┐
│ ╔═══════════╗                     │
│ ║   IMAGE   ║  Card Title         │
│ ║  224×224  ║  Much longer text   │
│ ╚═══════════╝  that provides more │
│                detail about this  │
│                particular item... │
└───────────────────────────────────┘
            Horizontal
```

---

## The Toggle Mechanism

```typescript
let layout: 'compact' | 'expanded' = $state('compact');

function toggleLayout() {
  layout = layout === 'compact' ? 'expanded' : 'compact';
}
```

When `layout` changes, Svelte's `{#if}` block destroys the old layout and creates the new one. Because both layouts have elements with matching crossfade keys, the transitions animate smoothly instead of just appearing/disappearing.

---

## Absolute Positioning (Critical!)

```css
.layouta {
  position: absolute;
}
```

**Why is this essential?**

Without `position: absolute`, the crossfade would fail because:
1. The old element would leave a gap in the document flow
2. The new element would push other content around
3. The animation would jump/stutter

With `position: absolute`:
1. Elements are removed from document flow
2. They can animate freely over other content
3. The transition is smooth and seamless

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `string` | Pinterest image | URL of the card image |
| `imageAlt` | `string` | `'Card Image'` | Alt text for accessibility |
| `heading` | `string` | `'Card Title'` | Main title text |
| `compactText` | `string` | Default text | Text shown in compact state |
| `expandedText` | `string` | Default text | Text shown in expanded state |
| `bgColor` | `string` | `'bg-lime-100'` | TailwindCSS background class |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Keyboard | Full button semantics - Tab to focus, Enter/Space to toggle |
| Screen readers | ARIA labels: "Expand card" / "Collapse card" |
| Focus indicators | Browser default focus ring on button |
| Semantics | Uses `<button>` element, not a div with click handler |

---

## Responsive Behaviour

The card adapts to screen size using Tailwind responsive classes:

| Breakpoint | Compact | Expanded |
|------------|---------|----------|
| Mobile (<640px) | 192×192 image | 112×112 image, smaller gaps |
| Small (≥640px) | 224×224 image | 128×144 image |
| Medium (≥768px) | Same as small | 224×224 image, full gaps |

---

## Performance Considerations

- **Zero external animation libraries** - uses Svelte's built-in transitions
- **Hardware accelerated** - CSS transforms are GPU-optimised
- **Short duration** (400ms) - feels snappy, doesn't test patience
- **Single state variable** - minimal reactive overhead

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Rapid clicking | Each click queues the next transition |
| Missing image | Alt text shown, layout still works |
| Very long text | Text overflows (consider truncation) |
| Reduced motion | Crossfade respects prefers-reduced-motion |

---

## Dependencies

- **svelte/transition** (crossfade) - built into Svelte, no bundle cost
- **$lib/types** (ExpandingCardProps) - TypeScript interface
- **TailwindCSS** - for utility styling

---

## File Structure

```
ExpandingCard.svelte      # The component
ExpandingCard.test.ts     # Unit tests
ExpandingCard.md          # This explainer
```

---

*Last updated: 26 December 2025*
