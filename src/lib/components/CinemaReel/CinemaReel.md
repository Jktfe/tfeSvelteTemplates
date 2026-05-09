# CinemaReel — Technical Logic Explainer

## What Does It Do? (Plain English)

A vertical reel of stills (photos, illustrations, gradients) where each frame becomes the "active" one as you scroll it past the middle of the screen. While a frame is active its top/bottom black letterbox bars retract slightly and its image regains full saturation; while it's inactive the bars close in and the image dims. The effect is winding through a film roll.

Use it for portfolio "scenes from the project" sections, kinetic about pages, or editorial features where each still earns its own scroll-stop.

## How It Works (Pseudo-Code)

```
state:
  activeId = null
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

on mount:
  observer = new IntersectionObserver(entries => {
    visible = entries
      .filter(e => e.isIntersecting && e.intersectionRatio >= activeThreshold)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
    if (visible[0]) activeId = visible[0].target.dataset.stillId
  }, { threshold: [activeThreshold, 0.75, 1] })

  for each frame element: observer.observe(frame)
  return () => observer.disconnect()

render per still:
  <figure class="cr-frame" class:cr-frame--active={activeId === still.id}>
    <div class="cr-stage">
      <img class="cr-image" /> | <div class="cr-image cr-image--gradient" />
      <div class="cr-mask cr-mask--top" />
      <div class="cr-mask cr-mask--bottom" />
    </div>
    <figcaption class="cr-caption">…</figcaption>
  </figure>
```

## The Core Concept: IntersectionObserver as a Scroll Driver

Most "active section as you scroll" effects reach for a scroll-event listener — `window.addEventListener('scroll', ...)` — and throttle it through requestAnimationFrame. That works but it's a queued event with measurement work every frame; on long pages with dense sections it gets expensive.

CinemaReel sidesteps that with `IntersectionObserver`. Each frame is observed; the observer fires only when a frame's visible ratio crosses one of the configured thresholds. The browser does the geometry; the component just receives "this entry is visible at 75% now". Picking the entry with the highest intersectionRatio gives the active frame, and Svelte 5's `$state` re-renders the right `--active` class.

```
threshold: [activeThreshold, 0.75, 1]
        │            │       │   └── fully visible — definite active
        │            │       └────── strong contender
        │            └────────────── lowest "could become active" trigger
        └─────────────────────────── 0.55 by default — over half visible
```

The component never measures scroll position, never throttles a callback, never reads layout. The only state mutation is `activeId = ...` inside the observer callback, and Svelte 5 fine-grained reactivity restricts the DOM update to the two frames whose `class:cr-frame--active` actually flipped.

## CSS Animation Strategy: GSAP-Driven, Class-Pinned Fallback

The letterbox bars are two `<div>`s positioned absolutely at the top and bottom of `.cr-stage` with `height: var(--letterbox)`. The image inside the stage starts at `transform: scale(1.02)` with `filter: saturate(0.85) contrast(1.05) brightness(0.78)` — the resting state.

When `activeId` flips, a Svelte 5 `$effect` runs:

```
on activeId change:
  if (lastActiveId) animateFrame(lastActiveId, 'leave')
  if (activeId)     animateFrame(activeId,    'enter')

animateFrame(id, kind):
  enter → gsap.to(image,   { filter: '…full saturation…', scale: 1,    duration: 0.7, ease: 'power2.out' })
          gsap.to(masks,   { height: 'calc(letterbox * 0.55)',          duration: 0.55, ease: 'power3.out' })
          gsap.to(caption, { opacity: 1,                                 duration: 0.45, ease: 'power2.out' })
  leave → gsap.to(image,   { filter: '…dim saturation…',  scale: 1.02, duration: 0.5, ease: 'power2.inOut' })
          gsap.to(masks,   { height: 'letterbox',                       duration: 0.45, ease: 'power3.inOut' })
          gsap.to(caption, { opacity: 0.65,                              duration: 0.4, ease: 'power2.inOut' })
```

CSS transitions on the same properties are deliberately absent — they would fight with the GSAP tweens (gsap sets inline-style, CSS transition fires on inline-style change, both run at once). The component is GSAP-driven for the visible motion; CSS holds only the resting state and the prefers-reduced-motion fallback.

The reduced-motion path: `prefersReduced` is set in `onMount`, the `$effect` early-returns before calling gsap, and a `.cr-frame--reduced.cr-frame--active` CSS rule pins the active visuals statically — no animation, but the right end-state.

## State Flow Diagram

```
            ┌────────────────────────────────┐
            │  IntersectionObserver entries  │
            └───────────────┬────────────────┘
                            │  filter intersectionRatio >= threshold
                            │  sort desc by ratio
                            ▼
                  ┌─────────────────────┐
                  │  activeId = best.id │
                  └──────────┬──────────┘
                             │  Svelte 5 fine-grained reactivity
                             ▼
       ┌─────────────────────┴───────────────────────┐
       │                                              │
   prev active frame                          new active frame
   class:cr-frame--active = false             class:cr-frame--active = true
       │                                              │
       ▼                                              ▼
   image dim, mask bars close                image bright, mask bars open
   caption fade to 65% opacity               caption fade to 100% opacity
```

## Props Reference

| Prop                | Type                    | Default          | Description                                                        |
|---------------------|-------------------------|------------------|--------------------------------------------------------------------|
| `stills`            | `CinemaReelStill[]`     | required         | Array of stills in display order.                                  |
| `letterboxRatio`    | `number`                | `0.18`           | Top/bottom bar height as a fraction of the frame's height (0–0.45). Active frames render at 55% of this. |
| `activeThreshold`   | `number`                | `0.55`           | IntersectionObserver ratio at which a frame is considered active.  |
| `ariaLabel`         | `string`                | `'Cinema reel'`  | aria-label on the wrapper.                                         |
| `class`             | `string`                | `''`             | Extra classes on the outer container.                              |

`CinemaReelStill` shape: `{ id, image?, alt?, title?, caption?, scene?, color? }` — see `$lib/types`.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `IntersectionObserver` is unavailable (very old browser, SSR) | The component falls back to setting `activeId` to `stills[0].id` so the first frame renders active — no blank stage. |
| `still.image` omitted | Renders a gradient using `still.color` as the base tint (fallback `#1f2937`). Useful for placeholder reels. |
| `still.alt` omitted but `still.title` present | The `<img alt>` falls back to `title`. |
| All frames intersect at once (very tall viewport) | The observer sorts by `intersectionRatio` so the most-visible one wins. |
| User has `prefers-reduced-motion: reduce` | All transitions disabled; active state snaps in. The `cr-frame--reduced` class also pins the image transform to `none`. |
| Same `still.id` appears twice | Each-loop key collision; expect `each_key_duplicate` runtime warning. Keep ids unique. |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, `$effect`, `onMount` action wiring.
- **`gsap` core** (already a project dep) — drives the eased transitions on filter / scale / mask height / caption opacity via `gsap.to`. No GSAP business plugins (no ScrollTrigger / Flip / Draggable / SplitText).
- **`IntersectionObserver`** — picks the active frame as it crosses centre. Universally supported (since 2017 in evergreen browsers).
- **No CSS transitions on the gsap-driven properties** — they would fight the gsap inline-style writes. The CSS holds the resting state and the `.cr-frame--reduced.cr-frame--active` static fallback for `prefers-reduced-motion`.

## File Structure

```
src/lib/components/CinemaReel/CinemaReel.svelte    # implementation
src/lib/components/CinemaReel/CinemaReel.md        # this file
src/lib/components/CinemaReel/CinemaReel.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                                   # CinemaReelStill + CinemaReelProps
```
