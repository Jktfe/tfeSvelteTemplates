# Typewriter — Technical Logic Explainer

## What Does It Do? (Plain English)

Typewriter reveals a list of phrases one character at a time, holds each phrase for a beat, deletes it, and types the next. The blinking cursor sits at the trailing edge throughout. It is the classic "I am a developer / designer / human" hero-section effect — typed by code rather than recorded in a video.

Think of it as a tiny actor on stage with a teleprompter: the script (`phrases`) is fixed, but the cadence is yours to direct via `typeSpeed`, `deleteSpeed`, and `pauseDuration`.

## How It Works (Pseudo-Code)

```
state:
  displayText  = ''
  phraseIndex  = 0
  charIndex    = 0
  phase        = 'typing' | 'pausing' | 'deleting' | 'waiting'
  started      = startDelay > 0 ? false : true
  prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

derive currentPhrase = phrases[phraseIndex]

on mount:
  if startDelay > 0:
    timer = setTimeout(() => started = true, startDelay)

on every state change (single $effect):
  if not started or phrases empty: bail
  if prefersReducedMotion: displayText = currentPhrase; bail

  switch phase:
    typing:
      if charIndex < currentPhrase.length:
        after typeSpeed ms → charIndex++; displayText = slice(0, charIndex)
      else if not loop and last phrase:
        rest at full text  // never delete
      else:
        after pauseDuration ms → phase = 'pausing'

    pausing:
      → phase = 'deleting'  // explicit phase aids state-flow reasoning

    deleting:
      if charIndex > 0:
        after deleteSpeed ms → charIndex--; displayText = slice(0, charIndex)
      else:
        after 200ms → phase = 'waiting'

    waiting:
      phraseIndex = (phraseIndex + 1) mod phrases.length
      charIndex = 0
      phase = 'typing'

  cleanup: clearTimeout(timer)  // cancels in-flight tick on unmount / dep change
```

The whole machine lives in one `$effect`. Each branch sets exactly one timeout, and the cleanup function cancels it. Phase transitions schedule themselves; nothing runs in parallel.

## The Core Concept: Single-Effect State Machine

Naive typewriters use `setInterval` and a tangled mess of "am I deleting yet?" booleans. This component compresses the entire lifecycle into a four-phase finite state machine driven by one `$effect`.

```
  ┌─────────┐  charIndex == phrase.length   ┌──────────┐
  │ typing  │ ─────────────────────────────▶│ pausing  │
  └─────────┘                                └────┬─────┘
       ▲                                          │ 0ms
       │                                          ▼
       │                                     ┌──────────┐
  ┌────┴─────┐    charIndex == 0             │ deleting │
  │ waiting  │ ◀──────────────────────────── │          │
  └──────────┘                                └──────────┘
       │ 200ms tick → next phrase
```

The win: every `$effect` re-run reads the current `phase`, schedules exactly one timeout, and returns a cleanup. Svelte 5 invalidates the effect when any reactive dependency changes — so changing `phrases` mid-run cleanly cancels the in-flight tick and starts the new phase.

## CSS Animation Strategy

The cursor is pure CSS — no JS toggle, no `setInterval`. A 1s `step-end` keyframe alternates `opacity: 1 ↔ 0`, which produces the chunky on-off flicker of a real terminal cursor (linear easing would look like a soft pulse).

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
.typewriter-cursor { animation: blink 1s step-end infinite; }
```

Reduced-motion users skip the entire JS animation (`displayText = currentPhrase` once) **and** the cursor freezes at full opacity (`animation: none` in the `@media` block). No flicker, no movement.

## Performance

- One `setTimeout` outstanding at any time. No interval fan-out, no parallel timers.
- DOM is two `<span>`s: text and cursor. No per-character span tree, so re-renders are flat regardless of phrase length.
- `displayText = currentPhrase.slice(0, charIndex)` — string slicing is O(n) but n is the live phrase, which is small (UI text). No measurable cost.
- The cursor blink runs on the GPU compositor (opacity-only animation), so the JS thread stays free for the typing tick.

## State Flow Diagram

```
                  startDelay elapsed
  [waiting-to-start] ─────────▶ [typing]
                                   │
                                   │ charIndex == phrase.length
                                   ▼
                              [pausing]  (pauseDuration ms)
                                   │
                                   ▼
                              [deleting]
                                   │
                                   │ charIndex == 0
                                   ▼
                              [waiting]  (200ms)
                                   │
                                   ▼ phraseIndex = (i + 1) mod n
                              [typing]   (next phrase)

  prefers-reduced-motion: skip the whole graph, paint final text once.
  loop = false on last phrase: stop at end of [typing], no [pausing].
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `phrases` | `string[]` | required | Array of strings to cycle through. |
| `typeSpeed` | `number` | `80` | Milliseconds between typed characters. |
| `deleteSpeed` | `number` | `50` | Milliseconds between deleted characters. |
| `pauseDuration` | `number` | `2000` | Milliseconds to hold a fully-typed phrase before deleting. |
| `loop` | `boolean` | `true` | Cycle forever, or stop at the final phrase. |
| `showCursor` | `boolean` | `true` | Render the trailing blinking cursor. |
| `cursorChar` | `string` | `'\|'` | Glyph used for the cursor. |
| `startDelay` | `number` | `0` | Milliseconds to wait after mount before typing. |
| `class` | `string` | `''` | Extra classes on the wrapper span. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `phrases` is `[]` | Effect bails immediately — empty span renders, no timers scheduled. |
| `phrases` updates mid-run | `$effect` cleanup cancels the in-flight timeout; new run starts from the (still valid) current `phaseIndex` or wraps. |
| `loop = false` and final phrase typed | Effect returns without scheduling — cursor keeps blinking on the resting text. |
| User has `prefers-reduced-motion: reduce` | `displayText` snaps to `currentPhrase`; cursor animation freezes at opacity 1. Screen reader still gets the live `aria-label`. |
| Component unmounts during a tick | Cleanup runs `clearTimeout(timer)`; no orphan timer fires. |
| `typeSpeed = 0` | Each character ticks on the next event loop turn — visually instantaneous but each phrase still completes one phase at a time. |
| Surrogate-pair character (emoji) in a phrase | `slice` operates on code units, so a multi-unit emoji may reveal half-formed for one tick; for emoji-heavy text use `Array.from(phrase)` upstream. |

## Dependencies

- **Svelte 5.x** — single-`$effect` state machine relies on cleanup-function semantics.
- **`$lib/types`** — imports the shared `TypewriterProps` interface.
- Zero runtime dependencies otherwise — no `setInterval`, no animation library.

## File Structure

```
src/lib/components/Typewriter.svelte   # implementation
src/lib/components/Typewriter.md       # this file (rendered inside ComponentPageShell)
src/routes/typewriter/+page.svelte     # demo page
```
