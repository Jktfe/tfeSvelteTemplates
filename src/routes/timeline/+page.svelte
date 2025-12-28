<!--
	Timeline Component Demo Page

	This page demonstrates the Timeline component with various configurations.
	Shows different orientations, alignments, and animation styles.
-->

<script lang="ts">
	import Timeline from '$lib/components/Timeline.svelte';
	import { FALLBACK_TIMELINE_EVENTS, FALLBACK_COMPANY_TIMELINE } from '$lib/constants';
	import type { TimelineEvent } from '$lib/types';

	// State for interactive demo
	let clickedEvent = $state<TimelineEvent | null>(null);

	function handleEventClick(event: TimelineEvent) {
		clickedEvent = event;
		setTimeout(() => {
			clickedEvent = null;
		}, 3000);
	}

	// Custom date formatter example
	function formatDateShort(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Timeline Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Animated timeline component for Svelte 5 with anime.js animations and multiple layout options"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>📅 Timeline Component</h1>
			<p class="subtitle">
				Display events and milestones in an animated chronological timeline. Features smooth
				anime.js animations, vertical and horizontal layouts, and progress tracking.
			</p>
		</header>

		<!-- Vertical Alternating Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Vertical Alternating</h2>
			</div>

			<p class="description">
				The default layout with events alternating between left and right sides. Great for project
				timelines, roadmaps, and history pages.
			</p>

			<div class="demo-container demo-container--wide">
				<Timeline events={FALLBACK_TIMELINE_EVENTS} orientation="vertical" alignment="alternate" />
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import Timeline from '$lib/components/Timeline.svelte';

  const events = [
    {
      id: 1,
      date: '2024-01-15',
      title: 'Project Kickoff',
      description: 'Initial planning meeting...',
      icon: '🚀',
      color: '#3b82f6',
      completed: true
    },
    // ... more events
  ];
</script>

<Timeline
  events={events}
  orientation="vertical"
  alignment="alternate"
/>`}</code></pre>
			</details>
		</section>

		<!-- Vertical Left Aligned Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Vertical Left Aligned</h2>
			</div>

			<p class="description">
				All events aligned to the left side of the timeline. Simpler layout that works well for
				narrower containers.
			</p>

			<div class="demo-container">
				<div class="timeline-wrapper timeline-wrapper--left">
					<Timeline
						events={FALLBACK_TIMELINE_EVENTS.slice(0, 4)}
						orientation="vertical"
						alignment="left"
						animation="fade"
					/>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Timeline
  events={events}
  orientation="vertical"
  alignment="left"
  animation="fade"
/>`}</code></pre>
			</details>
		</section>

		<!-- Company History Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Company History</h2>
			</div>

			<p class="description">
				A longer timeline showing company milestones with progress tracking enabled. Completed
				events show a checkmark and the progress line fills in.
			</p>

			<div class="demo-container demo-container--wide">
				<Timeline
					events={FALLBACK_COMPANY_TIMELINE}
					orientation="vertical"
					alignment="alternate"
					showProgress={true}
					animation="slide"
				/>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Timeline
  events={companyMilestones}
  showProgress={true}
  animation="slide"
