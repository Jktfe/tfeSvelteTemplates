<script lang="ts">
	import MagnetGrid from '$lib/components/MagnetGrid.svelte';

	const icons = ['★', '◆', '◯', '▲', '✦', '◈', '✧', '◉'];
	const emojis = ['🪐', '✨', '🌙', '☄️', '🌟', '💫', '🌠'];

	let liveCols = $state(10);
	let liveRows = $state(6);
	let liveRadius = $state(160);
	let liveStrength = $state(28);
	let livePolicy = $state<'attract' | 'repel'>('attract');
	let liveCellSize = $state(40);
	let liveGap = $state(0);
</script>

<svelte:head>
	<title>MagnetGrid — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<div class="hero__lede">
			<span class="badge">Helpful UX</span>
			<h1>🧲 MagnetGrid</h1>
			<p>
				A cursor-driven displacement field. Every cell in a grid shifts toward
				(or away from) the pointer with a smooth quadratic falloff — like iron
				filings under a roving magnet. Pure CSS transforms, no rAF, no canvas;
				the GPU composites every offset on its own layer.
			</p>
		</div>
	</header>

	<section class="demo">
		<div class="demo__head">
			<h2>Default dot field</h2>
			<p>
				Move your cursor across the grid. Each dot pulls toward the pointer,
				with influence falling off smoothly to zero at the radius edge.
			</p>
		</div>
		<div class="demo__stage demo__stage--dark">
			<MagnetGrid cols={20} rows={12} cellSize={28} radius={150} strength={20} />
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Icon grid — custom snippet content</h2>
			<p>
				Pass a <code>cell</code> snippet and you control what each square
				renders. Here every cell holds a Unicode glyph that warps with the
				rest of the field.
			</p>
		</div>
		<div class="demo__stage demo__stage--icon">
			<MagnetGrid cols={12} rows={7} cellSize={40} radius={180} strength={26}>
				{#snippet cell(row: number, col: number)}
					<span class="icon">{icons[(row + col) % icons.length]}</span>
				{/snippet}
			</MagnetGrid>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Repel mode — cursor pushes cells away</h2>
			<p>
				<code>policy="repel"</code> inverts the displacement direction. Cells
				flee the cursor instead of chasing it — an "anti-magnet" backdrop.
			</p>
		</div>
		<div class="demo__stage demo__stage--repel">
			<MagnetGrid
				cols={16}
				rows={10}
				cellSize={32}
				radius={170}
				strength={28}
				policy="repel"
			/>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Emoji grid — wider gap, bigger cells</h2>
			<p>Cell content can be anything. Increase <code>gap</code> for breathing room.</p>
		</div>
		<div class="demo__stage demo__stage--emoji">
			<MagnetGrid cols={8} rows={5} cellSize={48} gap={8} radius={170} strength={22}>
				{#snippet cell(row: number, col: number)}
					<span class="emoji">{emojis[(row * 7 + col * 3) % emojis.length]}</span>
				{/snippet}
			</MagnetGrid>
		</div>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Live controls</h2>
			<p>Adjust grid dimensions, influence radius, strength, and policy in real time.</p>
		</div>
		<div class="controls">
			<label>
				Cols: <strong>{liveCols}</strong>
				<input type="range" min="3" max="20" step="1" bind:value={liveCols} />
			</label>
			<label>
				Rows: <strong>{liveRows}</strong>
				<input type="range" min="3" max="14" step="1" bind:value={liveRows} />
			</label>
			<label>
				Radius: <strong>{liveRadius}px</strong>
				<input type="range" min="40" max="280" step="10" bind:value={liveRadius} />
			</label>
			<label>
				Strength: <strong>{liveStrength}px</strong>
				<input type="range" min="0" max="60" step="2" bind:value={liveStrength} />
			</label>
			<label>
				Cell size: <strong>{liveCellSize}px</strong>
				<input type="range" min="16" max="64" step="2" bind:value={liveCellSize} />
			</label>
			<label>
				Gap: <strong>{liveGap}px</strong>
				<input type="range" min="0" max="20" step="2" bind:value={liveGap} />
			</label>
			<label>
				Policy:
				<select bind:value={livePolicy}>
					<option value="attract">Attract</option>
					<option value="repel">Repel</option>
				</select>
			</label>
		</div>
		<div class="demo__stage demo__stage--live">
			<MagnetGrid
				cols={liveCols}
				rows={liveRows}
				radius={liveRadius}
				strength={liveStrength}
				policy={livePolicy}
				cellSize={liveCellSize}
				gap={liveGap}
			/>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero__lede {
		max-width: 820px;
	}

	.badge {
		display: inline-block;
		background: #ede9fe;
		color: #5b21b6;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem;
	}

	.hero p {
		font-size: 1.125rem;
		color: #475569;
		line-height: 1.6;
		margin: 0;
	}

	.demo {
		margin-bottom: 4rem;
	}

	.demo__head {
		margin-bottom: 1.5rem;
	}

	.demo__head h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
	}

	.demo__head p {
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	.demo__head code {
		background: #f1f5f9;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.demo__stage {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 2.5rem 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 360px;
	}

	.demo__stage--dark {
		background: radial-gradient(circle at 50% 50%, #1e1b4b, #020617);
		color: #fbbf24;
	}

	.demo__stage--icon {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #c4b5fd;
		min-height: 420px;
	}

	.demo__stage--repel {
		background: radial-gradient(circle at 50% 50%, #4c1d95, #0c0a09);
		color: #f9a8d4;
	}

	.demo__stage--emoji {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		color: #1f2937;
		min-height: 380px;
	}

	.demo__stage--live {
		background: linear-gradient(135deg, #0c0a09 0%, #1c1917 100%);
		color: #67e8f9;
		min-height: 480px;
	}

	.icon {
		font-size: 1.4rem;
		opacity: 0.85;
	}

	.emoji {
		font-size: 1.6rem;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.controls label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #334155;
	}

	.controls input[type='range'],
	.controls select {
		width: 100%;
	}
</style>
