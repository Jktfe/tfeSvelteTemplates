/**
 * ============================================================
 * Timeline Storyboard Data
 * ============================================================
 *
 * Interactive ExplainerCanvas storyboard for the Timeline component.
 * Mirrors the structure of shineborder.ts (Overview / Visual Guide /
 * Props / Code Examples / Accessibility / Tips).
 * ============================================================
 */

import type { ExplainerCanvasData } from '$lib/types';

export const timelineStoryboard: ExplainerCanvasData = {
	id: 'timeline-storyboard',
	title: 'Timeline Component',
	description: 'Animated chronological event timeline with vertical, horizontal, and progress modes.',
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
			summary: 'What Timeline does and when to reach for it',
			position: { x: 0, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## Timeline

Animated event timeline for project roadmaps, history pages, release ledgers, and onboarding flows.

### When to Use

- **Roadmaps & history** — show progress over time
- **Release notes** — version + ship date stamps
- **Onboarding flows** — step-by-step with completion ticks
- **Process flows** — horizontal layout for kanban-like swimlanes

### Key Features

- Vertical (alternating / left / right) and horizontal layouts
- Four entrance animation styles (slide, fade, scale, none) staggered with anime.js
- Progress overlay for completed events
- Pluggable date formatting (default, relative, custom function)
- Click handler with full event payload
- Light + dark theming via CSS custom properties
- Honours \`prefers-reduced-motion\``
				}
			],
			links: ['visual-guide', 'props'],
			children: []
		},
		{
			id: 'visual-guide',
			title: '👁️ Visual Guide',
			summary: 'Layouts and motion at a glance',
			position: { x: 400, y: 0 },
			content: [
				{
					type: 'markdown',
					content: `## How It Renders

### Vertical · alternating (default)

Events alternate left/right around a centre line. The connecting line + markers form a spine; the cards land on whichever side the index lands on.

\`\`\`
            ┌──────┐
            │ Mar  │
   ┌────────┤ ●    │
   │  Feb   │      │
   │   ●  ──┴──────┘
   │
   └─────────►
\`\`\`

### Vertical · left / right aligned

All events on one side. Better for narrow containers and sidebars.

\`\`\`
   ●─── Mar
   │
   ●─── Feb
   │
   ●─── Jan
\`\`\`

### Horizontal · scroll-snapped

Events run left to right, each card a fixed 280px wide. The container is \`overflow-x: auto\` with snap, so users can swipe through them on touch.

\`\`\`
  ●────●────●────●────●  →
  Jan  Feb  Mar  Apr  May
\`\`\``
				}
			],
			links: ['overview', 'props', 'code-examples'],
			children: []
		},
		{
			id: 'props',
			title: '⚙️ Props & Configuration',
			summary: 'Every prop, every default',
			position: { x: 0, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`events\` | \`TimelineEvent[]\` | required | Array of events to display |
| \`orientation\` | \`'vertical' \\| 'horizontal'\` | \`'vertical'\` | Layout direction |
| \`alignment\` | \`'left' \\| 'right' \\| 'alternate'\` | \`'alternate'\` | Item alignment (vertical only) |
| \`animation\` | \`'fade' \\| 'slide' \\| 'scale' \\| 'none'\` | \`'slide'\` | Entrance animation style |
| \`animationDuration\` | \`number\` | \`600\` | Animation duration in ms |
| \`animationDelay\` | \`number\` | \`100\` | Delay between item animations |
| \`lineColor\` | \`string\` | theme token | Override the connecting line colour |
| \`markerColor\` | \`string\` | theme token | Override the default marker colour |
| \`showProgress\` | \`boolean\` | \`false\` | Show completion progress overlay |
| \`dateFormat\` | \`function \\| 'relative'\` | — | Custom date formatter |
| \`onEventClick\` | \`function\` | — | Click handler |

### Theme Tokens (CSS custom properties)

Override these on \`.timeline\` to retheme without touching props:

\`\`\`css
.timeline {
  --timeline-title: #f1f5f9;       /* card title text */
  --timeline-description: #cbd5e1; /* card body text */
  --timeline-marker-ring: #0f172a; /* white halo around the dot */
  --line-color: rgba(...);
  --marker-color: #146ef5;
}
\`\`\``
				}
			],
			links: ['code-examples'],
			children: []
		},
		{
			id: 'code-examples',
			title: '💻 Code Examples',
			summary: 'Real-world usage patterns',
			position: { x: 400, y: 280 },
			content: [
				{
					type: 'markdown',
					content: `## Common Patterns

### Roadmap with progress

\`\`\`svelte
<script lang="ts">
  import Timeline from '$lib/components/Timeline.svelte';

  const events = [
    { id: '1', title: 'Discovery', date: '2026-01-15', completed: true },
    { id: '2', title: 'MVP', date: '2026-03-01', completed: true },
    { id: '3', title: 'Beta', date: '2026-05-01' },
    { id: '4', title: 'GA',   date: '2026-06-15' }
  ];
</script>

<Timeline
  events={events}
  orientation="vertical"
  alignment="alternate"
  animation="slide"
  showProgress
/>
\`\`\`

### Horizontal swipeable

\`\`\`svelte
<Timeline
  events={steps}
  orientation="horizontal"
  animation="scale"
  animationDelay={150}
/>
\`\`\`

### Relative dates ("3 days ago")

\`\`\`svelte
<Timeline
  events={recentActivity}
  orientation="vertical"
  alignment="left"
  dateFormat="relative"
  animation="fade"
/>
\`\`\`

### Click-to-detail

\`\`\`svelte
<script lang="ts">
  let selected = $state(null);
</script>

<Timeline
  events={events}
  onEventClick={(e) => (selected = e)}
/>

{#if selected}
  <Drawer bind:isOpen={drawerOpen}>{selected.description}</Drawer>
{/if}
\`\`\``
				}
			],
			links: ['accessibility'],
			children: []
		},
		{
			id: 'accessibility',
			title: '♿ Accessibility',
			summary: 'Keyboard, screen-reader, motion',
			position: { x: 0, y: 560 },
			content: [
				{
					type: 'markdown',
					content: `## Accessibility

### Keyboard

- Clickable items expose \`role="button"\` + \`tabindex="0"\` and respond to \`Enter\` and \`Space\`
- Non-clickable items are plain \`role="listitem"\` — no Tab focus
- Tab order follows source order (top → bottom for vertical, left → right for horizontal)

### Screen Readers

- Container is a \`role="list"\` labelled "Timeline of events"
- Each event uses \`<time datetime="...">\` so the date is announced as a date
- Markers have \`aria-hidden="true"\` because they're decorative

### Motion

- All entrance animations honour \`prefers-reduced-motion: reduce\`
- The marker hover transform + box-shadow transitions are disabled in reduced-motion mode
- Progress line animation is also gated on reduced-motion`
				}
			],
			links: ['tips'],
			children: []
		},
		{
			id: 'tips',
			title: '💡 Tips',
			summary: 'Patterns that work, traps to avoid',
			position: { x: 400, y: 560 },
			content: [
				{
					type: 'markdown',
					content: `## Tips

### Use stable \`event.id\` values

The Svelte each-loop is keyed on \`event.id\`. Stable ids make re-orderings animate smoothly; using array indices makes the wrong items re-mount when you reorder the data.

### Mobile alignment is forced left

At ≤ 768px viewports, the vertical timeline collapses both \`alternate\` and \`right\` layouts into \`align-left\`. Don't fight this — it's load-bearing for narrow viewports.

### Don't put a fixed-width timeline inside a narrow container

Set the parent's \`max-width\` and let the timeline fill it. The horizontal layout is \`overflow-x: auto\` — wrap it in something the page can scroll inside, not something that pushes the page itself.

### Combine with \`Drawer\` for "click to detail"

Click handlers are great for surfacing supplementary content without leaving the timeline. The pattern is: store the clicked event in \`$state\`, open a Drawer, render the event's full payload inside the drawer.

### Theme via CSS, not props

If you've got a design system, set \`--timeline-title\`, \`--timeline-description\`, and \`--timeline-marker-ring\` on \`.timeline\` (or a parent) and skip the colour props entirely. The component leaves these undefined by default so your CSS wins.`
				}
			],
			links: ['overview'],
			children: []
		}
	]
};