/>`}</code></pre>
			</details>
		</section>

		<!-- Horizontal Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Horizontal Layout</h2>
			</div>

			<p class="description">
				Events arranged horizontally with the timeline at the top. Scrollable on smaller screens.
				Good for process flows or short event sequences.
			</p>

			<div class="demo-container demo-container--horizontal">
				<Timeline
					events={FALLBACK_TIMELINE_EVENTS.slice(0, 5)}
					orientation="horizontal"
					animation="scale"
				/>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Timeline
  events={events}
  orientation="horizontal"
  animation="scale"
/>`}</code></pre>
			</details>
		</section>

		<!-- Interactive Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Interactive Events</h2>
			</div>

			<p class="description">
				Add click handlers to make events interactive. Perfect for revealing more details or
				navigating to related content.
			</p>

			{#if clickedEvent}
				<div class="event-notification">
					You clicked: <strong>{clickedEvent.title}</strong> ({clickedEvent.date})
				</div>
			{/if}

			<div class="demo-container demo-container--wide">
				<Timeline
					events={FALLBACK_TIMELINE_EVENTS}
					orientation="vertical"
					alignment="alternate"
					onEventClick={handleEventClick}
				/>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  function handleEventClick(event) {
    console.log('Clicked:', event.title);
    // Navigate, open modal, etc.
  }
</script>

<Timeline
  events={events}
  onEventClick={handleEventClick}
/>`}</code></pre>
			</details>
		</section>

		<!-- Animation Variants -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Animation Styles</h2>
			</div>

			<p class="description">
				Choose from different entrance animations powered by anime.js. All animations respect the
				user's reduced motion preferences.
			</p>

			<div class="animation-grid">
				<div class="animation-demo">
					<h4>Slide (Default)</h4>
					<p>Items slide in from the sides</p>
					<code>animation="slide"</code>
				</div>

				<div class="animation-demo">
					<h4>Fade</h4>
					<p>Simple opacity transition</p>
					<code>animation="fade"</code>
				</div>

				<div class="animation-demo">
					<h4>Scale</h4>
					<p>Items scale up from smaller size</p>
					<code>animation="scale"</code>
				</div>

				<div class="animation-demo">
					<h4>None</h4>
					<p>No entrance animation</p>
					<code>animation="none"</code>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Slide animation (default) -->
<Timeline events={events} animation="slide" />

<!-- Fade animation -->
<Timeline events={events} animation="fade" />

<!-- Scale animation -->
<Timeline events={events} animation="scale" />

<!-- Custom timing -->
<Timeline
  events={events}
  animation="slide"
  animationDuration={800}
  animationDelay={150}
/>`}</code></pre>
			</details>
		</section>

		<!-- Custom Colours -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Colours</h2>
			</div>

			<p class="description">
				Customise the line colour, default marker colour, or set individual event colours for
				visual categorisation.
			</p>

			<div class="demo-container demo-container--wide">
				<Timeline
					events={FALLBACK_TIMELINE_EVENTS.slice(0, 4)}
					orientation="vertical"
					alignment="alternate"
					lineColor="#cbd5e1"
					markerColor="#8b5cf6"
				/>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Custom line and marker colours -->
<Timeline
  events={events}
  lineColor="#cbd5e1"
  markerColor="#8b5cf6"
/>

