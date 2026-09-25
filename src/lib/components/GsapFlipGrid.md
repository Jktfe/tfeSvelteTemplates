# GsapFlipGrid - Technical Logic Explainer

## What Does It Do? (Plain English)

GsapFlipGrid is a CSS Grid of cards that glides every card to its new spot when you filter, sort, change density, or promote a card to the featured slot. It is the non-deck alternative to `CardStack`: reach for it when the content is a real grid, gallery, component directory or catalogue and users need to rearrange it without the layout jumping.

**Think of it like:** rearranging photos on a corkboard while someone films it. Instead of the photos teleporting, the film shows each one sliding from where it was to where it now lives.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. activeFilter   = initialFilter            ('all')
  2. activeItemId   = initialFeaturedId ?? items[0].id
  3. density        = initialDensity           ('featured')
  4. sortMode       = initialSort              ('curated')
  5. visibleItems   = order(filter(normalise(items), activeFilter), activeItemId, sortMode)

WHEN component mounts:
  1. LOAD gsap + gsap/Flip client-side via $lib/gsap/context
  2. IF not reduced motion → stagger the cards in once

withFlip(mutate):
  1. IF no grid OR Flip not loaded OR reduced motion:
       mutate(); await tick(); return          # plain state change, no animation
  2. state = Flip.getState(cards)              # capture FIRST positions
  3. mutate()                                  # change filter / sort / density / promoted id
  4. await tick()                              # let Svelte update the DOM (LAST positions)
  5. Flip.from(state, { absolute, prune, stagger, onEnter, onLeave })

ON filter click     → withFlip(set activeFilter; if promoted card vanished, promote first visible)
ON Feature/Compact  → withFlip(set density)
ON A-Z / Curated    → withFlip(toggle sortMode)
ON card click       → IF promoteOnClick: preventDefault, withFlip(promote card, force 'featured')
```

---

## The Core Concept: FLIP (First, Last, Invert, Play)

Real CSS Grid reflows are instant — the browser has no idea a card "moved". FLIP fakes the motion:

```
  FIRST   measure every card's box            ┌──┐┌──┐┌──┐
                                              │A ││B ││C │
  MUTATE  change state, Svelte re-renders     └──┘└──┘└──┘
  LAST    measure again                       ┌──────┐┌──┐
                                              │  C   ││A │   (C promoted)
  INVERT  transform each card back to FIRST   └──────┘└──┘
  PLAY    tween the transform to zero         ┌──┐
                                              │B │
                                              └──┘
```

GSAP's Flip plugin does the measuring and inverting. Cards that appear run `onEnter` (fade + scale up from 0.94); cards that disappear run `onLeave` (fade + scale down). `prune: true` skips cards that did not move, and a 24ms stagger gives the grid a ripple.

---

## Pure Helper Pipeline

The ordering rules are exported from `<script module>` so tests and agents can reuse them:

| Helper | Behaviour |
|--------|-----------|
| `normalizeFlipGridItems(items)` | Drops items with blank titles and generates a slug-based `id` when one is missing. |
| `normalizeFlipGridFilters(filters)` | Prepends `{ id: 'all', label: 'All' }` and removes duplicates or empty ids. |
| `filterFlipGridItems(items, filter)` | Keeps items whose `filter`, `category` or `tags` match; `'all'` keeps everything. |
| `sortFlipGridItems(items, mode)` | `'alpha'` sorts by title with `localeCompare`; `'curated'` keeps source order. |
| `orderFlipGridItems(items, promotedId, mode)` | Sorts, then moves the promoted card to the front. |

---

## State Flow Diagram

```
                     ┌──────────────────────────────┐
                     │  IDLE                        │
                     │  filter · sort · density ·   │
                     │  promoted id                 │
                     └──────┬───────────────────────┘
      filter / density /    │
      sort / card click     ▼
                     ┌──────────────────────────────┐   reduced motion or
                     │  withFlip()                  │── Flip not loaded ──▶ mutate + tick
                     │  getState(cards)  (FIRST)    │                       (instant)
                     └──────┬───────────────────────┘
                            │ mutate + tick
                            ▼
                     ┌──────────────────────────────┐
                     │  ANIMATING                   │
                     │  Flip.from(state) 0.62s      │
                     │  onEnter / onLeave tweens    │
                     └──────┬───────────────────────┘
                            │ complete
                            ▼
                          IDLE

   Unmount → killTweensOf(cards)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `GsapFlipGridItem[]` | Built-in sample cards | Cards with `id`, `title`, `description` and optional `href`, `icon`, `image`, `meta`, `category`, `filter`, `tags`, `accent`. |
| `filters` | `GsapFlipGridFilter[]` | `[]` | Extra filter buttons (`{ id, label }`); an "All" button is always prepended. |
| `title` | `string` | `'Animated CSS Grid positions'` | Header title. |
| `eyebrow` | `string` | `'GSAP Flip Grid'` | Small uppercase label above the title. |
| `description` | `string` | Short sample sentence | Header description. |
| `initialFilter` | `string` | `'all'` | Filter active on first render. |
| `initialFeaturedId` | `string` | First item's `id` | Card promoted to the featured slot on first render. |
| `initialDensity` | `'featured' \| 'compact'` | `'featured'` | Starting layout density. |
| `initialSort` | `'curated' \| 'alpha'` | `'curated'` | Starting sort order. |
| `showHeader` | `boolean` | `true` | Render the eyebrow/title/description header. |
| `showControls` | `boolean` | `true` | Render the filter, density and sort buttons. |
| `promoteOnClick` | `boolean` | `true` | Clicking a card promotes it instead of following its link. |
| `controlsLabel` | `string` | `'Filter and arrange grid items'` | Accessible label for the controls group. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Filter hides the promoted card | The first visible card is promoted instead. |
| Filter matches nothing | Grid empties and "No matching grid items." renders. |
| Item has a blank title | Dropped by `normalizeFlipGridItems`. |
| Item has no `id` | A slug of the title plus its index is used; keep ids stable between renders. |
| `promoteOnClick` is `true` and the card has an `href` | Navigation is prevented; the click promotes the card. Set `promoteOnClick={false}` for a navigable directory. |
| `prefers-reduced-motion: reduce` | State changes apply instantly with no Flip or entrance animation. |
| Clicking the already-active control | No-op — `withFlip` is never called. |
| SSR | GSAP and Flip load only in `onMount`; the server renders the static grid. |

---

## Dependencies

- **Svelte 5.x** — runes and `tick()` so Flip can measure the post-update layout.
- **`gsap`** and **`gsap/Flip`** — the Flip plugin handles measurement and inversion; building FLIP for grid reflows natively would be a sizeable project.
- **`$lib/gsap/context`** — SSR-safe plugin registration and the reduced-motion check.
- **`$lib/styles/gsap-tokens.css`** — shared GSAP suite tokens for light and dark themes.

---

## File Structure

```
src/lib/components/GsapFlipGrid.svelte     # implementation + exported pure helpers
src/lib/components/GsapFlipGrid.md         # this file (rendered inside ComponentPageShell)
src/lib/components/GsapFlipGrid.test.ts    # vitest unit tests for the helpers
src/lib/gsap/context.ts                    # SSR-safe GSAP plugin loader
src/lib/styles/gsap-tokens.css             # suite design tokens
src/routes/gsap-suite/+page.svelte         # demo page (GSAP suite)
```
