# InteractiveCards - Technical Logic Explainer

## What Does It Do? (Plain English)

InteractiveCards is a scroll-driven paintings portfolio. Seven painting cards rise up from below the fold, fan out beneath a large hero headline, and then — as the reader scrolls — sweep off the fan onto a curved diagonal conveyor that loops endlessly. Click any card and it glides into a detail view with an ornate frame, size and material pills, a quantity stepper and an add-to-cart button. While the conveyor is running, a painter's-room mockup and an awards/testimonials strip fade in alongside.

The whole composition stays pinned in place while you scroll, but there is no GSAP or ScrollTrigger underneath: the pin is plain `position: sticky` inside a tall spacer, and every card is moved by a small spring loop on `requestAnimationFrame`.

**Think of it like:** a gallery attendant holding a hand of postcards. First they fan the cards out for you to admire, then — as you walk along the corridor — they feed them past you one at a time on a moving belt. Point at one and they lift it into a frame so you can take a proper look.

---

## How It Works (Pseudo-Code)

```
WHEN component mounts:
  1. READ prefers-reduced-motion
  2. MEASURE viewport (vw, vh) and the hero title height
  3. CREATE one CardState per project, parked just below the viewport
  4. PICK the wall texture from <html data-theme> and watch it for changes
  5. LISTEN for resize, scroll (passive) and Escape
  6. START the requestAnimationFrame tick

EACH animation frame (tick):
  IF the entrance is still playing (first 1.7s):
     t = elapsed / 1700
     rise:   lerp stack position → fan centre        (t 0 → 0.55)
     fan:    lerp fan centre     → each card's pose  (t 0.45 → 1)
     fade the headline and summary in alongside
  ELSE:
     progress = how far the wrapper has scrolled past the viewport top (0..1)
     transition = progress / 0.20          (fan → diagonal)
     conveyor   = (progress - 0.20) / 0.80 (diagonal → looping belt)
     FOR each card:
        IF it is the open detail card → target = detail pose, frame on
        ELSE IF another card is open   → target opacity 0
        ELSE target = lerp(fanPose, conveyorPose, transition) (+28px hover lift)
     derive room-preview visibility / image index and the awards slide
  SPRING every card's current values 25% of the way to its target (15% in detail)
  WRITE transform / opacity / z-index straight onto the card element
  SCHEDULE the next frame (unless reduced motion is on)

WHEN a card is clicked:
  detailIdx = index; preselect its first size + material; quantity = 1

WHEN Escape is pressed, Back is clicked, or the background is clicked:
  detailIdx = -1; every frame opacity reset to 0
```

---

## The Core Concept: Sticky Pin Instead of ScrollTrigger

The reference design used a GSAP ScrollTrigger pin. This port gets the same effect with two elements:

```
.interactive-cards-wrapper   height: scrollHeight (default 500vh)
└── .interactive-cards       position: sticky; top: 0; height: 100vh
```

The inner section sticks to the top of the viewport while the tall wrapper scrolls past. Progress is simply how far the wrapper's top edge has moved above the viewport, divided by the scrollable range:

```
range    = wrapper.offsetHeight - window.innerHeight
progress = clamp(-wrapper.getBoundingClientRect().top / range, 0, 1)
```

Because it is native CSS, the pin never jitters on iOS momentum scrolling and there is no pin-spacer DOM to clean up. The trade-off is that `overflow: hidden` on any ancestor breaks `position: sticky`, so the host page must leave the ancestors' overflow alone.

---

## Card Geometry: Fan, Conveyor and Detail Poses

All the layout maths lives in `interactiveCards/geometry.ts` as pure functions, so it is unit-tested without the Svelte runtime.

### Card size

`getCardW(vw, vh)` steps through five width breakpoints (126px → 252px), then shrinks by 10–30% on short viewports so the fan never falls off the bottom of the screen. `getCardH` is always `width × 1.33` (a 3:4 portrait).

### The fan

`computeFan` places the fan centre just beneath the measured headline (`titleTop + titleHeight + gap + cardH/2`). `fanPoseFor(i, n)` then offsets each card from the middle:

```
offset   = i - (n - 1) / 2          // -3 … +3 for seven cards
norm     = offset / ((n - 1) / 2)   // -1 … +1
x        = centreX + offset × spread
y        = centreY + norm² × droop  // parabola: outer cards hang lower
rotation = offset × rotationStep    // 5.5° per step on desktop, 4° on mobile
```

### The conveyor

`computeDiagonal` describes a path from the top-left to the bottom-right (desktop) or a shallow band across the lower third (mobile), with a sine bow so it curves rather than running straight. `toScreen(pos, visibleLen)` wraps each card's position with a double modulo, so a card leaving the bottom edge re-enters at the top without any special-case code. Cards lower on screen get a higher z-index so the belt reads as coming towards you.

### The detail pose

`detailPose` parks the selected card left of centre at 1.35× on desktop (leaving room for the info panel), or centred near the top at 1.4× on mobile.

---

## State Flow Diagram

