# PortfolioPhotographer — Technical Logic Explainer

## What Does It Do? (Plain English)

A statement-piece editorial hero for a photographer's landing page. A wireframe camera-lens SVG sits centred behind the scene, slowly rotating; a horizontal reel of "photo" tiles drifts across the foreground in a seamless loop; a Halton-sequence dot scatter converges around the optical centre to suggest a focal plane; and a serif display name plus sans-serif tagline overlay the whole thing.

Think of it as a magazine cover with a slow conveyor belt of work samples behind the title. The reel pauses on hover so visitors can read a tile, the lens spins gently so the page never feels static, and the dots cluster toward the middle so the eye is drawn through the title down into the work. Until M2 ships, every "photo" is a CSS gradient — there are no image assets, no fonts to download, and no GSAP. The whole thing is a single `<section>` with two child sub-trees and one `onMount` for the reduced-motion query.

## How It Works (Pseudo-Code)

```
state:
  prefersReducedMotion = false
  mounted              = false

derive:
  reelTrack   = [...photos, ...photos]              // duplicate for seamless loop
  scatterDots = Array(dotCount).map(i =>
                  haltonPoint(i)                     // deterministic 2D position
                  .map toward centre with ease 0.7
                  + size 2..5 px
                  + delay (i × 137) mod 1800 ms      // golden-angle stagger
                )

onMount:
  mq = matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = mq.matches
  listen for mq change → update prefersReducedMotion
  rAF → mounted = true                              // copy fade-in
  cleanup: remove listener

on hover / focus-within on .prh-reel:
  CSS only — animation-play-state: paused

render:
  <section pp-{theme}>
    decorative wireframe lens SVG (rings + cross + 24 tick-marks)
    decorative Halton scatter dots (pulse)
    drifting reel — translateX 0% → −50% over `duration` s, infinite linear
    eyebrow pill + h1 serif name + tagline
```

The component holds almost no JavaScript state — the visual richness comes from CSS animations and a handful of deterministic numerical sequences. Reduced-motion is the only branch that actually requires runtime detection.

## The Core Concept: Marquee with `translateX(-50%)`

A naïve infinite-scroll marquee animates `translateX` from 0 to `-100%` and snaps back, which produces a visible "jump" frame at the loop point. The fix is the duplication trick:

```
  ┌── reel viewport (overflow: hidden) ──┐
  │                                       │
  │  [track-A] [track-A] [track-A] ...    │  ← real photos
  │  [track-B] [track-B] [track-B] ...    │  ← exact copies, aria-hidden
  │  ▲                                    │
  │  └─ animated 0 → −50% over `duration` │
  │                                       │
  └───────────────────────────────────────┘
```

The track contains *two* copies of the photo array end-to-end (`[...photos, ...photos]`). Animating `translateX` from `0` to `-50%` advances the track by exactly one full photo-set width, so the `100%` keyframe and the `0%` keyframe present *visually identical* content — there is no snap, just a clean continuous loop.

Hover-pause is one CSS rule, no JavaScript:

```css
.prh-reel:hover .prh-reel-track,
.prh-reel:focus-within .prh-reel-track {
  animation-play-state: paused;
}
```

`focus-within` is the keyboard-equivalent: tabbing into any tile pauses the drift, giving keyboard users the same affordance as mouse users.

The duplicated tiles in the second half of the track are marked `aria-hidden={i >= photos.length}` so screen readers enumerate the photo set once, not twice — important because to assistive tech the marquee illusion is irrelevant; what matters is the data underneath.

## The Halton Sequence: Why Not `Math.random()`?

The focal scatter wants a *pseudo-random-looking* dot field that:

1. Renders identically on server and client (no SSR mismatch).
2. Looks visually scattered with no clumps or empty patches.
3. Is parameterised by a single integer `i` so the layout is reproducible.

`Math.random()` fails (1) and (2): it produces clumps because each draw is independent, and it can't be made deterministic without a seedable PRNG. The Halton low-discrepancy sequence solves all three. Bases 2 (for X) and 3 (for Y) give a 2D distribution that *fills space evenly* without any sample being too close to its neighbours.

```
halton(i, base):
  r = 0; f = 1
  while i > 0:
    f = f / base
    r = r + f × (i mod base)
    i = floor(i / base)
  return r in [0, 1)
```

Calling `haltonPoint(i)` returns `{ x: halton(i+1, 2), y: halton(i+1, 3) }` — a coordinate in the unit square. The component then nudges every dot toward the centre by a factor of `0.7`:

```
cx = 0.5 + (p.x − 0.5) × 0.7
cy = 0.5 + (p.y − 0.5) × 0.7
```

That's a linear ease toward `(0.5, 0.5)` — dots are densest in the middle, sparse at the edges. The animation delay is `(i × 137) mod 1800` ms — `137` is close to the golden angle in degrees, which spreads the pulse phases evenly so the field never visibly "breathes" in unison.

Because everything derives from `i`, server and client render byte-identical output and there is no hydration warning.

## Performance & Accessibility

