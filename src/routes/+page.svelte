<!--
	============================================================
	TFE / Svelte Templates — Editorial Home (v2)
	============================================================

	WHAT
	Reimagined homepage in the TFE house style: ink hero slab,
	Anton display headline, Plex body, twelve numbered shelves
	for 100+ Svelte 5 components.

	STRUCTURE
	1. Hero (ink, editorial display)
	2. Marquee ticker
	3. GSAP suite featured spread (with animated dot field)
	4. Component index head (chip filter / scroll-spy)
	5. Twelve category shelves (auto-generated from componentCatalog)
	6. Quick-start how-to
	7. Editorial footer

	DESIGN TOKENS
	Imports tfe-tokens.css globally via app.css.
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { componentCategories, componentCount } from '$lib/componentCatalog';

	const categories = componentCategories;
	const total = componentCount;

	const categoryNums = categories.map((_, i) => String(i + 1).padStart(2, '0'));
	const categorySlugs = categories.map((c) => slugify(c.name));

	// Cumulative offsets so each card carries a global 001..N number.
	const offsets = categories.reduce<number[]>((acc, cat, i) => {
		acc.push(i === 0 ? 0 : acc[i - 1] + categories[i - 1].components.length);
		return acc;
	}, []);

	let activeId = $state<string>('all');

	// Scroll-spy: highlight the chip whose section is most visible.
	let canvasEl = $state<HTMLCanvasElement | null>(null);

	onMount(() => {
		const ids = categorySlugs.map((s) => `cat-${s}`);
		const sections = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => Boolean(el));

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				if (visible[0]) {
					activeId = visible[0].target.id.replace('cat-', '');
				}
			},
			{ rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] }
		);

		sections.forEach((s) => observer.observe(s));

		// Animated dot field for the GSAP feature visual.
		let raf = 0;
		let t = 0;
		const cv = canvasEl;
		const ctx = cv?.getContext('2d') ?? null;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function resize() {
			if (!cv || !ctx) return;
			const r = cv.getBoundingClientRect();
			cv.width = Math.max(1, r.width * dpr);
			cv.height = Math.max(1, r.height * dpr);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
		}

		function tick() {
			if (!cv || !ctx) return;
			const r = cv.getBoundingClientRect();
			ctx.clearRect(0, 0, r.width, r.height);
			const gap = 28;
			const cols = Math.floor(r.width / gap);
			const rows = Math.floor(r.height / gap);
			const cx = r.width / 2;
			const cy = r.height / 2;
			t += reduceMotion ? 0.002 : 0.012;
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const px = (x + 0.5) * gap;
					const py = (y + 0.5) * gap;
					const dx = px - cx;
					const dy = py - cy;
					const d = Math.sqrt(dx * dx + dy * dy);
					const wave = Math.sin(d * 0.04 - t * 2);
					const sz = 1.2 + Math.max(0, wave) * 2.6;
					const a = 0.18 + Math.max(0, wave) * 0.55;
					ctx.fillStyle = `rgba(91,130,196,${a})`;
					ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
				}
			}
			raf = requestAnimationFrame(tick);
		}

		if (cv && ctx) {
			resize();
			window.addEventListener('resize', resize);
			tick();
		}

		return () => {
			observer.disconnect();
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
		};
	});

	function slugify(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function tickerItems(): string[] {
		return [
			'Svelte 5 · Runes',
			'Accessibility wired',
			'TypeScript',
			'Zero-dep options',
			'Motion that doesn’t bounce',
			'GSAP suite',
			'Better Auth',
			'Open source',
			'Built in Britain',
			'Copy · paste · ship'
		];
	}

	const ticker = tickerItems();
</script>

<svelte:head>
	<title>TFE / Svelte Templates — Component library, v2</title>
	<meta
		name="description"
		content="A working library of Svelte 5 components by @Jktfe. {total} parts across {categories.length} categories. Copy, customise, ship."
	/>
</svelte:head>

<div class="tfe-home" id="top">
	<!-- ===== Hero ===== -->
	<header class="t-hero">
		<div class="t-hero__inner">
			<div class="t-hero__meta">
				<span><b>TFE</b> — Svelte 5 Templates</span>
				<span>v2.0 · {total} components · {categories.length} categories</span>
				<span>Updated · MAY 2026</span>
			</div>

			<h1 class="t-hero__headline">
				A Working<br />
				<span class="outline">Library&nbsp;of</span><br />
				<span class="accent">Svelte&nbsp;Parts.</span>
			</h1>

			<div class="t-hero__rule"></div>

			<div class="t-hero__sub">
				<p class="t-hero__lede">
					<em>I’m @Jktfe.</em> I build interface parts in Svelte 5 — runes, accessibility wired in,
					animation that doesn’t bounce. <em>{total} of them, so far.</em> Inspired by Magic UI,
					Aceternity and Sikandar S. Bhide; rebuilt properly, then mixed with originals. Copy what
					you need.
				</p>
				<div class="t-hero__actions">
					<a class="t-btn t-btn--primary" href="#components">
						Browse {total} components <span class="arrow" aria-hidden="true">→</span>
					</a>
					<a class="t-btn t-btn--ghost" href="/gsap-suite">
						GSAP suite <span class="arrow" aria-hidden="true">↗</span>
					</a>
					<a
						class="t-btn t-btn--ghost"
						href="https://github.com/Jktfe/tfeSvelteTemplates"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub <span class="arrow" aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
		</div>
	</header>

	<!-- ===== Ticker ===== -->
	<div class="t-ticker" aria-hidden="true">
		<div class="t-ticker__track">
			{#each [0, 1, 2] as repeatIndex (repeatIndex)}
				<span class="t-ticker__group">
					{#each ticker as item (item)}
						<span>{item}</span><span class="dot">●</span>
					{/each}
				</span>
			{/each}
		</div>
	</div>

	<!-- ===== Featured GSAP suite ===== -->
	<section class="t-featured">
		<div class="t-wrap">
			<div class="t-featured__grid">
				<div>
					<div class="t-featured__num">— Suite · 06.13</div>
					<h2 class="t-featured__title">
						GSAP, sequenced.<br /><span class="blue">For copy-and-ship agents.</span>
					</h2>
					<p class="t-featured__body">
						SplitText heroes, reveal wrappers, a kinetic canvas field, fan decks, and a Flip grid —
						grouped on one route, with provenance chips and copy-for-your-agent prompts.
					</p>
					<ul class="t-featured__list">
						<li><b>01</b><span>SplitText hero with stagger and word focus</span></li>
						<li><b>02</b><span>Reveal wrapper for any block, viewport-driven</span></li>
						<li><b>03</b><span>Kinetic canvas field, pointer-reactive</span></li>
						<li><b>04</b><span>Fan deck and Flip grid, scoped keyboard control</span></li>
					</ul>
					<a class="t-btn t-btn--blue" href="/gsap-suite">
						Open /gsap-suite <span class="arrow" aria-hidden="true">↗</span>
					</a>
				</div>
				<div class="t-featured__visual" aria-hidden="true">
					<canvas bind:this={canvasEl}></canvas>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== Index head ===== -->
	<section id="components" class="t-index-head">
		<div class="t-wrap">
			<div class="t-index-head__row">
				<div>
					<div class="t-index-head__eyebrow">— Section · 02.00</div>
					<h2>The catalogue.<br />Twelve shelves.</h2>
				</div>
				<div class="t-index-head__meta">
					<b>{total}</b>
					components on file
				</div>
			</div>
			<div class="t-filters" role="tablist" aria-label="Filter component categories">
				<a
					class="t-filters__chip"
					href="#components"
					data-active={activeId === 'all'}
					onclick={() => (activeId = 'all')}
				>
					All <b>{total}</b>
				</a>
				{#each categories as cat, i (cat.name)}
					<a
						class="t-filters__chip"
						href={`#cat-${categorySlugs[i]}`}
						data-active={activeId === categorySlugs[i]}
						onclick={() => (activeId = categorySlugs[i])}
					>
						{cat.name} <b>{cat.components.length}</b>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== Category shelves ===== -->
	{#each categories as cat, i (cat.name)}
		{@const offset = offsets[i]}
		<section id={`cat-${categorySlugs[i]}`} class="t-cat">
			<div class="t-wrap">
				<div class="t-cat__head">
					<div class="t-cat__num">{categoryNums[i]}</div>
					<div>
						<h3 class="t-cat__title">{cat.name}</h3>
						<p class="t-cat__blurb">{cat.summary}</p>
					</div>
					<div class="t-cat__count">
						<b>{String(cat.components.length).padStart(2, '0')}</b>
						in this shelf
					</div>
				</div>
				<div class="t-grid">
					{#each cat.components as item, j (item.href)}
						<a class="t-card" href={item.href} data-sveltekit-preload-data="hover">
							<div class="t-card__shot">
								<span class="t-card__num">{String(offset + j + 1).padStart(3, '0')}</span>
								<img src={item.screenshot} alt="" loading="lazy" decoding="async" />
							</div>
							<div class="t-card__body">
								<h4 class="t-card__name">{item.name}</h4>
								<p class="t-card__blurb">{item.description}</p>
								<div class="t-card__foot">
									<span>{item.href}</span>
									<span class="t-card__view"
										>View <span class="arrow" aria-hidden="true">→</span></span
									>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/each}

	<!-- ===== How-to ===== -->
	<section id="how" class="t-howto">
		<div class="t-wrap">
			<div class="t-howto__head">
				<h2>Copy, customise,<br />ship.</h2>
				<p>
					Three steps. No package install, no opaque API. The components are plain Svelte 5 files.
					Lift and adapt.
				</p>
			</div>
			<div class="t-howto__steps">
				<div class="t-step">
					<div class="t-step__num">01</div>
					<h3 class="t-step__title">Browse the shelf</h3>
					<p class="t-step__body">
						Find the component you want. Hit the demo, prod the controls, read the source.
					</p>
					<div class="t-step__code">/components → /demo</div>
				</div>
				<div class="t-step">
					<div class="t-step__num">02</div>
					<h3 class="t-step__title">Copy the file</h3>
					<p class="t-step__body">
						Grab the .svelte file from src/lib/components/. Drop it into your project. Props are
						typed.
					</p>
					<div class="t-step__code">cp Component.svelte ./src/lib</div>
				</div>
				<div class="t-step">
					<div class="t-step__num">03</div>
					<h3 class="t-step__title">Bend it to fit</h3>
					<p class="t-step__body">
						Wire your data, swap colours, tune the motion. If something’s missing, tell me — I’ll
						add it.
					</p>
					<div class="t-step__code">{'<Component data={...} />'}</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer is rendered by the global layout (TfeFooter). -->
</div>

<style>
	.tfe-home {
		background: var(--bg);
		color: var(--fg);
		font-family: var(--font-sans);
		line-height: var(--lh-loose);
		font-size: 16px;
	}

	.tfe-home :global(*) {
		box-sizing: border-box;
	}

	.tfe-home :global(::selection) {
		background: var(--tfe-blue);
		color: #fff;
	}

	.t-wrap {
		width: 100%;
		max-width: var(--container);
		margin: 0 auto;
		padding: 0 32px;
	}

	/* ============ Hero — paper-default ============ */
	.t-hero {
		background: var(--tfe-paper);
		color: var(--fg-1);
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid var(--border);
	}
	.t-hero__inner {
		max-width: var(--container);
		margin: 0 auto;
		padding: 80px 32px 96px;
		position: relative;
	}
	.t-hero__meta {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-bottom: 56px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--border);
	}
	.t-hero__meta span {
		white-space: nowrap;
	}
	.t-hero__meta b {
		color: var(--fg-1);
		font-weight: 500;
	}

	.t-hero__headline {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(56px, 11.5vw, 184px);
		line-height: 0.92;
		letter-spacing: 0.005em;
		text-transform: uppercase;
		margin: 0;
		color: var(--fg-1);
	}
	.t-hero__headline .accent {
		color: var(--tfe-blue);
	}
	.t-hero__headline .outline {
		color: transparent;
		-webkit-text-stroke: 1.5px var(--fg-1);
	}

	.t-hero__rule {
		margin: 56px 0 40px;
		height: 1px;
		background: var(--border);
	}

	.t-hero__sub {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 48px;
		align-items: end;
	}
	.t-hero__lede {
		font-size: clamp(18px, 1.6vw, 22px);
		line-height: 1.55;
		color: var(--fg-2);
		font-weight: 300;
		max-width: 56ch;
		margin: 0;
	}
	.t-hero__lede em {
		font-style: normal;
		color: var(--fg-1);
		font-weight: 500;
	}

	.t-hero__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		justify-content: flex-end;
	}

	/* ============ Buttons ============ */
	.t-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 22px;
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.02em;
		border-radius: var(--r-2);
		border: 1px solid transparent;
		text-decoration: none;
		transition: all var(--dur-fast) var(--ease-std);
		cursor: pointer;
	}
	.t-btn--primary {
		background: var(--tfe-ink);
		color: #f6f5f1;
		border-color: var(--tfe-ink);
	}
	.t-btn--primary:hover {
		background: var(--tfe-blue);
		border-color: var(--tfe-blue);
		color: #fff;
	}
	.t-btn--ghost {
		background: transparent;
		color: var(--fg-1);
		border-color: var(--border-strong);
	}
	.t-btn--ghost:hover {
		background: var(--surface-2);
		border-color: var(--fg-1);
	}
	.t-btn--blue {
		background: var(--tfe-blue);
		color: #fff;
		border-color: var(--tfe-blue);
	}
	.t-btn--blue:hover {
		background: var(--tfe-blue-700);
		border-color: var(--tfe-blue-700);
	}
	.t-btn .arrow {
		display: inline-block;
		transition: transform var(--dur-fast);
	}
	.t-btn:hover .arrow {
		transform: translateX(2px);
	}

	/* ============ Ticker — paper-default ============ */
	.t-ticker {
		background: var(--surface-2);
		color: var(--fg-3);
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 14px 0;
		overflow: hidden;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		position: relative;
	}
	.t-ticker__track {
		display: flex;
		gap: 56px;
		white-space: nowrap;
		width: max-content;
		animation: t-ticker-scroll 60s linear infinite;
	}
	.t-ticker__group {
		display: inline-flex;
		align-items: center;
		gap: 56px;
	}
	.t-ticker .dot {
		color: var(--tfe-blue-300);
	}
	@keyframes t-ticker-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-33.333%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.t-ticker__track {
			animation-duration: 240s;
		}
	}

	/* ============ Featured ============ */
	.t-featured {
		background: var(--tfe-paper);
		border-bottom: 1px solid var(--border);
		padding: 96px 0;
	}
	.t-featured__grid {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		gap: 80px;
		align-items: center;
	}
	.t-featured__num {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		color: var(--fg-3);
		text-transform: uppercase;
		margin-bottom: 20px;
	}
	.t-featured__title {
		font-family: var(--font-display);
		font-size: clamp(40px, 5.4vw, 80px);
		line-height: 0.96;
		text-transform: uppercase;
		margin: 0 0 24px;
		color: var(--tfe-ink);
		font-weight: 400;
		letter-spacing: 0.005em;
	}
	.t-featured__title .blue {
		color: var(--tfe-blue);
	}
	.t-featured__body {
		font-size: 17px;
		line-height: 1.65;
		color: var(--fg-2);
		max-width: 52ch;
		margin: 0 0 28px;
	}
	.t-featured__list {
		list-style: none;
		padding: 0;
		margin: 0 0 32px;
		display: grid;
		gap: 8px;
		font-size: 14px;
		color: var(--fg-2);
	}
	.t-featured__list li {
		display: flex;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.t-featured__list li b {
		font-family: var(--font-mono);
		font-weight: 500;
		font-size: 11px;
		color: var(--fg-3);
		letter-spacing: 0.08em;
		min-width: 56px;
		padding-top: 2px;
		text-transform: uppercase;
	}
	.t-featured__list li span {
		color: var(--fg-1);
		flex: 1;
	}
	.t-featured__visual {
		position: relative;
		aspect-ratio: 4 / 3;
		background: var(--tfe-ink);
		border: 1px solid var(--border-strong);
		overflow: hidden;
		border-radius: var(--r-2);
	}
	.t-featured__visual canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
	.t-featured__visual::after {
		content: 'GSAP / SUITE';
		position: absolute;
		bottom: 16px;
		left: 16px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		color: rgba(246, 245, 241, 0.6);
	}

	/* ============ Index head ============ */
	.t-index-head {
		padding: 96px 0 24px;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}
	.t-index-head__row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 32px;
		padding-bottom: 24px;
	}
	.t-index-head__eyebrow {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-bottom: 16px;
	}
	.t-index-head h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(40px, 5vw, 72px);
		line-height: 0.96;
		text-transform: uppercase;
		letter-spacing: 0.005em;
		margin: 0;
		color: var(--fg-1);
	}
	.t-index-head__meta {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
		text-align: right;
		white-space: nowrap;
	}
	.t-index-head__meta b {
		display: block;
		font-size: 32px;
		color: var(--fg-1);
		font-family: var(--font-display);
		letter-spacing: 0.02em;
	}
	.t-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 24px 0 0;
	}
	.t-filters__chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border: 1px solid var(--border-strong);
		background: transparent;
		color: var(--fg-2);
		font-family: var(--font-sans);
		font-size: 12px;
		letter-spacing: 0.02em;
		border-radius: var(--r-pill);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--dur-fast) var(--ease-std);
	}
	.t-filters__chip b {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--fg-3);
		font-weight: 500;
	}
	.t-filters__chip:hover {
		border-color: var(--fg-1);
		color: var(--fg-1);
	}
	.t-filters__chip[data-active='true'] {
		background: var(--fg-1);
		border-color: var(--fg-1);
		color: var(--bg);
	}
	.t-filters__chip[data-active='true'] b {
		color: var(--fg-3);
	}

	/* ============ Categories ============ */
	.t-cat {
		border-bottom: 1px solid var(--border);
		padding: 64px 0 80px;
		scroll-margin-top: 96px;
	}
	.t-cat__head {
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 32px;
		align-items: baseline;
		margin-bottom: 40px;
	}
	.t-cat__num {
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		color: var(--accent);
		letter-spacing: 0.02em;
	}
	.t-cat__title {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(28px, 3.4vw, 44px);
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.005em;
		margin: 0 0 8px;
		color: var(--fg-1);
	}
	.t-cat__blurb {
		font-size: 15px;
		color: var(--fg-2);
		margin: 0;
		max-width: 56ch;
	}
	.t-cat__count {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
		text-align: right;
		white-space: nowrap;
		align-self: center;
	}
	.t-cat__count b {
		display: block;
		font-family: var(--font-display);
		font-size: 32px;
		color: var(--fg-1);
	}

	/* ============ Card grid — dense default ============ */
	.t-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 16px;
	}
	.t-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: var(--r-2);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		position: relative;
		transition: all var(--dur-base) var(--ease-std);
	}
	.t-card:hover {
		border-color: var(--fg-1);
		box-shadow: var(--shadow-2);
		transform: translateY(-2px);
	}
	.t-card__shot {
		aspect-ratio: 16 / 10;
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
		position: relative;
		overflow: hidden;
	}
	.t-card__shot img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform var(--dur-slow) var(--ease-out);
	}
	.t-card:hover .t-card__shot img {
		transform: scale(1.04);
	}
	.t-card__shot::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 60%, rgba(17, 19, 21, 0.06));
		pointer-events: none;
	}
	.t-card__num {
		position: absolute;
		top: 12px;
		left: 12px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
		background: var(--surface);
		padding: 4px 8px;
		border-radius: var(--r-1);
		border: 1px solid var(--border);
	}
	.t-card__body {
		padding: 16px 18px 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.t-card__name {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 22px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1);
		line-height: 1;
	}
	.t-card__blurb {
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--fg-2);
		margin: 0;
		flex: 1;
	}
	.t-card__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.t-card__view {
		color: var(--accent);
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.t-card:hover .t-card__view {
		color: var(--accent-strong);
	}
	.t-card__view .arrow {
		transition: transform var(--dur-fast);
	}
	.t-card:hover .t-card__view .arrow {
		transform: translateX(3px);
	}

	/* ============ How-to ============ */
	.t-howto {
		background: var(--surface-2);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		padding: 96px 0;
	}
	.t-howto__head {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 48px;
		align-items: end;
		margin-bottom: 48px;
	}
	.t-howto__head h2 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(36px, 4.6vw, 64px);
		line-height: 0.96;
		text-transform: uppercase;
		letter-spacing: 0.005em;
		margin: 0;
		color: var(--fg-1);
	}
	.t-howto__head p {
		font-size: 16px;
		color: var(--fg-2);
		margin: 0;
		max-width: 50ch;
		justify-self: end;
	}
	.t-howto__steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		border-top: 2px solid var(--fg-1);
		border-bottom: 1px solid var(--border);
	}
	.t-step {
		padding: 32px 28px 36px;
		border-right: 1px solid var(--border);
		background: var(--surface);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.t-step:last-child {
		border-right: 0;
	}
	.t-step__num {
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		color: var(--accent);
		letter-spacing: 0.02em;
	}
	.t-step__title {
		font-family: var(--font-display);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		font-size: 22px;
		margin: 0;
		color: var(--fg-1);
		line-height: 1.05;
	}
	.t-step__body {
		font-size: 14px;
		color: var(--fg-2);
		line-height: 1.55;
		margin: 0;
	}
	.t-step__code {
		margin-top: 8px;
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--tfe-ink);
		color: #c8d6ec;
		padding: 10px 14px;
		border-radius: var(--r-2);
		letter-spacing: 0.01em;
		white-space: pre;
		overflow-x: auto;
	}

	/* ============ Responsive ============ */
	@media (max-width: 980px) {
		.t-featured__grid {
			grid-template-columns: 1fr;
			gap: 48px;
		}
		.t-featured {
			padding: 72px 0;
		}
	}
	@media (max-width: 880px) {
		.t-hero__sub {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.t-hero__actions {
			justify-content: flex-start;
		}
		.t-hero__inner {
			padding: 56px 20px 72px;
		}
		.t-hero__meta {
			flex-wrap: wrap;
		}
		.t-howto__head {
			grid-template-columns: 1fr;
		}
		.t-howto__head p {
			justify-self: start;
		}
		.t-howto__steps {
			grid-template-columns: 1fr;
		}
		.t-step {
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
		.t-step:last-child {
			border-bottom: 0;
		}
	}
	@media (max-width: 720px) {
		.t-wrap {
			padding: 0 20px;
		}
		.t-cat__head {
			grid-template-columns: 56px 1fr;
		}
		.t-cat__num {
			font-size: 40px;
		}
		.t-cat__count {
			grid-column: 1 / -1;
			text-align: left;
		}
	}

	/* Tokens already swap surfaces under prefers-color-scheme: dark — no per-route overrides needed. */
</style>
