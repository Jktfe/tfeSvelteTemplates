<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	let liveValue = $state(20);
	let intervalId: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		intervalId = setInterval(() => {
			liveValue = liveValue >= 100 ? 0 : liveValue + 5;
		}, 600);
		return () => clearInterval(intervalId);
	});
</script>

<svelte:head>
	<title>ProgressBar · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>📊 ProgressBar</h1>
		<p>
			Linear progress indicator. Pass a number 0–100 for determinate progress, or
			<code>value={'{null}'}</code> for an indeterminate animated stripe. Screen readers announce
			the percent automatically via a hidden native <code>&lt;progress&gt;</code> element.
		</p>
	</header>

	<section class="demo">
		<h2>Determinate — basic values</h2>
		<p class="demo-note">A static value renders a fixed fill width.</p>

		<div class="row">
			<div class="row-label">0%</div>
			<ProgressBar value={0} ariaLabel="Empty progress" />
		</div>
		<div class="row">
			<div class="row-label">25%</div>
			<ProgressBar value={25} ariaLabel="Quarter progress" />
		</div>
		<div class="row">
			<div class="row-label">50%</div>
			<ProgressBar value={50} ariaLabel="Half progress" />
		</div>
		<div class="row">
			<div class="row-label">75%</div>
			<ProgressBar value={75} ariaLabel="Three-quarter progress" />
		</div>
		<div class="row">
			<div class="row-label">100%</div>
			<ProgressBar value={100} ariaLabel="Complete progress" />
		</div>
	</section>

	<section class="demo">
		<h2>Sizes</h2>
		<p class="demo-note">
			Three heights — <code>sm</code> (4px), <code>md</code> (8px, default), <code>lg</code> (12px).
		</p>
		<div class="row">
			<div class="row-label">sm</div>
			<ProgressBar value={60} size="sm" ariaLabel="Small" />
		</div>
		<div class="row">
			<div class="row-label">md</div>
			<ProgressBar value={60} size="md" ariaLabel="Medium" />
		</div>
		<div class="row">
			<div class="row-label">lg</div>
			<ProgressBar value={60} size="lg" ariaLabel="Large" />
		</div>
	</section>

	<section class="demo">
		<h2>Variants</h2>
		<p class="demo-note">Semantic colour variants for context.</p>
		<div class="row">
			<div class="row-label">default</div>
			<ProgressBar value={70} variant="default" ariaLabel="Default" />
		</div>
		<div class="row">
			<div class="row-label">success</div>
			<ProgressBar value={70} variant="success" ariaLabel="Success" />
		</div>
		<div class="row">
			<div class="row-label">warning</div>
			<ProgressBar value={70} variant="warning" ariaLabel="Warning" />
		</div>
		<div class="row">
			<div class="row-label">danger</div>
			<ProgressBar value={70} variant="danger" ariaLabel="Danger" />
		</div>
	</section>

	<section class="demo">
		<h2>Indeterminate</h2>
		<p class="demo-note">
			Pass <code>value={'{null}'}</code> when you don't know the percent — animated stripe slides
			across the track. Falls back to a soft fill under <code>prefers-reduced-motion</code>.
		</p>
		<div class="row">
			<div class="row-label">loading</div>
			<ProgressBar value={null} ariaLabel="Loading" />
		</div>
		<div class="row">
			<div class="row-label">success</div>
			<ProgressBar value={null} variant="success" ariaLabel="Saving" />
		</div>
	</section>

	<section class="demo">
		<h2>Labels</h2>
		<p class="demo-note">
			Show the value <code>inline</code>, <code>above</code>, or hidden (<code>none</code>, default).
		</p>
		<div class="row">
			<div class="row-label">inline</div>
			<ProgressBar value={45} showValue="inline" ariaLabel="Inline label" />
		</div>
		<div class="stack">
			<ProgressBar
				value={3}
				max={5}
				showValue="above"
				ariaLabel="Onboarding"
				format={(v, m) => `${v} of ${m} steps`}
				size="lg"
			/>
		</div>
		<div class="stack">
			<ProgressBar
				value={liveValue}
				showValue="above"
				ariaLabel="Live demo"
				size="md"
			/>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>✅ Determinate (0–100) or indeterminate animated mode</li>
			<li>✅ Three sizes (<code>sm</code> / <code>md</code> / <code>lg</code>)</li>
			<li>✅ Four variants (<code>default</code>, <code>success</code>, <code>warning</code>, <code>danger</code>)</li>
			<li>✅ Optional value label (<code>above</code> / <code>inline</code> / <code>none</code>)</li>
			<li>✅ Custom <code>format</code> and <code>max</code></li>
			<li>✅ Hidden native <code>&lt;progress&gt;</code> for accurate SR announcement</li>
			<li>✅ Honours <code>prefers-reduced-motion</code></li>
			<li>✅ Zero dependencies, fully copy-paste ready</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import ProgressBar from '$lib/components/ProgressBar.svelte';
</`+`script>

<!-- Determinate -->
<ProgressBar value={40} ariaLabel="Upload progress" />

<!-- Indeterminate -->
<ProgressBar value={null} ariaLabel="Loading" />

<!-- With above-label and a custom formatter -->
<ProgressBar
  value={3}
  max={5}
  showValue="above"
  ariaLabel="Onboarding"
  format={(v, m) => \`\${v} of \${m} steps\`}
/>

<!-- Variant + inline -->
<ProgressBar value={92} variant="success" showValue="inline" size="lg" />`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.25rem;
		margin: 0 0 0.5rem;
	}

	.page-header p {
		color: #4b5563;
		max-width: 42rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2,
	.features h2,
	.usage h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.demo-note {
		color: #6b7280;
		font-size: 0.95rem;
		margin: 0 0 1.25rem;
	}

	.demo-note code,
	.features code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.row {
		display: grid;
		grid-template-columns: 5rem 1fr;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.875rem;
	}

	.row-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.stack {
		margin-bottom: 1rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 0.5rem 1.25rem;
		color: #374151;
	}

	.features li {
		line-height: 1.6;
	}

	.usage pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
