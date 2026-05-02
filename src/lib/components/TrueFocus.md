# TrueFocus — Technical Logic Explainer

## What Does It Do? (Plain English)

TrueFocus draws a single coloured focus box around one word of a phrase, then slides and resizes that box from word to word on a configurable cadence. There is exactly **one** indicator element — when it moves it morphs (transforms its position, animates its width and height) rather than fading out one box and fading in another. Hover pauses the cycle. Click on a word to pin focus there.

Think of it as a teleprompter highlight: the camera operator's spotlight glides from the next word to the next, leaving the rest of the line untouched.

## How It Works (Pseudo-Code)

```
state:
  activeIndex     = 0
  pinnedIndex     = null      // overrides activeIndex when set
  isHovering      = false
  measuredRect    = { left, top, width, height }
  prefersReduced  = matchMedia query

derive:
  words         = text.split(/\s+/) filter non-empty
  displayIndex  = pinnedIndex ?? activeIndex

events:
  on cycle interval:
    if pinned: skip
    if pauseOnHover and isHovering: skip
    activeIndex = cycleNext(activeIndex, words.length, order)

  on word click(idx):
    pinnedIndex = pinnedIndex === idx ? null : idx   // toggle pin

  on word keydown Enter or Space(idx):
    preventDefault
    treat as click

  on pointerenter / pointerleave:
    isHovering = true / false

re-measure on every displayIndex change:
  el      = wordEls[displayIndex]
  wRect   = wrapper.getBoundingClientRect()
  eRect   = el.getBoundingClientRect()
  rect    = {
    left:   eRect.left - wRect.left,
    top:    eRect.top  - wRect.top,
    width:  eRect.width,
    height: eRect.height
  }
  measuredRect = padRect(rect, paddingX, paddingY)

ResizeObserver(wrapper) → re-measure on reflow / font-load / window-resize

reduced-motion:
  cycle never starts; transitions disabled on the focus box.
```

## The Core Concept: One Morphing Indicator (Not Many Borders)

The naive implementation gives every word its own border and toggles `.active`. That works visually but you get fade-out/fade-in flicker and four rerendered borders during a transition. TrueFocus instead has **one** absolutely positioned indicator and animates its `transform`, `width`, and `height` in sync.

```
  Phrase wrapper (position: relative)
  ┌──────────────────────────────────────────────────┐
  │  [Build]   something   extraordinary             │   ← words (z-index: 1)
  │   ◯◯◯◯◯                                          │
  │   ▲                                              │
  │   │                                              │
  │   indicator absolutely positioned at the         │
  │   measured rect of word #0 (z-index: 0,          │
  │   pointer-events: none)                          │
  └──────────────────────────────────────────────────┘

           cycle tick → activeIndex = 1
           ▼

  ┌──────────────────────────────────────────────────┐
  │  Build   [something]   extraordinary             │
  │           ─────────                              │
  │           ▲                                      │
  │           │                                      │
  │           same indicator element, different      │
  │           inline style: translate3d + width + height
  └──────────────────────────────────────────────────┘
```

The indicator's CSS is `transition: transform 360ms cubic-bezier(0.6, 0, 0.2, 1), width 360ms ..., height 360ms ...`. When `measuredRect` changes, the browser interpolates all four properties on the same easing curve — the box slides AND resizes in one fluid motion. No DOM thrash, no fade/fade flicker.

`buildIndicatorStyle(rect, color, glow)` is exported as a pure helper so unit tests can confirm the inline-style string for a given rect without rendering anything.

## CSS Animation Strategy

The morph is a single CSS transition list — three position/size properties on one cubic-bezier so they share a velocity profile, plus shorter easing on `border-color`, `box-shadow`, and `opacity`:

```css
.focus-box {
  transition:
    transform   360ms cubic-bezier(0.6, 0, 0.2, 1),
    width       360ms cubic-bezier(0.6, 0, 0.2, 1),
    height      360ms cubic-bezier(0.6, 0, 0.2, 1),
    border-color 240ms ease,
    box-shadow   240ms ease,
    opacity      240ms ease;
  will-change: transform, width, height;
}
```

