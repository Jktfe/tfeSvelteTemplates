/**
 * ============================================================
 * WaveText Storyboard Data
 * ============================================================
 *
 * ExplainerCanvas storyboard for WaveText — text set on a
 * generated sine wave that ripples on hover, focus or tap.
 * Sections: Overview / Visual Guide / Props / Code Examples /
 * Accessibility / Tips.
 * ============================================================
 */

import type { ExplainerCanvasData } from '$lib/types';

export const waveTextStoryboard: ExplainerCanvasData = {
	id: 'wavetext-storyboard',
	title: 'WaveText Component',
	description: 'A phrase set on a generated sine wave that ripples when triggered',
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
			summary: 'What WaveText does and when to use it',
			position: { x: 0, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## WaveText

Sets a phrase on a smooth sine wave. Hover, focus or tap it and a ripple flows through the letters.

### When to Use

- **Playful headings** — seaside, music, summer campaigns
- **Badges and stickers** — a little motion on demand
- **Section breaks** — a wavy divider with words

### Key Features

- Shape controlled by \`amplitude\` + \`wavelength\`
- Flowing ripple while \`playing\`
- Hover / click / decorative trigger models
- Scoped styles, unique ids, zero dependencies`
				}
			],
			links: ['visual-guide', 'props'],
			children: []
		},
		{
			id: 'visual-guide',
			title: '👁️ Visual Guide',
			summary: 'How the wave is built',
			position: { x: 400, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## Building the Wave

\`\`\`
y = centre + amplitude × sin(2π × x / wavelength − phase)
\`\`\`

\`\`\`
      ╭──╮        ╭──╮
    ╱      ╲    ╱      ╲
──╱──────────╲╱──────────╲──
  └──── wavelength ────┘
\`\`\`

Advancing \`phase\` each frame slides every crest sideways — that's the ripple. The phrase rides the curve through \`<textPath>\`.`
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
| \`text\` | \`string\` | \`'WAVING TEXT'\` |
| \`amplitude\` | \`number\` | \`20\` |
| \`wavelength\` | \`number\` | \`200\` |
| \`playing\` | \`boolean\` (bindable) | \`false\` |
| \`trigger\` | \`'hover' \\| 'click' \\| 'none'\` | \`'hover'\` |
| \`speed\` | \`number\` | \`0.5\` |
| \`align\` | \`'start' \\| 'middle' \\| 'end'\` | \`'middle'\` |
| \`height\` | \`number\` | \`220\` |
| \`label\` | \`string\` | \`text\` |

### Tokens

\`--wave-text-fg\`, \`--wave-text-bg\`, \`--wave-text-focus-ring\` (chrome, flip in dark) plus \`--wave-text-font\` and \`--wave-text-size\`.`
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
  import WaveText from '$lib/components/WaveText.svelte';
</${'script'}>

<WaveText text="Making waves" amplitude={24} wavelength={240} />
\`\`\`

## External play / pause

\`\`\`svelte
<${'script'} lang="ts">
  let playing = $state(false);
</${'script'}>

<WaveText text="Now arriving" trigger="none" bind:playing />
<button onclick={() => (playing = !playing)}>Toggle</button>
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
- **Tab** focus (focus-visible) starts the ripple like hover
- **Enter / Space** toggle, **Escape** stops
- Touch: a tap toggles
- The SVG is \`aria-hidden\`; the phrase is the accessible name
- **prefers-reduced-motion**: the wave flips half a cycle instead of animating`
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

- Keep phrases short — anything past the end of the wave is clipped
- Large amplitudes need a taller \`height\` to avoid cropping crests
- Wavelengths of 150–400 read best; very short waves get choppy
- The background is transparent by default, so it sits on any surface`
				}
			],
			links: ['overview'],
			children: []
		}
	]
};
