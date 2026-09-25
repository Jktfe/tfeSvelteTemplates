# AnimatedText — Technical Logic Explainer

## What Does It Do? (Plain English)

AnimatedText lays a phrase along a curved line and lets it drift slowly sideways, like a banner caught in a breeze. When someone hovers over it, tabs to it with the keyboard or taps it on a phone, the ribbon cross-fades into a second phrase — a small "hidden message" moment. Move away and it fades back.

**Think of it like:** a tickertape looped around a lamppost. It keeps rolling, and every so often someone flips it over to reveal what's printed on the back.

---

## How It Works (Pseudo-Code)

```
state:
  distance     = 0        // how far the ribbon has travelled (SVG units)
  originalLoop = 0        // measured width of ONE copy of originalText
  morphedLoop  = 0        // measured width of ONE copy of morphedText
  morphed      = false    // bindable — which phrase is showing

on mount / text change / fonts ready:
  measure each <text> with getComputedTextLength()
  loop = total length ÷ repeat

every animation frame (only if on screen, not paused, motion allowed):
  distance += speed × secondsSinceLastFrame   // clamped to 0.1s

derived for each layer:
  phase  = distance mod loop
  offset = direction = left ? -phase : phase - loop
  <textPath startOffset={offset}>

events (trigger = 'hover'):
  pointerenter (mouse / pen) → morphed = true
  pointerleave               → morphed = false (unless keyboard-focused)
  focus (focus-visible only) → morphed = true
  blur                       → morphed = false (unless still hovered)
  click / tap / Enter / Space → toggle (ignored while a mouse is hovering)
  Escape                     → morphed = false

events (trigger = 'click'):
  click / tap / Enter / Space → toggle
  Escape                      → morphed = false
```

---

## The Core Concept: A Seamless Loop Along a Path

SVG's `<textPath>` places text along any `<path>`. Its `startOffset` attribute says how far along the path the first glyph sits. Slide `startOffset` and the whole string slides along the curve.

The trap is the seam. If you animate from `0%` to `-100%` (as the original SMIL version did), the text eventually runs out and snaps back to the start with a visible jump.

The fix is to make the ribbon out of identical "cells":

```
 cell 1                 cell 2                 cell 3
[STATIC DRIFT · ][STATIC DRIFT · ][STATIC DRIFT · ][STATIC DRIFT · ]
|<--- loop --->|
```

Each copy carries its own trailing separator, so every cell is exactly the same width. We measure that width once (`getComputedTextLength() ÷ repeat`) and only ever slide by **one cell**. When the offset reaches `-loop`, cell 2 is sitting precisely where cell 1 started — so wrapping back to `0` is invisible.

```
offset:   0 ──────────────▶ -loop │ 0 ──────────────▶ -loop
visual:   cell1 at start   cell2 at start (identical) — no jump
```

Rightward drift runs the same window backwards: `-loop → 0`.

Web fonts usually arrive after first paint and change glyph widths, so the component re-measures once `document.fonts.ready` resolves.

---

## Cross-fade Morph

Rather than swapping the string (which reflows and restarts the ribbon), both phrases are rendered as separate `<text>` layers on the **same** path, driven by the **same** distance. Only their opacity changes:

```
morphed = false   original: opacity 1   morph: opacity 0
morphed = true    original: opacity 0   morph: opacity 1
```

The transition lives in CSS (`--animated-text-fade`, default 450ms). Under `prefers-reduced-motion: reduce` the transition is removed, so the swap is instant, and the drift loop never starts.

The morph layer is filled with `--animated-text-accent` — a brand token, so it deliberately does **not** flip in dark mode. Background, foreground and focus ring are chrome tokens and do flip.

| Token | Kind | Light | Dark |
|-------|------|-------|------|
| `--animated-text-bg` | chrome | `#fafafa` | `#111318` |
| `--animated-text-fg` | chrome | `#111827` | `#f3f4f6` |
| `--animated-text-focus-ring` | chrome | `#2563eb` | `#93c5fd` |
| `--animated-text-accent` | brand | `#e11d48` | `#e11d48` |
| `--animated-text-font` | type | `'Space Mono', monospace` | — |
| `--animated-text-size` | type | `20px` | — |
| `--animated-text-radius` | shape | `12px` | — |
| `--animated-text-fade` | motion | `450ms` | — |

---

## State Flow Diagram

```
                ┌───────────────────────┐
                │        RESTING        │
                │   morphed = false     │
                │ original layer shown  │
                └──────────┬────────────┘
                           │ hover (mouse) · focus-visible
                           │ click / tap / Enter / Space
                           ▼
                ┌───────────────────────┐
                │        MORPHED        │
                │   morphed = true      │
                │  morph layer shown    │
                └──────────┬────────────┘
                           │ pointerleave · blur
                           │ click / tap / Enter / Space · Escape
                           ▼
                        RESTING

  Drift loop (independent of morph state):
    RUNNING ◀── on screen AND !paused AND speed > 0 AND motion allowed
    STOPPED ◀── any of those false
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `originalText` | `string` | required | Resting phrase |
| `morphedText` | `string` | `''` | Phrase revealed on trigger. Empty means no morph and the root becomes `role="img"` |
| `morphed` | `boolean` (bindable) | `false` | Which phrase is showing |
| `trigger` | `'hover' \| 'click' \| 'none'` | `'hover'` | Interaction model |
| `speed` | `number` | `30` | Drift in SVG user units per second. `0` holds still |
| `direction` | `'left' \| 'right'` | `'left'` | Drift direction |
| `paused` | `boolean` | `false` | Freeze the drift without unmounting |
| `repeat` | `number` | `4` | Copies of the phrase laid along the path |
| `path` | `string` | S-curve | SVG path `d` in a 1200×300 viewBox |
| `height` | `number` | `200` | Container height in px |
| `label` | `string` | `originalText — morphedText` | Accessible name override |
| `class` | `string` | `''` | Extra classes on the root element |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `morphedText` empty | Renders `role="img"`, no button, no morph |
| `trigger="none"` | Decorative `role="img"`; drive `morphed` yourself with `bind:morphed` |
| Short phrase on a long path | Raise `repeat` so the ribbon covers the whole curve |
| Loop not yet measured (SSR, jsdom) | Offset stays at `0`; nothing jumps once measurement lands |
| Mouse hovering, then clicks | Click is ignored so the hover morph isn't undone |
| Touch device | Tap toggles; there is no hover state to get stuck in |
| Tab hidden for a while | Frame delta is clamped to 0.1s, so the ribbon doesn't lurch forward |
| Off-screen | IntersectionObserver stops the loop entirely |
| `prefers-reduced-motion: reduce` | No drift; morph is an instant swap |
| Many instances on one page | Each gets its own `$props.id()`-based path id — no collisions |

---

## Dependencies

- **Zero external dependencies.**
- `$lib/types` — `AnimatedTextProps`, `PathTextTrigger`, `AnimatedTextDirection`. Inline these if you copy the component elsewhere.
- Requires **Svelte 5.20+** for `$props.id()`.

---

## File Structure

```
src/lib/components/AnimatedText.svelte    # The component (+ exported pure helpers)
src/lib/components/AnimatedText.test.ts   # Helper maths + rendered behaviour
src/lib/components/AnimatedText.md        # This explainer
src/routes/animated-text/+page.svelte     # Demo page (gallery + playground)
```
