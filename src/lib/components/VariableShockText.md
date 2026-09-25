# VariableShockText — Technical Logic Explainer

## What Does It Do? (Plain English)

VariableShockText turns a line of display copy into a row of individual letters that gently breathe while idle, then jolt outward in a ripple when you tap, click or press Enter on them. Each letter lifts, tilts and swells in weight before springing back into place, with the ripple starting from the letter you touched.

**Think of it like:** dropping a pebble into a pond made of letters. The splash happens where the pebble lands, and the ring spreads out from there before the surface settles.

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. SPLIT text into glyphs (one per code point, spaces flagged)
  2. RENDER each glyph as an aria-hidden <span data-shock-char>
  3. LAZY-LOAD gsap (dynamic import, so SSR never touches it)
  4. IF idle AND motion allowed:
       START a looping yoyo tween on every glyph
         (--shock-wght 520 → 720, y 0 → -2px, staggered from centre)

WHEN pointerdown on the button:
  1. FIND which glyph span was hit → origin index
  2. IF not a glyph → origin = middle of the word
  3. triggerShock(origin)

WHEN keydown Enter or Space:
  1. preventDefault (Space would otherwise scroll the page)
  2. triggerShock(middle)

triggerShock(origin):
  1. IF gsap not loaded OR prefers-reduced-motion → do nothing
  2. PAUSE the idle tween, kill any running glyph tweens
  3. CLAMP intensity to 0.25 … 2.5
  4. TIMELINE:
       beat 1 (0.22s): wght 900, wdth 122, lift + tilt by distance from origin
       beat 2 (0.7s elastic): settle back to wght 520, wdth 100, y 0, rotation 0
  5. ON complete → restart idle motion

WHEN component unmounts:
  1. CANCEL the pending gsap import
  2. KILL the idle tween and any glyph tweens
```

---

## The Core Concept: Distance-Weighted Ripples

The ripple feels physical because every letter's reaction is scaled by how far it sits from the letter you hit. `distanceFromOrigin(index, origin)` is simply `|index − origin|`, and the two beat-one properties use it differently:

```
lift(index)     = -max(4, 18 - distance × 2) × intensity   (px)
rotation(index) = sign × max(2, 10 - distance)             (deg)
                  sign = -1 left of origin, +1 right of origin
```

Worked example with `text="SHOCK"`, clicking the `O` (origin = 2), intensity 1:

```
glyph      S     H     O     C     K
distance   2     1     0     1     2
lift      -14   -16   -18   -16   -14   px
rotation  -8°   -9°   +10°  +9°   +8°
```

The origin letter jumps highest, neighbours lean *away* from it, and the `max(...)` floors make sure even the far end of a long headline still twitches a little instead of sitting dead still. GSAP's `stagger: { from: origin }` then delays each glyph by its distance, so the wave visibly travels outwards.

---

## CSS Animation Strategy

Only compositor-friendly properties move:

| Property | Why it is cheap |
|---|---|
| `transform` (y, rotation) | GPU-composited, no layout |
| `--shock-wght` / `--shock-wdth` | Custom properties feeding `font-variation-settings` on the button |

Variable-font axes do trigger a text re-shape, but only for the handful of glyphs in a headline, which stays well within a 60fps budget. Each glyph span carries `will-change: transform, font-variation-settings` so the browser promotes them once, up front.

If the consumer's font has no `wght` / `wdth` axes the variation settings are ignored and you still get the lift-and-tilt ripple, so the effect degrades gracefully to "bouncy letters".

### Reduced Motion

`prefersReducedMotion()` from `$lib/gsapMotion` is checked at the start of both `startIdleMotion()` and `triggerShock()`. When it returns true neither tween is ever created. A CSS belt-and-braces rule (`transform: none !important` on the glyphs) also guarantees nothing is left mid-pose if the preference flips while a tween is running.

---

## State Flow Diagram

```
                ┌───────────────┐
                │   LOADING     │  gsap not yet imported
                │ (static text) │
                └───────┬───────┘
                        │ gsap resolved
          reduced motion│or idle=false
           ┌────────────┴────────────┐
           ▼                         ▼
   ┌───────────────┐         ┌───────────────┐
   │    STILL      │         │     IDLE      │  looping breathe tween
   │ (no tweens)   │         │  (yoyo, ∞)    │
   └───────┬───────┘         └───────┬───────┘
           │ pointer / Enter         │ pointer / Enter / Space
           │ (motion allowed)        │
           └────────────┬────────────┘
                        ▼
                ┌───────────────┐
                │    SHOCK      │  2-beat timeline from origin
                └───────┬───────┘
                        │ onComplete
                        ▼
                  back to IDLE (or STILL when idle=false)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | The copy to split into shockable glyphs |
| `ariaLabel` | `string` | `text` | Accessible name for the button (glyph spans are hidden from assistive tech) |
| `idle` | `boolean` | `true` | Run the gentle breathing loop between shocks |
| `intensity` | `number` | `1` | Multiplier for the lift distance, clamped to `0.25 … 2.5` |
| `class` | `string` | `''` | Extra classes forwarded to the button |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `text` | Renders an empty button; shocks are no-ops because there are no glyphs |
| Text with spaces | Spaces render as `&nbsp;` spans with a fixed `0.32em` width so words keep their gap |
| Emoji / astral characters | `Array.from` splits by code point, so emoji stay whole rather than splitting surrogate pairs |
| Pointer lands between glyphs | Origin falls back to the middle of the word |
| Rapid repeated clicks | Each shock kills in-flight glyph tweens before starting, so they never stack |
| `intensity` of 0 or 100 | Clamped to 0.25 or 2.5 respectively |
| Unmount before gsap loads | A `cancelled` flag stops the late import from starting tweens on a dead node |
| `prefers-reduced-motion: reduce` | No idle loop, no shock; the text stays perfectly still and readable |

---

## Dependencies

- **gsap** (external): drives the idle loop and the two-beat shock timeline; loaded lazily via `loadGsap()` so SSR and first paint never wait for it
- **$lib/gsapMotion**: `loadGsap()` and `prefersReducedMotion()` helpers
- **Svelte 5**: `$props`, `$derived`, `onMount`

---

## File Structure

```
VariableShockText.svelte       # The component (+ exported splitTextForShock / distanceFromOrigin helpers)
VariableShockText.test.ts      # Unit + interaction tests
VariableShockText.md           # This explainer
GsapSuite.test.ts              # Shared GSAP-suite helper tests (also covers the split helper)
```
