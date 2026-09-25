# GsapRevealSequence - Technical Logic Explainer

## What Does It Do? (Plain English)

GsapRevealSequence is a wrapper that fades and slides its children in one after another when the component mounts. Mark the elements you want sequenced with `data-gsap-item` (or pass your own selector) and they arrive in order — heading, then paragraph, then buttons — without you writing a timeline for every section.

**Think of it like:** a stage manager cueing actors on to the stage one by one, rather than everyone walking on at once.

---

## How It Works (Pseudo-Code)

```
WHEN component renders (server or client):
  1. RENDER children inside <div class="gsap-reveal-sequence" style="display: contents">
     (content is fully visible in the SSR HTML)

WHEN component mounts:
  1. LAZY-LOAD gsap via loadGsap()
  2. IF unmounted before it resolves → stop
  3. targets = resolveRevealTargets(root, selector)
       - every descendant matching selector, OR
       - every direct child element if nothing matches
  4. IF no targets → stop
  5. IF prefers-reduced-motion:
       gsap.set(targets, final visible state) → stop
  6. offset = revealOffset(axis, distance)       # { x: distance, y: 0 } or { x: 0, y: distance }
  7. INSIDE gsap.context(root):
       fromTo(targets,
              { autoAlpha: 0, ...offset },
              { autoAlpha: 1, x: 0, y: 0, delay, duration, stagger, ease,
                clearProps: 'transform,opacity,visibility' })

WHEN component unmounts:
  1. cancelled = true
  2. context.revert()     # undoes every tween and inline style it created
```

---

## The Core Concept: Scoped GSAP Contexts

Page-level animation code tends to leak: selectors hit elements in other components and tweens survive navigation. `gsap.context(fn, root)` solves both.

```
  ┌─ gsap-reveal-sequence (root) ──────────────┐
  │  <h2 data-gsap-item>   ← targeted  (0.00s) │
  │  <p  data-gsap-item>   ← targeted  (0.08s) │
  │  <div data-gsap-item>  ← targeted  (0.16s) │
  └────────────────────────────────────────────┘
  <h2 data-gsap-item> elsewhere on the page     ← NOT targeted
```

- Selectors resolve only inside `root`.
- Every tween created inside the context is recorded, so a single `context.revert()` on unmount cleans the lot.
- `clearProps` removes the inline transform/opacity after the tween finishes, so the final state is plain CSS again.

Because the root uses `display: contents`, the wrapper adds no box of its own — children lay out exactly as if the wrapper were not there.

---

## CSS Animation Strategy

The tween only animates `autoAlpha` (opacity + visibility) and `x`/`y` transforms, so it stays on the compositor and never triggers layout. Timing for target *n* is:

```
start(n) = delay + n × stagger
end(n)   = start(n) + duration
```

With the defaults (`delay 0`, `stagger 0.08`, `duration 0.7`) five items finish by 1.02s.

Under `prefers-reduced-motion: reduce`, targets are set straight to their final visible state — nothing moves.

---

## State Flow Diagram

```
   ┌──────────────────┐   mount + gsap loaded   ┌──────────────────────┐
   │  STATIC          │ ──────────────────────▶ │  RESOLVE TARGETS     │
   │  SSR content     │                         │  selector or children│
   │  fully visible   │                         └──────────┬───────────┘
   └──────────────────┘                                    │
                                        none found ◀───────┼───────▶ found
                                        (stay static)      │
                                                           ▼
                                             reduced motion?
                                  yes ◀──────────────────────────────▶ no
                                   │                                   │
                                   ▼                                   ▼
                          ┌─────────────────┐              ┌──────────────────────┐
                          │  SET FINAL      │              │  REVEALING           │
                          │  (no movement)  │              │  staggered fromTo    │
                          └─────────────────┘              └──────────┬───────────┘
                                                                      │ done
                                                                      ▼
                                                             REVEALED (props cleared)

   Unmount at any point → context.revert()
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Content to reveal. |
| `selector` | `string` | `'[data-gsap-item]'` | CSS selector for targets inside the root; falls back to direct children when nothing matches. |
| `axis` | `'x' \| 'y'` | `'y'` | Direction the items slide in along. |
| `distance` | `number` | `28` | Starting offset in pixels; negative values slide from the opposite side. |
| `duration` | `number` | `0.7` | Seconds each item takes to arrive. |
| `delay` | `number` | `0` | Seconds before the first item starts. |
| `stagger` | `number` | `0.08` | Seconds between each item's start. |
| `ease` | `string` | `'power3.out'` | Any GSAP ease string. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

### Exported helpers

| Export | Purpose |
|--------|---------|
| `resolveRevealTargets(root, selector)` | Returns matching descendants, or direct children as a fallback. |
| `revealOffset(axis, distance)` | Returns the `{ x, y }` starting offset; non-finite distances become `0`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| No element matches `selector` | Every direct child element is revealed instead. |
| No children at all | Nothing is animated; the component renders an empty wrapper. |
| `distance` is `NaN` or `Infinity` | Treated as `0`, so items only fade. |
| Unmounted before GSAP finishes loading | The `cancelled` flag stops the reveal from starting. |
| `prefers-reduced-motion: reduce` | Targets jump to their final visible state immediately. |
| JavaScript disabled / GSAP fails | Content stays visible — nothing is hidden until the tween starts. |
| Children added after mount | Not revealed; the sequence runs once. Wrap in `{#key}` to replay. |

---

## Dependencies

- **Svelte 5.x** — runes, snippets and `onMount`.
- **`gsap`** — dynamically imported via `$lib/gsapMotion` for the stagger and `gsap.context` clean-up.
- **`$lib/gsapMotion`** — tiny helper (`loadGsap`, `prefersReducedMotion`); copy it alongside the component.

---

## File Structure

```
src/lib/components/GsapRevealSequence.svelte     # implementation + exported helpers
src/lib/components/GsapRevealSequence.md         # this file (rendered inside ComponentPageShell)
src/lib/components/GsapRevealSequence.test.ts    # vitest unit tests
src/lib/gsapMotion.ts                            # shared GSAP loader + reduced-motion check
src/routes/gsap-suite/+page.svelte               # demo page (GSAP suite)
```
