# ScrambledText — Technical Logic Explainer

## What Does It Do? (Plain English)

ScrambledText displays a string where each character starts as a random glyph from a configurable pool (default `A–Z` + `0–9`) and "decodes" to the final letter at a per-character settle time. The classic Mission Impossible / Matrix / heist-movie terminal reveal — every glyph rolls through the pool until the right one drops into place.

Think of it as a row of slot-machine wheels, each spinning at random until its target letter clicks into position.

## How It Works (Pseudo-Code)

```
state:
  display       = ''             // frame-by-frame visible string
  isAnimating   = false
  settleTimes   = number[]       // ms each char locks at
  startTime     = 0              // performance.now() at first tick
  prefersReduced = matchMedia query

helpers (pure, exported):
  pickScrambleChar(pool, rng) → random character from pool
  computeSettleTimes(charCount, duration, order, rng) → number[]
    'left-to-right': i_th time = ((i+1) / count) * duration
    'random':        i_th time = rng() * duration
  getDisplayString(text, settleTimes, elapsed, pool, rng) → string
    for each char in text:
      if char is space → keep space
      else if elapsed >= settleTimes[i] → final char
      else → pickScrambleChar(pool)
  isScrambleComplete(settleTimes, elapsed) → bool

start animation:
  if prefersReduced: display = text; bail
  settleTimes = computeSettleTimes(text.length, duration, order)
  display = getDisplayString(text, settleTimes, 0, pool)  // paint a fully-scrambled frame first
  isAnimating = true
  if delay > 0: setTimeout(begin, delay) else begin()

  begin():
    startTime = performance.now()
    rafLoop(now):
      elapsed = now - startTime
      display = getDisplayString(text, settleTimes, elapsed, pool)
      if isScrambleComplete(settleTimes, elapsed):
        display = text; isAnimating = false; stop
      else:
        rafHandle = requestAnimationFrame(rafLoop)

on pointerenter:
  if replayOnHover and not isAnimating: startScramble()

on unmount:
  cancelAnimationFrame(rafHandle); clearTimeout(delayHandle)
```

The component itself is thin: build the settle-time array once, then run an rAF loop that calls a pure `getDisplayString` each frame.

## The Core Concept: Per-Character Settle Times

The trick that gives the effect its rhythm is precomputing one timestamp per character — the `settleTimes` array. Each entry says "at this many milliseconds into the animation, this character stops scrambling and shows its final glyph". The rAF loop then becomes embarrassingly simple: read `elapsed`, ask each character whether its time has come.

```
text       = "DECODED"
duration   = 1500ms
order      = 'left-to-right'

i  char  settleTime          elapsed:  0    400   800   1200  1500
0  D     214  ms              ────────  ░     D     D     D     D
1  E     429  ms              ────────  ▒     ▒     E     E     E
2  C     643  ms              ────────  ░     ▓     C     C     C
3  O     857  ms              ────────  ▓     ░     ▒     O     O
4  D     1071 ms              ────────  ▒     ▒     ░     D     D
5  E     1286 ms              ────────  ░     ▓     ▒     ░     E
6  D     1500 ms              ────────  ▓     ░     ▒     ▓     D

  ░ ▒ ▓ = randomly picked glyphs from the pool at that frame
```

For `'random'` order, settle times are uniform-random in `[0, duration]`, which produces the chaotic "letters lock in unpredictable order" feel rather than the orderly left-to-right reveal.

The functions are split out as pure exports (`pickScrambleChar`, `computeSettleTimes`, `getDisplayString`, `isScrambleComplete`) so unit tests can pass a deterministic `rng = () => 0` and assert the exact sequence without rendering anything.

## Performance

- One rAF loop while scrambling; cancelled the moment `isScrambleComplete` returns true.
- The visible string updates a **single text node** — no per-letter `<span>` tree, so DOM cost stays flat regardless of text length.
- No layout reads (`getBoundingClientRect`, `offsetWidth`, etc.) during the animation, so no forced reflows.
- `font-variant-numeric: tabular-nums` and a hairline `letter-spacing` keep proportional fonts from "wobbling" as glyph widths change between frames.

## CSS Animation Strategy

ScrambledText is JS-driven for the scramble itself (the random glyph pick has no CSS analogue), so the CSS layer stays minimal: a `display: inline-block` wrapper, `tabular-nums` for predictable digit width, and a `0.95` opacity nudge while `is-animating` to make the reveal feel slightly muted compared to the resting text. The settled string then snaps to full opacity, giving the eye a subtle "lock-in" moment without any explicit transition.

## State Flow Diagram

```
  [idle]
     │  autoStart on mount     replayOnHover pointerenter
     ▼
  [animating]  ── rAF tick ──┐
     │                       │
     │  for each char:       │
     │   elapsed >= settle?  │
     │     yes → final glyph │
     │     no  → pick random │
     │                       │
     ◀───────────────────────┘
     │
     │  isScrambleComplete(elapsed) === true
     ▼
  [settled]   display = text; isAnimating = false

  prefers-reduced-motion: reduce
       └─ skip [animating], paint final text once.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | The final string to land on. |
| `duration` | `number` | `1500` | Total scramble length in milliseconds. |
| `pool` | `string` | `'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'` | Pool of glyphs picked from while scrambling. |
| `order` | `'left-to-right' \| 'random'` | `'left-to-right'` | How per-character settle times are distributed. |
| `replayOnHover` | `boolean` | `false` | Restart the scramble when the pointer enters the wrapper. |
| `autoStart` | `boolean` | `true` | Run the scramble on mount; otherwise render the final text and wait for `replayOnHover`. |
| `delay` | `number` | `0` | Milliseconds to wait after `start` is requested before the first rAF tick. |
| `class` | `string` | `''` | Extra classes on the wrapper span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `text` prop | `computeSettleTimes` returns `[]`; `isScrambleComplete` is true immediately and no rAF loop starts. |
| Single-character `text` | `settleTimes` is `[duration]` regardless of `order`; the lone character locks in at the very end. |
| Empty `pool` | `pickScrambleChar` returns `''`; mid-scramble the character renders blank, then resolves to its final glyph at settle time. |
| User has `prefers-reduced-motion: reduce` | `display = text` immediately; rAF never starts, no flicker. |
| `replayOnHover` triggered while still animating | The hover handler bails out (`if (!isAnimating)`); current run completes before another can start. |
| Component unmounts mid-animation | `onMount` teardown calls `cancelTimers()`, cancelling both the rAF handle and any pending `setTimeout`. |
| Spaces in `text` | Spaces are passed through verbatim — they never scramble — so word boundaries remain readable as the rest of the string decodes. |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `onMount` for lifecycle.
- Zero external dependencies — pure JS state machine + `requestAnimationFrame`.

## File Structure

```
src/lib/components/ScrambledText.svelte   # implementation
src/lib/components/ScrambledText.md       # this file (rendered inside ComponentPageShell)
src/lib/components/ScrambledText.test.ts  # vitest unit tests for the pure helpers
src/routes/scrambledtext/+page.svelte     # demo page
```
