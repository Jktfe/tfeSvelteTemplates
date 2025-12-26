# ShineBorder - Technical Logic Explainer

## What Does It Do? (Plain English)

ShineBorder wraps any content and adds an animated glowing border that sweeps horizontally - like a sparkle catching the light on polished chrome.

**Think of it like:** Wrapping a gift with ribbon that has a glittery stripe running through it. The stripe constantly moves from left to right, catching your eye.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. CREATE outer wrapper div
  2. SET CSS variables from props (colour, speed, thickness, roundness)
  3. CREATE inner content div
  4. RENDER children inside the inner div

THE VISUAL TRICK:
  - Outer div HAS a gradient background (transparent → colour → transparent)
  - Gradient is 200% wide (twice the visible area)
  - Animation MOVES gradient from left to right continuously
  - Inner div HAS white background that "covers" the gradient
  - ONLY the padding area (the "border") shows the gradient

ANIMATION LOOP:
  START: gradient positioned at -200% (off-screen left)
  END: gradient positioned at 200% (off-screen right)
  REPEAT: forever, at constant speed
```

---

## The Core Concept

### The "Fake Border" Technique

This component doesn't use a real CSS `border`. Instead, it uses a clever trick:

1. **Outer div** = The gradient "border" creator
   - Has `padding` equal to desired border width
   - Has an animated gradient background

2. **Inner div** = The content area
   - Has solid white background
   - Sits on top, covering the gradient except at the edges

**Result:** You see the gradient only through the "frame" created by the padding!

```
┌─────────────────────────────┐
│ GRADIENT BACKGROUND         │  ← Outer div
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │   WHITE BACKGROUND      │ │  ← Inner div (your content)
│ │                         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
        ↑
   Padding creates visible "border"
```

---

## CSS Variables Explained

| Variable | What It Controls | Example |
|----------|-----------------|---------|
| `--shine-color` | The sparkle colour | `#146ef5` (blue) |
| `--shine-duration` | How long one sweep takes | `3s` |
| `--border-width` | Thickness of the border | `2px` |
| `--border-radius` | Corner roundness | `8px` |

---

## The Animation Trick

The gradient is **twice as wide** as the visible area. Why?

```
Visible area:     [====100%====]
Actual gradient:  [====100%====][====100%====]
                  ^-200%        ^0%          ^200%
```

- **Start (0%):** Gradient at position `-200%` (sparkle hidden on left)
- **Middle (50%):** Gradient at position `0%` (sparkle in centre)
- **End (100%):** Gradient at position `200%` (sparkle hidden on right)

Because we go from `-200%` to `+200%`, the sparkle smoothly enters, crosses, and exits without any jarring "jump" back to start.

---

## Performance Notes

- **GPU Accelerated:** Uses `will-change: background-position` to hint at the browser
- **No JavaScript:** Pure CSS animation runs even if JS fails
- **Minimal Repaints:** Only `background-position` changes, not layout

---

## Edge Cases Handled

| Situation | Behaviour |
|-----------|-----------|
| No children provided | Empty bordered box displays |
| Very small dimensions | Border still visible (may look chunky) |
| Very large duration | Slow, subtle effect |
| Duration of 0 | Static gradient (no animation) |

---

## What This Component Does NOT Do

- Does not support vertical or diagonal shine directions
- Does not support multiple colours in one sweep (but you can nest!)
- Does not pause on hover (could be added)
- Does not yet respect `prefers-reduced-motion` (TODO)

---

## Dependencies

**Zero external dependencies.**

This component uses only:
- Svelte 5 (`$props()` rune)
- Standard CSS features (gradients, keyframes, custom properties)

---

## File Structure

```
ShineBorder.svelte      # The component
ShineBorder.test.ts     # Unit tests (5 tests)
ShineBorder.md          # This explainer
```

---

*Last updated: 26 December 2025*
