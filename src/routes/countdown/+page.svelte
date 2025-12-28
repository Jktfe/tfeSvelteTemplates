<!--
	Countdown Component Demo Page

	This page demonstrates the Countdown component with various configurations.
	Shows different formats, units, and customisation options.
-->

<script lang="ts">
	import Countdown from '$lib/components/Countdown.svelte';

	// [CR] Calculate target dates for demos
	// [NTL] We create different dates to show various countdown scenarios

	// Demo 1: New Year countdown (or next year if already past)
	const now = new Date();
	const currentYear = now.getFullYear();
	const newYearDate = new Date(`${currentYear + 1}-01-01T00:00:00`);

	// Demo 2: Short countdown (5 minutes from now)
	const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

	// Demo 3: A few days from now
	const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

	// Demo 4: Already complete (past date)
	const pastDate = new Date('2020-01-01T00:00:00');

	// State for interactive demo
	let completionCount = $state(0);

	function handleComplete() {
		completionCount++;
	}
</script>

<svelte:head>
	<title>Countdown Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Animated countdown timer component for Svelte 5 with multiple display formats"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Header Section -->
		<header>
			<h1>⏱️ Countdown Component</h1>
			<p class="subtitle">
				A versatile countdown timer that displays the time remaining until a target date. Features
				multiple display formats, configurable units, and smooth animations.
			</p>
		</header>

		<!-- Cards Format Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Cards Format</h2>
			</div>

			<p class="description">
				The default format displays each time unit in a separate card with a dark theme. Perfect
				for hero sections and prominent countdowns.
			</p>

			<div class="demo-container demo-container--dark">
				<Countdown targetDate={newYearDate} format="cards" />
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  import Countdown from '$lib/components/Countdown.svelte';

  const newYear = new Date('2025-01-01T00:00:00');
</script>

<Countdown targetDate={newYear} format="cards" />`}</code></pre>
			</details>
		</section>

		<!-- Labels Format Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Labels Format</h2>
			</div>

			<p class="description">
				A cleaner, minimal style with large numbers and small labels underneath. Works well on
				light backgrounds.
			</p>

			<div class="demo-container">
				<Countdown targetDate={newYearDate} format="labels" />
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Countdown targetDate={targetDate} format="labels" />`}</code></pre>
			</details>
		</section>

		<!-- Compact Format Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Compact Format</h2>
			</div>

			<p class="description">
				A single-line display like a digital clock. Great for headers or tight spaces.
			</p>

			<div class="demo-container">
				<Countdown targetDate={threeDaysFromNow} format="compact" padZeros={true} />
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Countdown targetDate={targetDate} format="compact" padZeros={true} />`}</code></pre>
			</details>
		</section>

		<!-- Custom Units Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Units</h2>
			</div>

			<p class="description">
				Choose which time units to display. Show only what's relevant to your countdown.
			</p>

			<div class="demo-grid">
				<div class="demo-item">
					<h4>Days Only</h4>
					<div class="demo-container">
						<Countdown targetDate={newYearDate} format="cards" units={['days']} />
					</div>
				</div>

				<div class="demo-item">
					<h4>Hours & Minutes</h4>
					<div class="demo-container">
						<Countdown targetDate={threeDaysFromNow} format="cards" units={['hours', 'minutes']} />
					</div>
				</div>

				<div class="demo-item">
					<h4>Minutes & Seconds</h4>
					<div class="demo-container">
						<Countdown
							targetDate={fiveMinutesFromNow}
							format="cards"
							units={['minutes', 'seconds']}
						/>
					</div>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<!-- Days only -->
<Countdown targetDate={date} units={['days']} />

<!-- Hours and minutes -->
<Countdown targetDate={date} units={['hours', 'minutes']} />

<!-- Minutes and seconds -->
<Countdown targetDate={date} units={['minutes', 'seconds']} />`}</code></pre>
			</details>
		</section>

		<!-- Completion Handling Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Completion Handling</h2>
			</div>

			<p class="description">
				Customise what happens when the countdown finishes. Show a message, trigger a callback, or
				hide the countdown entirely.
			</p>

			<div class="demo-container">
				<Countdown
					targetDate={pastDate}
					format="labels"
					completedMessage="🎉 This event has already happened!"
				/>
			</div>

			<p class="demo-note">
				<strong>Tip:</strong> Use the <code>onComplete</code> callback to trigger actions when the countdown
				finishes.
			</p>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<script>
  function handleComplete() {
    alert('Countdown finished!');
  }
