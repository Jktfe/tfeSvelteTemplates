<script lang="ts">
	import ConfettiBurst, {
		type ConfettiOrigin,
		DEFAULT_PALETTE
	} from '$lib/components/ConfettiBurst.svelte';

	let defaultBurst = $state<ConfettiBurst | null>(null);
	let wideBurst = $state<ConfettiBurst | null>(null);
	let coneBurst = $state<ConfettiBurst | null>(null);
	let cursorBurst = $state<ConfettiBurst | null>(null);
	let themedBurst = $state<ConfettiBurst | null>(null);

	let lastBurst = $state<string | null>(null);
	let burstLog = $state<Array<{ id: string; at: string }>>([]);

	function record(id: string) {
		lastBurst = id;
		const at = new Date().toLocaleTimeString();
		burstLog = [{ id, at }, ...burstLog].slice(0, 5);
	}

	function fireFromClick(
		event: MouseEvent,
		burstRef: ConfettiBurst | null,
		palette?: readonly string[]
	) {
		const origin: ConfettiOrigin = { x: event.clientX, y: event.clientY };
		burstRef?.fire(palette ? { origin, palette } : { origin });
	}

	const successPalette = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
	const fierylPalette = ['#f97316', '#ef4444', '#fbbf24', '#fde047'];
	const oceanPalette = ['#0ea5e9', '#38bdf8', '#22d3ee', '#a5f3fc'];

	let activePalette = $state<'rainbow' | 'success' | 'fiery' | 'ocean'>('rainbow');

	const palettes: Record<typeof activePalette, readonly string[]> = {
		rainbow: DEFAULT_PALETTE,
		success: successPalette,
		fiery: fierylPalette,
		ocean: oceanPalette
	};
</script>

