<script lang="ts">
	import '$lib/styles/gsap-tokens.css';

	import GsapRevealSequence from '$lib/components/GsapRevealSequence.svelte';
	import GsapSplitTextHero from '$lib/components/GsapSplitTextHero.svelte';
	import KineticCanvasField from '$lib/components/KineticCanvasField.svelte';
	import FanDeckCarousel, { type FanDeckItem } from '$lib/components/FanDeckCarousel.svelte';
	import GsapFlipGrid, {
		type GsapFlipGridFilter,
		type GsapFlipGridItem
	} from '$lib/components/GsapFlipGrid.svelte';
	import CinemaReel from '$lib/components/CinemaReel/CinemaReel.svelte';
	import ShapeTrailHero from '$lib/components/ShapeTrail/ShapeTrailHero.svelte';
	import LiquidTypeHero from '$lib/components/LiquidType/LiquidTypeHero.svelte';
	import DragGallery from '$lib/components/DragGallery/DragGallery.svelte';
	import MomentumSlider from '$lib/components/MomentumSlider/MomentumSlider.svelte';
	import PicassoPortfolio from '$lib/components/Picasso/PicassoPortfolio.svelte';
	import GsapTimeline from '$lib/components/GsapTimeline.svelte';
	import GsapGantt from '$lib/components/GsapGantt.svelte';
	import type {
		CinemaReelStill,
		DragGalleryItem,
		MomentumSliderItem,
		PicassoPainting,
		TimelineEvent,
		GanttTask
	} from '$lib/types';
	import AgentPromptCopy from '$lib/components/AgentPromptCopy.svelte';
	import BadgeProvenance from '$lib/components/BadgeProvenance.svelte';

	import {
		groupGsapSuiteByStatus,
		getGsapSuiteEntry,
		getGsapSuiteDemoUrl,
		gsapSuiteRegistry,
		type GsapSuiteEntry
	} from '$lib/registry/gsap-suite';

	const status = groupGsapSuiteByStatus();
	const totalConcepts = gsapSuiteRegistry.length;

	const splitTextEntry = getGsapSuiteEntry('split-text-hero')!;
	const revealEntry = getGsapSuiteEntry('reveal-sequence')!;
	const kineticEntry = getGsapSuiteEntry('kinetic-canvas')!;
	const fanDeckEntry = getGsapSuiteEntry('fan-deck')!;
	const flipGridEntry = getGsapSuiteEntry('flip-grid')!;
	const cinemaReelEntry = getGsapSuiteEntry('cinema-reel')!;
	const shapeTrailEntry = getGsapSuiteEntry('shape-trail')!;
	const liquidTypeEntry = getGsapSuiteEntry('liquid-type')!;
	const dragGalleryEntry = getGsapSuiteEntry('drag-gallery')!;
	const momentumSliderEntry = getGsapSuiteEntry('momentum-slider')!;
	const picassoEntry = getGsapSuiteEntry('picasso')!;
	const gsapTimelineEntry = getGsapSuiteEntry('gsap-timeline')!;
	const gsapGanttEntry = getGsapSuiteEntry('gsap-gantt')!;

	const gsapTimelineEvents: TimelineEvent[] = [
		{ id: 't1', date: '2024-01-15', title: 'Discovery', description: 'Kickoff meeting + scope', completed: true },
		{ id: 't2', date: '2024-03-01', title: 'MVP', description: 'First demo to stakeholders', completed: true, icon: '🚀' },
		{ id: 't3', date: '2024-06-15', title: 'Beta', description: 'Limited release to design partners', color: '#9333ea' },
		{ id: 't4', date: '2024-09-01', title: 'GA', description: 'Public launch' }
	];

	function offsetIso(days: number): string {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const d = new Date(Date.now());
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + days);
		return d.toISOString().slice(0, 10);
	}

	const gsapGanttTasks: GanttTask[] = [
		{ id: 'g-spec', name: 'Spec & sign-off', start: offsetIso(-5), end: offsetIso(-1), progress: 100, group: 'Plan' },
		{ id: 'g-kick', name: 'Kick-off', start: offsetIso(0), end: offsetIso(0), isMilestone: true, dependencies: ['g-spec'], color: '#f59e0b' },
		{ id: 'g-design', name: 'Design', start: offsetIso(1), end: offsetIso(8), progress: 60, dependencies: ['g-kick'], group: 'Build' },
		{ id: 'g-build', name: 'Build', start: offsetIso(5), end: offsetIso(16), progress: 25, dependencies: ['g-design'], group: 'Build' },
		{ id: 'g-launch', name: 'Launch', start: offsetIso(20), end: offsetIso(20), isMilestone: true, dependencies: ['g-build'], color: '#10b981' }
	];

	const picassoPaintings: PicassoPainting[] = [
		{
			id: 'pp-01',
			title: 'Cubist Calm',
			caption: 'Soft geometric harmony — earth tones disrupted by a single hot accent.',
			scene: 'Suite I · 2024',
			palette: ['#1d4ed8', '#0f766e', '#fde68a', '#f87171', '#9333ea']
		},
		{
			id: 'pp-02',
			title: 'Aurora Variations',
			caption: 'Cool tones with magenta heat. The eye finds the warmth and stays.',
			scene: 'Suite II · 2025',
			palette: ['#0891b2', '#9333ea', '#e879f9', '#fbbf24', '#22d3ee']
		},
		{
			id: 'pp-03',
			title: 'Heatmap',
			caption: 'Two reds, one yellow, one black — minimum palette, maximum tension.',
			scene: 'Suite III · 2026',
			palette: ['#dc2626', '#7f1d1d', '#f59e0b', '#0f172a']
		}
	];

	const momentumSliderItems: MomentumSliderItem[] = [
		{ id: 'ms-01', title: 'Establishing', eyebrow: 'Wide', subtitle: 'Take 1', description: 'Wide, slow, deliberate. The camera tells the audience what to feel before anything moves.', color: '#1d4ed8' },
		{ id: 'ms-02', title: 'Reveal', eyebrow: 'Cut', subtitle: 'Take 2', description: 'Cut to close-up. The eye finds the subject; the rest of the frame falls away.', color: '#9333ea' },
		{ id: 'ms-03', title: 'Tension', eyebrow: 'Hold', subtitle: 'Take 3', description: 'Hold. Let the audience breathe. The longest cuts feel the shortest in the right scene.', color: '#dc2626' },
		{ id: 'ms-04', title: 'Coda', eyebrow: 'Pull', subtitle: 'Take 4', description: 'Pull back. The frame becomes a memory. End on a long, calm hold.', color: '#0f766e' },
		{ id: 'ms-05', title: 'Credits', eyebrow: 'Stagger', subtitle: 'Take 5', description: 'Names rise, bow, and exit. The room exhales.', color: '#0891b2' }
	];

	const dragGalleryItems: DragGalleryItem[] = [
		{ id: 'dg-01', title: 'Linen Tote', eyebrow: 'Bags', subtitle: '£64' },
		{ id: 'dg-02', title: 'Cedar Tray', eyebrow: 'Home', subtitle: '£42' },
		{ id: 'dg-03', title: 'Brass Compass', eyebrow: 'Gifts', subtitle: '£38' },
		{ id: 'dg-04', title: 'Wool Throw', eyebrow: 'Home', subtitle: '£120' },
		{ id: 'dg-05', title: 'Glass Carafe', eyebrow: 'Kitchen', subtitle: '£28' },
		{ id: 'dg-06', title: 'Walnut Spoon', eyebrow: 'Kitchen', subtitle: '£12' }
	];

	const cinemaReelStills: CinemaReelStill[] = [
		{ id: 'cr-01', scene: '01', title: 'Establishing', caption: 'Wide, slow, deliberate.', color: '#1d4ed8' },
		{ id: 'cr-02', scene: '02', title: 'Reveal', caption: 'Cut to close-up. The eye finds the subject.', color: '#9333ea' },
		{ id: 'cr-03', scene: '03', title: 'Tension', caption: 'Hold. Let the audience breathe.', color: '#dc2626' },
		{ id: 'cr-04', scene: '04', title: 'Coda', caption: 'Pull back. The frame becomes a memory.', color: '#0f766e' }
	];

	const revealCards = [
		{
			title: 'SplitText Hero',
			copy: 'A reusable hero component inspired by GreenSock text splitting demos, adapted for Svelte 5.'
		},
		{
			title: 'Scoped Timelines',
			copy: 'Animations mount client-side, run inside local GSAP context, then revert cleanly.'
		},
		{
			title: 'Reduced Motion',
			copy: 'Motion-heavy paths collapse to a final readable state when the user asks for less.'
		},
		{
			title: 'Composable Primitives',
			copy: 'The suite wraps content instead of locking teams into a single fixed layout.'
		}
	];

	const deckItems: FanDeckItem[] = [
		{
			eyebrow: 'Core',
			title: 'Reveal',
			description: 'Stagger headings, controls, and cards without leaking selectors.',
			tone: '#2563eb'
		},
		{
			eyebrow: 'Text',
			title: 'Shock',
			description: 'Character-level impact motion for display copy and calls to action.',
			tone: '#db2777'
		},
		{
			eyebrow: 'Canvas',
			title: 'Kinetic',
			description: 'Pointer trails and click bursts with a hard particle budget.',
			tone: '#0891b2'
		},
		{
			eyebrow: 'Deck',
			title: 'Fan',
			description: 'A generic fan carousel inspired by editorial card systems.',
			tone: '#ea580c'
		},
		{
			eyebrow: 'Next',
			title: 'Scroll',
			description: 'Room for ScrollTrigger-backed conveyors once the first suite beds in.',
			tone: '#7c3aed'
		}
	];

	const flipGridFilters: GsapFlipGridFilter[] = [
		{ id: 'catalog', label: 'Catalog' },
		{ id: 'layout', label: 'Layout' },
		{ id: 'agent', label: 'Agent' }
	];

	const flipGridItems: GsapFlipGridItem[] = [
		{
			id: 'directory',
			title: 'Dense directories',
			description:
				'Use the Flip grid when a category has too many cards for CardStack and needs scannable rows of real links.',
			meta: 'Catalog',
			category: 'catalog',
			filter: 'catalog',
			accent: '#ff6a3d'
		},
		{
			id: 'filtering',
			title: 'Animated filtering',
			description:
				'Filter by status, theme support, family, or ownership without the grid snapping around the page.',
			meta: 'State',
			category: 'layout',
			filter: 'layout',
			accent: '#5eb3ff'
		},
		{
			id: 'promotion',
			title: 'Promoted component',
			description:
				'Promote a selected item into a larger slot while the rest of the CSS Grid reflows naturally.',
			meta: 'Feature',
			category: 'layout',
			filter: 'layout',
			accent: '#4dd4ac'
		},
		{
			id: 'agent-copy',
			title: 'Agent-ready route',
			description:
				'Each demo keeps its install prompt close to the component so local agents can copy the right primitive.',
			meta: 'Prompt',
			category: 'agent',
			filter: 'agent',
			accent: '#f1b14a'
		},
		{
			id: 'reduced-motion',
			title: 'Reduced motion',
			description:
				'The state change still happens for users who prefer less motion; GSAP simply skips the interpolation.',
			meta: 'Access',
			category: 'agent',
			filter: 'agent',
			accent: '#ee6c8a'
		},
		{
			id: 'responsive',
			title: 'Mobile grid',
			description:
				'Feature spans collapse to one column on narrow screens, so the grid remains readable and tappable.',
			meta: 'Mobile',
			category: 'catalog',
			filter: 'catalog',
			accent: '#6c5ce7'
		}
	];

	function entriesByCategory(entries: GsapSuiteEntry[]): GsapSuiteEntry[] {
		return [...entries].sort((a, b) =>
			a.category === b.category ? a.title.localeCompare(b.title) : a.category.localeCompare(b.category)
		);
	}
