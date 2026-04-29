<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';

	// Live "Submit" demo — a button that flips into loading state for 1.5s.
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');

	function fakeSubmit() {
		if (submitState !== 'idle') return;
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
			setTimeout(() => {
				submitState = 'idle';
			}, 1200);
		}, 1500);
	}

	// Live full-page overlay demo — toggle on for 2s.
	let overlayVisible = $state(false);
	function showOverlay() {
		overlayVisible = true;
		setTimeout(() => {
			overlayVisible = false;
		}, 2200);
	}
</script>

<svelte:head>
	<title>Spinner · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🌀 Spinner</h1>
		<p>
			Indeterminate loading indicator with four visual variants. Pure CSS keyframes, zero
			dependencies, inherits text colour by default, and respects
			<code>prefers-reduced-motion</code>. Use it whenever you want to signal "something is
			happening" but don't yet know how long it will take.
		</p>
	</header>

	<section class="demo">
		<h2>Variants</h2>
		<p class="demo-note">
			Pick the visual that fits your product's tone. <code>ring</code> is the universal default;
			<code>dots</code> feels friendlier; <code>bars</code> hints at audio / processing;
			<code>pulse</code> is calm and ambient.
		</p>
		<div class="variants-grid">
			<div class="variant-cell">
				<Spinner variant="ring" size="lg" />
				<span class="variant-name">ring</span>
			</div>
			<div class="variant-cell">
				<Spinner variant="dots" size="lg" />
				<span class="variant-name">dots</span>
			</div>
			<div class="variant-cell">
				<Spinner variant="bars" size="lg" />
				<span class="variant-name">bars</span>
			</div>
			<div class="variant-cell">
				<Spinner variant="pulse" size="lg" />
				<span class="variant-name">pulse</span>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Sizes</h2>
		<p class="demo-note">
			Three sizes — <code>sm</code> (16px), <code>md</code> (24px, default),
			<code>lg</code> (36px). Sized in <code>em</code> so the optional label scales with them.
		</p>
		<div class="row">
			<Spinner size="sm" />
			<Spinner size="md" />
			<Spinner size="lg" />
		</div>
	</section>

	<section class="demo">
		<h2>With label</h2>
		<p class="demo-note">
			Pass <code>label</code> to render a visible caption. The same string is used for
			<code>aria-label</code> so screen readers don't announce twice.
		</p>
		<div class="row stack">
			<Spinner label="Loading data" />
			<Spinner variant="dots" label="Saving changes" />
			<Spinner variant="bars" label="Processing audio" />
			<Spinner variant="pulse" label="Listening for updates" />
		</div>
	</section>

	<section class="demo">
		<h2>Custom colour</h2>
		<p class="demo-note">
			By default the spinner inherits its parent's <code>currentColor</code>. Pass
			<code>color</code> to override.
		</p>
		<div class="row">
			<Spinner size="lg" color="#10b981" />
			<Spinner size="lg" color="#3b82f6" variant="dots" />
			<Spinner size="lg" color="#f59e0b" variant="bars" />
			<Spinner size="lg" color="#ef4444" variant="pulse" />
		</div>
		<p class="demo-note">
			…or just style the parent's text colour, no <code>color</code> prop needed:
		</p>
		<div class="row">
			<span class="purple">
				<Spinner size="lg" />
			</span>
			<span class="cyan">
				<Spinner size="lg" variant="dots" />
			</span>
			<span class="rose">
				<Spinner size="lg" variant="bars" />
			</span>
		</div>
	</section>

	<section class="demo">
		<h2>Inside a button</h2>
		<p class="demo-note">
			The classic "submitting" pattern. Click the button — it shows a small spinner alongside the
			text for 1.5s, then flips to a success state for 1.2s.
		</p>
		<button
			class="submit-btn"
			class:loading={submitState === 'loading'}
			class:success={submitState === 'success'}
			disabled={submitState !== 'idle'}
			onclick={fakeSubmit}
		>
			{#if submitState === 'loading'}
				<Spinner size="sm" />
				<span>Submitting…</span>
			{:else if submitState === 'success'}
				<span>✓ Saved</span>
			{:else}
				<span>Submit form</span>
			{/if}
		</button>
	</section>

	<section class="demo">
		<h2>Full-page overlay</h2>
		<p class="demo-note">
			Centre a large spinner over a translucent backdrop while a slow operation runs. Click the
			button to trigger a 2.2s overlay.
		</p>
		<button class="ghost-btn" onclick={showOverlay}>Show overlay</button>
		{#if overlayVisible}
			<div class="overlay" role="presentation">
				<Spinner variant="ring" size="lg" label="Loading dashboard" />
			</div>
		{/if}
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>✅ Four variants — ring / dots / bars / pulse</li>
			<li>✅ Three sizes — sm / md / lg</li>
			<li>✅ Inherits <code>currentColor</code> by default</li>
			<li>✅ Custom colour via <code>color</code> prop (forwarded as CSS custom property)</li>
			<li>✅ Optional visible <code>label</code> (also exposed to AT)</li>
			<li>✅ <code>role="status"</code> + <code>aria-live="polite"</code></li>
			<li>✅ Honours <code>prefers-reduced-motion</code> with a calm fade fallback</li>
			<li>✅ Pure CSS <code>@keyframes</code> — no JS animation loop</li>
			<li>✅ Zero dependencies, fully copy-paste portable</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import Spinner from '$lib/components/Spinner.svelte';
</`+`script>

<!-- Default (ring, md, inherits currentColor) -->
<Spinner />

<!-- Inside a button while submitting -->
<button class="loading" disabled>
  <Spinner size="sm" />
  Submitting…
</button>

<!-- Centred page-level loading -->
<Spinner size="lg" variant="dots" label="Loading data" />

<!-- Custom colour -->
<Spinner color="#10b981" />`}</code></pre>
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
		max-width: 42rem;
	}

	.demo-note code,
	.features code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.variants-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 1.25rem;
	}

	.variant-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #4f46e5;
	}

	.variant-name {
		font-size: 0.875rem;
		color: #6b7280;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.row.stack {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.purple {
		color: #8b5cf6;
	}
	.cyan {
		color: #06b6d4;
	}
	.rose {
		color: #f43f5e;
	}

	.submit-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: #4f46e5;
		color: #ffffff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 150ms ease;
		min-width: 11rem;
		justify-content: center;
	}

	.submit-btn:hover:not(:disabled) {
		background: #4338ca;
	}

	.submit-btn:disabled {
		cursor: progress;
		opacity: 0.85;
	}

	.submit-btn.success {
		background: #059669;
	}

	.ghost-btn {
		padding: 0.625rem 1.25rem;
		background: #ffffff;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
	}

	.ghost-btn:hover {
		background: #f3f4f6;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.55);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		z-index: 100;
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