<svelte:head>
	<title>ConfettiBurst · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>ConfettiBurst</h1>
		<p>
			Trigger-fired celebration particle burst. Mount once anywhere on the page; call
			<code>fire()</code> imperatively when a moment deserves celebration. Canvas-rendered for 60fps
			even at high particle counts. The DOM stays empty while idle —
			<code>&lt;canvas&gt;</code> only mounts during a burst.
			<code>prefers-reduced-motion</code> skips the animation; the
			<code>onComplete</code> contract is preserved.
		</p>
	</header>

	<section class="demo">
		<h2>1. Default celebration</h2>
		<p class="caption">
			Centred burst, 80 particles, 70° upward spread. The canonical "submit succeeded" effect.
		</p>
		<div class="surface">
			<button
				class="celebrate-btn"
				type="button"
				onclick={() => {
					defaultBurst?.fire();
					record('default');
				}}
			>
				🎉 Celebrate
			</button>
		</div>
	</section>

	<section class="demo">
		<h2>2. Wide-spread launch</h2>
		<p class="caption">
			180° omnidirectional burst with 200 particles, 2.5 s duration. Use for big-deal moments —
			level-up, achievement unlocked, milestone hit.
		</p>
		<div class="surface">
			<button
				class="celebrate-btn celebrate-wide"
				type="button"
				onclick={() => {
					wideBurst?.fire();
					record('wide');
				}}
			>
				🚀 Launch
			</button>
		</div>
	</section>

	<section class="demo">
		<h2>3. Narrow cone firework</h2>
		<p class="caption">
			15° cone, high velocity, low gravity — looks like a directional rocket. Pair with sound for
			tactile feedback in games.
		</p>
		<div class="surface">
			<button
				class="celebrate-btn celebrate-cone"
				type="button"
				onclick={() => {
					coneBurst?.fire();
					record('cone');
				}}
			>
				🎆 Firework
			</button>
		</div>
	</section>

	<section class="demo">
		<h2>4. Burst from click point</h2>
		<p class="caption">
			Each click bursts at the cursor. Pass <code>origin: &#123; x, y &#125;</code> to
			<code>fire()</code>
			from a pointer event.
		</p>
		<div class="surface">
			<button
				class="celebrate-btn celebrate-cursor"
				type="button"
				onclick={(e) => {
					fireFromClick(e, cursorBurst);
					record('cursor');
				}}
			>
				💥 Burst here
			</button>
		</div>
	</section>

	<section class="demo">
		<h2>5. Themed palettes</h2>
		<p class="caption">
			Same primitive, different moods. Override <code>palette</code> per-shot via
			<code>fire(&#123; palette &#125;)</code>. Switch theme below, then click the burst button.
		</p>
		<div class="theme-row">
			<button
				type="button"
				class="theme-chip"
				class:active={activePalette === 'rainbow'}
				onclick={() => (activePalette = 'rainbow')}
			>
				🌈 Rainbow
			</button>
			<button
				type="button"
				class="theme-chip"
				class:active={activePalette === 'success'}
				onclick={() => (activePalette = 'success')}
			>
				✅ Success
			</button>
			<button
				type="button"
				class="theme-chip"
				class:active={activePalette === 'fiery'}
				onclick={() => (activePalette = 'fiery')}
			>
				🔥 Fiery
			</button>
			<button
				type="button"
				class="theme-chip"
				class:active={activePalette === 'ocean'}
				onclick={() => (activePalette = 'ocean')}
			>
				🌊 Ocean
			</button>
		</div>
		<div class="surface">
			<button
				class="celebrate-btn celebrate-themed"
				type="button"
				onclick={() => {
					themedBurst?.fire({ palette: palettes[activePalette] });
					record(`themed:${activePalette}`);
				}}
			>
				🎨 Burst with {activePalette}
			</button>
		</div>
	</section>

	<section class="readout">
		{#if lastBurst}
			<span>
				Last burst: <code>{lastBurst}</code>
			</span>
		{:else}
			<span>Click any of the buttons above to start.</span>
		{/if}
		{#if burstLog.length > 0}
			<ul class="log">
				{#each burstLog as entry (entry.at + entry.id)}
					<li>
						<code>{entry.id}</code>
						<span class="log-time">@ {entry.at}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Imperative fire()</h3>
				<p>
					<code>bind:this</code> exposes a single <code>fire(opts?)</code> method. Per-shot
					<code>opts</code>
					can override <code>origin</code> and <code>palette</code> without re-mounting the component.
					No re-render churn between shots.
				</p>
			</div>
			<div class="meta-card">
				<h3>Canvas-only-while-firing</h3>
				<p>
					The <code>&lt;canvas&gt;</code> only mounts during a burst — bracketed by
					<code>&#123;#if firing&#125;</code>. Idle DOM cost is zero. The component itself renders
					nothing until you call <code>fire()</code>.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion bypass</h3>
				<p>
					<code>prefers-reduced-motion: reduce</code> causes <code>fire()</code> to call
					<code>onComplete</code> synchronously and skip the canvas mount. The contract is preserved
					— the consumer's own success indication still runs.
				</p>
			</div>
			<div class="meta-card">
				<h3>Pure-physics helpers</h3>
				<p>
					<code>generateParticles</code>, <code>stepParticle</code>, <code>mulberry32</code> are pure
					module-script exports. Determinism via seeded RNG means the test suite verifies physics
					without a canvas or <code>requestAnimationFrame</code>.
				</p>
			</div>
			<div class="meta-card">
				<h3>Palette themability</h3>
				<p>
					Pass any string-array as <code>palette</code> — hex, RGB, named colors. Empty arrays fall
					back to <code>DEFAULT_PALETTE</code>. Per-shot overrides let one component drive
					success/error/info bursts from a single mount.
				</p>
			</div>
			<div class="meta-card">
				<h3>Per-shot origin</h3>
				<p>
					<code>fire(&#123; origin: &#123; x, y &#125; &#125;)</code> bursts at any viewport
					coordinate.
					<code>'center'</code> resolves to viewport centre. Invalid inputs fall back to centre rather
					than throwing — tested via <code>parseOrigin</code> helper.
				</p>
			</div>
		</div>
	</section>
</main>

<ConfettiBurst bind:this={defaultBurst} />
<ConfettiBurst bind:this={wideBurst} count={200} spread={180} duration={2500} velocity={900} />
<ConfettiBurst bind:this={coneBurst} count={60} spread={15} velocity={1400} gravity={400} />
<ConfettiBurst bind:this={cursorBurst} count={50} spread={50} duration={1200} />
<ConfettiBurst bind:this={themedBurst} count={120} spread={90} duration={2000} />

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		color: #e6e6e6;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin: 0 0 0.5rem;
		background: linear-gradient(135deg, #fde047, #f472b6, #a78bfa);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hero p {
		font-size: 1.125rem;
		line-height: 1.6;
		max-width: 720px;
		color: #a8a8b8;
	}

	.hero code,
	.caption code,
	.meta-card code {
		background: #1a1a2e;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
		color: #c9c9d1;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
		color: #fff;
	}

	.caption {
		color: #8c8c9c;
		font-size: 0.95rem;
		margin: 0 0 1.5rem;
		line-height: 1.6;
	}

	.surface {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 2rem 1.5rem;
		display: flex;
		justify-content: center;
	}

	.celebrate-btn {
		appearance: none;
		border: 0;
		font: inherit;
		font-size: 1.05rem;
		font-weight: 600;
		padding: 0.875rem 1.75rem;
		border-radius: 999px;
		color: #fff;
		cursor: pointer;
		background: linear-gradient(135deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6);
		background-size: 200% 200%;
		background-position: 0% 0%;
		transition:
			transform 120ms ease,
			background-position 220ms ease;
		box-shadow:
			0 8px 24px -8px rgba(247, 113, 113, 0.4),
			0 4px 12px -4px rgba(167, 139, 250, 0.4);
	}

	.celebrate-btn:hover {
		background-position: 100% 100%;
		transform: translateY(-1px);
	}

	.celebrate-btn:active {
		transform: translateY(0);
	}

	.celebrate-wide {
		background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399);
		box-shadow: 0 8px 24px -8px rgba(167, 139, 250, 0.5);
	}

	.celebrate-cone {
		background: linear-gradient(135deg, #f97316, #ef4444);
		box-shadow: 0 8px 24px -8px rgba(249, 115, 22, 0.5);
	}

	.celebrate-cursor {
		background: linear-gradient(135deg, #ec4899, #d946ef);
		box-shadow: 0 8px 24px -8px rgba(236, 72, 153, 0.5);
	}

	.celebrate-themed {
		background: linear-gradient(135deg, #1f1f3a, #2a2a4e);
		border: 1px solid #3a3a5e;
		box-shadow: none;
	}

	.celebrate-themed:hover {
		background: linear-gradient(135deg, #2a2a4e, #3a3a5e);
	}

	.theme-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.theme-chip {
		appearance: none;
		border: 1px solid #2a2a3e;
		background: #14142b;
		color: #c9c9d1;
		font: inherit;
		font-size: 0.875rem;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}

	.theme-chip:hover {
		background: #1a1a2e;
	}

	.theme-chip.active {
		background: #2a2a4e;
		border-color: #6d6d7a;
		color: #fff;
	}

	.readout {
		margin: 0 0 4rem;
		padding: 1.25rem 1.5rem;
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: #a8a8b8;
	}

	.readout code {
		background: #1a1a2e;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		color: #f472b6;
		font-family: 'Fira Code', monospace;
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.log-time {
		color: #6d6d7a;
		font-size: 0.85em;
		margin-left: 0.5rem;
	}

	.meta {
		margin-top: 4rem;
		border-top: 1px solid #1f1f3a;
		padding-top: 3rem;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.meta-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.meta-card h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
		color: #c9c9d1;
	}

	.meta-card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #a8a8b8;
	}
</style>
