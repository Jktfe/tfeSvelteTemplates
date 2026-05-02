# StreamShowcase — Technical Logic Explainer

## What Does It Do? (Plain English)

StreamShowcase is a full-bleed editorial section for "now playing" / "now browsing" style hero shelves. The top half is a brush-script title ("Queue up. / Level up.") with a staggered letter entrance; the bottom half is a fan of ten cards splayed around a shared pivot below the deck, each card a colour-gradient billboard for one of your playlists. Click a side card to bring it to centre, drag the deck to rotate it, or use the arrow keys — and Enter on the centre card fires `onSelect`.

Think of it as an album-cover wall that's been arranged into a deck of cards held by an invisible hand below the page, ready to be flipped through.

## How It Works (Pseudo-Code)

```
state:
  active     ∈ [0, count)        // which card is at centre, bindable
  dragging   = false
  dragStartX = 0
  dragStartActive = 0

derive:
  cards = repeat(playlists, count)        // loop the input until length === count
  fanAngle(i, active, count)              // angle in degrees per card
  cardTransforms = map cards → translate3d + rotateZ around shared pivot

events:
  on keydown ←:        active = max(0, active - 1)
  on keydown →:        active = min(count - 1, active + 1)
  on keydown Home:     active = 0
  on keydown End:      active = count - 1
  on keydown Enter on active card:
    onSelect?.(playlists[active % playlists.length], active)

  on click side card[i]:        active = i
  on click centre card[active]: onSelect?.(playlists[active % length], active)

  on pointerdown deck:
    dragging = true
    dragStartX = e.clientX
    dragStartActive = active
    deck.setPointerCapture(e.pointerId)

  on pointermove (while dragging):
    delta = e.clientX - dragStartX
    spin the fan in real time using delta (CSS variable)

  on pointerup:
    dragging = false
    snap to nearest card based on travel:
      newActive = round(dragStartActive - delta / SNAP_PX)
      active = clamp(newActive, 0, count - 1)
```

The hero animation and the carousel deck are independent subcomponents — `StreamShowcaseHero` and `StreamShowcaseCarousel` — each with its own state. The wrapper just provides theming, glow effects, and prop pass-through.

## The Core Concept: Fan Layout Around a Shared Pivot

A standard carousel translates each card horizontally by some multiple of the card width. A fan carousel **rotates** each card around a pivot point well below the deck — typically 800–1200 pixels — so cards fan out like the cards in your hand at a poker table.

```
                      visible deck
                     ┌──────────────┐
                     │  ┌──────┐    │
                     │ ┌─│┌────┐│   │
                     │┌─│ │┌──┐││   │     ← cards splay outward
                     ││ │ ││centre─┐│        because each is
                     │└─│ │└──┘││  ││         rotated around
                     │ └─│└────┘│  ││         the same pivot
                     │   └──────┘  ││
                     └─────────────┘│
                              \    /
                               \  /
                                \/
                              pivot
                          (off-screen, ~1000 px below)
```

For a card at index `i` with `active` at centre and `count` total cards, the angle is approximately:

```
angleDeg = (i - active) * fanSpread / (count - 1)
```

where `fanSpread` is the total angle from leftmost to rightmost card (e.g. 60°). The card's transform is:

```
translate3d(0, 0, 0)                              // initial
rotate(angleDeg) at transform-origin (50%, 1000px) // rotate around pivot
```

`transform-origin: 50% 1000px` is the trick. It puts the rotation centre 1000 px below the card's own top edge — invisible, but every card rotates around the *same* point because they all share that origin. The mathematical effect is identical to placing every card at the pivot, fanning them out, and only rendering the top portion.

Easing the rotation through `easedRotation()` (a small cubic that pinches near the centre) makes the centre card rotate more slowly than the outer cards, mimicking how a real hand of cards splays.

## Letter-by-Letter Hero Entrance

The hero's top and bottom lines render as a row of `<span>` letters, each with its own `transition-delay` so they animate in sequence:

```
<h1 class="ssh-line ssh-top">
  <span class="visually-hidden">Queue up.</span>
  {#each letters as char, i}
    <span class="ssh-letter" style="--delay: {i * 35}ms" aria-hidden="true">
      {char}
    </span>
  {/each}
</h1>
```

The visually-hidden span carries the canonical text for screen readers; the per-letter spans are decorative (`aria-hidden="true"`). On mount, a class flip triggers the CSS transition:

```css
.ssh-letter {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(6px);
  transition: opacity 600ms, transform 600ms, filter 400ms;
  transition-delay: var(--delay, 0ms);
}

.ssh-hero.is-visible .ssh-letter {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}
```

`prefers-reduced-motion: reduce` short-circuits the entrance — the letters render at their final state with no transition. The screen-reader text is unaffected either way; the letter-stagger is purely visual sugar.

## Drag-to-Rotate with Pointer Capture

The deck is one big `pointermove` consumer. The drag handler maintains the current `active` index in a separate `dragStartActive` snapshot at `pointerdown`, so the calculation during drag is always relative to where the deck started rather than accumulating per-frame error.

```
on pointerdown:
  dragging = true
  dragStartX      = e.clientX
  dragStartActive = active
  deck.setPointerCapture(e.pointerId)

on pointermove (dragging):
  liveDelta = e.clientX - dragStartX                 // px since drag started
  visualOffset = liveDelta / SNAP_PX                  // fractional cards
  apply rotation = (dragStartActive - visualOffset) → CSS variable

on pointerup:
  dragging = false
  newActive = round(dragStartActive - liveDelta / SNAP_PX)
  active    = clamp(newActive, 0, count - 1)
  // CSS transitions snap the deck to the new index over ~300 ms
```

