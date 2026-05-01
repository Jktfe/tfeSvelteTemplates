# FloatingDock — Technical Logic Explainer

## What Does It Do? (Plain English)

A floating bar of icons at the bottom of the screen. As the cursor moves across it, the icon nearest the cursor swells up while its neighbours grow slightly less, producing the smooth wave effect made famous by the macOS dock. Tap it on a phone and it gives up on magnification entirely, becoming a simple horizontally-scrollable strip — touch input has no concept of "hover", so the gymnastics would be wasted there.

Think of it as a single soft hill of magnification that follows the mouse: the closer your cursor gets to an icon's centre, the taller it stands, and icons farther away gently slope back down to normal size.

## How It Works (Pseudo-Code)

```
state:
  mouseX     = null          // viewport X, or null when cursor is elsewhere
  isMobile   = window.innerWidth < 768
  itemEls[i] = bound DOM element per item

events:
  on resize:
    isMobile = window.innerWidth < 768

  on mousemove(e) over dock (skip if isMobile):
    mouseX = e.clientX

  on mouseleave dock:
    mouseX = null

derive scales[i]:
  if isMobile or mouseX is null: return 1                        // flat
  centerX = itemEls[i].getBoundingClientRect().left + width / 2
  dist    = mouseX - centerX
  if abs(dist) < magnificationDistance:
    return 1 + (magnification - 1) * cos((dist / distance) * (PI / 2))
  else:
    return 1                                                     // out of range

render:
  for each item i:
    style: --dock-scale = scales[i]
           --dock-size  = 40 * scales[i] px
```

The reactivity comes from a `$derived.by(...)` that recomputes the entire `scales[]` array whenever `mouseX` changes. CSS custom properties (`--dock-scale`, `--dock-size`) carry the result onto each `.dock-item`, so layout updates happen in the compositor with no per-icon re-render.

## The Core Concept: Cosine-Curve Magnification

The dock's "feel" lives in one line of trigonometry. The naïve approach — *"if the cursor is over me, scale to 2; otherwise stay at 1"* — produces a pop, not a wave. The cosine curve solves that by giving every icon within range a *graded* scale, falling off smoothly to 1 at the edges of the influence radius.

```
scale = 1 + (magnification − 1) × cos( (dist / distance) × (π / 2) )

where:
  dist     = horizontal distance from cursor to icon centre (pixels)
  distance = the influence radius prop (default 140 px)
  magnification = peak scale at dist = 0 (default 2)
```

Plotting `scale` against `dist`, with `distance = 140` and `magnification = 2`:

```
2.0 │ ●
    │   ●
1.5 │     ●
    │       ● ●
1.0 │           ● ● ● ─────────────
    └────────────────────────────── dist (px)
    0       70     140
```

`cos(0) = 1` makes the icon directly under the cursor reach exactly `magnification`. `cos(π/2) = 0` makes icons at the edge of the influence radius reach exactly `1`. Every value in between sits on the upper half of a cosine wave — a gentle, decelerating slope that the eye reads as "natural" rather than "scripted".

Why `cos` and not `1 − dist / distance` (a linear ramp)? The linear ramp gives the same boundary values but feels mechanical because the rate of change is constant. The cosine ramp is fastest in the middle and slowest at the boundaries, which mimics the easing your nervous system expects from physical motion.

## CSS Animation Strategy

The magnification is **JS-driven, CSS-applied**. JavaScript writes two CSS custom properties per item per frame; CSS transitions smooth the visible change.

```css
.dock-item {
  --dock-scale: 1;
  --dock-size: 40px;
  width: var(--dock-size);
  height: var(--dock-size);
  transition: width 0.1s ease-out, height 0.1s ease-out;
  transform-origin: bottom; /* icons grow upwards, like macOS */
}

.dock-icon {
  transform: scale(var(--dock-scale));
  transition: transform 0.1s ease-out;
}
```

Two important moves:

- **`transform-origin: bottom`** anchors growth to the dock's baseline so icons rise *above* the bar instead of bursting outward equally — this is the difference between "macOS dock" and "magnifying glass".
- **The `0.1s` transition is short on purpose.** It's just long enough to smooth the gap between mouse-move ticks (typically 60Hz) without lagging behind the cursor. A longer duration would feel rubbery.

