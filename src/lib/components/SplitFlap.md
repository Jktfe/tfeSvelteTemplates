# SplitFlap — Technical Logic Explainer

## What Does It Do? (Plain English)

SplitFlap is the mechanical Solari board you see in old European train stations and airport arrivals halls — a row of cards each split horizontally in two; when the value changes, the top half drops down through intermediate charset positions while the bottom half catches the next glyph and settles. Per-character stagger creates a left-to-right cascade as the whole word updates.

Asset-free: every flap, hinge, and divider is CSS — `transform: rotateX(...)` plus two stacked half-glyph layers. Change `value` and the cells re-tick from their current state to the new target, never spinning more than one full charset traversal.

## How It Works (Pseudo-Code)

```
state:
  displayed: string[]   // current glyph in each cell
  flipping:  boolean[]  // is each cell mid-rotation right now?
  timers:    Timeout[]
  prefersReduced = matchMedia query

derive:
  resolvedCharset = pickCharset(charset)              // digits | alpha | alnum | solari
  cells = value.toUpperCase().split('')

helpers (pure, exported):
  pickCharset(name)                                   → SplitFlapCharset
  nextCharIndex(curIdx, tgtIdx, len, direction)       → next index, one step toward target
    forward:  always (cur + 1) mod len
    shortest: pick whichever direction is fewer ticks
  buildTickSequence(from, to, charset, direction)     → string[] of intermediate glyphs ending in `to`
  frameDelay(index, baseStagger, intensity)           → ms before this cell's first tick

on value change:
  for each cell index i:
    if displayed[i] === cells[i]: continue            // already on target
    if prefersReduced: displayed[i] = cells[i]; continue
    sequence  = buildTickSequence(displayed[i], cells[i], charset, direction)
    startDelay = frameDelay(i, stagger, intensity)
    for step, char in sequence:
      setTimeout(at startDelay + step * flipDuration):
        displayed[i] = char
        flipping[i]  = true
        setTimeout(after flipDuration): flipping[i] = false

on unmount:
  clearTimeout for every queued timer
```

The CSS handles the visible rotation: `flipping[i] === true` adds `.sf-flipping`, which animates `.sf-flap-top` from `rotateX(0deg)` → `rotateX(-90deg)` and `.sf-flap-bottom` from `rotateX(90deg)` → `rotateX(0deg)`. Each tick lasts `flipDuration` ms, and the bottom half settles holding the new glyph.

## The Core Concept: Tick Sequence + Stagger Cascade

A real Solari board doesn't teleport between glyphs — it ticks through every intermediate position. `buildTickSequence` reproduces that:

```
from = 'A', to = 'D', charset = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', direction = 'forward'

  A  →  B  →  C  →  D
        tick   tick   tick (lands)

returned: ['B', 'C', 'D']  — three flaps, three flipDurations
```

`'shortest'` direction picks the cheaper path (forward vs backward) for each cell, which feels snappier for clocks/counters; `'forward'` always cycles forward through the charset, giving the classic "every change costs a full traversal" Solari rhythm. The function caps at `charset.length` iterations as a hard guard — a malformed direction can never spin a cell forever.

The cascade comes from `frameDelay(index, baseStagger, intensity)`:

```
delay_i = i * baseStagger * intensity

  baseStagger = 60ms, intensity = 1
  cell 0:    0ms    starts immediately
  cell 1:   60ms    starts a beat later
  cell 2:  120ms
  cell 3:  180ms
```

Each cell's flap-tick chain is offset, producing a left-to-right wave even though every cell is animating in parallel.

```
   t=0       t=60      t=120     t=180
  ┌───┐    ┌───┐     ┌───┐     ┌───┐
  │ A │    │ B │     │ A │     │ A │
  └─▼─┘    └─▼─┘     └─▼─┘     └─▼─┘
  ┌───┐    ┌───┐     ┌───┐     ┌───┐
  │ B │    │ C │     │ B │     │ A │
  └───┘    └───┘     └───┘     └───┘
  ┌───┐    ┌───┐     ┌───┐     ┌───┐
  │ C │    │ D │     │ C │     │ B │
  └───┘    └───┘     └───┘     └───┘
  ─cell 0─ ─cell 1── ─cell 2── ─cell 3─
   ticking  ticking   waiting   waiting
```

## CSS Animation Strategy

Each cell stacks five layers inside a 3D-preserved container:

