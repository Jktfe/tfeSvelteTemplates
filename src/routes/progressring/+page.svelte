<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ProgressRing from '$lib/components/ProgressRing.svelte';

	const shell = catalogShellPropsForSlug('/progressring')!;

	let uploadValue = $state(0);
	let uploadRunning = $state(false);

	function startUpload() {
		uploadValue = 0;
		uploadRunning = true;
		const tick = () => {
			if (!uploadRunning) return;
			uploadValue = Math.min(100, uploadValue + 7);
			if (uploadValue < 100) setTimeout(tick, 220);
			else uploadRunning = false;
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
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG', 'A11y', 'Zero deps']}
	codeExplanation="ProgressRing is a pure SVG circle wrapped in a small CSS animation. In determinate mode the stroke-dashoffset is calculated from value (0–100) and transitions smoothly. In indeterminate mode a dasharray spins forever — and the omitted aria-valuenow tells screen readers we don't know the percent yet. Track and progress colours, size, and stroke are all CSS custom properties, so theming is a one-line change. The label snippet renders dead-centre and accepts any markup."
>
	{#snippet demo()}
		<div class="pr-stack">
			<div class="pr-row">
				<div class="pr-cell">
					<ProgressRing value={25} ariaLabel="25 percent">{#snippet label()}<strong>25%</strong>{/snippet}</ProgressRing>
					<span class="pr-cap">value=25</span>
				</div>
				<div class="pr-cell">
					<ProgressRing value={50} ariaLabel="50 percent">{#snippet label()}<strong>50%</strong>{/snippet}</ProgressRing>
					<span class="pr-cap">value=50</span>
				</div>
				<div class="pr-cell">
					<ProgressRing value={75} ariaLabel="75 percent">{#snippet label()}<strong>75%</strong>{/snippet}</ProgressRing>
					<span class="pr-cap">value=75</span>
				</div>
				<div class="pr-cell">
					<ProgressRing value={100} ariaLabel="100 percent" progressColor="#16a34a">{#snippet label()}<strong>✓</strong>{/snippet}</ProgressRing>
					<span class="pr-cap">complete</span>
				</div>
			</div>

			<div class="pr-row">
				<div class="pr-cell">
					<ProgressRing indeterminate ariaLabel="Loading data" />
					<span class="pr-cap">indeterminate</span>
				</div>
				<div class="pr-cell">
					<ProgressRing indeterminate size={48} stroke={4} ariaLabel="Loading" />
					<span class="pr-cap">small</span>
				</div>
				<div class="pr-cell">
					<ProgressRing indeterminate size={96} stroke={8} progressColor="#a855f7" ariaLabel="Working" />
					<span class="pr-cap">large + custom colour</span>
				</div>
			</div>

			<div class="pr-live">
				<div class="pr-live-head">
					<strong>Simulated upload</strong>
					<div class="pr-actions">
						<button class="pr-btn" onclick={startUpload} disabled={uploadRunning}>
							{uploadRunning ? 'Uploading…' : 'Start upload'}
						</button>
						<button class="pr-btn pr-btn--ghost" onclick={resetUpload}>Reset</button>
					</div>
				</div>
				<div class="pr-live-body">
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
					<div class="pr-live-meta">
						<div class="pr-live-name">photo-12.jpg</div>
						<div class="pr-live-status">
							{uploadValue === 100 ? 'Uploaded successfully.' : uploadRunning ? 'Uploading… please don\'t close this tab.' : 'Ready when you are.'}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>value</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Determinate progress 0–100. Ignored when indeterminate is true.</td>
				</tr>
				<tr>
					<td><code>indeterminate</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Spin continuously when true; aria-valuenow is omitted automatically.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number</code></td>
					<td><code>64</code></td>
					<td>Outer width and height in pixels.</td>
				</tr>
				<tr>
					<td><code>stroke</code></td>
					<td><code>number</code></td>
					<td><code>6</code></td>
					<td>Ring thickness in pixels.</td>
				</tr>
				<tr>
					<td><code>trackColor</code></td>
					<td><code>string</code></td>
					<td>token-based</td>
					<td>Background ring colour — any CSS colour string.</td>
				</tr>
				<tr>
					<td><code>progressColor</code></td>
					<td><code>string</code></td>
					<td><code>"#3b82f6"</code></td>
					<td>Foreground ring colour.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Accessible name for the progressbar role.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Optional centred label — accepts any markup.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pr-stack { display: grid; gap: 24px; }
	.pr-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 28px;
		padding: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.pr-cell { display: grid; gap: 8px; justify-items: center; }
	.pr-cap { font: 11px var(--font-mono); color: var(--fg-3); letter-spacing: 0.08em; }
	.pr-live {
		padding: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		display: grid;
		gap: 14px;
	}
	.pr-live-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.pr-live-body {
		display: flex;
		align-items: center;
		gap: 24px;
		flex-wrap: wrap;
	}
	.pr-live-meta { display: grid; gap: 4px; max-width: 28ch; }
	.pr-live-name { font: 600 14px var(--font-sans); color: var(--fg-1); }
	.pr-live-status { font-size: 13px; color: var(--fg-3); }
	.pr-actions { display: flex; gap: 8px; }
	.pr-btn {
		padding: 6px 12px;
		background: var(--accent);
		color: #fff;
		border: 0;
		border-radius: var(--r-2);
		font: 500 13px var(--font-sans);
		cursor: pointer;
	}
	.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.pr-btn--ghost {
		background: transparent;
		color: var(--fg-1);
		border: 1px solid var(--border);
	}
</style>
