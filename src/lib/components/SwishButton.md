# SwishButton - Technical Logic Explainer

## What Does It Do? (Plain English)

SwishButton is an animated call-to-action button with three coordinated hover effects: text slides out, replacement text with an arrow slides in, and a background dot expands to fill the button.

**Think of it like:** A magic trick where one card slides behind another. The text swoops off-stage left while a fresh copy with an arrow glides in from the right. Meanwhile, a tiny dot in the corner grows to become the new coloured background. It's like a little theatre show!

---

## How It Works (Pseudo-Code)

```
WHEN button loads:
  1. DISPLAY original text (slightly offset to the right)
  2. HIDE replacement text + arrow (positioned off-screen right)
  3. SHOW tiny background dot (positioned near center-left)

WHEN user hovers:
  SIMULTANEOUSLY:
    - SLIDE original text to the left + FADE OUT
    - SLIDE replacement text + arrow FROM right to center + FADE IN
    - EXPAND background dot to fill entire button

WHEN user stops hovering:
  REVERSE all animations back to initial state
```

---

## The Three Animation Layers

### Layer 1: Original Text
- Starts visible, slightly right of center (`translate-x-1`)
- On hover: slides further right (`translate-x-12`) and fades out (`opacity-0`)
- This creates the "exit left" illusion

### Layer 2: Hover Content (Text + Icon)
- Starts invisible (`opacity-0`) and positioned off-screen right (`translate-x-12`)
- On hover: slides into view (`-translate-x-1`) and fades in (`opacity-100`)
- Contains: text + contextual SVG icon

### Layer 3: Background Dot
- Starts as 8x8px dot (`h-2 w-2`) positioned at 20% left, 40% top
- On hover: expands to full size and scales up 1.8x to cover everything
- The `bg-primary` colour creates the filled-button look

---

## Visual Breakdown

```
NORMAL STATE:
┌────────────────────────────┐
│           [•]              │  ← Small dot (hidden layer 3)
│      "Button"              │  ← Original text (layer 1)
│  [hidden: "Button" →]      │  ← Hidden off-screen (layer 2)
└────────────────────────────┘

HOVER STATE:
┌────────────────────────────┐
│████████████████████████████│  ← Expanded dot (layer 3)
│  "Button"  →               │  ← Slid in text + arrow (layer 2)
│      [faded out]           │  ← Original text gone (layer 1)
└────────────────────────────┘
```

---

## The Tailwind "Group" Trick

The magic relies on Tailwind's `group` class:

```html
<button class="group ...">           <!-- Parent has "group" class -->
  <span class="group-hover:...">     <!-- Children react to parent hover -->
</button>
```

When you hover the button (the "group"), all children with `group-hover:*` classes activate simultaneously. This is how we coordinate three different animations!

---

## Icon Logic

The button shows different icons based on state:

| State | Icon | Reason |
|-------|------|--------|
| `disabled={true}` | X (cross) | Indicates unavailable action |
| `type="reset"` | Circular undo | Standard reset iconography |
| Default | Arrow right | Implies "go" or "continue" |

All icons are **inline SVGs** - no icon library required!

---

## Dependencies

- **TailwindCSS**: All styling uses Tailwind utility classes
- **$lib/utils**: Uses `cn()` function for class merging
- **Zero icon libraries**: All SVGs are inline

---

## Performance Notes

- **CSS-only animations**: No JavaScript runs during hover
- **GPU accelerated**: `transform` properties are hardware-accelerated
- **Smooth 300ms duration**: Fast enough to feel responsive, slow enough to see
- **overflow-hidden**: Ensures sliding elements don't escape the button bounds

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `'Button'` | Button label |
| `class` | `string` | `''` | Additional CSS classes |
| `onclick` | `function` | - | Click handler |
| `disabled` | `boolean` | `false` | Disable the button |
| `type` | `string` | `'button'` | button / submit / reset |
| `...rest` | `any` | - | Native button attributes |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Very long text | May overflow - consider max-width |
| Disabled state | Shows X icon, but animation still works |
| Reset type | Shows undo icon |
| Custom onclick | Works as expected |
| Form submission | Works with `type="submit"` |

---

## File Structure

```
SwishButton.svelte      # The component
SwishButton.test.ts     # Unit tests
SwishButton.md          # This explainer
```

---

*Last updated: 26 December 2025*
