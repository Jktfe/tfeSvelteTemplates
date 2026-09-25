# FanDeckCarousel - Technical Logic Explainer

## What Does It Do? (Plain English)

FanDeckCarousel lays a set of cards out like a hand of playing cards fanned across a table. The selected card sits upright in the middle; its neighbours tilt, shrink and fade the further they are from the centre. Clicking a card or using the arrow buttons rotates the fan so a new card takes centre stage, with GSAP tweening the move.

**Think of it like:** a croupier spreading a deck on the felt. Point at any card and the whole fan shuffles round so that card faces you.

---

## How It Works (Pseudo-Code)

```
WHEN component renders (server or client):
  1. selectedIndex = 0
  2. FOR each item:
       transform = deckTransform(index, selectedIndex, total)
       WRITE transform into the inline style  (stable SSR layout, no JS needed)

WHEN component mounts:
  1. LAZY-LOAD gsap via loadGsap()
  2. IF unmounted before it resolves → stop
  3. selectedIndex = normalizeIndex(initialIndex, total)
  4. animateDeck()

select(index):
  1. selectedIndex = normalizeIndex(index, total)   # wraps -1 → last, total → 0
  2. animateDeck()

animateDeck():
  1. IF gsap not loaded OR prefers-reduced-motion → return
     (inline styles already reflect the new layout, so the deck still updates)
  2. FOR each card: gsap.to(card, deckTransform(...), 0.55s, power3.out)

WHEN component unmounts:
  1. cancelled = true
  2. killTweensOf(all cards)
```

---

## The Core Concept: The Fan Transform

`deckTransform(index, selectedIndex, total)` is a pure function that turns "how far is this card from the selected one?" into a transform.

```
offset = index - selectedIndex
IF offset >  total/2 → offset -= total     # take the short way round
IF offset < -total/2 → offset += total
clamped = clamp(offset, -4, 4)

x        = clamped × 74px
y        = |clamped| × 16px                  # outer cards drop lower
rotation = clamped × 8deg
scale    = 1 if selected else max(0.74, 0.92 − |clamped| × 0.04)
opacity  = 0 if |offset| > 4 else max(0.32, 1 − |clamped| × 0.13)
zIndex   = 100 − |clamped|
```

Example with 5 cards and card 0 selected:

```
   offset:   -2      -1       0       +1      +2
            ╱ ╲     ╱ ╲     ┌───┐     ╱ ╲     ╱ ╲
           ╱ 3 ╲   ╱ 4 ╲    │ 0 │    ╱ 1 ╲   ╱ 2 ╲
          -16°     -8°       0°       +8°    +16°
```

Card 4 has a raw offset of +4 but is wrapped to −1, so the fan is always balanced around the selected card rather than trailing off one side.

---

## CSS Animation Strategy

Two layers of motion keep the component robust:

1. **Inline styles** — every render writes `transform`, `opacity` and `z-index` from `deckTransform`. This means the server-rendered HTML is already fanned, and the deck still reorders correctly if GSAP never loads.
2. **GSAP tweens** — once loaded, `gsap.to()` animates each card to its new transform over 0.55s with `power3.out`.

When `prefers-reduced-motion: reduce` is set, `animateDeck()` returns early and the CSS media query removes transitions, so the fan snaps instantly to its new arrangement.

---

## State Flow Diagram

```
   ┌──────────────────┐   mount + gsap loaded   ┌──────────────────────┐
   │  SSR / STATIC    │ ──────────────────────▶ │  INTERACTIVE          │
   │  selectedIndex=0 │                         │  selectedIndex =      │
   │  inline fan      │                         │  initialIndex (wrap)  │
   └──────────────────┘                         └──────────┬───────────┘
                                                           │
             click card / ← previous / → next              │
                                                           ▼
                                                ┌──────────────────────┐
                                                │  SELECT               │
                                                │  normalizeIndex()     │
                                                │  animateDeck()        │
                                                └──────────┬───────────┘
                                                           │ reduced motion?
                                          yes ◀────────────┴────────────▶ no
                                   snap via inline style         GSAP tween 0.55s
                                                           │
                                                 unmount → killTweensOf(cards)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FanDeckItem[]` | Four built-in sample cards | Cards to fan out; each has `title`, `description`, optional `eyebrow` and optional `tone` colour. |
| `initialIndex` | `number` | `0` | Card selected once the component mounts; wrapped into range. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

### Exported helpers

| Export | Purpose |
|--------|---------|
| `normalizeIndex(index, total)` | Wraps any integer into `0..total-1`; returns `0` when `total <= 0`. |
| `deckTransform(index, selectedIndex, total)` | Returns the `{ x, y, rotation, scale, opacity, zIndex }` for one card. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `items` is empty | Stage renders empty; `normalizeIndex` returns `0` and the caption is blank. |
| More than 9 cards | Cards beyond four places from the selected one get opacity `0` and are hidden. |
| `initialIndex` out of range or negative | Wrapped with modulo, so `-1` selects the last card. |
| Two items share a `title` | Keyed `{#each}` requires unique titles — give each card a distinct title. |
| GSAP fails to load | Cards still reposition instantly via inline styles; only the tween is lost. |
| `prefers-reduced-motion: reduce` | GSAP is skipped and CSS transitions are disabled; changes are instant. |
| Unmount mid-tween | `killTweensOf` stops outstanding tweens so nothing writes to detached nodes. |

---

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`, `$props`) and the `use:` action for card refs.
- **`gsap`** — dynamically imported through `$lib/gsapMotion` for smooth card tweens; the deck works without it.
- **`$lib/gsapMotion`** — tiny helper (`loadGsap`, `prefersReducedMotion`); copy it alongside the component.

---

## File Structure

```
src/lib/components/FanDeckCarousel.svelte     # implementation + exported pure helpers
src/lib/components/FanDeckCarousel.md         # this file (rendered inside ComponentPageShell)
src/lib/components/FanDeckCarousel.test.ts    # vitest unit tests
src/lib/gsapMotion.ts                         # shared GSAP loader + reduced-motion check
src/routes/gsap-suite/+page.svelte            # demo page (GSAP suite)
```
