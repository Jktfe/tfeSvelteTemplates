# ExpandingCard — Technical Logic Explainer

## What Does It Do? (Plain English)

ExpandingCard is a card that morphs between two layouts when clicked: a tall, vertical "compact" form with a square image above its heading, and a wide, horizontal "expanded" form with the image to the left of a longer body of text. The image, heading, and text don't fade in and out — they fly between positions. Click the card again and they fly back.

Think of it like a business card folding open: it's the same card, the same content, just rearranged with a smooth animation linking the two states.

## How It Works (Pseudo-Code)

```
state:
  layout         ∈ { 'compact', 'expanded' }       // starts at 'compact'
  send, receive = crossfade({ duration: 400 })     // a paired transition

events:
  on click card:
    layout = (layout === 'compact') ? 'expanded' : 'compact'

render:
  {#if layout === 'compact'}
    <div class="layout-a compact">
      <img out:send={{ key: 'image' }}    in:receive={{ key: 'image' }} />
      <h3  out:send={{ key: 'heading' }}  in:receive={{ key: 'heading' }} />
      <p   out:send={{ key: 'text' }}     in:receive={{ key: 'text' }}>{compactText}</p>
    </div>
  {:else}
    <div class="layout-a expanded">
      <img out:send={{ key: 'image' }}    in:receive={{ key: 'image' }} />
      <h3  out:send={{ key: 'heading' }}  in:receive={{ key: 'heading' }} />
      <p   out:send={{ key: 'text' }}     in:receive={{ key: 'text' }}>{expandedText}</p>
    </div>
  {/if}
```

Both layouts mount the same three elements with the same three crossfade keys. When `layout` flips, Svelte tears down the old layout, builds the new one, and the crossfade pairs each "leaving" element with its "arriving" twin by key — animating from the old position to the new in 400 ms.

## The Core Concept: Crossfade Transitions

Svelte's `crossfade` is a *paired* transition factory. It returns two functions, `send` and `receive`, that look up each other's bounding rects by a shared key:

```typescript
import { crossfade } from 'svelte/transition';

const [send, receive] = crossfade({ duration: 400 });
```

When an element with `out:send={{ key: 'image' }}` leaves the DOM, Svelte parks its rect under the key `'image'`. When an element with `in:receive={{ key: 'image' }}` enters, Svelte looks up that parked rect and animates the new element from the parked rect to its own real rect. The result: the image appears to fly between layouts, even though they're entirely different DOM subtrees.

```
Layout A (compact)                    Layout B (expanded)
┌─────────────────┐                  ┌────────────────────────────┐
│   ┌─────────┐   │                  │ ┌─────────┐                │
│   │  IMAGE  │   │       click      │ │  IMAGE  │  HEADING       │
│   │ key:img │   │  ─────────────▶  │ │ key:img │  Long body text│
│   └─────────┘   │                  │ └─────────┘  that explains │
│   HEADING       │                  └────────────────────────────┘
│   short body    │
└─────────────────┘
```

The two `IMAGE` boxes in the diagram are different DOM nodes — but because they share `key: 'image'`, the crossfade animates the *transition* between their geometries.

### Why the keys must match exactly

If layout A's image has key `'img'` and layout B's image has key `'image'`, the crossfade has nothing to pair them with. Both elements fall back to a plain fade — A fades out from its old position, B fades in at its new one. The flying-between-layouts effect is gone. Always copy the key strings exactly.

## The Importance of Absolute Positioning

The whole crossfade illusion relies on the *outgoing* element still occupying its old screen position long enough to be measured. If the layouts are normal-flow blocks, the outgoing element leaves a gap, the new layout reflows, and the geometry is wrong by the time `receive` fires.

```css
.layout-a {
  position: absolute;
  inset: 0;
}
```

The two layouts stack on top of each other in the same container. Both have `position: absolute`, so neither contributes to the parent's layout flow. When layout A is being torn down, it's still painted at its old position; when layout B mounts, it does so on top, and the crossfade has clean rects on both sides.

Without `position: absolute`, the same code would produce a noticeable jump where the parent collapses around the new layout's natural size.

## CSS Animation Strategy

