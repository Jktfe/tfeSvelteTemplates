# TopologyColorGrid - Technical Logic Explainer

## What Does It Do? (Plain English)

TopologyColorGrid presents a colour palette as a full-bleed 3D scene. Each swatch is a card floating at its own height above a gently rippling wireframe plane; clicking a card lifts it into focus, and a toggle flattens the whole topology on to one plane. It is inspired by Aura's Interactive 3D Topology Color Grid (https://www.aura.build/component/95909) and rebuilt with Svelte state, client-only Three.js, GSAP entry reveals, keyboard-focusable cards and explicit light/dark themes.

**Think of it like:** paint chips pinned at different heights on a model landscape — you can pick one up to look at it, or press them all flat to compare them side by side.

---

## How It Works (Pseudo-Code)

```
WHEN component renders (server or client):
  1. activeId    = swatches[3].id ?? swatches[0].id     # the "apex" card by default
  2. isExtruded  = extruded
  3. activeTheme = theme
  4. FOR each swatch at index i:
       layout = topologyCardLayout(i, isExtruded)       # x, y, w, h, depth, rotation
       text   = readableTextColor(hex)                  # dark or white label
       RENDER <button> with those values as CSS custom properties

WHEN component mounts:
  1. setupWireframe():
       IF no WebGL2 → hasWireframe = false → stop (CSS scene still works)
       LAZY-LOAD three
       BUILD plane geometry (44 × 24 segments), wireframe material, camera
       ResizeObserver → resize renderer + camera aspect
       render once
       IF not reduced motion → requestAnimationFrame loop:
            z of every vertex = sin(time + x + y) × 0.18   # rolling wave
  2. LAZY-LOAD gsap
  3. IF reduced motion → set every [data-topology-reveal] visible → stop
  4. ELSE gsap.context → stagger reveal header + cards (y 28, rotateX −12°)

ON card click         → IF interactive AND not already active: activeId = card.id
ON "Flatten Plane"    → isExtruded = !isExtruded   (depth → 0 for every card)
ON "Dark/Light Mode"  → activeTheme toggles

WHEN component unmounts:
  1. revert GSAP context
  2. cancel rAF, disconnect observer, dispose geometry/material/renderer
```

---

## The Core Concept: CSS Depth Driven by a Layout Table

The cards are not Three.js objects — they are real `<button>` elements positioned with CSS 3D transforms. A fixed seven-slot table decides where each card lives:

```
slot  x%  y%  w%  h%  depth  rot°
 0    20  72  27  23   18    -1
 1    36  48  24  19   54     1
 2    26  34  21  20   34    -2
 3    50  60  33  27   84     0    ← default active "apex"
 4    66  35  32  20  112     1    ← tallest
 5    74  64  23  22   42    -1
 6    87  72  23  24   66     2
```

`topologyCardLayout(index, extruded)` wraps the index modulo 7, so an eighth swatch reuses slot 0. When `extruded` is `false`, every depth becomes `0` — flatten means genuinely flat. The values are written to `--x`, `--y`, `--w`, `--h`, `--z` and `--r`, and the stylesheet turns them into `translate3d` and `rotate`, so toggling extrusion is a pure CSS transition.

Keeping cards in the DOM (rather than in WebGL) is what makes them focusable, screen-reader friendly and clickable without ray-casting.

---

## Colour Helpers

| Helper | Behaviour |
|--------|-----------|
| `normalizeHex(hex)` | Accepts `#abc`, `abc`, `#aabbcc` or `aabbcc`; returns upper-case `#AABBCC`; invalid input returns `#000000`. |
| `hexToRgbTriplet(hex)` | Returns `[r, g, b]` as integers. |
| `formatRgbTriplet(hex)` | Returns a zero-padded string such as `194 . 065 . 012`. |
| `readableTextColor(hex)` | Relative luminance above 0.58 → `#111827`, otherwise `#ffffff`. |
| `topologyCardLayout(index, extruded)` | Looks up the slot for a card (index wrapped modulo 7); depth is `0` when `extruded` is `false`. |

---

## Multiple Instances

