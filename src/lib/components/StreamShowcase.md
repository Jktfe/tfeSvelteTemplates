---
name: StreamShowcase
category: Statement Sections
author: AntClaude
status: stable
---

# StreamShowcase

An editorial streaming-platform shelf for showcasing curated playlists. A
brush-script title dominates a short hero; a 10-card fan carousel splays
cards around a shared pivot below the deck. Click, drag or use the keyboard
to navigate.

> **Milestone 1 (this release):** hero + carousel + interactions.
> The FLIP modal, inline YouTube playback, and `?playlist=slug` URL sync
> are reserved for M2 / M3.

## When to use it

- Marketing or landing page where curated content needs editorial weight
- Course / podcast / YouTube playlist hub
- Founder / studio "what we're working on" shelf
- Anywhere a primitive carousel feels too lightweight

## When **not** to use it

- Functional content discovery (use a regular grid + search)
- Lists longer than ~12 items (fan layout breaks down past that)
- High-density product catalogs (the per-card real estate is small)

## Usage

Default — five sample playlists, ten-card fan, dark theme:

```svelte
<script>
	import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
</script>

<StreamShowcase />
```

Pass your own playlists, react to selection:

```svelte
<script>
	import StreamShowcase from '$lib/components/StreamShowcase/StreamShowcase.svelte';
	import type { Playlist } from '$lib/components/StreamShowcase/types.js';

	const playlists: Playlist[] = [
		{
			slug: 'launch-week',
			title: 'Launch Week',
			tag: 'Founder Diary',
			description: 'Behind-the-launch storytelling, one short episode per shipped feature.',
			cover: { from: '#0f172a', to: '#1e293b', accent: '#fbbf24' },
			episodeCount: 8
		}
		// ...
	];

	let active = $state(2);
</script>

<StreamShowcase
	{playlists}
	count={10}
	bind:active
	eyebrow="Now playing"
	topLine="Build."
	bottomLine="Ship."
	theme="dark"
	onSelect={(p, i) => console.log('opened', p.slug, i)}
/>
```

## Props

| Prop         | Type                       | Default                    |
| ------------ | -------------------------- | -------------------------- |
| `playlists`  | `Playlist[]`               | `SAMPLE_PLAYLISTS` (5)     |
| `count`      | `number`                   | `10`                       |
| `eyebrow`    | `string`                   | `'Now browsing'`           |
| `topLine`    | `string`                   | `'Queue up.'`              |
| `bottomLine` | `string`                   | `'Level up.'`              |
| `active`     | `number` (bindable)        | `floor(count / 2)`         |
| `onSelect`   | `(p: Playlist, i) => void` | —                          |
| `theme`      | `'light' \| 'dark'`        | `'dark'`                   |
| `class`      | `string`                   | `''`                       |

`count` controls the number of cards in the fan; the `playlists` array is
looped, so a five-playlist input with `count=10` will repeat each playlist
twice (matching the brief).

The `Playlist` shape lives in `StreamShowcase/types.ts` and exports the
helpers used internally — `fanAngle`, `wrapIndex`, `easedRotation` — so
they can be unit-tested or reused by adjacent components.

## Interaction

| Trigger                    | Behaviour                                       |
| -------------------------- | ----------------------------------------------- |
| `←` / `→`                  | Move active by 1 (clamps at edges)              |
| `Home` / `End`             | Jump to first / last card                       |
| `Enter` on active card     | Fire `onSelect(playlist, index)`                |
| Click on side card         | Bring that card to centre (does not fire select) |
| Click on centre card       | Fire `onSelect`                                 |
| Drag horizontally          | Spin the fan in real time                       |
| Pointer release after drag | Snap to the nearest card based on travel        |

Drag uses `pointercapture`, so the fan keeps tracking the cursor even if
you slide off the deck.

## Accessibility

- The hero is a real `<h1>` with the canonical text duplicated in a
  visually-hidden `<span>` so screen readers always read the unbroken
  string. The animated letter spans are `aria-hidden="true"`.
- The carousel is `role="region"` with
  `aria-roledescription="carousel"`.
- The active card has `aria-current="true"` and `tabindex="0"`. All other
  cards are `tabindex="-1"` so Tab visits exactly one card per carousel.
- Each card's `aria-label` includes the playlist title, tag and episode
  count.
- Keyboard handlers live on the region wrapper, so focus moves with
  the active card automatically (no roving-tabindex bookkeeping in your
  parent code).

## Reduced motion

When `prefers-reduced-motion: reduce` is detected:

- The brush-script letter entrance is skipped (full opacity, no
  translate/blur).
- Card deal-out is skipped (cards appear in their final fan positions).
- Drag-to-rotate is disabled (keyboard + click still work).
- The eyebrow status dot stops pulsing.

## Asset and dependency notes

- **No external images.** Card art is pure CSS gradients tinted with
  `color-mix()`. Each playlist's `cover` prop describes its colour stops.
- **No GSAP, no rAF physics, no third-party motion library.** All
  motion is plain CSS transitions plus a few Svelte-driven inline
  styles, so the runtime cost is essentially zero.
- **Brush-script font** uses a system stack:
  `'Caveat Brush', 'Caveat', 'Brush Script MT', 'Lucida Handwriting', cursive`.
  For pixel-perfect rendering, install `@fontsource/caveat-brush` in
  your application and import it in your root layout.

## Roadmap

- **M2** — FLIP modal opening from the active card, with episode list.
- **M3** — Inline YouTube playback + `?playlist=slug&episode=videoId`
  URL sync.

Both will land in this same component as additive props (`onSelect` will
become the trigger for the modal).