</script>

<Countdown
  targetDate={pastDate}
  completedMessage="🎉 Event started!"
  onComplete={handleComplete}
  hideOnComplete={false}
/>`}</code></pre>
			</details>
		</section>

		<!-- Custom Separator Demo -->
		<section class="demo-section">
			<div class="section-header">
				<h2>Custom Separators</h2>
			</div>

			<p class="description">
				In compact format, you can customise the separator between units.
			</p>

			<div class="demo-grid">
				<div class="demo-item">
					<h4>Colon (default)</h4>
					<div class="demo-container">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator=":" />
					</div>
				</div>

				<div class="demo-item">
					<h4>Dot</h4>
					<div class="demo-container">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator="." />
					</div>
				</div>

				<div class="demo-item">
					<h4>Dash</h4>
					<div class="demo-container">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator=" - " />
					</div>
				</div>
			</div>

			<details class="code-block">
				<summary>View Code Example</summary>
				<pre><code>{`<Countdown targetDate={date} format="compact" separator="." />`}</code></pre>
			</details>
		</section>

		<!-- Features Grid -->
		<section class="features-section">
			<h2>Component Features</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎨</div>
					<h3>Multiple Formats</h3>
					<p>Choose from cards, labels, or compact display styles to match your design.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚙️</div>
					<h3>Flexible Units</h3>
					<p>Display any combination of days, hours, minutes, and seconds.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">✨</div>
					<h3>Smooth Animations</h3>
					<p>Subtle animations when digits change, respecting reduced motion preferences.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Completion Callback</h3>
					<p>Execute custom logic when the countdown reaches zero.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">📦</div>
					<h3>Zero Dependencies</h3>
					<p>Pure Svelte and CSS implementation with no external libraries.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">♿</div>
					<h3>Accessible</h3>
					<p>ARIA live regions and proper labelling for screen reader support.</p>
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
						<h3>Copy the Component</h3>
						<p>
							Copy <code>Countdown.svelte</code> from
							<code>src/lib/components/</code> to your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Import and Use</h3>
						<p>
							Import the component and set your target date. All other props are optional with
							sensible defaults.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Customise</h3>
						<p>
							Choose your format, units, and add completion handling as needed for your use case.
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
							<td><code>targetDate</code></td>
							<td>Date | number | string</td>
							<td>required</td>
							<td>Target date/time to count down to</td>
						</tr>
						<tr>
							<td><code>units</code></td>
							<td>CountdownUnit[]</td>
							<td>['days', 'hours', 'minutes', 'seconds']</td>
							<td>Which time units to display</td>
						</tr>
						<tr>
							<td><code>format</code></td>
							<td>'compact' | 'cards' | 'labels'</td>
							<td>'cards'</td>
							<td>Display format style</td>
						</tr>
						<tr>
							<td><code>showLabels</code></td>
							<td>boolean</td>
							<td>true</td>
							<td>Show unit labels (Days, Hours, etc.)</td>
						</tr>
						<tr>
							<td><code>separator</code></td>
							<td>string</td>
							<td>':'</td>
							<td>Separator for compact format</td>
						</tr>
						<tr>
							<td><code>padZeros</code></td>
							<td>boolean</td>
							<td>true</td>
							<td>Pad single digits with zeros</td>
						</tr>
						<tr>
							<td><code>completedMessage</code></td>
							<td>string</td>
							<td>"Time's up!"</td>
							<td>Message shown when countdown finishes</td>
						</tr>
						<tr>
							<td><code>onComplete</code></td>
							<td>() =&gt; void</td>
							<td>undefined</td>
							<td>Callback when countdown reaches zero</td>
						</tr>
						<tr>
							<td><code>hideOnComplete</code></td>
							<td>boolean</td>
							<td>false</td>
							<td>Hide countdown when complete</td>
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
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 3rem 1rem;
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		border-radius: 12px;
		margin-bottom: 2rem;
	}

	.demo-container--dark {
		background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.demo-item {
		text-align: center;
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

	.demo-note {
		font-size: 0.9rem;
		color: #4a5568;
		background: #f7fafc;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #146ef5;
		margin-bottom: 2rem;
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

		.demo-grid {
			grid-template-columns: 1fr;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