<!-- Individual event colours (set in event data) -->
const events = [
  { id: 1, title: 'Design', color: '#8b5cf6', ... },
  { id: 2, title: 'Development', color: '#10b981', ... },
  { id: 3, title: 'Launch', color: '#ef4444', ... },
];`}</code></pre>
			</details>
		</section>

		<!-- Date Formatting -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Date Formatting</h2>
			</div>

			<p class="description">
				Use relative dates ("2 days ago"), provide a custom formatter function, or use the default
				format.
			</p>

			<div class="demo-grid-2col">
				<div class="demo-item">
					<h4>Relative Dates</h4>
					<div class="demo-container">
						<Timeline
							events={FALLBACK_TIMELINE_EVENTS.slice(0, 3)}
							orientation="vertical"
							alignment="left"
							dateFormat="relative"
							animation="none"
						/>
					</div>
				</div>

				<div class="demo-item">
					<h4>Custom Format</h4>
					<div class="demo-container">
						<Timeline
							events={FALLBACK_TIMELINE_EVENTS.slice(0, 3)}
							orientation="vertical"
							alignment="left"
							dateFormat={formatDateShort}
							animation="none"
						/>
					</div>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Relative dates -->
<Timeline events={events} dateFormat="relative" />

<!-- Custom formatter -->
<script>
  function formatDateShort(date) {
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });
  }
</script>

<Timeline events={events} dateFormat={formatDateShort} />`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎬</div>
					<h3>Anime.js Animations</h3>
					<p>Smooth, staggered entrance animations with multiple preset styles.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">↔️</div>
					<h3>Multiple Layouts</h3>
					<p>Vertical with alternating/fixed alignment, or horizontal scrolling.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">📊</div>
					<h3>Progress Tracking</h3>
					<p>Visual indicator showing completed vs. pending milestones.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎨</div>
					<h3>Custom Styling</h3>
					<p>Customisable colours for lines, markers, and individual events.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">👆</div>
					<h3>Interactive</h3>
					<p>Click handlers and keyboard navigation for event interactions.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>Proper ARIA attributes and reduced motion support.</p>
				</div>
			</div>
		</section>

		<!-- Quick Start Guide -->
		<section class="guide-section">
			<h2>Quick Start Guide</h2>
			<div class="guide-steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Install anime.js</h3>
						<p>
							Run <code>bun add animejs</code> to install the animation library dependency.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Copy the Component</h3>
						<p>
							Copy <code>Timeline.svelte</code> from
							<code>src/lib/components/</code> to your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Add Your Events</h3>
						<p>
							Create an array of timeline events with id, date, title, and optional description,
							icon, and colour.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Props Reference -->
		<section class="props-section">
			<h2>Props Reference</h2>
			<div class="props-table">
				<table>
					<thead>
						<tr>
							<th>Prop</th>
							<th>Type</th>
							<th>Default</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>events</code></td>
							<td>TimelineEvent[]</td>
							<td>required</td>
							<td>Array of timeline events</td>
						</tr>
						<tr>
							<td><code>orientation</code></td>
							<td>'vertical' | 'horizontal'</td>
							<td>'vertical'</td>
							<td>Layout direction</td>
						</tr>
						<tr>
							<td><code>alignment</code></td>
							<td>'left' | 'right' | 'alternate'</td>
							<td>'alternate'</td>
							<td>Item alignment (vertical only)</td>
						</tr>
						<tr>
							<td><code>animation</code></td>
							<td>'fade' | 'slide' | 'scale' | 'none'</td>
							<td>'slide'</td>
							<td>Entrance animation style</td>
						</tr>
						<tr>
							<td><code>animationDuration</code></td>
							<td>number</td>
							<td>600</td>
							<td>Animation duration in ms</td>
						</tr>
						<tr>
							<td><code>animationDelay</code></td>
							<td>number</td>
							<td>100</td>
							<td>Delay between item animations</td>
						</tr>
						<tr>
							<td><code>lineColor</code></td>
							<td>string</td>
							<td>'#e2e8f0'</td>
							<td>Connecting line colour</td>
						</tr>
						<tr>
							<td><code>markerColor</code></td>
							<td>string</td>
							<td>'#146ef5'</td>
							<td>Default marker colour</td>
						</tr>
						<tr>
							<td><code>showProgress</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Show progress for completed events</td>
						</tr>
						<tr>
							<td><code>dateFormat</code></td>
							<td>function | 'relative'</td>
							<td>undefined</td>
							<td>Date formatting function</td>
						</tr>
						<tr>
							<td><code>onEventClick</code></td>
							<td>(event) =&gt; void</td>
							<td>undefined</td>
							<td>Click handler for events</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<!-- Event Data Structure -->
		<section class="props-section">
			<h2>Event Data Structure</h2>
			<div class="props-table">
				<table>
					<thead>
						<tr>
							<th>Property</th>
							<th>Type</th>
							<th>Required</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>id</code></td>
							<td>string | number</td>
							<td>Yes</td>
							<td>Unique identifier</td>
						</tr>
						<tr>
							<td><code>date</code></td>
							<td>Date | string</td>
							<td>Yes</td>
							<td>Event date</td>
						</tr>
						<tr>
							<td><code>title</code></td>
							<td>string</td>
							<td>Yes</td>
							<td>Event title/heading</td>
						</tr>
						<tr>
							<td><code>description</code></td>
							<td>string</td>
							<td>No</td>
							<td>Longer description text</td>
						</tr>
						<tr>
							<td><code>icon</code></td>
							<td>string</td>
							<td>No</td>
							<td>Emoji or icon in marker</td>
						</tr>
						<tr>
							<td><code>color</code></td>
							<td>string</td>
							<td>No</td>
							<td>Custom marker colour</td>
						</tr>
						<tr>
							<td><code>completed</code></td>
							<td>boolean</td>
							<td>No</td>
							<td>Mark as completed</td>
						</tr>
						<tr>
							<td><code>href</code></td>
							<td>string</td>
							<td>No</td>
							<td>Link URL</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>