- **Asset weight**: zero. No images, no font CDN, no animation library. The wireframe lens is inline SVG, tiles are CSS gradients, typography uses `ui-serif` / `ui-sans-serif` system stacks.
- **Animation strategy**: every motion is CSS-driven — `prh-drift` on the reel, `prh-spin` on the lens rings (90 s outer, 240 s reverse on inner ticks so they don't lock), `prh-pulse` on each dot, `prh-eyepulse` on the eyebrow indicator. JavaScript never touches `transform`. `will-change: transform` on the reel track promotes it to a compositor layer for free 60 fps drift.
- **Accessibility**: the display name renders as a real `<h1>`; the reel has `aria-label="Drifting photo reel"`; duplicated tiles in the second half of the marquee track are `aria-hidden`; the wireframe lens SVG and Halton scatter are `aria-hidden`; hover-pause works through `focus-within` so keyboard users get the same affordance.
- **Reduced motion**: detected on mount via `matchMedia('(prefers-reduced-motion: reduce)')` and reflected as a `.prh-instant` class that disables every loop. A `@media (prefers-reduced-motion: reduce)` block also disables the same animations with `!important`, so the protection is double-layered (no race between mount and first paint).

## State Flow Diagram

```
        ┌──────────────────────┐
        │       INITIAL        │  ── server-render or pre-mount
        │  prefersRM = false   │     copy hidden (8 px ↓)
        │  mounted   = false   │
        └─────────┬────────────┘
                  │ onMount: matchMedia read; rAF → mounted = true
                  ▼
        ┌──────────────────────┐
        │       MOUNTED        │  copy fades + slides in (700 ms)
        │  prefersRM = mq.match│  reel begins drift (if !prefersRM)
        │  mounted   = true    │
        └─────────┬────────────┘
                  │
       ┌──────────┼──────────────────────┐
       │          │                      │
  pointer/focus over reel           mq → 'reduce'
  ─────────────────────             ────────────
  CSS pause via                     all CSS loops halt
  animation-play-state              (.prh-instant class)
       │          │                      │
       └──────────┼──────────────────────┘
                  │
            hover ends / blur
                  ▼
            drift resumes (or stays static if prefersRM)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `photos` | `Photo[]` | `SAMPLE_PHOTOS` | Array of photo descriptors; defaults to 14 generic gradient tiles. |
| `name` | `string` | `'Aria Lindqvist'` | Display name rendered as the `<h1>`. |
| `tagline` | `string` | `'photographs of light, distance, and quiet rooms'` | Sans-serif tagline beneath the name. |
| `years` | `string` | `'2018 — 2026'` | Eyebrow date range shown in the pill above the name. |
| `dotCount` | `number` | `24` | Number of Halton-scatter focal dots. |
| `duration` | `number` | `36` | Seconds per full reel cycle; larger = slower drift. |
| `theme` | `'light' \| 'dark'` | `'dark'` | Background palette and text colour. |
| `class` | `string` | `''` | Extra classes appended to the root `<section>`. |

The `Photo` shape:

```typescript
type Photo = {
  id: string;            // kebab-case, reserved for ?photo= URL sync (M2)
  caption: string;       // editorial one-liner shown in the tile caption
  category: string;      // tag — Studio, Portrait, Urban, etc.
  cover: {
    from: string;        // gradient stop 1
    via: string;         // gradient stop 2
    to: string;          // gradient stop 3
    accent: string;      // vignette + focal dot
  };
  src?: string;          // reserved for M2 real-image swap-in
};
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Small viewport (mobile portrait) | Tile width is `clamp(160px, 18vw, 240px)` so tiles shrink with the viewport but stop at 160 px; the reel mask gradient hides tiles partially outside the safe area. `<h1>` uses `clamp(2.5rem, 7vw, 5rem)` for fluid type. |
| Single / empty `photos` | Single: both halves duplicate; loop still appears continuous. Empty: marquee renders nothing; the lens, dots, and copy still render. |
| Slow network | No external assets — first paint is bounded by HTML/CSS only. Inline SVG never waits for an image request. |
| `prefers-reduced-motion: reduce` | Reel drift, lens spin, dot pulse, and eyebrow pulse stop. Hover-pause still works. The one-shot 700 ms copy fade-in still runs. |
| Keyboard-only user | Tabbing into a tile triggers `focus-within` on the reel, pausing drift via CSS — same affordance as mouse hover. `<h1>` and tagline are real text, so screen readers and search see them in document order. |
| Dark mode toggle | Pass `theme="light"` for the light palette. The component uses `color-mix(in srgb, currentColor, transparent)` everywhere, so a parent-set colour flows through. |
| Server-side rendering | All decorative numbers (dot positions, delays) are deterministic via the Halton sequence — SSR/CSR render byte-identical, no hydration warning. The reduced-motion query runs only on mount; reduced-motion users may see one quick frame of motion before it stops. |
| `duration={0}` | CSS treats this as a paused animation; the reel sits at frame zero. Useful for static screenshots. |
| Long captions | Wrap to a second line rather than truncating; tile padding increases rather than overflowing. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, `onMount` for the reduced-motion query and the dealcue mount flag.
- Zero external runtime dependencies — no GSAP, no Motion One, no icon library, no font CDN, no images. The wireframe lens is inline SVG, the typography uses `ui-serif` / `ui-sans-serif` system stacks, and the photo tiles are pure CSS gradients.

## File Structure

```
src/lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte   # implementation
src/lib/components/PortfolioPhotographer/PhotoReelHero.svelte           # reel + lens + copy subcomponent
src/lib/components/PortfolioPhotographer/types.ts                        # Photo type + Halton helpers
src/lib/components/PortfolioPhotographer/photos.ts                       # SAMPLE_PHOTOS fallback data
src/lib/components/PortfolioPhotographer.md                              # this file (rendered inside ComponentPageShell)
src/lib/components/PortfolioPhotographer.test.ts                         # vitest unit tests
src/routes/portfolio-photographer/+page.svelte                           # demo page
```
