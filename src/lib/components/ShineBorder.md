# ShineBorder — Technical Logic Explainer

## What Does It Do? (Plain English)

ShineBorder wraps any block of content in a border that has a bright stripe of colour sliding across it forever — the chrome-trim glint you see on premium product cards. There is no real CSS `border` involved: the wrapper paints a wide horizontal gradient, the inner content sits on a solid background that hides the centre of that gradient, and only the padding around the edge is left exposed. Animate the gradient's horizontal position and the exposed edge appears to shimmer.

Think of it like a theatre stage where the spotlight is twice as wide as the stage, sweeping in from the wings on the left and exiting through the wings on the right. The audience only sees the slice that crosses the stage — and because the spotlight enters and exits offstage, there is never a visible jump back to the start.

## How It Works (Pseudo-Code)

```
on render:
  read props: color, duration, borderWidth, borderRadius
  emit outer wrapper:
    background = linear-gradient(90deg, transparent, color, transparent)
    background-size = 200% 100%   // gradient is twice as wide as visible area
    padding = borderWidth          // padding becomes the visible "border" strip
    border-radius = borderRadius
    animation = shine-border-animation duration linear infinite
  emit inner content:
    background = solid (white)
    border-radius = borderRadius - borderWidth
    render { children }

@keyframes shine-border-animation:
  0%   → background-position = -200% 0   // bright band offstage left
  100% → background-position =  200% 0   // bright band offstage right
```

The component never touches JavaScript at runtime. Every shimmer you see is the browser's compositor smoothly interpolating one declarative property (`background-position`) on one element.

## The Core Concept: The "Padding-As-Border" Trick

Most CSS borders use the actual `border` property and so cannot show a gradient (CSS `border-image` works but is a different beast). ShineBorder gets around that with a layered sandwich:

```
┌────────────────────────────────────┐
│   wrapper — gradient background    │  ← only this layer is animated
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │   inner — solid background   │  ← covers the gradient's centre
│  │      { children render }     │
│  │                              │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
   ↑
   padding = borderWidth: this strip is NOT covered by the inner div,
   so it shows the wrapper's animated gradient — i.e. the "border".
```

The visible band of colour appears because the wrapper's gradient is `transparent → colour → transparent`. At any instant only one slice of that band is over the visible padding strip; sliding the gradient horizontally is what makes the slice travel around the frame.

Why a `200%`-wide gradient? If the gradient were only as wide as the wrapper, animating from `0%` to `100%` would require a snap back to `0%` to repeat, which the eye reads as a stutter. Going from `-200%` to `+200%` lets the bright band enter from offstage left, cross the visible area, and exit offstage right before the next loop begins entirely offstage — the loop is invisible.

## CSS Animation Strategy

Everything is GPU-friendly. The only animated property is `background-position`, which the compositor handles without triggering layout or paint on the inner content. The wrapper carries `will-change: background-position` so the browser hoists it to its own layer up front rather than promoting mid-animation.

```css
.shine-border-wrapper {
  background: linear-gradient(90deg, transparent, var(--shine-color), transparent);
  background-size: 200% 100%;
  animation: shine-border-animation var(--shine-duration) linear infinite;
  will-change: background-position;
}

@keyframes shine-border-animation {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
```

Reduced motion is documented in the component as a known TODO. The recommended override is:

```css
@media (prefers-reduced-motion: reduce) {
  .shine-border-wrapper { animation-duration: 0.01s; }
}
```

This freezes the gradient at its starting offset rather than disabling it entirely — the static band still reads as a styled border for users who would otherwise lose the visual cue.

## State Flow Diagram

```
                  ┌──────────────────────┐
                  │  initial render      │
                  │  CSS vars from props │
                  └──────────┬───────────┘
                             │
                             ▼
       ┌────────────────────────────────────────┐
       │  CSS animation begins (browser-driven) │
       │  background-position: -200% → +200%    │
       │  loops linearly forever                │
       └────────────────────────────────────────┘
                             │
              prop changes (color / duration / width / radius)
                             │
                             ▼
       ┌────────────────────────────────────────┐
       │  CSS custom properties re-emit         │
       │  animation continues from current pos  │
       └────────────────────────────────────────┘

       prefers-reduced-motion: reduce (recommended override)
                             │
                             ▼
       ┌────────────────────────────────────────┐
       │  duration ≈ 0s → effectively static    │
       └────────────────────────────────────────┘
```

There is no runtime state to track — the component is a thin bag of CSS variables wrapping a `{children}` render slot.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'#146ef5'` | Any CSS colour. Drives the gradient mid-stop. |
| `duration` | `number` | `3` | Seconds for one full sweep across the visible area. |
| `borderWidth` | `number` | `2` | Padding (px) around the inner content — this strip is the visible "border". |
| `borderRadius` | `number` | `8` | Corner radius (px) for the wrapper. The inner div uses `radius − width`. |
| `children` | `Snippet` | — | Wrapped content. Sits over the solid inner background. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `children` omitted | Empty bordered box renders. The shimmer still runs but there is no content slot. |
| `borderWidth = 0` | The inner div fills the wrapper exactly. The gradient is fully covered and you see no shine. |
| `borderRadius < borderWidth` | The inner radius is computed as `radius − width` and clamps to `0` in CSS — the inner corners become sharp while the outer keeps the requested radius. Content inside the inner div may sit awkwardly close to the edge; pad your child element. |
| `duration = 0` | Browsers treat it as no animation; the gradient renders frozen at its starting offset (`-200%` — band offstage left). Visually, the border appears solid-transparent. Avoid; use the reduced-motion override instead. |
| Very small wrapper (e.g. 24×24 px) | The 200% gradient is still wider than the wrapper — no visual problem — but the `borderRadius − borderWidth` calc may produce a tiny inner radius that looks inconsistent with the outer. |
| `prefers-reduced-motion: reduce` | Component does not yet honour this automatically. Consumers should either layer the recommended `@media` override, or omit ShineBorder for users with the preference set. |
| Multiple ShineBorders on one page | Each runs independently; there is no shared timer. They will drift out of phase, which usually looks better than synchronised shimmer. |

## Dependencies

- **Svelte 5** — `$props()` rune to read configuration; snippet slot for children.
- **Zero external libraries** — no animation library, no icon library, no framework. Pure CSS keyframes.
- **`$lib/types`** — `ShineBorderProps` interface for type safety across consumers.

## File Structure

```
src/lib/components/ShineBorder.svelte         # implementation
src/lib/components/ShineBorder.md             # this explainer (rendered in ComponentPageShell)
src/lib/components/ShineBorder.test.ts        # unit tests
src/routes/shineborder/+page.svelte           # demo page
src/lib/types.ts                              # ShineBorderProps interface
```