The `<section>` is labelled by its `<h1>` through `aria-labelledby`. The heading id is built from `$props.id()`, so several grids can share a page (the demo route mounts four) without duplicate ids — each section always points at its own title.

```
uid       = $props.id()                          # unique, SSR-stable per instance
headingId = `topology-color-grid-title-${uid}`
<section aria-labelledby={headingId}>
  <h1 id={headingId}>{title}</h1>
```

Each instance also owns its own WebGL canvas, `ResizeObserver`, animation frame and GSAP context, and tears all of them down on unmount, so one grid's theme or extrusion toggle never touches another.

---

## State Flow Diagram

```
   ┌─────────────────────┐   mount   ┌────────────────────────────┐
   │  STATIC (SSR)       │ ────────▶ │  WIREFRAME SETUP           │
   │  cards + header     │           │  WebGL2? ── no ──▶ hasWire-│
   └─────────────────────┘           │  frame = false (CSS only)  │
                                     └────────────┬───────────────┘
                                                  │ yes
                                                  ▼
                                     ┌────────────────────────────┐
                                     │  REVEAL                    │
                                     │  GSAP stagger (or instant  │
                                     │  under reduced motion)     │
                                     └────────────┬───────────────┘
                                                  ▼
                                     ┌────────────────────────────┐
         click card (interactive) ──▶│  IDLE                      │◀── toggle theme
         → activeId = card.id        │  wave animating (rAF)      │    light ⇄ dark
                                     │  activeId · isExtruded ·   │
         Flatten / Activate ────────▶│  activeTheme               │
         → depth ⇄ 0                 └────────────────────────────┘

   Unmount → revert GSAP, cancel rAF, dispose Three.js resources
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `swatches` | `TopologySwatch[]` | `defaultTopologySwatches` (7 swatches) | Colours to show; each has `id`, `name`, `hex` and `label`. |
| `title` | `string` | `'Chromatic Substrate Topology'` | Scene heading (rendered as `<h1>`). |
| `subtitle` | `string` | `'Spatial Z-Index Mapping'` | Line under the heading. |
| `extruded` | `boolean` | `true` | Initial extrusion; cards float at their table depth when `true`. |
| `interactive` | `boolean` | `true` | Allow clicking a card to make it active. |
| `theme` | `'light' \| 'dark'` | `'light'` | Initial theme. |
| `showThemeToggle` | `boolean` | `true` | Show the Light/Dark mode button. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Browser without WebGL2 | The wireframe canvas is disabled; the CSS card scene still renders and works. |
| More than seven swatches | Layout slots repeat modulo 7, so later cards overlap earlier ones — keep to seven for a clean scene. |
| Fewer than four swatches | The first swatch becomes the default active card. |
| Invalid hex such as `'red'` | Rendered as `#000000` with white text. |
| `interactive={false}` | Cards stay focusable but clicking does not change the active card. |
| Clicking the already-active card | No-op, so no transition is retriggered. |
| `prefers-reduced-motion: reduce` | The wireframe renders one still frame, and the entry reveal is skipped. |
| Props change after mount | `extruded` and `theme` seed internal state once; use the built-in toggles to change them at runtime. |
| Two grids on one page | Safe. Each heading id is derived from `$props.id()`, so every `aria-labelledby` resolves to its own title. |

---

## Dependencies

- **Svelte 5.x** — runes and `onMount` for client-only setup.
- **`three`** — dynamically imported for the animated wireframe plane only; the cards are plain DOM.
- **`gsap`** — dynamically imported via `$lib/gsapMotion` for the staggered entry reveal.
- **`$lib/gsapMotion`** — `loadGsap` and `prefersReducedMotion`; copy it alongside the component.

---

## File Structure

```
src/lib/components/TopologyColorGrid.svelte     # implementation + exported colour/layout helpers
src/lib/components/TopologyColorGrid.md         # this file (rendered inside ComponentPageShell)
src/lib/components/TopologyColorGrid.test.ts    # vitest unit tests
src/lib/gsapMotion.ts                           # shared GSAP loader + reduced-motion check
src/routes/topologycolorgrid/+page.svelte       # demo page
```