</script>

<svelte:head>
	<title>GSAP Suite · TFE Svelte Templates</title>
	<meta
		name="description"
		content="Reusable GSAP animation primitives for Svelte 5 — SSR-safe, reduced-motion aware, with copy-for-your-agent install prompts on every demo."
	/>
</svelte:head>

<main class="page">
	<GsapSplitTextHero
		headline="Motion primitives with manners"
		copy="Client-only GSAP components for SplitText hero motion, sequencing, kinetic canvas effects, fan-deck presentation, and Flip-powered grid layouts. Each one ships with a copy-for-your-agent install prompt so any coding agent can drop it into a fresh repo."
	/>

	<section class="suite-status" aria-labelledby="suite-status-title">
		<header>
			<p class="eyebrow">Suite status</p>
			<h2 id="suite-status-title">{totalConcepts} concepts, 1 family</h2>
		</header>
		<div class="status-grid">
			<article class="status-card status-card--shipped">
				<span class="status-card__count">{status.shipped.length}</span>
				<span class="status-card__label">Shipped &amp; copyable</span>
				<ul>
					{#each status.shipped as entry (entry.slug)}
						<li>
							<a href={getGsapSuiteDemoUrl(entry)}>{entry.title}</a>
						</li>
					{/each}
				</ul>
			</article>
			<article class="status-card status-card--in-progress">
				<span class="status-card__count">{status['in-progress'].length}</span>
				<span class="status-card__label">In progress</span>
				<ul>
					{#each status['in-progress'] as entry (entry.slug)}
						<li>{entry.title}</li>
					{/each}
				</ul>
			</article>
			<article class="status-card status-card--spec">
				<span class="status-card__count">{status.spec.length}</span>
				<span class="status-card__label">Spec'd, queued</span>
				<ul>
					{#each status.spec as entry (entry.slug)}
						<li>{entry.title}</li>
					{/each}
				</ul>
			</article>
		</div>
	</section>

	<section id="flip-grid" class="component-section" aria-labelledby="flip-grid-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Grid motion</p>
				<h2 id="flip-grid-title">{flipGridEntry.title}</h2>
				<p class="lede">{flipGridEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={flipGridEntry.inspiredBy.kind}
				sourceLabel={flipGridEntry.inspiredBy.label}
				sourceUrl={flipGridEntry.inspiredBy.url}
			/>
		</header>

		<GsapFlipGrid
			items={flipGridItems}
			filters={flipGridFilters}
			initialFeaturedId="directory"
			title="Grid, not deck"
			eyebrow="Animate CSS Grid positions"
			description="Click a card, change the filters, switch density, or sort alphabetically. The DOM stays a real grid and GSAP Flip animates the position delta."
		/>

		<AgentPromptCopy
			name={flipGridEntry.componentName}
			summary={flipGridEntry.tagline}
			componentPath={flipGridEntry.componentImportPath}
			demoPath={flipGridEntry.demoRoutePath}
			deps={['gsap', ...(flipGridEntry.extraDeps ?? [])]}
			propsSignature={flipGridEntry.propsSignature}
			usage={flipGridEntry.usageExample}
			inspiredBy={flipGridEntry.inspiredBy.label}
			notes={flipGridEntry.agentNotes}
		/>
	</section>

	<section id="shape-trail" class="component-section" aria-labelledby="shape-trail-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Pointer-driven motion</p>
				<h2 id="shape-trail-title">{shapeTrailEntry.title}</h2>
				<p class="lede">{shapeTrailEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={shapeTrailEntry.inspiredBy.kind}
				sourceLabel={shapeTrailEntry.inspiredBy.label}
				sourceUrl={shapeTrailEntry.inspiredBy.url}
			/>
		</header>

		<ShapeTrailHero density={48} palette="aurora" />

		<AgentPromptCopy
			name={shapeTrailEntry.componentName}
			summary={shapeTrailEntry.tagline}
			componentPath={shapeTrailEntry.componentImportPath}
			demoPath={shapeTrailEntry.demoRoutePath}
			deps={[]}
			propsSignature={shapeTrailEntry.propsSignature}
			usage={shapeTrailEntry.usageExample}
			inspiredBy={shapeTrailEntry.inspiredBy.label}
			notes={shapeTrailEntry.agentNotes}
		/>
	</section>

	<section id="liquid-type" class="component-section" aria-labelledby="liquid-type-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Variable-font physics</p>
				<h2 id="liquid-type-title">{liquidTypeEntry.title}</h2>
				<p class="lede">{liquidTypeEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={liquidTypeEntry.inspiredBy.kind}
				sourceLabel={liquidTypeEntry.inspiredBy.label}
				sourceUrl={liquidTypeEntry.inspiredBy.url}
			/>
		</header>

		<LiquidTypeHero words={['Words', 'have', 'weight']} />

		<AgentPromptCopy
			name={liquidTypeEntry.componentName}
			summary={liquidTypeEntry.tagline}
			componentPath={liquidTypeEntry.componentImportPath}
			demoPath={liquidTypeEntry.demoRoutePath}
			deps={[]}
			propsSignature={liquidTypeEntry.propsSignature}
			usage={liquidTypeEntry.usageExample}
			inspiredBy={liquidTypeEntry.inspiredBy.label}
			notes={liquidTypeEntry.agentNotes}
		/>
	</section>

	<section id="gsap-timeline" class="component-section" aria-labelledby="gsap-timeline-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">GSAP variant of native Timeline</p>
				<h2 id="gsap-timeline-title">{gsapTimelineEntry.title}</h2>
				<p class="lede">{gsapTimelineEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={gsapTimelineEntry.inspiredBy.kind}
				sourceLabel={gsapTimelineEntry.inspiredBy.label}
				sourceUrl={gsapTimelineEntry.inspiredBy.url}
			/>
		</header>

		<GsapTimeline events={gsapTimelineEvents} showProgress />

		<AgentPromptCopy
			name={gsapTimelineEntry.componentName}
			summary={gsapTimelineEntry.tagline}
			componentPath={gsapTimelineEntry.componentImportPath}
			demoPath={gsapTimelineEntry.demoRoutePath}
			deps={[]}
			propsSignature={gsapTimelineEntry.propsSignature}
			usage={gsapTimelineEntry.usageExample}
			inspiredBy={gsapTimelineEntry.inspiredBy.label}
			notes={gsapTimelineEntry.agentNotes}
		/>
	</section>

	<section id="gsap-gantt" class="component-section" aria-labelledby="gsap-gantt-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">GSAP variant of native Gantt</p>
				<h2 id="gsap-gantt-title">{gsapGanttEntry.title}</h2>
				<p class="lede">{gsapGanttEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={gsapGanttEntry.inspiredBy.kind}
				sourceLabel={gsapGanttEntry.inspiredBy.label}
				sourceUrl={gsapGanttEntry.inspiredBy.url}
			/>
		</header>

		<GsapGantt tasks={gsapGanttTasks} />

		<AgentPromptCopy
			name={gsapGanttEntry.componentName}
			summary={gsapGanttEntry.tagline}
			componentPath={gsapGanttEntry.componentImportPath}
			demoPath={gsapGanttEntry.demoRoutePath}
			deps={[]}
			propsSignature={gsapGanttEntry.propsSignature}
			usage={gsapGanttEntry.usageExample}
			inspiredBy={gsapGanttEntry.inspiredBy.label}
			notes={gsapGanttEntry.agentNotes}
		/>
	</section>

	<section id="picasso" class="component-section" aria-labelledby="picasso-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Scroll-driven editorial</p>
				<h2 id="picasso-title">{picassoEntry.title}</h2>
				<p class="lede">{picassoEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={picassoEntry.inspiredBy.kind}
				sourceLabel={picassoEntry.inspiredBy.label}
				sourceUrl={picassoEntry.inspiredBy.url}
			/>
		</header>

		<PicassoPortfolio paintings={picassoPaintings} />

		<AgentPromptCopy
			name={picassoEntry.componentName}
			summary={picassoEntry.tagline}
			componentPath={picassoEntry.componentImportPath}
			demoPath={picassoEntry.demoRoutePath}
			deps={[]}
			propsSignature={picassoEntry.propsSignature}
			usage={picassoEntry.usageExample}
			inspiredBy={picassoEntry.inspiredBy.label}
			notes={picassoEntry.agentNotes}
		/>
	</section>

	<section id="momentum-slider" class="component-section" aria-labelledby="momentum-slider-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Editorial 3D carousel</p>
				<h2 id="momentum-slider-title">{momentumSliderEntry.title}</h2>
				<p class="lede">{momentumSliderEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={momentumSliderEntry.inspiredBy.kind}
				sourceLabel={momentumSliderEntry.inspiredBy.label}
				sourceUrl={momentumSliderEntry.inspiredBy.url}
			/>
		</header>

		<MomentumSlider items={momentumSliderItems} />

		<AgentPromptCopy
			name={momentumSliderEntry.componentName}
			summary={momentumSliderEntry.tagline}
			componentPath={momentumSliderEntry.componentImportPath}
			demoPath={momentumSliderEntry.demoRoutePath}
			deps={[]}
			propsSignature={momentumSliderEntry.propsSignature}
			usage={momentumSliderEntry.usageExample}
			inspiredBy={momentumSliderEntry.inspiredBy.label}
			notes={momentumSliderEntry.agentNotes}
		/>
	</section>

	<section id="drag-gallery" class="component-section" aria-labelledby="drag-gallery-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Pointer-driven slider</p>
				<h2 id="drag-gallery-title">{dragGalleryEntry.title}</h2>
				<p class="lede">{dragGalleryEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={dragGalleryEntry.inspiredBy.kind}
				sourceLabel={dragGalleryEntry.inspiredBy.label}
				sourceUrl={dragGalleryEntry.inspiredBy.url}
			/>
		</header>

		<DragGallery items={dragGalleryItems} />

		<AgentPromptCopy
			name={dragGalleryEntry.componentName}
			summary={dragGalleryEntry.tagline}
			componentPath={dragGalleryEntry.componentImportPath}
			demoPath={dragGalleryEntry.demoRoutePath}
			deps={[]}
			propsSignature={dragGalleryEntry.propsSignature}
			usage={dragGalleryEntry.usageExample}
			inspiredBy={dragGalleryEntry.inspiredBy.label}
			notes={dragGalleryEntry.agentNotes}
		/>
	</section>

	<section id="cinema-reel" class="component-section" aria-labelledby="cinema-reel-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Scroll-driven scenes</p>
				<h2 id="cinema-reel-title">{cinemaReelEntry.title}</h2>
				<p class="lede">{cinemaReelEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={cinemaReelEntry.inspiredBy.kind}
				sourceLabel={cinemaReelEntry.inspiredBy.label}
				sourceUrl={cinemaReelEntry.inspiredBy.url}
			/>
		</header>

		<CinemaReel stills={cinemaReelStills} />

		<AgentPromptCopy
			name={cinemaReelEntry.componentName}
			summary={cinemaReelEntry.tagline}
			componentPath={cinemaReelEntry.componentImportPath}
			demoPath={cinemaReelEntry.demoRoutePath}
			deps={[]}
			propsSignature={cinemaReelEntry.propsSignature}
			usage={cinemaReelEntry.usageExample}
			inspiredBy={cinemaReelEntry.inspiredBy.label}
			notes={cinemaReelEntry.agentNotes}
		/>
	</section>

	<section
		id="reveal-sequence"
		class="component-section"
		aria-labelledby="reveal-sequence-title"
	>
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Reveal</p>
				<h2 id="reveal-sequence-title">{revealEntry.title}</h2>
				<p class="lede">{revealEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={revealEntry.inspiredBy.kind}
				sourceLabel={revealEntry.inspiredBy.label}
				sourceUrl={revealEntry.inspiredBy.url}
			/>
		</header>

		<div class="cards">
			<GsapRevealSequence stagger={0.12} distance={42}>
				{#each revealCards as card (card.title)}
					<article data-gsap-item>
						<h3>{card.title}</h3>
						<p>{card.copy}</p>
					</article>
				{/each}
			</GsapRevealSequence>
		</div>

		<AgentPromptCopy
			name={revealEntry.componentName}
			summary={revealEntry.tagline}
			componentPath={revealEntry.componentImportPath}
			demoPath={revealEntry.demoRoutePath}
			deps={['gsap', ...(revealEntry.extraDeps ?? [])]}
			propsSignature={revealEntry.propsSignature}
			usage={revealEntry.usageExample}
			inspiredBy={revealEntry.inspiredBy.label}
			notes={revealEntry.agentNotes}
		/>
	</section>

	<section
		id="kinetic-canvas"
		class="component-section component-section--ink"
		aria-labelledby="kinetic-canvas-title"
	>
		<header class="component-section__header">
			<div>
				<p class="eyebrow eyebrow--ink">Canvas</p>
				<h2 id="kinetic-canvas-title">{kineticEntry.title}</h2>
				<p class="lede lede--ink">{kineticEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={kineticEntry.inspiredBy.kind}
				sourceLabel={kineticEntry.inspiredBy.label}
				sourceUrl={kineticEntry.inspiredBy.url}
				tone="ink"
			/>
		</header>

		<div class="kinetic-shell">
			<KineticCanvasField density={96} palette="aurora">
				<div class="kinetic-panel">
					<div class="kinetic-copy">
						<p>Pointer field</p>
						<h3>Move, press, release</h3>
						<span>Particles drawn on canvas, driven from the GSAP ticker, cleaned up on unmount.</span>
					</div>
				</div>
			</KineticCanvasField>
		</div>

		<AgentPromptCopy
			name={kineticEntry.componentName}
			summary={kineticEntry.tagline}
			componentPath={kineticEntry.componentImportPath}
			demoPath={kineticEntry.demoRoutePath}
			deps={['gsap', ...(kineticEntry.extraDeps ?? [])]}
			propsSignature={kineticEntry.propsSignature}
			usage={kineticEntry.usageExample}
			inspiredBy={kineticEntry.inspiredBy.label}
			notes={kineticEntry.agentNotes}
		/>
	</section>

	<section id="fan-deck" class="component-section" aria-labelledby="fan-deck-title">
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Deck</p>
				<h2 id="fan-deck-title">{fanDeckEntry.title}</h2>
				<p class="lede">{fanDeckEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={fanDeckEntry.inspiredBy.kind}
				sourceLabel={fanDeckEntry.inspiredBy.label}
				sourceUrl={fanDeckEntry.inspiredBy.url}
			/>
		</header>

		<FanDeckCarousel items={deckItems} />

		<AgentPromptCopy
			name={fanDeckEntry.componentName}
			summary={fanDeckEntry.tagline}
			componentPath={fanDeckEntry.componentImportPath}
			demoPath={fanDeckEntry.demoRoutePath}
			deps={['gsap', ...(fanDeckEntry.extraDeps ?? [])]}
			propsSignature={fanDeckEntry.propsSignature}
			usage={fanDeckEntry.usageExample}
			inspiredBy={fanDeckEntry.inspiredBy.label}
			notes={fanDeckEntry.agentNotes}
		/>
	</section>

	<section
		id="split-text-hero"
		class="component-section component-section--inset"
		aria-labelledby="split-text-section-title"
	>
		<header class="component-section__header">
			<div>
				<p class="eyebrow">Hero text</p>
				<h2 id="split-text-section-title">{splitTextEntry.title}</h2>
				<p class="lede">{splitTextEntry.summary}</p>
			</div>
			<BadgeProvenance
				kind={splitTextEntry.inspiredBy.kind}
				sourceLabel={splitTextEntry.inspiredBy.label}
				sourceUrl={splitTextEntry.inspiredBy.url}
			/>
		</header>

		<p class="inset-note">
			The hero at the top of this page <em>is</em> this component. The agent prompt below is what other agents
			should paste to install the same SplitText hero in their own project.
		</p>

		<AgentPromptCopy
			name={splitTextEntry.componentName}
			summary={splitTextEntry.tagline}
			componentPath={splitTextEntry.componentImportPath}
			demoPath={splitTextEntry.demoRoutePath}
			deps={['gsap', ...(splitTextEntry.extraDeps ?? [])]}
			propsSignature={splitTextEntry.propsSignature}
			usage={splitTextEntry.usageExample}
			inspiredBy={splitTextEntry.inspiredBy.label}
			notes={splitTextEntry.agentNotes}
		/>
	</section>

	<section class="coming-next" aria-labelledby="coming-next-title">
		<header>
			<p class="eyebrow">Coming next</p>
			<h2 id="coming-next-title">From spec to component</h2>
			<p class="lede">
				Concept specs from <a
					href="https://github.com/Jktfe/CascadeProjects/Dave%20Vault/GSAP%20concepts"
					target="_blank"
					rel="noopener noreferrer">Dave Vault</a
				> queued for implementation. Each one will land here with a working demo, agent prompt, and provenance chip.
			</p>
		</header>
		<ul class="coming-grid">
			{#each entriesByCategory([...status['in-progress'], ...status.spec]) as entry (entry.slug)}
				<li class="coming-card" data-status={entry.status}>
					<div class="coming-card__top">
						<span class="coming-card__cat">{entry.category}</span>
						<span class="coming-card__status">
							{entry.status === 'in-progress' ? 'In progress' : 'Spec'}
						</span>
					</div>
					<h3>{entry.title}</h3>
					<p>{entry.tagline}</p>
					<footer>
						<span class="coming-card__inspired">{entry.inspiredBy.label}</span>
					</footer>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		padding: clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 8vw, 7rem);
		background: linear-gradient(180deg, var(--gsap-surface-0) 0%, var(--gsap-surface-1) 100%);
		color: var(--gsap-fg);
		font-family: var(--gsap-font-sans);
	}

	section {
		width: min(var(--gsap-suite-max), 100%);
		margin: 0 auto;
	}

	section + section {
		margin-top: var(--gsap-section-gap);
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		color: var(--gsap-accent);
		font-size: var(--gsap-text-xs);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.eyebrow--ink {
		color: var(--gsap-mint);
	}

	h2 {
		margin: 0;
		font-size: var(--gsap-text-2xl);
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1.05;
		text-wrap: balance;
		color: var(--gsap-fg-strong);
	}

	.lede {
		margin: 0.85rem 0 0;
		max-width: 64ch;
		color: var(--gsap-fg-muted);
		font-size: var(--gsap-text-md);
		line-height: 1.55;
	}

	.lede--ink {
		color: var(--gsap-fg-on-ink-muted);
	}

	.suite-status header {
		display: grid;
		gap: 0.25rem;
		margin-bottom: var(--gsap-space-6);
	}

	.status-grid {
		display: grid;
		gap: var(--gsap-space-4);
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.status-card {
		display: grid;
		gap: var(--gsap-space-2);
		padding: var(--gsap-space-5);
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-md);
		background: var(--gsap-surface-1);
	}

	.status-card--shipped {
		border-color: var(--gsap-accent);
		background: linear-gradient(180deg, rgba(255, 106, 61, 0.08), var(--gsap-surface-1));
	}

	.status-card__count {
		font-family: var(--gsap-font-display);
		font-size: 3rem;
		line-height: 1;
		font-weight: 700;
		color: var(--gsap-fg-strong);
	}

	.status-card__label {
		font-size: var(--gsap-text-sm);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--gsap-fg-muted);
	}

	.status-card ul {
		margin: var(--gsap-space-2) 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 4px;
	}

	.status-card li {
		font-size: var(--gsap-text-sm);
		color: var(--gsap-fg);
	}

	.status-card a {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--gsap-accent-soft);
		text-underline-offset: 3px;
	}

	.status-card a:hover {
		text-decoration-color: var(--gsap-accent);
	}

	.component-section {
		display: grid;
		gap: var(--gsap-space-5);
		padding: var(--gsap-space-6);
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-lg);
		background: var(--gsap-surface-1);
		box-shadow: var(--gsap-shadow-1);
	}

	.component-section--ink {
		background: var(--gsap-surface-ink);
		border-color: var(--gsap-border-on-ink);
		color: var(--gsap-fg-on-ink);
	}

	.component-section--ink h2 {
		color: var(--gsap-fg-on-ink);
	}

	.component-section--inset {
		background: var(--gsap-surface-1);
	}

	.component-section__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--gsap-space-4);
		flex-wrap: wrap;
		min-width: 0;
	}

	.component-section__header > div {
		min-width: 0;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--gsap-space-4);
	}

	.cards article {
		min-height: 180px;
		padding: var(--gsap-space-4);
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-md);
		background: var(--gsap-surface-1);
		box-shadow: var(--gsap-shadow-1);
	}

	.cards h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--gsap-fg-strong);
		line-height: 1.2;
	}

	.cards p {
		margin: 0.65rem 0 0;
		color: var(--gsap-fg-muted);
		line-height: 1.55;
		font-size: var(--gsap-text-sm);
	}

	.kinetic-shell {
		border-radius: var(--gsap-radius-md);
		overflow: hidden;
	}

	.kinetic-panel {
		min-height: 340px;
		display: grid;
		place-items: center;
		border: 1px solid var(--gsap-border-on-ink);
		border-radius: var(--gsap-radius-md);
		background:
			linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92)),
			radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.3), transparent 32%);
		color: #ffffff;
		box-shadow: var(--gsap-shadow-3);
	}

	.kinetic-copy {
		max-width: 520px;
		padding: var(--gsap-space-8);
		text-align: center;
	}

	.kinetic-copy p {
		margin: 0 0 0.65rem;
		color: var(--gsap-mint);
		font-size: var(--gsap-text-xs);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.kinetic-copy h3 {
		margin: 0;
		color: #ffffff;
		font-size: var(--gsap-text-xl);
		font-weight: 800;
		line-height: 1.1;
	}

	.kinetic-copy span {
		display: block;
		margin-top: 0.85rem;
		color: #cbd5e1;
		line-height: 1.55;
	}

	.inset-note {
		margin: 0;
		padding: var(--gsap-space-4) var(--gsap-space-5);
		border-radius: var(--gsap-radius-sm);
		background: var(--gsap-surface-2);
		color: var(--gsap-fg);
		font-size: var(--gsap-text-sm);
		line-height: 1.6;
	}

	.coming-next header {
		display: grid;
		gap: 0.4rem;
		margin-bottom: var(--gsap-space-5);
	}

	.coming-next a {
		color: var(--gsap-accent);
	}

	.coming-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--gsap-space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.coming-card {
		display: grid;
		gap: var(--gsap-space-2);
		padding: var(--gsap-space-5);
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-md);
		background: var(--gsap-surface-1);
	}

	.coming-card[data-status='in-progress'] {
		border-color: var(--gsap-accent);
	}

	.coming-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gsap-space-2);
		font-size: var(--gsap-text-xs);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.coming-card__cat {
		color: var(--gsap-fg-muted);
	}

	.coming-card__status {
		padding: 2px 10px;
		border-radius: var(--gsap-radius-pill);
		background: var(--gsap-surface-2);
		color: var(--gsap-fg-strong);
	}

	.coming-card[data-status='in-progress'] .coming-card__status {
		background: var(--gsap-accent-soft);
		color: var(--gsap-accent);
	}

	.coming-card h3 {
		margin: 0;
		font-size: var(--gsap-text-md);
		font-weight: 700;
		color: var(--gsap-fg-strong);
	}

	.coming-card p {
		margin: 0;
		color: var(--gsap-fg-muted);
		font-size: var(--gsap-text-sm);
		line-height: 1.5;
	}

	.coming-card__inspired {
		font-size: var(--gsap-text-xs);
		color: var(--gsap-fg-subtle);
	}

	@media (max-width: 920px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.status-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.component-section {
			padding: var(--gsap-space-4);
		}

		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
