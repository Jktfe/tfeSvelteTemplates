<script lang="ts">
	import NeonSign from '$lib/components/NeonSign.svelte';

	let powered = $state(true);
	let intensity = $state(1.2);
</script>

<svelte:head>
	<title>NeonSign · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Glowing neon-tube text — five-stop CSS text-shadow stack creates the inner-tube core through to the outer atmospheric haze. Six palettes, deterministic flicker (none/subtle/broken), per-character burnt-out mode, on/off power state. Asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>NeonSign</h1>
		<p class="lede">
			Glowing neon-tube text. A five-stop <code>text-shadow</code> stack fakes the inner tube, the
			saturated glow, and the outer haze on a single element — no blur filter, no SVG, no canvas.
			An optional flicker animation dips the opacity at deterministic per-seed beats; <code>broken</code>
			profiles dim individual characters as if a tube has burnt out.
		</p>
	</header>

	<section class="demo-block">
		<div class="block-label">
			<h2>Hero — OPEN</h2>
			<p class="block-help">Pink palette · subtle flicker · intensity 1.4</p>
		</div>
		<div class="brick">
			<NeonSign value="OPEN" colour="pink" size="lg" intensity={1.4} />
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Six palettes</h2>
			<p class="block-help">Same word · steady (no flicker) so the colour reads cleanly</p>
		</div>
		<div class="brick palette-grid">
			<NeonSign value="PINK" colour="pink" flicker="none" />
			<NeonSign value="CYAN" colour="cyan" flicker="none" />
			<NeonSign value="GOLD" colour="yellow" flicker="none" />
			<NeonSign value="MINT" colour="green" flicker="none" />
			<NeonSign value="HEAT" colour="red" flicker="none" />
			<NeonSign value="DUSK" colour="purple" flicker="none" />
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Burnt-out tubes</h2>
			<p class="block-help">
				<code>broken=[0, 1]</code> · <code>flicker="broken"</code> dips deeper and more often
			</p>
		</div>
		<div class="brick">
			<NeonSign
				value="NO VACANCY"
				colour="red"
				size="lg"
				intensity={1.2}
				broken={[0, 1]}
				flicker="broken"
				seed={31}
			/>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Power toggle</h2>
			<p class="block-help">Click to flip the power state — <code>on=false</code> collapses the glow</p>
		</div>
		<div class="brick">
			<button class="power-btn" type="button" onclick={() => (powered = !powered)}>
				<NeonSign value="ON AIR" colour="cyan" size="lg" on={powered} flicker="subtle" seed={9} />
			</button>
			<p class="state-tag">{powered ? 'POWERED' : 'OFF'}</p>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Intensity slider</h2>
			<p class="block-help">Drag to scale the shadow blur radii — same palette, same shadow stack count</p>
		</div>
		<div class="brick stacked">
			<NeonSign value="GLOW" colour="green" size="lg" intensity={intensity} flicker="none" />
			<label class="slider-row">
				<span>intensity</span>
				<input type="range" min="0" max="2.5" step="0.1" bind:value={intensity} />
				<span class="slider-value">{intensity.toFixed(1)}×</span>
			</label>
		</div>
	</section>

	<section class="meta">
		<div class="meta-card">
			<h2>How the glow is built</h2>
			<p>
				Five <code>text-shadow</code> stops on a single span: a hard white core (the tube
				filament), two saturated palette stops at 4px and 8px (the visible tube glow), and two
				soft halo stops at 16px and 32px (atmospheric bloom). All radii scale with the
				<code>intensity</code> prop, so one knob controls the whole sign.
			</p>
		</div>

		<div class="meta-card">
			<h2>Flicker is deterministic</h2>
			<p>
				The <code>seed</code> prop runs an LCG to pick dip percentages and depths. Same seed →
				same pattern, so the sign doesn't twitch differently on every paint or prop update. Real
				neon flickers irregularly but predictably for a given tube — that's what the seed
				captures.
			</p>
		</div>

		<div class="meta-card">
			<h2>Burnt-out tubes</h2>
			<p>
				<code>broken={`{[0, 1]}`}</code> drops those character indices out of the glow stack and
				renders them in the palette's dim shade. The rest of the sign stays lit. Out-of-range
				indices are silently ignored, so a fixed list still works after the value shrinks.
			</p>
		</div>

		<div class="meta-card">
			<h2>Power state vs flicker</h2>
			<p>
				<code>on=false</code> collapses every character to the dim shade and disables the
				flicker animation — useful for closed-shop / off-air toggles. The <code>broken</code> prop
				is independent: a sign can be powered on with two characters out, or fully off with the
				broken-list ignored.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				<code>prefers-reduced-motion: reduce</code> disables the flicker animation at the CSS
				layer. The steady glow remains, so the sign is still legible — accessibility doesn't mean
				stripping the visual effect, just stripping the motion.
			</p>
		</div>

		<div class="meta-card">
			<h2>Restyle via CSS variables</h2>
			<p>
				Override <code>--neon-glow</code>, <code>--neon-halo</code>, <code>--neon-dim</code>, or
				<code>--neon-shadow</code> on the root or on a parent to retheme without touching the
				component. The default font stack is brush/handwriting; swap it via plain
				<code>font-family</code> on the parent.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #08070d;
		color: #f8fafc;
	}
	.intro {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
		color: #94a3b8;
		text-decoration: none;
	}
	.back:hover {
		color: #f1f5f9;
	}
	.intro h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0;
		max-width: 60ch;
		line-height: 1.6;
		color: #cbd5e1;
	}

	.demo-block {
		max-width: 1100px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
	.block-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}
	.block-label h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #e2e8f0;
	}
	.block-help {
		margin: 0;
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.brick {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 3rem 1.5rem;
		background:
			radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.8) 0%, #050409 70%),
			repeating-linear-gradient(
				0deg,
				#1a1622 0,
				#1a1622 32px,
				#231d2d 32px,
				#231d2d 33px
			);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.04);
		box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
	}

	.palette-grid {
		gap: 1.5rem 2.5rem;
	}

	.brick.stacked {
		flex-direction: column;
	}

	.power-btn {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		font: inherit;
	}
	.power-btn:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: 8px;
		border-radius: 0.5rem;
	}

	.state-tag {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		color: #64748b;
		margin: 0;
	}

	.slider-row {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.85rem;
		color: #cbd5e1;
	}
	.slider-row input[type='range'] {
		width: 220px;
	}
	.slider-value {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		min-width: 3em;
		color: #38bdf8;
	}

	.meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		max-width: 1100px;
		margin: 3rem auto 4rem;
		padding: 0 1.5rem;
	}
	.meta-card {
		background: rgba(20, 18, 32, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.12);
		border-radius: 0.75rem;
		padding: 1.25rem 1.5rem;
	}
	.meta-card h2 {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: #e2e8f0;
	}
	.meta-card p {
		font-size: 0.875rem;
		line-height: 1.55;
		color: #cbd5e1;
		margin: 0;
	}
	.meta-card code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		background: rgba(15, 23, 42, 0.7);
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		border: 1px solid rgba(148, 163, 184, 0.12);
		color: #f8fafc;
	}
</style>
