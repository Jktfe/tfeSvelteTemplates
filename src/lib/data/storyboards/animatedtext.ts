/**
 * ============================================================
 * AnimatedText Storyboard Data
 * ============================================================
 *
 * ExplainerCanvas storyboard for AnimatedText — the path-following
 * text ribbon that cross-fades into a hidden phrase.
 * Sections: Overview / Visual Guide / Props / Code Examples /
 * Accessibility / Tips.
 * ============================================================
 */

import type { ExplainerCanvasData } from '$lib/types';

export const animatedTextStoryboard: ExplainerCanvasData = {
	id: 'animatedtext-storyboard',
	title: 'AnimatedText Component',
	description: 'A text ribbon drifting along an SVG path that cross-fades into a second phrase',
	defaultCardId: 'overview',
	config: {
		lineStyle: 'bezier',
		background: { type: 'dots', color: '#e2e8f0', size: 1, gap: 20 },
		enableSearch: true
	},
	cards: [
		{
			id: 'overview',
			title: '🎯 Overview',
			summary: 'What AnimatedText does and when to use it',
			position: { x: 0, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## AnimatedText

A phrase is repeated along a curved SVG path and drifts slowly sideways. Hover, focus or tap it and the ribbon cross-fades into a second phrase.

### When to Use

- **Hero ribbons** — kinetic type behind a headline
- **Section breaks** — a moving divider with a hidden message
- **Event banners** — "now booking" that reveals the dates

### Key Features

- Any SVG path via the \`path\` prop
- Seamless loop measured from the rendered text
- Hover / click / decorative trigger models
- Zero dependencies, themable in light and dark`
				}
			],
			links: ['visual-guide', 'props'],
			children: []
		},
		{
			id: 'visual-guide',
			title: '👁️ Visual Guide',
			summary: 'How the seamless loop works',
			position: { x: 400, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## One Cell at a Time

Each copy of the phrase carries a trailing separator, so every "cell" is identical in width. The ribbon only ever slides by one cell, then wraps — cell 2 lands exactly where cell 1 began, so the jump is invisible.

\`\`\`
[PHRASE · ][PHRASE · ][PHRASE · ][PHRASE · ]
|<-loop->|
offset: 0 ───────▶ -loop │ 0 ───────▶ -loop
\`\`\`

Two \`<text>\` layers share the same path and the same distance. The morph is just an opacity cross-fade between them.`
				}
			],
			links: ['overview', 'props'],
			children: []
		},
		{
			id: 'props',
			title: '⚙️ Props & Configuration',
			summary: 'Every prop and theming token',
			position: { x: 0, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Props

| Prop | Type | Default |
|------|------|---------|
| \`originalText\` | \`string\` | required |
| \`morphedText\` | \`string\` | \`''\` |
| \`morphed\` | \`boolean\` (bindable) | \`false\` |
| \`trigger\` | \`'hover' \\| 'click' \\| 'none'\` | \`'hover'\` |
| \`speed\` | \`number\` | \`30\` |
| \`direction\` | \`'left' \\| 'right'\` | \`'left'\` |
| \`paused\` | \`boolean\` | \`false\` |
| \`repeat\` | \`number\` | \`4\` |
| \`path\` | \`string\` | S-curve |
| \`height\` | \`number\` | \`200\` |
| \`label\` | \`string\` | both phrases |

### Tokens

\`--animated-text-bg\`, \`--animated-text-fg\`, \`--animated-text-focus-ring\` flip in dark mode. \`--animated-text-accent\` is brand and stays put.`
				}
			],
			links: ['code-examples'],
			children: []
		},
		{
			id: 'code-examples',
			title: '📝 Code Examples',
			summary: 'Copy-paste ready examples',
			position: { x: 400, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Basic

\`\`\`svelte
<${'script'} lang="ts">
  import AnimatedText from '$lib/components/AnimatedText.svelte';
  let morphed = $state(false);
</${'script'}>

<AnimatedText
  originalText="STATIC DRIFT TRANSMIT RECEIVE"
  morphedText="SIGNAL FOUND — SAY HELLO"
  bind:morphed
/>
\`\`\`

## Decorative, driven externally

\`\`\`svelte
<AnimatedText
  originalText="ORBIT · SIGNAL · RETURN"
  morphedText="HOUSTON, WE HEAR YOU"
  trigger="none"
  morphed={reveal}
  paused={!animate}
/>
\`\`\``
				}
			],
			links: ['accessibility'],
			children: []
		},
		{
			id: 'accessibility',
			title: '♿ Accessibility',
			summary: 'Keyboard, screen readers and motion',
			position: { x: 200, y: 520 },
			content: [
				{
					type: 'markdown',
					content: `## Accessibility

- Interactive modes render a real \`<button aria-pressed>\`
- **Tab** focus (focus-visible) morphs like hover
- **Enter / Space** toggle, **Escape** resets
- Touch: a tap toggles
- The SVG is \`aria-hidden\`, so the repeated ribbon isn't read four times
- \`trigger="none"\` renders \`role="img"\` named after the current phrase
- **prefers-reduced-motion**: no drift, and the morph is an instant swap`
				}
			],
			links: ['tips'],
			children: []
		},
		{
			id: 'tips',
			title: '💡 Tips',
			summary: 'Getting the best out of it',
			position: { x: 200, y: 760 },
			content: [
				{
					type: 'markdown',
					content: `## Tips

- Short phrase? Raise \`repeat\` so the ribbon covers the whole path
- Paths are drawn in a 1200×300 viewBox — overshoot the edges so the ribbon enters and exits off-screen
- Keep \`speed\` modest (20–60); fast drift is hard to read
- Retheme with the doubled-class override pattern from \`docs/THEMING.md\``
				}
			],
			links: ['overview'],
			children: []
		}
	]
};
