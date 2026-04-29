<script lang="ts">
	import RippleGrid from '$lib/components/RippleGrid.svelte';

	let lastEvent = $state<{ row: number; col: number } | null>(null);
</script>

<svelte:head>
	<title>RippleGrid · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>〰️ RippleGrid</h1>
		<p class="lede">
			A grid where clicks become waves. Tap any cell and a pulse radiates outward, each neighbour
			lighting up on the wavefront's leading edge with arrival delay proportional to its grid
			distance from the click. Multiple ripples compose via <code>mix-blend-mode: screen</code> —
			rapid clicks layer rather than thrash. The animation is pure CSS, the steady-state cost is
			zero, and the keyboard path is fully wired (arrow keys navigate, Enter/Space fires).
		</p>
	</header>

	<section class="demo">
		<h2>Default — 20×12 indigo, euclidean wavefront</h2>
		<p class="hint">
			The out-of-the-box pairing. Click anywhere — the wave radiates as a circle (euclidean
			distance), each cell pulses with a sin-shaped intensity curve. <code>maxConcurrent=3</code>
			means rapid clicks stack up to three live ripples before the oldest is dropped.
		</p>
		<div class="card centered">
			<RippleGrid />
		</div>
	</section>

	<section class="demo">
		<h2>Hex variant — manhattan wavefront, emerald</h2>
		<p class="hint">
			Set <code>variant="hex"</code> and odd rows offset by half a cell width — the wave now travels
			through a honeycomb lattice. Pair with <code>distanceMode="manhattan"</code> for a
			diamond-shaped wavefront that reads more architectural than the default circle.
		</p>
		<div class="card centered">
			<RippleGrid
				rows={10}
				cols={14}
				cellSize={28}
				gap={3}
				variant="hex"
				distanceMode="manhattan"
				colour="#10b981"
			/>
		</div>
	</section>

	<section class="demo">
		<h2>Dense grid — 40×24 fast wave</h2>
		<p class="hint">
			A high-density grid (960 cells) with a fast propagation speed (<code>rippleSpeed=24</code>)
			and short pulse (<code>rippleDuration=400ms</code>). The wave reads almost instantaneous —
			useful for dashboard backdrops where the effect should feel ambient rather than ceremonial.
			<code>maxConcurrent=5</code> permits dense overlap.
		</p>
		<div class="card centered">
			<RippleGrid
				rows={24}
				cols={40}
				cellSize={14}
				gap={1}
				rippleSpeed={24}
				rippleDuration={400}
				maxConcurrent={5}
				colour="#f97316"
			/>
		</div>
	</section>

	<section class="demo">
		<h2>Big-cell — 6×8 with click-to-log readout</h2>
		<p class="hint">
			Larger cells (<code>cellSize=64</code>) make the wave's per-cell delay legible. The
			<code>onRipple</code> callback fires with the cell coordinates — wire it up to your own state
			to drive secondary UI. The readout below shows the most recent click.
		</p>
		<div class="card centered">
			<RippleGrid
				rows={6}
				cols={8}
				cellSize={64}
				gap={4}
				colour="#ec4899"
				onRipple={(e) => (lastEvent = e)}
			/>
			<div class="readout">
				{#if lastEvent}
					Last fire: <code>row {lastEvent.row}, col {lastEvent.col}</code>
				{:else}
					Click any cell to see the coordinates here.
				{/if}
			</div>
		</div>
	</section>

	<section class="demo">
		<h2>Chebyshev wavefront — square propagation, slow and deliberate</h2>
		<p class="hint">
			With <code>distanceMode="chebyshev"</code>, the wavefront is a square — diagonal cells arrive
			at the same time as straight neighbours. Combined with a slow speed
			(<code>rippleSpeed=6</code>) and long pulse (<code>rippleDuration=900ms</code>), the effect
			reads ceremonial rather than fizzy. Try clicking near a corner.
		</p>
		<div class="card centered">
			<RippleGrid
				rows={12}
				cols={20}
				cellSize={28}
				gap={3}
				distanceMode="chebyshev"
				rippleSpeed={6}
				rippleDuration={900}
				maxConcurrent={2}
				colour="#a855f7"
			/>
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>Three distance modes: <code>manhattan</code> (diamond), <code>chebyshev</code> (square),
				<code>euclidean</code> (circle, default).</li>
			<li>Two grid variants: <code>rect</code> and <code>hex</code> (offset odd rows).</li>
			<li>Multi-ripple composition via <code>mix-blend-mode: screen</code> — overlap brightens
				without blowing out.</li>
			<li>Hard <code>maxConcurrent</code> cap keeps DOM cost bounded under rapid clicking.</li>
			<li>Pure CSS one-shot keyframe per ripple layer — no rAF, no per-frame JS.</li>
			<li>Roving tabindex: arrow keys move focus, Enter/Space fires a ripple from the focused cell.</li>
			<li>Honours <code>prefers-reduced-motion</code> — opacity-only pulse, no scale transform.</li>
			<li>SSR-safe (<code>isReducedMotion()</code> defaults to <code>false</code> on the server).</li>
			<li>Pure helpers exported from the module-script for unit testing without a DOM.</li>
			<li>Zero external dependencies. ~10KB of inspectable Svelte.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<` + `script lang="ts">
  import RippleGrid from '$lib/components/RippleGrid.svelte';
<` + `/script>

<!-- Default: 20x12 indigo, euclidean wavefront -->
<RippleGrid />

<!-- Hex variant with manhattan wavefront -->
<RippleGrid
  rows={10}
  cols={14}
  variant="hex"
  distanceMode="manhattan"
  colour="#10b981" />

<!-- Dense grid with fast wave -->
<RippleGrid
  rows={24}
  cols={40}
  cellSize={14}
  rippleSpeed={24}
  rippleDuration={400}
  maxConcurrent={5} />

<!-- Big-cell with click-to-log -->
<RippleGrid
  rows={6}
  cols={8}
  cellSize={64}
  onRipple={({ row, col }) => console.log(row, col)} />`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 980px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #0f172a;
	}

	.page-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0 0 2rem;
		color: #475569;
		line-height: 1.6;
	}

	.demo {
		margin: 0 0 2.5rem;
	}
	.demo h2 {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}
	.hint {
		margin: 0 0 0.875rem;
		color: #64748b;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	.hint code,
	.demo code,
	.features code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 2rem 1.5rem;
	}
	.card.centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.readout {
		font-size: 0.875rem;
		color: #475569;
	}
	.readout code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.features {
		margin: 2.5rem 0;
		padding: 1.5rem;
		background: #f8fafc;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
	}
	.features h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.features ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #475569;
		line-height: 1.7;
	}

	.usage {
		margin-top: 2.5rem;
	}
	.usage h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.usage pre {
		margin: 0;
		padding: 1rem;
		background: #0f172a;
		color: #e2e8f0;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.8125rem;
		line-height: 1.6;
	}
</style>
