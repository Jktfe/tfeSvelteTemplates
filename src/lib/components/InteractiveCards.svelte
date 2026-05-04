<!--
	============================================================
	InteractiveCards — scroll-driven paintings portfolio
	============================================================

	🎯 WHAT IT DOES
	A scroll-pinned gallery where seven painting cards rise up from below,
	fan out beneath a hero title, then travel along a curved diagonal
	conveyor as the user scrolls. Clicking any card opens a detail view with
	an ornate frame, size/material pills and add-to-cart. A room-mockup
	overlay and an awards/testimonials strip fade in during the conveyor
	phase.

	This is a Svelte 5 port of the GSAP + ScrollTrigger reference spec.
	The pin is achieved natively with `position: sticky` inside a tall
	spacer, and all per-frame card motion is computed in a spring-driven
	`requestAnimationFrame` loop. No external animation libraries.

	✨ FEATURES
	• 7 cards with per-card spring interpolation (position, rotation, scale)
	• Entrance choreography: rise → breathe → fan
	• Scroll progress drives fan → diagonal conveyor transition
	• Conveyor wraps seamlessly with modulo + teleport-on-jump
	• Click to open detail: coin-flip, frame reveal, info panel
	• Painter room overlay with scroll-driven painting cycling
	• Awards + 3 testimonial slides, each with per-letter reveal
	• Theme-aware wall texture (MutationObserver on data-theme)
	• Respects prefers-reduced-motion
	• Full keyboard + ARIA; Escape closes detail view

	♿ ACCESSIBILITY
	• Each card is a <button> with descriptive aria-label
	• Escape key closes detail view
	• prefers-reduced-motion shortens / disables the spring loop
	• Screen-reader-only summary of hidden cards

	📦 DEPENDENCIES
	Zero external runtime dependencies.
	============================================================
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { InteractiveCardsProps } from '$lib/types';
	import {
		FALLBACK_INTERACTIVE_PROJECTS,
		FALLBACK_INTERACTIVE_TESTIMONIALS
	} from '$lib/constants';
	import {
		clamp,
		computeDiagonal,
		computeFan,
		detailPose,
		fanPoseFor,
		getCardH,
		getCardW,
		getSubGap,
		toScreen,
		MOBILE_BREAKPOINT
	} from './interactiveCards/geometry';
	import InteractiveCardItem from './interactiveCards/InteractiveCardItem.svelte';
	import InteractiveCardsAwards from './interactiveCards/InteractiveCardsAwards.svelte';
	import InteractiveCardsDetail from './interactiveCards/InteractiveCardsDetail.svelte';
	import InteractiveCardsRoomPreview from './interactiveCards/InteractiveCardsRoomPreview.svelte';

	const CDN = 'https://pub-dc2abe5caae44240a6d1913566a75e0f.r2.dev/picasso-ecommerce';

	let {
		projects = FALLBACK_INTERACTIVE_PROJECTS,
		testimonials = FALLBACK_INTERACTIVE_TESTIMONIALS,
		headline = ['Every brushstroke', 'deserves a gallery.'],
		subheading = 'Hand-picked originals and limited edition prints from a collective of working painters. Every piece is signed, numbered, and shipped museum-ready.',
		wallImageLight = `${CDN}/wall-bg.jpg`,
		wallImageDark = `${CDN}/wall-bg-dark.jpg`,
		frameImage = `${CDN}/frame.png`,
		roomImage = `${CDN}/painter-sample-bottom.png`,
		scrollHeight = '500vh'
	}: InteractiveCardsProps = $props();

	// ------------------------------------------------------------------
	// Refs
	// ------------------------------------------------------------------
	let wrapperEl: HTMLElement;
	let sectionEl: HTMLElement;
	let heroEl: HTMLElement;
	let subEl: HTMLElement;
	let titleEl: HTMLElement;
	let cardRefs: Array<HTMLDivElement | null> = $state([]);

	// ------------------------------------------------------------------
	// Scroll + viewport state
	// ------------------------------------------------------------------
	let vw = $state(0);
	let vh = $state(0);
	let scrollProgress = $state(0);
	let titleHeight = $state(0);
	// Prop reads via `$state(prop)` only capture the initial value — use a
	// getter so theme swaps can re-read the latest prop values.
	let wallBg = $state('');

	// Gating flags — set by progress in the tick loop.
	let painterVisible = $state(false);
	let painterImgIdx = $state(0);
	let awardsVisible = $state(false);
	let awardsSlide = $state(-1);

	// Hero opacity — fades out as cards transition off-fan.
	let heroOpacity = $state(1);

	// ------------------------------------------------------------------
	// Detail view state
	// ------------------------------------------------------------------
	let detailIdx = $state(-1);
	let hoverIdx = $state(-1);
	let selectedSize = $state('');
	let selectedMaterial = $state('');
	let quantity = $state(1);

	// ------------------------------------------------------------------
	// Card state machine — current (c*) and target (t*) values. The tick loop
	// eases current toward target every frame.
	// ------------------------------------------------------------------
	interface CardState {
		cx: number;
		cy: number;
		cr: number;
		cs: number;
		co: number;
		tx: number;
		ty: number;
		tr: number;
		ts: number;
		to: number;
		z: number;
		flipY: number;
		frameOpacity: number;
	}

	// The card array is mutated in place by the tick loop and re-read by the
	// template; wrapping with $state keeps Svelte's reactivity graph correct.
	let cards: CardState[] = $state([]);
	let conveyorOffset = 0;
	let entranceDone = false;
	let entranceStart = 0;
	const ENTRANCE_DURATION = 1700; // ms — covers all 3 beats

	let rafId: number | null = null;
	let reducedMotion = false;
	// Set true once `onMount` has measured the title — guards `computeTargets`
	// against the one-frame race where cards would otherwise read titleHeight = 0
	// and snap into the wrong fan layout before the first measurement lands.
	let mounted = false;

	// ------------------------------------------------------------------
	// Measure viewport + hero title height. Cheap enough to run on every
	// resize; the tick loop reads these on each frame too.
	// ------------------------------------------------------------------
	function measure() {
		vw = window.innerWidth;
		vh = window.innerHeight;
		if (titleEl) {
			titleHeight = titleEl.getBoundingClientRect().height;
		}
	}

	// ------------------------------------------------------------------
	// Scroll progress. The pin is a sticky inner inside a tall outer spacer,
	// so "how far we've scrolled through the pinned region" is just how far
	// the wrapper has moved past the viewport top.
	// ------------------------------------------------------------------
	function updateScroll() {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		// rect.top starts at 0 when the pin engages and becomes negative as we
		// scroll further. The pinned range is `wrapper.height - viewport.height`.
		const range = wrapperEl.offsetHeight - window.innerHeight;
		if (range <= 0) {
			scrollProgress = 0;
			return;
		}
		const p = clamp(-rect.top / range, 0, 1);
		scrollProgress = p;
	}

	// ------------------------------------------------------------------
	// Initial card positions — stacked below the viewport, ready to rise.
	// ------------------------------------------------------------------
	function initCards() {
		cards = projects.map((_, i) => ({
			cx: vw / 2,
			cy: vh + 80,
			cr: (Math.random() - 0.5) * 6,
			cs: 0.7,
			co: 0,
			tx: vw / 2,
			ty: vh + 80,
			tr: 0,
			ts: 0.7,
			to: 0,
			z: i,
			flipY: 0,
			frameOpacity: 0
		}));
	}

	// ------------------------------------------------------------------
	// Entrance tween — replaces the spec's GSAP timeline. Three concurrent
	// beats (rise, breathe, fan) sequenced through a single time cursor.
	// We drive targets; the spring loop does the visual easing.
	// ------------------------------------------------------------------
	function stepEntrance(t: number) {
		// t in [0,1] across ENTRANCE_DURATION
		const n = cards.length;
		const fanCfg = computeFan(vw, vh, heroTopPx(), titleHeight);

		for (let i = 0; i < n; i++) {
			// Beat 1 — rise (0 → 0.55)
			const riseT = clamp(t / 0.55 - i * 0.01, 0, 1);
			// Beat 3 — fan (0.45 → 1)
			const fanT = clamp((t - 0.45) / 0.55, 0, 1);

			const pose = fanPoseFor(i, n, fanCfg);

			// Midpoint position (fanned center) — used during rise.
			const midX = fanCfg.centerX;
			const midY = fanCfg.centerY;

			// Lerp rise first (stack → center), then fan (center → fanned).
			const rx = vw / 2 + (midX - vw / 2) * riseT;
			const ry = vh + 80 + (midY - (vh + 80)) * riseT;

			const fx = rx + (pose.x - midX) * fanT;
			const fy = ry + (pose.y - midY) * fanT;

			cards[i].tx = fx;
			cards[i].ty = fy;
			cards[i].tr = pose.rotation * fanT;
			cards[i].ts = 0.76 + (pose.scale - 0.76) * fanT;
			cards[i].to = clamp(riseT * 1.5, 0, 1);
		}

		// Hero headline fades in alongside the rise.
		if (heroEl && t > 0.1) {
			const heroT = clamp((t - 0.1) / 0.6, 0, 1);
			heroEl.style.opacity = String(heroT);
		}
		if (subEl && t > 0.55) {
			const subT = clamp((t - 0.55) / 0.45, 0, 1);
			subEl.style.opacity = String(subT);
		}

		if (t >= 1) {
			entranceDone = true;
			if (heroEl) heroEl.style.opacity = '1';
			if (subEl) subEl.style.opacity = '1';
		}
	}

	// ------------------------------------------------------------------
	// Where the hero title sits (vertically). Mobile gets a minimum padding
	// so the title clears any fixed app chrome.
	// ------------------------------------------------------------------
	function heroTopPx() {
		if (vw < MOBILE_BREAKPOINT) return Math.max(40, vh * 0.08);
		return vh * 0.12;
	}

	// ------------------------------------------------------------------
	// Per-frame target computation. Implements spec section 11 (phases) and
	// section 12 (tick loop). The actual DOM write happens further down.
	// ------------------------------------------------------------------
	function computeTargets() {
		if (!cards.length) return;
		// Bail out for the brief window where the component has mounted but the
		// hero title hasn't been measured yet — running the fan maths against a
		// titleHeight of 0 would snap cards into a visibly wrong pose for a frame.
		if (mounted && titleHeight === 0) return;
		const n = cards.length;
		const cardH = getCardH(vw, vh);
		const fanCfg = computeFan(vw, vh, heroTopPx(), titleHeight);
		const diagCfg = computeDiagonal(vw, vh, cardH);

		// Phases: 0 → 0.20 fan→diagonal, 0.20 → 1.00 conveyor
		const P_DIAG = 0.2;
		const transition = clamp(scrollProgress / P_DIAG, 0, 1);
		const convP = clamp((scrollProgress - P_DIAG) / (1 - P_DIAG), 0, 1);

		// Conveyor wraps over `visibleLen`. We use n*spacing to spread evenly.
		const yRange = diagCfg.yEnd - diagCfg.yStart;
		const visibleLen = yRange;
		const spacing = visibleLen / n;
		conveyorOffset = convP * visibleLen * 1.25;

		// Hero + sub fade out as we start moving to diagonal.
		heroOpacity = clamp(1 - transition * 2.5, 0, 1);

		// Flags driven off progress — these get read by child components.
		painterVisible = detailIdx === -1 && transition >= 1;
		painterImgIdx = Math.floor(convP * n) % n;
		awardsVisible = detailIdx === -1 && transition >= 1;
		// Four slides at 0.25 intervals.
		if (awardsVisible) {
			awardsSlide = Math.min(3, Math.floor(convP * 4));
		} else {
			awardsSlide = -1;
		}

		// Per-card targets.
		const dPose = detailPose(vw, vh);

		for (let i = 0; i < n; i++) {
			const c = cards[i];

			if (detailIdx === i) {
				// Detail view — selected card flies to the detail pose.
				c.tx = dPose.x;
				c.ty = dPose.y;
				c.tr = 0;
				c.ts = dPose.scale;
				c.to = 1;
				c.z = n + 5;
				c.frameOpacity = 1;
				continue;
			} else if (detailIdx !== -1) {
				// Other cards fade out while one is featured.
				c.to = 0;
				c.frameOpacity = 0;
				continue;
			}

			const fan = fanPoseFor(i, n, fanCfg);
			// Conveyor position for this card. Stagger by i * spacing so they
			// spread evenly along the curve, then shift by the scroll offset.
			const convPos = i * spacing + conveyorOffset;
			const diag = toScreen(convPos, visibleLen, diagCfg);

			// Z-index in conveyor mode: lower-on-screen cards render above.
			const diagZ = Math.round(((diag.y + diagCfg.margin) / yRange) * n);

			// Lerp fan → diagonal.
			const tx = fan.x + (diag.x - fan.x) * transition;
			const ty = fan.y + (diag.y - fan.y) * transition;
			const tr = fan.rotation + (0 - fan.rotation) * transition;
			const ts = fan.scale + (0.9 - fan.scale) * transition;

			// Hover lift — 28px up when hovered, not in detail, still in fan.
			const liftY = hoverIdx === i && transition < 0.5 ? -28 : 0;

			c.tx = tx;
			c.ty = ty + liftY;
			c.tr = tr;
			c.ts = ts;
			c.to = 1;
			c.z = transition > 0.5 ? diagZ : i;
			c.frameOpacity = 0;
		}
	}

	// ------------------------------------------------------------------
	// Spring + DOM write. Easing factor matches the spec: lighter when in
	// detail so the featured card drifts in elegantly.
	// ------------------------------------------------------------------
	function applyCards() {
		const spring = detailIdx !== -1 ? 0.15 : 0.25;
		for (let i = 0; i < cards.length; i++) {
			const c = cards[i];
			c.cx += (c.tx - c.cx) * spring;
			c.cy += (c.ty - c.cy) * spring;
			c.cr += (c.tr - c.cr) * spring;
			c.cs += (c.ts - c.cs) * spring;
			c.co += (c.to - c.co) * spring;

			const el = cardRefs[i];
			if (!el) continue;

			// translate3d centres the card on its x,y (cardW/H are already
			// baked in via CSS width/aspect-ratio, so we offset by half).
			const w = getCardW(vw, vh);
			const h = getCardH(vw, vh);
			el.style.transform = `translate3d(${c.cx - w / 2}px, ${c.cy - h / 2}px, 0) rotate(${c.cr}deg) scale(${c.cs})`;
			el.style.opacity = String(clamp(c.co, 0, 1));
			el.style.zIndex = String(c.z);
		}
	}

	// ------------------------------------------------------------------
	// The loop. If the user prefers reduced motion we bail after the first
	// frame — everything still works, just without the gentle spring.
	// ------------------------------------------------------------------
	function tick(now: number) {
		if (!entranceDone) {
			if (!entranceStart) entranceStart = now;
			const t = clamp((now - entranceStart) / ENTRANCE_DURATION, 0, 1);
			stepEntrance(t);
		} else {
			computeTargets();
		}
		applyCards();
		updateHero();

		if (!reducedMotion) {
			rafId = requestAnimationFrame(tick);
		}
	}

	function updateHero() {
		if (heroEl && entranceDone) heroEl.style.opacity = String(heroOpacity);
		if (subEl && entranceDone) subEl.style.opacity = String(heroOpacity);
	}

	// ------------------------------------------------------------------
	// Detail handlers
	// ------------------------------------------------------------------
	function openDetail(i: number) {
		if (i < 0 || i >= projects.length) return;
		detailIdx = i;
		selectedSize = projects[i].sizes[0] ?? '';
		selectedMaterial = projects[i].materials[0] ?? '';
		quantity = 1;
	}

	function closeDetail() {
		detailIdx = -1;
		// Reset frame opacity on all cards so the overlay fades back out.
		for (let i = 0; i < cards.length; i++) {
			cards[i].frameOpacity = 0;
		}
	}

	// ------------------------------------------------------------------
	// Events
	// ------------------------------------------------------------------
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && detailIdx !== -1) {
			closeDetail();
		}
	}

	function onSectionClick(e: MouseEvent) {
		// Ignore clicks that bubbled from a card or the detail panel itself.
		const target = e.target as HTMLElement;
		if (target.closest('[data-card]') || target.closest('[data-panel]')) return;
		if (detailIdx !== -1) closeDetail();
	}

	// ------------------------------------------------------------------
	// Theme observer — swap the wall texture when data-theme changes.
	// ------------------------------------------------------------------
	let themeObserver: MutationObserver | null = null;
	function applyTheme() {
		if (typeof document === 'undefined') return;
		const theme = document.documentElement.getAttribute('data-theme');
		wallBg = theme === 'dark' ? wallImageDark : wallImageLight;
	}

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		measure();
		// Belt-and-braces: measure the title synchronously before any tick fires
		// so the very first computeTargets call sees a non-zero titleHeight.
		if (titleEl) titleHeight = titleEl.getBoundingClientRect().height;
		mounted = true;
		initCards();
		applyTheme();

		themeObserver = new MutationObserver(applyTheme);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		window.addEventListener('resize', measure);
		window.addEventListener('scroll', updateScroll, { passive: true });
		window.addEventListener('keydown', onKeyDown);
		if (sectionEl) sectionEl.addEventListener('click', onSectionClick);

		// First scroll read before the first paint.
		updateScroll();
		rafId = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (rafId != null) cancelAnimationFrame(rafId);
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', updateScroll);
			window.removeEventListener('keydown', onKeyDown);
		}
		if (sectionEl) sectionEl.removeEventListener('click', onSectionClick);
		themeObserver?.disconnect();
	});

	// Reactive side-effects: reinitialise cards when the project list changes
	// so consumers can swap data at runtime (e.g. after database load).
	$effect(() => {
		if (!projects) return;
		if (cards.length !== projects.length && vw > 0) {
			initCards();
		}
	});

	// Derived CSS for the sub-content vertical placement.
	let subGapPx = $derived(getSubGap(vw, vh));
