<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Timeline from '$lib/components/Timeline.svelte';
	import { FALLBACK_TIMELINE_EVENTS, FALLBACK_COMPANY_TIMELINE } from '$lib/constants';
	import type { TimelineEvent } from '$lib/types';

	const shell = catalogShellPropsForSlug('/timeline')!;

	let clickedEvent = $state<TimelineEvent | null>(null);

	function handleEventClick(event: TimelineEvent) {
		clickedEvent = event;
		setTimeout(() => {
			clickedEvent = null;
		}, 3000);
	}

	function formatDateShort(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Timeline — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated chronological timeline with vertical (alternating, left, right) and horizontal layouts, four animation styles, and progress tracking."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Animation', 'A11y', 'Theme-aware']}
	codeExplanation="Timeline takes a TimelineEvent[] and lays them out vertically or horizontally, with alternating, left, or right alignment. Entrance animations — slide, fade, scale, none — stagger across items. Date formatting is pluggable: pass a function or 'relative' for human-friendly dates. All animations honour prefers-reduced-motion."
>
	{#snippet demo()}
		<div class="tl-demo">
			<section class="tl-block">
				<header class="tl-head">
					<h3>Vertical · alternating</h3>
					<p>Default layout — alternates left/right around a centre line.</p>
				</header>
				<div class="tl-stage tl-stage--wide">
					<Timeline events={FALLBACK_TIMELINE_EVENTS} orientation="vertical" alignment="alternate" />
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Vertical · left aligned</h3>
					<p>All events on the left — works in narrower containers.</p>
				</header>
				<div class="tl-stage">
					<div class="tl-narrow">
						<Timeline
							events={FALLBACK_TIMELINE_EVENTS.slice(0, 4)}
							orientation="vertical"
							alignment="left"
							animation="fade"
						/>
					</div>
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Company history · progress</h3>
					<p>Completed events show a checkmark; the line fills as you progress.</p>
				</header>
				<div class="tl-stage tl-stage--wide">
					<Timeline
						events={FALLBACK_COMPANY_TIMELINE}
						orientation="vertical"
						alignment="alternate"
						showProgress={true}
						animation="slide"
					/>
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Horizontal layout</h3>
					<p>Scrollable on smaller screens — good for process flows.</p>
				</header>
				<div class="tl-stage tl-stage--horizontal">
					<Timeline events={FALLBACK_TIMELINE_EVENTS.slice(0, 5)} orientation="horizontal" animation="scale" />
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Interactive · onEventClick</h3>
					<p>Click any event to fire the callback.</p>
				</header>
				{#if clickedEvent}
					<div class="tl-toast">
						You clicked: <strong>{clickedEvent.title}</strong> ({clickedEvent.date})
					</div>
				{/if}
				<div class="tl-stage tl-stage--wide">
					<Timeline
						events={FALLBACK_TIMELINE_EVENTS}
						orientation="vertical"
						alignment="alternate"
						onEventClick={handleEventClick}
					/>
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Custom colours</h3>
					<p>Override line and marker colours; per-event colour wins.</p>
				</header>
				<div class="tl-stage tl-stage--wide">
					<Timeline
						events={FALLBACK_TIMELINE_EVENTS.slice(0, 4)}
						orientation="vertical"
						alignment="alternate"
						lineColor="#cbd5e1"
						markerColor="#8b5cf6"
					/>
				</div>
			</section>

			<section class="tl-block">
				<header class="tl-head">
					<h3>Date formatting</h3>
					<p>Relative dates · custom formatter</p>
				</header>
				<div class="tl-grid-2">
					<div class="tl-stage">
						<h4>Relative</h4>
						<Timeline
							events={FALLBACK_TIMELINE_EVENTS.slice(0, 3)}
							orientation="vertical"
							alignment="left"
							dateFormat="relative"
							animation="none"
						/>
					</div>
					<div class="tl-stage">
						<h4>Custom format</h4>
						<Timeline
							events={FALLBACK_TIMELINE_EVENTS.slice(0, 3)}
							orientation="vertical"
							alignment="left"
							dateFormat={formatDateShort}
							animation="none"
						/>
					</div>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>events</code></td><td><code>TimelineEvent[]</code></td><td>required</td><td>Events to render.</td></tr>
				<tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td><td>Layout direction.</td></tr>
				<tr><td><code>alignment</code></td><td><code>"left" | "right" | "alternate"</code></td><td><code>"alternate"</code></td><td>Vertical-only alignment.</td></tr>
				<tr><td><code>animation</code></td><td><code>"fade" | "slide" | "scale" | "none"</code></td><td><code>"slide"</code></td><td>Entrance animation.</td></tr>
				<tr><td><code>animationDuration</code></td><td><code>number</code></td><td><code>600</code></td><td>Per-item duration in ms.</td></tr>
				<tr><td><code>animationDelay</code></td><td><code>number</code></td><td><code>100</code></td><td>Stagger between items.</td></tr>
				<tr><td><code>lineColor</code></td><td><code>string</code></td><td><code>"#e2e8f0"</code></td><td>Connecting line colour.</td></tr>
				<tr><td><code>markerColor</code></td><td><code>string</code></td><td><code>"#146ef5"</code></td><td>Default marker colour.</td></tr>
				<tr><td><code>showProgress</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Fill the line for completed events.</td></tr>
				<tr><td><code>dateFormat</code></td><td><code>function | "relative"</code></td><td><code>undefined</code></td><td>Custom formatter or relative dates.</td></tr>
				<tr><td><code>onEventClick</code></td><td><code>(event) => void</code></td><td><code>undefined</code></td><td>Callback for event clicks.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tl-demo {
		display: grid;
		gap: 1.5rem;
	}
	.tl-block {
		display: grid;
		gap: 0.75rem;
	}
	.tl-head h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.tl-head p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
	.tl-stage {
		padding: 2rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
		color: var(--fg-1);
	}
	.tl-stage--wide {
		padding: 3rem 1rem;
	}
	.tl-stage--horizontal {
		overflow-x: auto;
	}
	.tl-stage h4 {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.tl-narrow {
		max-width: 500px;
		margin: 0 auto;
		padding-left: 60px;
	}
	@media (max-width: 600px) {
		.tl-narrow {
			padding-left: 0;
		}
	}
	.tl-grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 1rem;
	}
	.tl-toast {
		background: color-mix(in srgb, var(--accent) 12%, var(--surface));
		border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
		color: var(--fg-1);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		text-align: center;
		font-size: 0.95rem;
	}
</style>