`setPointerCapture` keeps events flowing to the deck even when the cursor strays off the carousel — important because users tend to drag in big arcs that overshoot the visible area.

When `prefers-reduced-motion: reduce` is set, drag-to-rotate is disabled (the pointerdown handler short-circuits). Keyboard and click navigation still work, so the carousel remains fully usable without motion.

## State Flow Diagram

```
                    ┌──────────────────────┐
                    │  IDLE                │
                    │  active = floor(n/2) │
                    │  dragging = false    │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼─────────────────────────┐
        │                      │                         │
   keyboard ←→               click side card        pointerdown deck
        │                      │                         │
        ▼                      ▼                         ▼
  ┌──────────────┐    ┌──────────────┐         ┌──────────────────┐
  │ active ± 1   │    │ active = i   │         │ DRAGGING          │
  │ clamped      │    │              │         │ pointer captured  │
  └──────┬───────┘    └──────┬───────┘         │ deck rotates with │
         │                   │                 │ cursor in real    │
         └───────────┬───────┘                 │ time              │
                     ▼                         └─────────┬─────────┘
              ┌──────────────────┐                       │
              │ deck animates    │              pointerup│
              │ to new active    │                       ▼
              │ over CSS         │              ┌──────────────────┐
              │ transition       │              │ snap to nearest  │
              └──────────────────┘              │ card based on    │
                     │                          │ travel           │
                     ▼                          └─────────┬────────┘
              ┌──────────────────┐                        │
              │ Enter on centre  │                        │
              │ → onSelect(...)  │ ◄──────────────────────┘
              └──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `playlists` | `Playlist[]` | `SAMPLE_PLAYLISTS` (5) | Playlist data. Looped to fill `count` cards. |
| `count` | `number` | `10` | Number of cards in the fan. |
| `eyebrow` | `string` | `'Now browsing'` | Small status text above the hero. |
| `topLine` | `string` | `'Queue up.'` | Hero line 1 (brush-script). |
| `bottomLine` | `string` | `'Level up.'` | Hero line 2 (brush-script). |
| `active` | `number` | `floor(count / 2)` | Which card is at centre. Bindable for parent control. |
| `onSelect` | `(playlist: Playlist, index: number) => void` | — | Fires when the centre card is clicked or Enter is pressed on it. |
| `theme` | `'light' \| 'dark'` | `'dark'` | Background theme — sets the radial gradient and text colour. |
| `class` | `string` | `''` | Extra classes appended to the section wrapper. |

The `Playlist` type:

```typescript
interface Playlist {
  slug: string;
  title: string;
  tag: string;
  description: string;
  cover: { from: string; to: string; accent: string };
  episodeCount: number;
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `playlists.length < count` | The array is looped — a five-playlist input with `count: 10` repeats each playlist twice. This is intentional and matches the editorial brief. |
| `count = 1` | The fan collapses to a single card at centre. No fan splay. Keyboard nav has nothing to navigate. |
| User has `prefers-reduced-motion: reduce` | Hero letter stagger skips (instant final state); drag-to-rotate is disabled; click and keyboard still work; eyebrow status dot stops pulsing. |
| Drag released exactly between two cards | `Math.round(dragStartActive - delta / SNAP_PX)` rounds half-values to the nearest integer; ties go to the higher card by JS rounding rules. |
| Active card focused, then user Tabs forward | Focus moves to the next focusable element on the page. The carousel is `role="region"` with one `tabindex=0` (the active card); other cards are `tabindex=-1`. |
| Bound `active` set by parent to a value outside `[0, count)` | Component clamps internally before applying transforms; out-of-range writes are silently ignored. |
| `theme="light"` background interacting with light card gradients | The card gradients are designed to work on both themes. The radial-glow accents soften on light theme to keep contrast acceptable. |
| Brush-script font not installed | A system stack falls back to `'Caveat'`, then `'Brush Script MT'`, then `'Lucida Handwriting'`, then generic cursive. Install `@fontsource/caveat-brush` for pixel-perfect rendering. |

## Dependencies

- **Svelte 5.x** — `$state`, `$bindable`, `$derived`, snippets, and `bind:this` for the deck pointer-capture target.
- Zero external dependencies — no GSAP, no rAF physics library, no third-party motion library. All motion is plain CSS transitions plus a few Svelte-driven inline styles.
- **No external images** — card art is pure CSS gradients tinted with `color-mix()`. Each playlist's `cover` prop describes its colour stops.

## File Structure

```
src/lib/components/StreamShowcase/StreamShowcase.svelte           # wrapper / theming
src/lib/components/StreamShowcase/StreamShowcaseHero.svelte       # brush-script title
src/lib/components/StreamShowcase/StreamShowcaseCarousel.svelte   # fan carousel
src/lib/components/StreamShowcase/types.ts                        # Playlist + helpers
src/lib/components/StreamShowcase/playlists.ts                    # SAMPLE_PLAYLISTS
src/lib/components/StreamShowcase.md                              # this file
src/lib/components/StreamShowcase.test.ts                         # vitest unit tests
src/routes/streamshowcase/+page.svelte                            # demo page
```