```
┌────────────────────┐  ← .sf-cell (perspective: 800px on parent)
│  ┌──────────────┐  │
│  │ .sf-half top │  │  static — shows top half of current glyph
│  ├──────────────┤  │  ← .sf-divider (1px line at 50%)
│  │ .sf-half bot │  │  static — shows bottom half of current glyph
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │ .sf-flap-top │  │  rotates 0 → -90deg (top falls)
│  ├──────────────┤  │
│  │ .sf-flap-bot │  │  rotates 90 → 0deg (bottom rises)
│  └──────────────┘  │
└────────────────────┘
```

When `.sf-flipping` is added:

```css
.sf-flipping .sf-flap-top    { animation: sf-flap-down 320ms ease-in  forwards; }
.sf-flipping .sf-flap-bottom { animation: sf-flap-up   320ms ease-out forwards; }

@keyframes sf-flap-down { 0%{rotateX(0)}    100%{rotateX(-90deg)} }
@keyframes sf-flap-up   { 0%{rotateX(90)}   100%{rotateX(0)}      }
```

`backface-visibility: hidden` on each flap hides its back during the rotation, so you only ever see the painted face. `transform-origin: bottom center` for the top flap and `top center` for the bottom flap means the hinge sits exactly on the divider — the geometry of a real split-flap mechanism.

Reduced-motion users get `animation: none; opacity: 0` on both flaps — the cell snaps to the new glyph immediately, no rotation.

## Performance

- One `setTimeout` per tick step per cell. A 7-cell update rolling through 4 charset positions is 28 timers — trivial.
- All timers are tracked in a single array and cleared on unmount or value change.
- `buildTickSequence` caps at `charset.length`, so even pathological input can't queue an infinite chain.
- The animation itself is two `transform: rotateX` properties — pure GPU compositor work, no layout, no paint thrash.
- `aria-busy` flips while any cell is mid-flight, so assistive tech can defer announcements until the row settles.

## State Flow Diagram

```
   value changes
        │
        ▼
   syncCells(cells)  ── reduced-motion ──▶ [settled instantly]
        │
        │ schedule per cell:
        ▼
   for cell i: setTimeout(startDelay):
        ▼
   [flipping] ── flipDuration tick ──▶ displayed[i] = next char
        │ flipping[i] = true
        │
        │ next setTimeout(flipDuration): flipping[i] = false
        ▼
   loop until last char in sequence
        │
        ▼
   [settled]   target glyph painted, flipping = false

   aria-busy = !allSettled  (every cell idle → polite live region announces)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Target string. Uppercased before display. |
| `charset` | `'digits' \| 'alpha' \| 'alnum' \| 'solari'` | `'alnum'` | Allowed glyph set; cells tick through this in order. |
| `stagger` | `number` | `60` | Milliseconds between adjacent cells' first flips. |
| `flipDuration` | `number` | `320` | Milliseconds for a single half-flap rotation. |
| `intensity` | `number` | `1` | Multiplier on the per-cell stagger. `>1` longer cascade, `<1` punchier. |
| `direction` | `'forward' \| 'shortest'` | `'forward'` | Per-cell traversal: always forward, or whichever way is fewer ticks. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Type scale and cell dimensions. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `value` shrinks (fewer cells) | `syncCells` re-creates `displayed` at the new length; orphan timers from the old length are cleared via `clearTimers()`. |
| `value` grows (more cells) | New cells start at their target glyph (`prev[i] ?? targets[i]`); only changed cells animate. |
| Glyph not in `charset` | `buildTickSequence` returns `[to]`; the cell does a single flap straight to the target. |
| `direction = 'shortest'` and equidistant | Forward wins on tie (`forward <= backward`). |
| User has `prefers-reduced-motion: reduce` | `scheduleCell` writes the target directly, skipping every intermediate tick. |
| Reduced-motion preference changes mid-mount | `mq.addEventListener('change')` updates `prefersReduced`; the next `value` change uses the new mode. |
| Component unmounts mid-flip | `clearTimers()` cancels every pending `setTimeout`; the cleanup also unbinds the `matchMedia` listener. |
| `value = ''` | `cells = []`; nothing renders, `aria-busy` is `false`. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `onMount`, `untrack`.
- **`window.matchMedia`** (native) — reduced-motion gate, with feature-detection.
- Zero external dependencies otherwise. Asset-free.

## File Structure

```
src/lib/components/SplitFlap.svelte   # implementation
src/lib/components/SplitFlap.md       # this file (rendered inside ComponentPageShell)
src/lib/components/SplitFlap.test.ts  # vitest unit tests for the pure helpers
src/routes/splitflap/+page.svelte     # demo page
```