Reduced motion gets a hard kill switch:

```css
@media (prefers-reduced-motion: reduce) {
  .dock-item, .dock-icon, .dock-tooltip {
    transition: none !important;
    --dock-scale: 1 !important;
    --dock-size: 40px !important;
  }
}
```

The `!important` is necessary because the inline-style `--dock-scale` written by Svelte would otherwise win the cascade.

## Performance

Per frame the component does:

- One `mousemove` handler call (`mouseX = e.clientX`)
- One `$derived.by(...)` recomputation that maps over `items.length` (typically 4–10)
- One `getBoundingClientRect()` per item (cheap; called from a derived, not a layout-thrashing loop)
- Two CSS custom-property writes per item

There are **no `IntersectionObserver`s, `ResizeObserver`s, or `MutationObserver`s**, no `requestAnimationFrame` loops, no DOM mutations. The cost scales linearly with `items.length` and is bounded by mouse-move frequency. On a 60Hz display with 8 items the dock is effectively free.

The mobile path skips all the math (`isMobile` guard returns `1` from `calculateScale` immediately), so phones never pay for desktop interactions they can't trigger.

## State Flow Diagram

```
              ┌────────────────────┐
              │  mouseX = null     │  ── initial / cursor outside dock
              │  scales = [1, 1…]  │
              └─────────┬──────────┘
                        │ mouseenter / mousemove (desktop only)
                        ▼
              ┌────────────────────┐
              │  mouseX = clientX  │  ── derived recomputes scales[]
              │  scales updated    │
              └─────────┬──────────┘
                        │ mousemove
                        │   ↺ same state, scales[] re-derives
                        │
                        │ mouseleave
                        ▼
              ┌────────────────────┐
              │  mouseX = null     │
              │  scales reset      │
              └────────────────────┘

  resize ─────►  isMobile flag flips ────►  scales pinned to 1
                                            (CSS overrides --dock-* vars)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FloatingDockItem[]` | `FALLBACK_DOCK_ITEMS` | Navigation items to render. Each needs `id`, `title`, `icon` and optional `href`. |
| `magnification` | `number` | `2` | Peak scale factor for the icon directly under the cursor. `1` disables the effect. |
| `distance` | `number` | `140` | Pixel radius around the cursor inside which icons receive any magnification. |
| `class` | `string` | `''` | Extra classes appended to the dock container. |

The `FloatingDockItem` type:

```typescript
interface FloatingDockItem {
  id: string | number;
  title: string;     // tooltip + aria-label
  icon: string;      // emoji or character; rendered in a <span aria-hidden>
  href?: string;     // omit for non-navigational items
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Window narrower than 768 px on initial mount | Dock renders in mobile mode immediately — no flash of magnified state. |
| Window resized across the 768 px breakpoint | `isMobile` flips on resize; CSS variables pinned to neutral values; no JS errors. |
| Item has no `href` | `<a>` falls back to `href="#"`. Click-handling is the caller's responsibility — wrap with a snippet or use a different component if you need plain buttons. |
| User has `prefers-reduced-motion: reduce` | Transitions disabled; magnification CSS variables forced to neutral. The component is fully static. |
| `items` array changes at runtime | `itemElements` array follows via `bind:this`; new items default to scale `1` until the cursor passes over them. |
| Cursor leaves the dock fast | `mouseleave` fires; `mouseX = null`; all scales transition back to `1` over `100ms`. |
| Touch device with no mouse events | `mousemove` never fires, `mouseX` stays `null`, scales stay flat — the desktop path becomes a no-op rather than misbehaving. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived.by`, `bind:this` and snippets. The reactive `scales[]` array is the heart of the component.
- Zero external dependencies — pure CSS for animation, no motion library, no icon library (icons are caller-supplied strings).

## File Structure

```
src/lib/components/FloatingDock.svelte         # implementation
src/lib/components/FloatingDock.md             # this file (rendered inside ComponentPageShell)
src/routes/floatingdock/+page.svelte           # demo page
src/lib/types.ts                               # FloatingDockProps + FloatingDockItem
src/lib/constants.ts                           # FALLBACK_DOCK_ITEMS sample data
```