Crossfade does the heavy lifting; the rest is presentation. The card itself uses TailwindCSS for layout (`bg-lime-100`, `flex flex-row gap-4`), so it picks up the colour and spacing tokens of the host app rather than imposing its own. The 400 ms duration is hard-coded in the crossfade options — short enough to feel responsive, long enough that the eye can follow the image flying between positions.

`prefers-reduced-motion: reduce` is honoured by Svelte's transition system itself: when the user preference is set, transitions complete in 0 ms and the layout swap becomes an instant cut. No additional code path is needed.

## State Flow Diagram

```
                     ┌──────────────────┐
                     │  COMPACT         │
                     │  layout = 'compact' │
                     │  layout-a renders   │
                     │  vertical card      │
                     └─────────┬───────────┘
                               │
                  click card  ▼
                     ┌──────────────────────┐
                     │  TRANSITION OUT      │
                     │  layout-a (compact)  │
                     │  out:send for img,   │
                     │  heading, text       │
                     └─────────┬────────────┘
                               │
                               ▼
                     ┌──────────────────────┐
                     │  TRANSITION IN       │
                     │  layout-a (expanded) │
                     │  in:receive matches  │
                     │  by key — elements   │
                     │  fly from old rects  │
                     │  to new rects        │
                     └─────────┬────────────┘
                               │
                               ▼
                     ┌──────────────────────┐
                     │  EXPANDED            │
                     │  layout = 'expanded' │
                     │  horizontal card     │
                     │  expandedText shown  │
                     └─────────┬────────────┘
                               │
                  click card  ▼
                     ┌──────────────────────┐
                     │  reverse direction:  │
                     │  expanded → compact  │
                     └──────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `string` | `'https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg'` | URL of the card image. |
| `imageAlt` | `string` | `'Card Image'` | Alt text for the image. |
| `heading` | `string` | `'Card Title'` | Main heading text. Same in both layouts. |
| `compactText` | `string` | `'Hello Devs, welcome to our Website'` | Body text shown in compact (vertical) layout. |
| `expandedText` | `string` | `'Yoo devs, How you doing?'` | Body text shown in expanded (horizontal) layout. Typically longer. |
| `bgColor` | `string` | `'bg-lime-100'` | TailwindCSS background class applied to the card. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Rapid clicking before the 400 ms transition completes | Each click flips `layout`. The crossfade re-targets mid-flight, so the elements smoothly redirect to the new destination instead of jumping. |
| `imageSrc` 404s | The browser shows the broken-image fallback inside an otherwise-functional layout. The crossfade still flies the empty image box between positions. |
| `compactText` shorter than `expandedText` | Expected — the whole point. Both texts share the `'text'` crossfade key, so the longer text appears to grow out of the shorter one. |
| User has `prefers-reduced-motion: reduce` | Svelte's transition system treats the duration as 0; the layout swap becomes an instant cut with no flying motion. |
| `bgColor` set to a non-Tailwind value | Tailwind's JIT will not generate the class. Pass a valid Tailwind class, or wrap the card in your own background container. |
| Card placed inside a parent with conflicting `position: relative` rules | Both layouts have `position: absolute; inset: 0;` so they fill the nearest positioned ancestor. Make sure the parent has a known size, or the card collapses. |
| Many ExpandingCards on the same page | Each component has its own `crossfade` instance; keys are scoped per-component, so cards animate independently without cross-talk. |

## Dependencies

- **Svelte 5.x** — `$state` and `$props`, plus the built-in `crossfade` transition from `svelte/transition`. No extra runtime cost — `crossfade` is part of the framework.
- **TailwindCSS** — used for layout utilities (`flex`, `gap-4`, `bg-lime-100`). The component assumes Tailwind is configured in the host app.
- Zero external animation libraries — `crossfade` is pure Svelte.

## File Structure

```
src/lib/components/ExpandingCard.svelte         # implementation
src/lib/components/ExpandingCard.md             # this file
src/lib/components/ExpandingCard.test.ts        # vitest unit tests
src/routes/expandingcard/+page.svelte           # demo page
src/routes/expandingcard/+page.server.ts        # SSR data loader
src/lib/types.ts                                # ExpandingCardProps
```
