# Marquee — Technical Logic Explainer

## What Does It Do? (Plain English)

Marquee creates an endlessly scrolling horizontal (or vertical) strip of arbitrary content — logos, testimonials, headlines, cards. Pure CSS keyframe animation translates a row of duplicated children across the visible window forever; pause-on-hover is `animation-play-state: paused`; reverse direction is `animation-direction: reverse`. Unlike `TickerTape` (which is structured items only), `Marquee` is a content-agnostic Snippet wrapper — drop anything inside.

Think of it as a sushi conveyor belt: dishes (your children) keep gliding past the visible window, and you can hover to peek at one without it sliding away.

## How It Works (Pseudo-Code)

```
state:
  containerEl   = bound DOM ref (the visible window)
  contentEl     = bound DOM ref (the FIRST child copy, used for measurement)
  actualRepeat  = computed copy count, starts at the `repeat` prop floor

derive:
  none — every visual is encoded in CSS classes

on mount:
  requestAnimationFrame:
    calculateRepeat()         // first measurement after layout settles
  ResizeObserver(containerEl):
    on resize → calculateRepeat()  // container can grow on viewport change
  cleanup: resizeObserver.disconnect()

calculateRepeat():
  if !containerEl or !contentEl: bail
  containerSize = vertical ? containerEl.offsetHeight : containerEl.offsetWidth
  contentSize   = vertical ? contentEl.offsetHeight   : contentEl.offsetWidth
  if contentSize <= 0: bail
  // Need 3× container worth of content (one going out, one in view, one coming in),
  // plus the gap between copies, rounded up.
  minCopies     = ceil((containerSize * 3) / contentSize) + 1
  actualRepeat  = max(4, minCopies, repeat)

render:
  <div class="group flex overflow-hidden" style="--duration:{duration}s; --delay:-{duration/2}s">
    <div bind:this={contentEl} class="animate-marquee ...">  <!-- copy 0: measured -->
      {@render children?.()}
    </div>
    {#each {length: actualRepeat - 1}}
      <div class="animate-marquee ...">                       <!-- copies 1..n-1 -->
        {@render children?.()}
      </div>
    {/each}
  </div>

CSS (Tailwind config):
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(-100% - var(--gap))); }
  }
  .animate-marquee { animation: marquee var(--duration) linear infinite; }
  .group:hover .animate-marquee { animation-play-state: paused; }     // when pauseOnHover
  .animate-marquee[direction:reverse]                                 // when reverse
```

## The Core Concept: Dynamic Repeat Count for Seamless Loop

A single-copy marquee jumps when the keyframe restarts (the strip teleports back to `0` and the user sees the gap). A two-copy marquee mostly works for content wider than the container, but breaks for short content where the gap is visible while one copy is exiting. The library variants like SwiftUI's marquee solve this by hardcoding 4 copies; that's wasteful for long content and still wrong for short content if the container is wide enough.

`Marquee` measures both at runtime and picks an exact count:

```
  containerSize = 1200px       (visible window)
  contentSize   =  300px       (one copy of children)

  We need enough copies that AS the strip animates from 0 → -100% - gap,
  the visible window always shows live content. That requires:
    one copy worth going OUT on the leading edge
  + one copy worth IN VIEW
  + one copy worth COMING IN on the trailing edge
  = 3× containerSize worth of strip.

  minCopies = ceil((1200 * 3) / 300) + 1 = 13
  actualRepeat = max(4, 13, repeat) = 13

  ┌────────────────────────────────────────────┐
  │ [chld] [chld] [chld] [chld] [chld] [chld]  │
  └────────────────────────────────────────────┘
       │             │             │
       │             │             └── coming IN (trailing buffer)
       │             └────────────── visible window
       └──────────────────────────── exiting OUT (leading buffer)
```

```
  Short content (single 80px logo) in a 1600px container:
  minCopies = ceil(1600 * 3 / 80) + 1 = 61
  actualRepeat = 61   — many tiny copies, never any visible gap

  Long content (1200px wide testimonial card) in a 320px container:
  minCopies = ceil(320 * 3 / 1200) + 1 = 2
  actualRepeat = max(4, 2, 4) = 4   — `repeat` floor wins
```

The first copy is bound (`contentEl`) and the rest are spread by `{#each}` so they all share the same animation, gap, and direction modifiers. The `--delay: -{duration/2}s` negative offset starts copies mid-animation so they're already in motion at mount, hiding the cold-start jump that some browsers show on the very first keyframe.

## CSS Animation Strategy