<style>
	/* Page Layout */
	.page {
		padding: 4rem 0;
		min-height: 100vh;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* Header */
	header {
		text-align: center;
		margin-bottom: 4rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #1a202c;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #718096;
		margin: 0;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	/* Sections */
	.demo-section,
	.features-section,
	.guide-section,
	.props-section {
		margin-bottom: 4rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: 2rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0;
	}

	.description {
		font-size: 1rem;
		color: #4a5568;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	/* Demo Container */
	.demo-container {
		padding: 2rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.demo-container--wide {
		padding: 3rem 1rem;
	}

	.demo-container--horizontal {
		overflow-x: auto;
	}

	.timeline-wrapper {
		max-width: 500px;
		margin: 0 auto;
	}

	.timeline-wrapper--left {
		padding-left: 60px;
	}

	.demo-grid-2col {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.demo-item {
		text-align: left;
	}

	.demo-item h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #4a5568;
		margin: 0 0 1rem 0;
	}

	.demo-item .demo-container {
		margin-bottom: 0;
	}

	.event-notification {
		background: #f0fdf4;
		border: 1px solid #86efac;
		color: #166534;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: center;
	}

	/* Animation Grid */
	.animation-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.animation-demo {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 2px solid #e2e8f0;
		text-align: center;
	}

	.animation-demo h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 0.5rem 0;
	}

	.animation-demo p {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 0.75rem 0;
	}

	/* Code Blocks */
	code {
		padding: 0.125rem 0.375rem;
		background: #edf2f7;
		color: #146ef5;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.code-block {
		margin-top: 2rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		overflow: hidden;
	}

	.code-block summary {
		padding: 1rem 1.5rem;
		background: #f7fafc;
		cursor: pointer;
		font-weight: 600;
		color: #1a202c;
		user-select: none;
	}

	.code-block summary:hover {
		background: #edf2f7;
	}

	.code-block pre {
		margin: 0;
		padding: 1.5rem;
		background: #1a202c;
		color: #e2e8f0;
		overflow-x: auto;
	}

	.code-block code {
		background: transparent;
		color: #e2e8f0;
		padding: 0;
	}

	/* Features Grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		text-align: center;
		padding: 2rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		color: #1a202c;
	}

	.feature-card p {
		font-size: 0.95rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	/* Guide Steps */
	.guide-steps {
		max-width: 800px;
		margin: 0 auto;
	}

	.step {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 2rem;
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
	}

	.step-number {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		border-radius: 50%;
	}

	.step-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #1a202c;
	}

	.step-content p {
		font-size: 1rem;
		color: #4a5568;
		margin: 0;
		line-height: 1.6;
	}

	/* Props Table */
	.props-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 8px;
		overflow: hidden;
	}

	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}

	th {
		background: #f7fafc;
		font-weight: 600;
		color: #1a202c;
	}

	td {
		color: #4a5568;
	}

	tr:last-child td {
		border-bottom: none;
	}

	/* Responsive */
	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 1.1rem;
		}

		.demo-grid-2col {
			grid-template-columns: 1fr;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
		}

		.timeline-wrapper--left {
			padding-left: 0;
		}
	}
</style>
