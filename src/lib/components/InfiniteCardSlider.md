# InfiniteCardSlider - Technical Logic Explainer

## What Does It Do? (Plain English)

InfiniteCardSlider shows a row of cards that never runs out. One card sits in the middle, larger and fully opaque; its neighbours peek out either side, smaller and dimmer. Drag, swipe, press the arrow buttons or use the keyboard and the row glides round — past the last card you're simply back at the first.

**Think of it like:** a lazy Susan on a restaurant table. You spin it, the dish you want comes to the front, and there's no "end" to the table — it just keeps going round.

---

## How It Works (Pseudo-Code)

```
state:
  selectedIndex = initialIndex mod N
  dragOffsetPx  = 0
  dragging      = false

for every card i:
  offset   = wrappedOffset(i, selectedIndex, N) + dragOffsetPx / stride
  x        = offset × (cardWidth + gap)
  scale    = 1 at the centre, shrinking 8% per step (min 0.7)
  opacity  = 1 at the centre, fading 18% per step (min 0.25)
  visible  = |offset| ≤ maxVisible + 0.5
  hidden cards → opacity 0, aria-hidden, inert

on next / previous / ArrowRight / ArrowLeft / Home / End:
  select(newIndex)  → selectedIndex = newIndex mod N
                    → GSAP tweens every card to its new transform
                    → onchange(index, item) if it actually moved

on pointerdown: remember x, do NOT capture yet
on pointermove: once |dx| ≥ 6px → capture pointer, dragging = true
                write transforms directly (no tween) as the finger moves
on pointerup:   steps = round(-dx / stride) → select(selectedIndex + steps)

when N, cardWidth, gap or maxVisible change:
  clamp selectedIndex into range, re-lay every card instantly
```

---

## The Core Concept: Wrapped Offsets Instead of Clones

Most "infinite" carousels cheat by cloning the first and last few slides and jumping back when you reach a clone. That doubles the DOM and causes a visible hiccup when the jump lands mid-animation. This component keeps exactly one node per item and asks a simpler question: *how far is card `i` from the focal card, going whichever way round is shorter?*

```ts
export function wrappedOffset(index, selected, total) {
  const half = total / 2;
  let offset = index - selected;
  if (offset >  half) offset -= total;   // quicker to go left
  if (offset < -half) offset += total;   // quicker to go right
  return offset;
}
```

Worked example with 8 cards and card 0 selected:

```
index:   0   1   2   3   4   5   6   7
raw:     0  +1  +2  +3  +4  +5  +6  +7
wrapped: 0  +1  +2  +3  +4  -3  -2  -1

            [5][6][7] (0) [1][2][3]      ← card 7 sits just left of card 0
```

Press "next" and card 1 becomes the centre; card 0 slides to `-1` and card 4 wraps round to `-4`. Because each card's target is recomputed from scratch every time, there is never a "reset" frame.

---

## CSS Animation Strategy

- **Transforms only.** Cards are `position: absolute` at the centre of the stage and moved with `translate3d(x, 0, 0) scale(s)` plus `opacity`. No `left`/`width` animation, so nothing reflows.
- **GSAP for easing, not for layout.** `select()` tweens each card with `power3.out` over 0.5s and `overwrite: true`, so rapid clicks retarget smoothly instead of queueing.
- **Direct writes while dragging.** During a drag the component sets `style.transform` itself on every pointermove — a tween would lag behind the finger.
- **Lazy GSAP.** `loadGsap()` dynamically imports the library after mount. Until it resolves (or if it fails) transforms are applied instantly, so the slider is never broken, merely less smooth.
- **Reduced motion.** `prefersReducedMotion()` is checked on every move; when true the tween path is skipped and cards jump to position. The nav buttons also lose their hover lift.

---

## Accessibility and Focus

- The wrapper is a `<section>` with `aria-roledescription="carousel"` and your `ariaLabel`.
- The stage is a focusable `role="group"`: focus it and use ← → Home End.
- The "01 / 08" meter is `aria-live="polite"`, so position changes are announced without stealing focus.
- The focal card gets `aria-current="true"`.
- Off-stage cards are **both** `aria-hidden` and `inert`. `aria-hidden` alone would hide them from screen readers but still let Tab land on their links — `inert` removes them from the focus order too.
- Pointer capture is deferred until a 6px drag threshold. Capturing on `pointerdown` would retarget the synthesised click to the stage and swallow navigation on `<a href>` cards; deferring keeps taps working as links.