`@keyframes marquee` translates `0 → calc(-100% - var(--gap))` — exactly one content width plus the gap, so when the keyframe restarts the next copy lines up perfectly with where the first copy started. `linear` easing keeps velocity constant; any other curve would visibly accelerate or decelerate.

`pause-on-hover` is implemented through Tailwind's `group:hover` selector: the wrapper carries `class="group"`, each child carries `class="group-hover:[animation-play-state:paused]"`. No JS event listener — the browser handles it. `[animation-direction:reverse]` flips direction on `reverse=true`, again purely CSS.

For reduced-motion users, Tailwind's `motion-reduce:` variants (or the browser's `prefers-reduced-motion: reduce` media query in the keyframes config) cancel the animation, leaving the strip statically positioned at `translate(0)`.

## Performance

- One CSS keyframe animation per copy. All copies animate identically and the GPU compositor batches them.
- `transform` translates are paint-free on the layout thread; the animation never invalidates layout.
- `ResizeObserver` only fires on container size change. Quiet pages do nothing after mount.
- `actualRepeat` is the *minimum* copies needed; we don't over-render. The 4-copy floor is a safety net for cases where measurement returns 0 (e.g. content not yet laid out).
- Hover pause is free — a single CSS property flip via `:hover`.

## State Flow Diagram

```
  [mounted]
       │
       │ rAF → calculateRepeat()
       │ actualRepeat = max(4, minCopies, repeat)
       ▼
  [scrolling]   each copy animates 0 → calc(-100% - gap), looping forever
       │
       │ pauseOnHover && hover
       ▼
  [paused]   animation-play-state: paused
       │
       │ hover ends
       ▼
  [scrolling]
       │
       │ ResizeObserver fires (container resized)
       ▼
  recalc actualRepeat → re-render with new copy count
       │
       ▼
  [scrolling]   continues from current frame on the new strip

  prefers-reduced-motion: reduce
        │
        ▼
   [static]  animation suppressed, strip at translate(0)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pauseOnHover` | `boolean` | `false` | Pause the scroll while the pointer is over the wrapper. |
| `vertical` | `boolean` | `false` | Scroll vertically (`translateY`) instead of horizontally. |
| `repeat` | `number` | `4` | Minimum number of copies. Acts as a safety floor; the runtime calculation may render more. |
| `reverse` | `boolean` | `false` | Reverse scroll direction (`animation-direction: reverse`). |
| `duration` | `number` | `40` | Seconds for one full cycle. Lower = faster. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `children` | `Snippet` | — | Content snippet rendered inside each copy. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Content is wider than the container | `minCopies` from the formula may be `< 4`; the `max(4, ...)` floor keeps the animation seamless. |
| Container resizes (viewport, devtools docked) | `ResizeObserver` fires and `calculateRepeat()` recomputes; actualRepeat updates and Svelte re-renders the each-block. |
| Content has zero size at mount (font not loaded yet) | `calculateRepeat` bails (`contentSize <= 0`); `actualRepeat` stays at the prop default of `4`. Subsequent ResizeObserver calls fix it once the layout settles. |
| `vertical=true` with a fixed-height container | Same logic, just measuring `offsetHeight`. The `marquee-vertical` keyframe animates `translateY` instead. |
| `pauseOnHover=true` on a touch-only device | `:hover` on iOS triggers on first tap; the user gets one pause-tap, then a second tap proceeds normally. |
| User has `prefers-reduced-motion: reduce` | Combined with Tailwind `motion-reduce:` variants, the animation can be neutralised; the strip sits motionless. |
| Snippet renders nothing | First copy has `offsetWidth: 0`; calculation bails; the strip renders 4 empty copies and animates them invisibly. |
| `repeat` set very high (e.g. 100) | Acts as a floor; `actualRepeat = max(100, minCopies, 4)`. DOM cost scales linearly. |

## Dependencies

- **Svelte 5.x** — `$state`, `$props`, snippet (`children`) syntax, `onMount`.
- **TailwindCSS** — provides `animate-marquee`, `animate-marquee-vertical` keyframes from `tailwind.config.js`.
- **`$lib/utils`** — `cn` helper for class merging.
- **`ResizeObserver`** (native) — for runtime copy-count recalculation.
- Zero external animation libraries.

## File Structure

```
src/lib/components/Marquee.svelte    # implementation
src/lib/components/Marquee.md        # this file (rendered inside ComponentPageShell)
src/lib/components/Marquee.test.ts   # vitest unit tests
src/routes/marquee/+page.svelte      # demo page
tailwind.config.js                   # marquee + marquee-vertical keyframes
```
