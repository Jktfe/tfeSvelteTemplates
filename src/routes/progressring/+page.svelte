<script lang="ts">
	import ProgressRing from '$lib/components/ProgressRing.svelte';

	let uploadValue = $state(0);
	let uploadRunning = $state(false);

	function startUpload() {
		uploadValue = 0;
		uploadRunning = true;
		const tick = () => {
			if (!uploadRunning) return;
			uploadValue = Math.min(100, uploadValue + 7);
			if (uploadValue < 100) {
				setTimeout(tick, 220);
			} else {
				uploadRunning = false;
			}
		};
		setTimeout(tick, 220);
	}

	function resetUpload() {
		uploadRunning = false;
		uploadValue = 0;
	}

	$effect(() => {
		startUpload();
		return () => {
			uploadRunning = false;
		};
	});
</script>

<svelte:head>
	<title>ProgressRing | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">ProgressRing</h1>
			<p class="text-xl text-muted-foreground">
				Tiny circular progress indicator. Determinate fills smoothly; indeterminate spins while you
				wait.
			</p>
		</header>

		<!-- Determinate sizes -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Determinate</h2>
			<p class="text-sm text-neutral-500">
				Pass <code>value</code> from 0 to 100. The ring fills smoothly and announces its percent for screen readers.
			</p>
			<div
				class="bg-white border border-neutral-200 rounded-xl p-6 flex flex-wrap items-center gap-10"
			>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={25} ariaLabel="25 percent">
						{#snippet label()}<strong>25%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">value=25</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={50} ariaLabel="50 percent">
						{#snippet label()}<strong>50%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">value=50</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={75} ariaLabel="75 percent">
						{#snippet label()}<strong>75%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">value=75</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={100} ariaLabel="100 percent" progressColor="#16a34a">
						{#snippet label()}<strong>✓</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">value=100 (success)</span>
				</div>
			</div>
		</section>

		<!-- Indeterminate -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Indeterminate</h2>
			<p class="text-sm text-neutral-500">
				When you can't tell users <em>how much longer</em>, set <code>indeterminate</code> and the ring
				spins. <code>aria-valuenow</code> is correctly omitted in this mode.
			</p>
			<div
				class="bg-white border border-neutral-200 rounded-xl p-6 flex flex-wrap items-center gap-10"
			>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing indeterminate ariaLabel="Loading data" />
					<span class="text-xs text-neutral-500">default</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing indeterminate size={48} stroke={4} ariaLabel="Loading" />
					<span class="text-xs text-neutral-500">small</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing
						indeterminate
						size={96}
						stroke={8}
						progressColor="#a855f7"
						ariaLabel="Working"
					/>
					<span class="text-xs text-neutral-500">large + custom colour</span>
				</div>
			</div>
		</section>

		<!-- Live composed demo -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold">Live: simulated upload</h2>
				<div class="flex gap-2">
					<button
						onclick={startUpload}
						disabled={uploadRunning}
						class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{uploadRunning ? 'Uploading…' : 'Start upload'}
					</button>
					<button
						onclick={resetUpload}
						class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
					>
						Reset
					</button>
				</div>
			</div>
			<div
				class="bg-white border border-neutral-200 rounded-xl p-8 flex items-center justify-center gap-8"
			>
				<ProgressRing
					value={uploadValue}
					size={120}
					stroke={10}
					progressColor={uploadValue === 100 ? '#16a34a' : '#3b82f6'}
					ariaLabel="Upload progress"
				>
					{#snippet label()}
						{#if uploadValue === 100}
							<strong style="color: #16a34a;">Done</strong>
						{:else}
							<strong>{uploadValue}%</strong>
						{/if}
					{/snippet}
				</ProgressRing>
				<div class="text-sm text-neutral-600 max-w-xs">
					<p class="font-semibold text-neutral-900">photo-12.jpg</p>
					<p class="text-neutral-500">
						{uploadValue === 100
							? 'Uploaded successfully.'
							: uploadRunning
								? 'Uploading… please don\'t close this tab.'
								: 'Ready when you are.'}
					</p>
				</div>
			</div>
		</section>

		<!-- Custom palette -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Custom palettes</h2>
			<p class="text-sm text-neutral-500">
				Override <code>trackColor</code> and <code>progressColor</code> for brand-aware indicators.
			</p>
			<div
				class="bg-white border border-neutral-200 rounded-xl p-6 flex flex-wrap items-center gap-10"
			>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={42} progressColor="#22c55e" trackColor="#dcfce7">
						{#snippet label()}<strong style="color:#15803d;">42%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">success</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={66} progressColor="#f97316" trackColor="#ffedd5">
						{#snippet label()}<strong style="color:#c2410c;">66%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">warning</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={88} progressColor="#ef4444" trackColor="#fee2e2">
						{#snippet label()}<strong style="color:#b91c1c;">88%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">danger</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<ProgressRing value={50} size={80} stroke={3} progressColor="#0f172a" trackColor="#e2e8f0">
						{#snippet label()}<strong>50%</strong>{/snippet}
					</ProgressRing>
					<span class="text-xs text-neutral-500">thin stroke</span>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Determinate (0–100) and indeterminate (spinning) modes</li>
					<li>Configurable size and stroke thickness</li>
					<li>Custom track / progress colours</li>
					<li>Centred label snippet — render any content</li>
					<li><code>role="progressbar"</code> with proper ARIA</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Pure SVG + CSS — zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import ProgressRing from '$lib/components/ProgressRing.svelte';
</${''}script>

<!-- Determinate with label -->
<ProgressRing value={75} ariaLabel="Upload">
  {#snippet label()}<strong>75%</strong>{/snippet}
</ProgressRing>

<!-- Indeterminate -->
<ProgressRing indeterminate ariaLabel="Loading" />`}</code></pre>
			</div>
		</section>
	</div>
</div>
