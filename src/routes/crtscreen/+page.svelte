<script lang="ts">
	import CRTScreen from '$lib/components/CRTScreen.svelte';

	let density = $state(3);
	let aberration = $state(1);
	let rollOn = $state(true);
	let rollSpeed = $state(4);
	let curved = $state(true);
</script>

<svelte:head>
	<title>CRTScreen · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Retro CRT-monitor frame for arbitrary content. Pure-CSS scanlines, RGB chromatic aberration via channel-split text-shadow, optional vertical tracking roll, and corner vignette. Four named profiles, asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>CRTScreen</h1>
		<p class="lede">
			Wraps any content in a CRT-monitor frame. A <code>repeating-linear-gradient</code> paints
			horizontal scanlines, a channel-split <code>text-shadow</code> fakes RGB phosphor
			misalignment on the inner glyphs, an optional vertical band drifts a "tracking roll" down
			the screen, and a <code>radial-gradient</code> darkens the corners. Four named profiles
			(amber, green-phosphor, broadcast, modern) preset the colours together. No SVG filters, no
			canvas, no images.
		</p>
	</header>

	<section class="demo-block">
		<div class="block-label">
			<h2>Amber terminal</h2>
			<p class="block-help">Profile <code>amber</code> · classic 80s BIOS banner · density 3</p>
		</div>
		<div class="brick">
			<CRTScreen profile="amber" density={3} aberration={1} curved>
				<div class="terminal">
					<p>&gt; BOOT v3.14 …</p>
					<p>&gt; LOADING SECTOR 0x1A — OK</p>
					<p>&gt; LOADING SECTOR 0x1B — OK</p>
					<p>&gt; SYSTEM READY ▌</p>
				</div>
			</CRTScreen>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Green phosphor — with tracking roll</h2>
			<p class="block-help">
				Profile <code>green</code> · density 2 · roll speed 4 · aberration 0.6
			</p>
		</div>
		<div class="brick">
			<CRTScreen profile="green" density={2} aberration={0.6} roll={4}>
				<div class="phosphor">
					<h3>SYS::HEALTH</h3>
					<dl>
						<dt>cpu</dt><dd>42%</dd>
						<dt>mem</dt><dd>1.8 GB / 8 GB</dd>
						<dt>net</dt><dd>OK · 14ms</dd>
						<dt>disk</dt><dd>312 GB / 1 TB</dd>
					</dl>
				</div>
			</CRTScreen>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Broadcast — BREAKING card</h2>
			<p class="block-help">
				Profile <code>broadcast</code> · curved glass · aberration 1.5 · TV news lower-third
			</p>
		</div>
		<div class="brick">
			<CRTScreen profile="broadcast" density={4} aberration={1.5} curved>
				<div class="broadcast">
					<span class="tag">BREAKING</span>
					<h3>Markets close higher on tech rally</h3>
					<p>FTSE 100 +1.2% · S&amp;P 500 +0.9% · Nasdaq +1.4%</p>
				</div>
			</CRTScreen>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Modern — clean retro</h2>
			<p class="block-help">
				Profile <code>modern</code> · pink/cyan aberration · vignette off · density 5
			</p>
		</div>
		<div class="brick">
			<CRTScreen profile="modern" density={5} aberration={1.2} vignette={false}>
				<div class="modern-card">
					<h3>NIGHT MODE</h3>
					<p>
						The modern profile keeps the scanlines and the channel-split shadow, but uses a
						clean slate background and a softer vignette so it sits naturally inside design
						systems.
					</p>
				</div>
			</CRTScreen>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Live controls</h2>
			<p class="block-help">
				Sliders + toggles drive the same wrapper — every setting is reactive
			</p>
		</div>
		<div class="brick stacked">
			<CRTScreen
				profile="amber"
				density={density}
				aberration={aberration}
				roll={rollOn ? rollSpeed : false}
				{curved}
			>
				<div class="controls-content">
					<h3>LIVE FEED</h3>
					<p>density {density}px · aberration {aberration.toFixed(1)}px</p>
					<p>roll {rollOn ? `speed ${rollSpeed}` : 'off'} · curved {curved ? 'on' : 'off'}</p>
				</div>
			</CRTScreen>

			<div class="controls">
				<label class="slider-row">
					<span>density</span>
					<input type="range" min="1" max="8" step="1" bind:value={density} />
					<span class="slider-value">{density}px</span>
				</label>
				<label class="slider-row">
					<span>aberration</span>
					<input type="range" min="0" max="3" step="0.1" bind:value={aberration} />
					<span class="slider-value">{aberration.toFixed(1)}px</span>
				</label>
				<label class="slider-row">
					<span>roll speed</span>
					<input
						type="range"
						min="1"
						max="10"
						step="1"
						bind:value={rollSpeed}
						disabled={!rollOn}
					/>
					<span class="slider-value">{rollSpeed}</span>
				</label>
				<div class="toggle-row">
					<label class="toggle">
						<input type="checkbox" bind:checked={rollOn} /> roll
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={curved} /> curved
					</label>
				</div>
			</div>
		</div>
	</section>

	<section class="meta">
		<div class="meta-card">
			<h2>Scanlines are a single gradient</h2>
			<p>
				<code>repeating-linear-gradient(0deg, scan 0px, scan Npx, transparent Npx, transparent
				Dpx)</code> painted as a <code>mix-blend-mode: multiply</code> overlay. <code>density</code>
				sets D (cycle height) and <code>intensity</code> sets N (line height). One layer, GPU-composited.
			</p>
		</div>

		<div class="meta-card">
			<h2>Aberration via text-shadow</h2>
			<p>
				No SVG filters needed. The slot inherits a two-stop <code>text-shadow</code> that ghosts
				the R channel one way and the B channel the other. <code>aberration</code> scales the offset
				in pixels; the channel colours come from the profile.
			</p>
		</div>

		<div class="meta-card">
			<h2>Roll is one keyframe</h2>
			<p>
				A static <code>@keyframes crt-roll</code> drifts a soft white band from top to bottom.
				Per-instance speed is set via <code>animation-duration</code> using a CSS custom
				property — no per-instance keyframe generation, no <code>@html</code> style injection.
			</p>
		</div>

		<div class="meta-card">
			<h2>Profiles preset everything</h2>
			<p>
				Each profile bundles foreground, background, scanline alpha, both aberration channel
				colours, and the vignette tone. Switching profiles re-skins the whole frame in one
				prop change.
			</p>
		</div>

		<div class="meta-card">
			<h2>Reduced motion</h2>
			<p>
				<code>prefers-reduced-motion: reduce</code> disables the roll animation and removes the
				chromatic-aberration text-shadow at the CSS layer. Static scanlines + vignette stay so
				the frame still reads as a CRT — accessibility doesn't mean stripping the identity.
			</p>
		</div>

		<div class="meta-card">
			<h2>Restyle via CSS variables</h2>
			<p>
				Override <code>--crt-fg</code>, <code>--crt-bg</code>,
				<code>--crt-scan-gradient</code>, <code>--crt-aberration</code>, or
				<code>--crt-vignette-color</code> on the root to retheme without touching the
				component. Roll uses <code>--crt-roll-name</code> + <code>--crt-roll-duration</code>.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #050409;
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
		gap: 1.5rem;
		padding: 2.5rem 1.5rem;
		background:
			radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.8) 0%, #050409 70%);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.04);
		box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
	}

	.brick.stacked {
		flex-direction: column;
		gap: 1.5rem;
	}

	.terminal {
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 1rem;
		line-height: 1.6;
		min-width: 22rem;
	}
	.terminal p {
		margin: 0;
	}

	.phosphor {
		min-width: 22rem;
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
	.phosphor h3 {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		letter-spacing: 0.08em;
	}
	.phosphor dl {
		margin: 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.25rem 1.25rem;
		font-size: 0.95rem;
	}
	.phosphor dt {
		opacity: 0.75;
	}
	.phosphor dd {
		margin: 0;
	}

	.broadcast {
		min-width: 26rem;
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}
	.broadcast .tag {
		display: inline-block;
		font-weight: 700;
		letter-spacing: 0.16em;
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		background: #c0392b;
		color: #fff;
		border-radius: 0.15rem;
		margin-bottom: 0.6rem;
	}
	.broadcast h3 {
		margin: 0 0 0.4rem;
		font-size: 1.35rem;
		font-weight: 700;
	}
	.broadcast p {
		margin: 0;
		font-size: 0.95rem;
		opacity: 0.85;
	}

	.modern-card {
		min-width: 26rem;
		max-width: 32rem;
		font-family: 'Inter', system-ui, sans-serif;
	}
	.modern-card h3 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
		letter-spacing: 0.08em;
		font-weight: 600;
	}
	.modern-card p {
		margin: 0;
		line-height: 1.6;
		font-size: 0.95rem;
	}

	.controls-content {
		min-width: 22rem;
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
	.controls-content h3 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		letter-spacing: 0.08em;
	}
	.controls-content p {
		margin: 0.15rem 0;
		font-size: 0.9rem;
	}

	.controls {
		display: grid;
		gap: 0.65rem;
		width: 100%;
		max-width: 30rem;
		padding: 1rem 1.25rem;
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
	}

	.slider-row {
		display: grid;
		grid-template-columns: 6rem 1fr 4rem;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: #cbd5e1;
	}
	.slider-row input[type='range'] {
		width: 100%;
	}
	.slider-row .slider-value {
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: #f1f5f9;
	}

	.toggle-row {
		display: flex;
		gap: 1.25rem;
		font-size: 0.85rem;
		color: #cbd5e1;
	}
	.toggle {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		cursor: pointer;
	}

	.meta {
		max-width: 1100px;
		margin: 3rem auto 4rem;
		padding: 0 1.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}
	.meta-card {
		padding: 1.25rem 1.4rem;
		background: #0f172a;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
	}
	.meta-card h2 {
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #e2e8f0;
	}
	.meta-card p {
		margin: 0;
		line-height: 1.55;
		font-size: 0.9rem;
		color: #cbd5e1;
	}
	.meta-card code {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.85em;
		padding: 0.05rem 0.3rem;
		background: rgba(148, 163, 184, 0.18);
		border-radius: 0.25rem;
	}
</style>