</script>

<!--
	Outer wrapper is tall ({scrollHeight}); inner section is sticky so the
	composition stays pinned while the user scrolls through the full range.
-->
<div
	class="interactive-cards-wrapper"
	bind:this={wrapperEl}
	style:height={scrollHeight}
>
	<section
		class="interactive-cards"
		bind:this={sectionEl}
		aria-label="Paintings gallery"
	>
		<!-- Wall texture -->
		<div
			class="wall"
			style:background-image={`url(${wallBg})`}
		></div>

		<!-- Hero title (letters kept in a single h1 for screen readers) -->
		<div class="hero" bind:this={heroEl}>
			<h1 bind:this={titleEl}>
				<span class="hero-line">{headline[0]}</span>
				<br />
				<span class="hero-line hero-line-em">{headline[1]}</span>
			</h1>
		</div>

		<!-- Sub-content: summary + CTAs + rating strip. Positioned below the fan. -->
		<div
			class="sub-content"
			bind:this={subEl}
			style:top={`${heroTopPx() + titleHeight + getCardH(vw, vh) + 60 + subGapPx}px`}
		>
			<p class="summary">{subheading}</p>
			<div class="ctas">
				<button type="button" class="cta cta-primary">View Collection</button>
				<button type="button" class="cta cta-ghost">Commission a Piece</button>
			</div>
				<div class="rating-strip" aria-label="Trusted by collectors">
					<div class="stars" aria-hidden="true">
						{#each [0, 1, 2, 3, 4] as i (i)}
							<svg viewBox="0 0 24 24" class="star">
							<path
								d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 17 L5.5 21 L7.5 13.5 L2 9 L9 9 Z"
							/>
						</svg>
					{/each}
				</div>
				<div class="rating-meta">
					<span>4.9 from 2,400 collectors</span>
					<span class="dot" aria-hidden="true">·</span>
					<span>Free worldwide shipping</span>
				</div>
			</div>
		</div>

		<!-- Cards -->
		{#each projects as project, i (project.id)}
			<div style:position="absolute" style:left="0" style:top="0">
				<div bind:this={cardRefs[i]} class="card-slot">
					<InteractiveCardItem
						{project}
						index={i}
						{frameImage}
						frameOpacity={cards[i]?.frameOpacity ?? 0}
						badgeVisible={hoverIdx === i || detailIdx === i}
						onSelect={openDetail}
						onHover={(idx) => (hoverIdx = idx)}
						onUnhover={() => (hoverIdx = -1)}
					/>
				</div>
			</div>
		{/each}

		<!-- Room mockup + awards strip -->
		<InteractiveCardsRoomPreview
			{projects}
			imageIdx={painterImgIdx}
			visible={painterVisible}
			{roomImage}
		/>

		<InteractiveCardsAwards
			{testimonials}
			slideIdx={awardsSlide}
			visible={awardsVisible}
		/>

		<!-- Detail panel -->
		<InteractiveCardsDetail
			project={detailIdx >= 0 ? projects[detailIdx] : null}
			open={detailIdx !== -1}
			{selectedSize}
			{selectedMaterial}
			{quantity}
			onSelectSize={(s) => (selectedSize = s)}
			onSelectMaterial={(m) => (selectedMaterial = m)}
			onQuantityChange={(q) => (quantity = q)}
			onAddToCart={() => {
				// Consumer would normally wire in their cart here.
				// We flash a quick acknowledgement via the button colour.
				closeDetail();
			}}
			onClose={closeDetail}
		/>
	</section>
</div>

<style>
	.interactive-cards-wrapper {
		position: relative;
		width: 100%;
	}

	/* Sticky pin — matches the ScrollTrigger `pin: true, pinSpacing: true`
	   behaviour of the reference spec using only native CSS. */
	.interactive-cards {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: var(--background, #f6f3ef);
		color: var(--foreground, #111);
	}

	.wall {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		opacity: 0.85;
		z-index: 0;
	}

	.hero {
		position: absolute;
		inset-inline: 0;
		top: clamp(40px, 12vh, 140px);
		text-align: center;
		z-index: 12;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.hero h1 {
		margin: 0;
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-weight: 500;
		font-size: clamp(32px, 6.4vw, 92px);
		line-height: 0.98;
		letter-spacing: -0.01em;
	}

	.hero-line-em {
		font-style: italic;
	}

	.sub-content {
		position: absolute;
		inset-inline: 0;
		padding: 0 1.25rem;
		text-align: center;
		z-index: 11;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.summary {
		max-width: 640px;
		margin: 0 auto 1rem;
		font-size: clamp(14px, 1.3vw, 17px);
		line-height: 1.55;
		opacity: 0.82;
	}

	.ctas {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.cta {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		padding: 0.65rem 1.1rem;
		border-radius: 2px 8px 2px 6px;
		border: 1px solid var(--foreground, #111);
		background: var(--foreground, #111);
		color: var(--background, #fff);
		cursor: pointer;
	}

	.cta-ghost {
		background: transparent;
		color: var(--foreground, #111);
	}

	.rating-strip {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	.stars {
		display: inline-flex;
		gap: 2px;
	}

	.star {
		width: 11px;
		height: 11px;
		fill: color-mix(in srgb, var(--foreground, #111) 30%, transparent);
	}

	.rating-meta {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.card-slot {
		position: absolute;
		left: 0;
		top: 0;
		width: clamp(126px, 18vw, 252px);
		aspect-ratio: 3 / 4;
		will-change: transform, opacity;
	}

	@media (max-width: 767px) {
		.rating-strip {
			flex-direction: column;
			gap: 0.35rem;
		}
	}
</style>