```
             mount
               │
               ▼
      ┌─────────────────┐
      │    ENTRANCE     │  rise → fan over 1.7s
      │ entranceDone=no │
      └────────┬────────┘
               │ t ≥ 1
               ▼
      ┌─────────────────┐   scroll ≥ 20%   ┌─────────────────┐
      │       FAN       │ ───────────────▶ │    CONVEYOR     │
      │ hero visible    │ ◀─────────────── │ room + awards   │
      └────────┬────────┘   scroll < 20%   └────────┬────────┘
               │                                    │
               │ click card                         │ click card
               ▼                                    ▼
      ┌──────────────────────────────────────────────────────┐
      │                       DETAIL                         │
      │ detailIdx = i, frame on, other cards faded out,      │
      │ room preview + awards hidden                          │
      └───────────────────────────┬──────────────────────────┘
                                  │ Escape / Back / background click
                                  ▼
                     return to FAN or CONVEYOR
                     (whichever the scroll position implies)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projects` | `InteractiveCardsProject[]` | `FALLBACK_INTERACTIVE_PROJECTS` | Paintings to show. Each needs `id`, `title`, `artist`, `image`, `sizes`, `materials`, `price` and badge fields. |
| `testimonials` | `InteractiveCardsTestimonial[]` | `FALLBACK_INTERACTIVE_TESTIMONIALS` | Quotes cycled in the awards strip during the conveyor phase. |
| `headline` | `[string, string]` | `['Every brushstroke', 'deserves a gallery.']` | Two-line hero title; the second line is set in italics. |
| `subheading` | `string` | Collective blurb | Summary paragraph shown beneath the fan with the CTAs. |
| `wallImageLight` | `string` | CDN `wall-bg.jpg` | Wall texture used when `<html data-theme>` is not `dark`. |
| `wallImageDark` | `string` | CDN `wall-bg-dark.jpg` | Wall texture used when `<html data-theme="dark">`. |
| `frameImage` | `string` | CDN `frame.png` | Ornate frame overlay revealed around the detail card. |
| `roomImage` | `string` | CDN `painter-sample-bottom.png` | Room mockup behind the conveyor-phase preview. |
| `scrollHeight` | `string` | `'500vh'` | Height of the outer spacer. Taller means slower scroll-through. |

Types live in `src/lib/types.ts` (`InteractiveCardsProps`, `InteractiveCardsProject`, `InteractiveCardsTestimonial`).

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `projects` array changes length at runtime | An `$effect` re-initialises the card states so new cards rise in from below. |
| Headline not yet measured on the first frame | `computeTargets` bails while `titleHeight` is 0, avoiding a one-frame snap into the wrong fan pose. |
| Conveyor position passes the end of the path | Double modulo in `toScreen` wraps it back to the start seamlessly. |
| Room preview index lands exactly on `projects.length` | `InteractiveCardsRoomPreview` clamps the index with a positive modulo. |
| Dark mode toggled while mounted | A `MutationObserver` on `data-theme` swaps the wall texture live. |
| Ancestor has `overflow: hidden` | `position: sticky` stops pinning; give the component an unclipped scroll ancestor. |
| Remote CDN images blocked or offline | Cards and wall render empty; pass your own `image` URLs and `wall*` / `frame` / `room` props for production. |
| `prefers-reduced-motion: reduce` | The tick runs a single frame and stops. Known limitation: that frame is the start of the entrance, so the cards stay at opacity 0 — reduced-motion visitors currently see the headline and CTAs but not the fan. A settled, motion-free final pose is the intended behaviour and still needs implementing. |
| Clicking inside the detail panel | Ignored by the background-click handler (`[data-panel]`), so pills and the stepper don't close the view. |

---

## Dependencies

- **Zero external runtime dependencies** — no GSAP, no ScrollTrigger, no motion library.
- **$lib/types**: `InteractiveCardsProps`, `InteractiveCardsProject`, `InteractiveCardsTestimonial`
- **$lib/constants**: `FALLBACK_INTERACTIVE_PROJECTS`, `FALLBACK_INTERACTIVE_TESTIMONIALS`
- **./interactiveCards/**: geometry helpers and four presentational child components (copy the folder along with the parent).

---

## File Structure

```
src/lib/components/
├── InteractiveCards.svelte                # Orchestrator: scroll, entrance, spring loop, detail state
├── InteractiveCards.md                    # This explainer
└── interactiveCards/
    ├── geometry.ts                        # Pure layout maths (card size, fan, conveyor, detail pose)
    ├── geometry.test.ts                   # Unit tests for the geometry helpers
    ├── InteractiveCardItem.svelte         # One card: <button>, badge, vignette, frame overlay
    ├── InteractiveCardsDetail.svelte      # Detail panel: size/material radios, quantity, add to cart
    ├── InteractiveCardsRoomPreview.svelte # Painter's-room mockup shown during the conveyor
    └── InteractiveCardsAwards.svelte      # Laurels + per-letter testimonial reveal
src/routes/interactivecards/+page.svelte   # Demo page
```