`translate3d` on the position keeps the element on the GPU compositor; `width`/`height` do force a paint, but only inside the indicator's own bounding box (no neighbours reflow). Reduced-motion users get `transition: none` — the indicator pins to the first word and stays put while the rest of the text reads as static copy.

## Performance

- One indicator element, transform-driven; the rest of the phrase is plain text spans.
- The cycle is a `setInterval` that bails out early under hover or pin — no rAF burning while paused.
- `ResizeObserver` only fires when the wrapper actually changes size (window resize, font load, viewport reflow); quiet pages do nothing after mount.
- A `SvelteMap<number, HTMLElement>` registers each word element via the bind-getter/setter pattern, so per-frame measurement is `wordEls.get(displayIndex)` — O(1) lookup.

## State Flow Diagram

```
                       autoStart
  [mounted] ──────────────────────────────▶ [cycling]
                                                 │
                ┌────────────────────────────────┤
                │ pointerenter  (pauseOnHover)   │
                ▼                                │
           [paused]                              │
                │                                │
                │ pointerleave                   │
                ▼                                │
            [cycling]                            │
                │                                │
                │ word click                     │
                ▼                                │
            [pinned]                             │
                │                                │
                │ click pinned word again        │
                ▼                                │
            [cycling] ◀──────────────────────────┘

  prefers-reduced-motion: reduce
        │
        ▼
   [static]  cycle never starts; indicator pinned to first word.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | The phrase, split on whitespace into words. |
| `cycleDuration` | `number` | `1500` | Milliseconds each word stays in focus. |
| `color` | `string` | `'#4338ca'` | Border and glow colour of the focus box. |
| `glow` | `boolean` | `true` | Render the soft `box-shadow` glow around the indicator. |
| `order` | `'sequential' \| 'random'` | `'sequential'` | Cycle order through the words. |
| `pauseOnHover` | `boolean` | `true` | Stop the cycle while the pointer is over the wrapper. |
| `autoStart` | `boolean` | `true` | Begin cycling on mount. |
| `paddingX` | `number` | `8` | Horizontal padding inside the focus box (px). |
| `paddingY` | `number` | `4` | Vertical padding inside the focus box (px). |
| `class` | `string` | `''` | Extra classes on the wrapper span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `text` | `splitWords` returns `[]`; the indicator block is skipped (`{#if words.length > 0}`). |
| Single word | `cycleNext` returns `0` for any input when `total === 1`; indicator parks on the only word. |
| `'random'` order with two words | `cycleNext` always avoids repeating the current index, preventing visual stutter. |
| Window resize while open | `ResizeObserver` fires; `measureActiveWord` recomputes the rect against the new wrapper position. |
| User has `prefers-reduced-motion: reduce` | Cycle never starts; CSS transition disabled; indicator sits on word 0. |
| Click on currently-pinned word | `pinnedIndex` toggles back to `null`; the cycle resumes from `activeIndex`. |
| Phrase prop changes mid-cycle | The reactive `words` derivation recomputes; the `$effect` watching `displayIndex` and `words.length` fires a fresh measurement. |
| Word wrapping to a new line | Indicator measures off the actual rect, so a word that wraps to line 2 gets the indicator on line 2 — the morph still works, it just travels diagonally. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, `untrack`, and `SvelteMap` from `svelte/reactivity`.
- **`ResizeObserver`** (native browser API) — no shim; the component bails out gracefully if the API is missing.
- Zero external dependencies otherwise.

## File Structure

```
src/lib/components/TrueFocus.svelte   # implementation
src/lib/components/TrueFocus.md       # this file (rendered inside ComponentPageShell)
src/lib/components/TrueFocus.test.ts  # vitest unit tests for the pure helpers
src/routes/truefocus/+page.svelte     # demo page
```