---

## State Flow Diagram

```
                 ┌──────────────────────┐
                 │        IDLE          │
                 │ selectedIndex = k    │
                 └──┬───────┬───────┬───┘
      next/prev/key │       │       │ pointerdown
                    ▼       │       ▼
        ┌────────────────┐  │  ┌────────────────┐
        │   TWEENING     │  │  │   PRESSED      │
        │ GSAP → targets │  │  │ no capture yet │
        └───────┬────────┘  │  └───┬────────┬───┘
                │ settles   │      │ |dx|≥6 │ pointerup (<6px)
                ▼           │      ▼        ▼
              IDLE          │ ┌──────────┐  IDLE (tap → link navigates)
                            │ │ DRAGGING │
                            │ │ direct   │
                            │ │ writes   │
                            │ └────┬─────┘
                            │      │ pointerup / cancel
                            │      ▼
                            │  snap to round(-dx/stride) → TWEENING
                            │
          items / geometry  │
          change            ▼
                 re-lay instantly → IDLE
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` where `T extends SliderItem` | required | Slide data. Keyed by `id ?? href ?? index`. |
| `cardWidth` | `number` | `280` | Card width in px. Stage height is `cardWidth × 1.32` (min 280px). |
| `gap` | `number` | `24` | Gap between neighbouring cards in px. |
| `initialIndex` | `number` | `0` | Starting focal card; wrapped with `mod N` on mount. |
| `maxVisible` | `number` | `4` | Cards shown on each side of the centre. Others fade out and become inert. |
| `ariaLabel` | `string` | `'Carousel'` | Accessible name of the region. |
| `children` | `Snippet<[T, number]>` | — | Replaces the default card chrome; receives `(item, index)`. |
| `onchange` | `(index: number, item: T) => void` | — | Fires when the focal card changes (not on no-op selects). |
| `class` | `string` | `''` | Extra classes on the outer `<section>`. |

### SliderItem

```ts
interface SliderItem {
  id?: string | number;   // stable key — strongly recommended
  href?: string;          // makes the default card a link
  name?: string;          // title fallback chain: name ?? title
  title?: string;
  description?: string;   // blurb fallback chain: description ?? blurb
  blurb?: string;
  screenshot?: string;    // image shown above the text (links only)
  [key: string]: unknown; // anything else your snippet needs
}
```

### Exported helper

`wrappedOffset(index, selected, total)` is exported from the module script so you can reuse the loop maths (or unit-test it) without mounting the component.

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Empty `items` | Stage renders empty; nav buttons disabled; meter shows `01 / 00` |
| One item | Nav buttons disabled, dragging ignored, the card sits in the centre |
| Two or three items | Loop still works — the wrap maths always picks the nearer side |
| `initialIndex` out of range | Wrapped with `mod N` (e.g. 9 of 7 → index 2) |
| Items shrink below the selection | Selection clamps to the last card and all cards re-lay |
| Missing `id` and `href` | Falls back to the array index as key — fine for static lists, but reorders will re-create nodes |
| Tap on a link card | Navigates normally; drags only start after 6px of movement |
| Drag released between cards | Snaps to the nearest whole card |
| GSAP fails to load | Transforms apply instantly; everything else works |
| Reduced motion | No tweens, no hover lift — cards jump straight to position |

---

## Dependencies

- **GSAP** (`gsap`) — easing tweens, loaded lazily through `$lib/gsapMotion` (`loadGsap`, `prefersReducedMotion`). Copying to another project: bring `gsapMotion.ts` along, or inline its two tiny helpers.
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) and `untrack`.

---

## File Structure

```
src/lib/components/InfiniteCardSlider.svelte                 # component (+ wrappedOffset, SliderItem)
src/lib/components/InfiniteCardSlider.md                     # this explainer
src/lib/components/InfiniteCardSlider.test.ts                # unit tests
src/lib/components/InfiniteCardSliderTestHarness.test.svelte # snippet harness for tests
src/lib/gsapMotion.ts                                        # lazy GSAP loader + reduced-motion check
src/routes/infinitecardslider/+page.svelte                   # demo page
src/routes/+page.svelte                                      # home-page shelves use it too
```
