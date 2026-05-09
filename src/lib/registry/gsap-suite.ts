/**
 * ============================================================
 * GSAP Suite — Component Registry
 * ============================================================
 * Single source of truth for the Dave Vault GSAP concept set.
 * Drives:
 *   - The /gsap-suite landing grid
 *   - The /gsap-suite/[slug] sub-routes (where present)
 *   - The "Copy for your agent" prompt block on each demo
 *   - Status reporting in chat / docs
 *
 * Edit this file when:
 *   - A new Dave Vault concept is added
 *   - A concept moves from "spec" → "in-progress" → "shipped"
 *   - The reference component name or props change
 *
 * Both agents in the collab-room must keep this in sync with
 * the actual code on disk; that's why each entry carries the
 * componentImportPath and demoRoute fields explicitly.
 * ============================================================
 */

export type GsapSuiteStatus =
	/** Spec exists in /Dave Vault/GSAP concepts but no Svelte component yet */
	| 'spec'
	/** A component file exists but is partial / not yet wired into the suite */
	| 'in-progress'
	/** Component is feature-complete with a demo route, doc, and tests */
	| 'shipped';

export interface GsapSuiteEntry {
	/** URL slug under /gsap-suite/ — also used as the registry key */
	slug: string;
	/** Display title shown in cards + page titles */
	title: string;
	/** One-sentence pitch for the landing grid */
	tagline: string;
	/** Longer paragraph for the demo route hero */
	summary: string;
	/** Implementation status */
	status: GsapSuiteStatus;
	/** Path to the Svelte 5 component (PascalCase, in src/lib/components or subfolder) */
	componentImportPath: string;
	/** PascalCase component name used in import statements */
	componentName: string;
	/** Path of the demo route's +page.svelte (for the agent prompt) */
	demoRoutePath?: string;
	/** Resolved demo URL — defaults to /gsap-suite/<slug> */
	demoUrl?: string;
	/** External provenance (Dave Vault, GreenSock pen, Aura …) */
	inspiredBy: {
		kind: 'gsap' | 'aura' | 'davevault' | 'codepen' | 'custom';
		label: string;
		url: string;
	};
	/** GSAP plugins this concept needs */
	plugins?: string[];
	/** bun add deps beyond what's already in package.json */
	extraDeps?: string[];
	/** TypeScript signature for the props (used in agent prompt + docs) */
	propsSignature?: string;
	/** A short usage example for the agent prompt */
	usageExample?: string;
	/** Notes for the receiving agent (SSR caveats, plugin loading, etc.) */
	agentNotes?: string;
	/** Visual category — drives chip colour on the landing grid */
	category: 'hero' | 'reveal' | 'canvas' | 'deck' | 'scroll' | 'flip' | 'editorial' | 'physics';
}

const DAVE_VAULT = (label: string) =>
	({
		kind: 'davevault' as const,
		label,
		url: 'https://github.com/Jktfe/CascadeProjects/Dave%20Vault/GSAP%20concepts'
	});

export const gsapSuiteRegistry: GsapSuiteEntry[] = [
	{
		slug: 'split-text-hero',
		title: 'SplitText Hero',
		tagline: 'Per-character, per-word, per-line text reveal with mode toggle.',
		summary:
			'A reusable hero that splits a headline into characters, words, or lines and choreographs the entrance with GSAP SplitText. Mode is switchable at runtime; the component re-runs the timeline on change and respects reduced-motion preferences.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/GsapSplitTextHero.svelte',
		componentName: 'GsapSplitTextHero',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#split-text-hero',
		inspiredBy: {
			kind: 'codepen',
			label: 'GreenSock pen xxmaNYj',
			url: 'https://codepen.io/GreenSock/pen/xxmaNYj'
		},
		plugins: ['SplitText'],
		propsSignature: `{
  headline?: string;
  eyebrow?: string;
  copy?: string;
  initialMode?: 'chars' | 'words' | 'lines';
  theme?: 'light' | 'dark';
}`,
		usageExample: `<GsapSplitTextHero
  headline="Motion primitives with manners"
  eyebrow="GSAP suite"
  copy="SplitText, scoped timelines, canvas motion, deck choreography."
/>`,
		agentNotes: 'Client-only — wraps SplitText.create inside onMount and reverts on cleanup.',
		category: 'hero'
	},
	{
		slug: 'reveal-sequence',
		title: 'Reveal Sequence',
		tagline: 'Stagger any group of children with an SSR-safe gsap.context wrapper.',
		summary:
			'Wraps a slot in a gsap.context that picks up [data-gsap-item] children (or any selector) and staggers them on mount. Reverts cleanly on unmount and falls back to a static layout under reduced motion.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/GsapRevealSequence.svelte',
		componentName: 'GsapRevealSequence',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#reveal-sequence',
		inspiredBy: DAVE_VAULT('GSAP scoped-timeline pattern'),
		propsSignature: `{
  selector?: string;        // default '[data-gsap-item]'
  axis?: 'x' | 'y';         // default 'y'
  distance?: number;        // default 28
  duration?: number;        // default 0.7
  delay?: number;           // default 0
  stagger?: number;         // default 0.08
  ease?: string;            // default 'power3.out'
}`,
		usageExample: `<GsapRevealSequence stagger={0.12} distance={42}>
  {#each cards as card (card.title)}
    <article data-gsap-item>...</article>
  {/each}
</GsapRevealSequence>`,
		category: 'reveal'
	},
	{
		slug: 'kinetic-canvas',
		title: 'Kinetic Canvas Field',
		tagline: 'Pointer-driven particle field with GSAP ticker cleanup.',
		summary:
			'A full-bleed canvas particle field that follows the cursor, presses on click, and releases under a budget. Particles are drawn on a 2D context and driven from the GSAP ticker so cleanup is single-call.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/KineticCanvasField.svelte',
		componentName: 'KineticCanvasField',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#kinetic-canvas',
		inspiredBy: DAVE_VAULT('Liquid Type cursor trail'),
		propsSignature: `{
  density?: number;         // default 96
  palette?: 'aurora' | 'mono' | 'amber';
  children?: Snippet;
}`,
		usageExample: `<KineticCanvasField density={96} palette="aurora">
  <div class="kinetic-panel">
    <h2>Move, press, release</h2>
  </div>
</KineticCanvasField>`,
		agentNotes: 'Caps particle budget at 240; resizes the canvas on devicePixelRatio changes.',
		category: 'canvas'
	},
	{
		slug: 'fan-deck',
		title: 'Fan Deck Carousel',
		tagline: 'Editorial fan-stack carousel with keyboard + drag navigation.',
		summary:
			'A fan-stack carousel that arranges card items in a perspective fan and rotates the active card to the front. Keyboard navigation, drag-to-flick, and a soft 3D depth effect.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/FanDeckCarousel.svelte',
		componentName: 'FanDeckCarousel',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#fan-deck',
		inspiredBy: DAVE_VAULT('Drag Gallery'),
		propsSignature: `{
  items: FanDeckItem[];
  initialIndex?: number;
}`,
		usageExample: `<FanDeckCarousel items={deckItems} />`,
		category: 'deck'
	},
	{
		slug: 'flip-grid',
		title: 'Flip Grid',
		tagline: 'Animate CSS Grid filtering, sorting, and promoted-item layout changes with GSAP Flip.',
		summary:
			'A reusable non-deck grid primitive for component catalogues, galleries, and browse surfaces. It keeps the DOM as real CSS Grid, captures layout state with GSAP Flip, then animates filtering, sorting, density changes, and featured-card promotion without global selectors.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/GsapFlipGrid.svelte',
		componentName: 'GsapFlipGrid',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#flip-grid',
		inspiredBy: {
			kind: 'gsap',
			label: 'GSAP demo Animate CSS Grid Positions',
			url: 'https://demos.gsap.com/demo/animate-css-grid-positions/'
		},
		plugins: ['Flip'],
		propsSignature: `{
  items?: GsapFlipGridItem[];
  filters?: GsapFlipGridFilter[];
  initialFilter?: string;
  initialFeaturedId?: string;
  initialDensity?: 'featured' | 'compact';
  initialSort?: 'curated' | 'alpha';
  showHeader?: boolean;
  showControls?: boolean;
  promoteOnClick?: boolean;
}`,
		usageExample: `<GsapFlipGrid
  items={gridItems}
  filters={[{ id: 'catalog', label: 'Catalog' }]}
  initialFeaturedId="directory"
/>`,
		agentNotes:
			'Client-only Flip plugin load. Use this for real grids and galleries; keep CardStack for physical deck metaphors.',
		category: 'flip'
	},
	{
		slug: 'shape-trail',
		title: 'Shape Trail',
		tagline: 'Geometric morph hero — shapes follow the cursor, settle on click.',
		summary:
			'A hero canvas where geometric primitives orbit the pointer with damped rAF physics. GSAP timeline stages the entrance reveal (canvas fade + content slide); `gsap.to` drives the settle/release ease on click. Click to settle into a lattice; click again to release.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/ShapeTrail/ShapeTrailHero.svelte',
		componentName: 'ShapeTrailHero',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#shape-trail',
		inspiredBy: DAVE_VAULT('Shape Trail'),
		plugins: [],
		propsSignature: `{
  density?: number;                          // 32 (clamped to [8, 128])
  palette?: 'mono' | 'aurora' | 'amber';     // 'aurora'
  ariaLabel?: string;                        // 'Shape Trail hero'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import ShapeTrailHero from '$lib/components/ShapeTrail/ShapeTrailHero.svelte';
</script>
<ShapeTrailHero density={48} palette="aurora" />`,
		agentNotes:
			'rAF + canvas2d for the per-particle damped-spring physics (stiffness 0.012, damping 0.86); trail fade via translucent rgba bg fillRect each frame. GSAP core (no business plugins) drives the entrance gsap.timeline (canvas fade + content slide + status slide) and the gsap.to settle/release tweens. prefers-reduced-motion paints a single static lattice and skips both gsap and rAF.',
		category: 'canvas'
	},
	{
		slug: 'liquid-type',
		title: 'Liquid Type',
		tagline: 'Variable-font hero — characters inflate under the cursor with spring physics.',
		summary:
			'Per-character damped-spring physics on font-weight + scale (rAF), cursor-proximity peaks, click shockwaves, idle breathing wave. GSAP staggers the entrance reveal per-glyph; rAF owns the continuous physics. CSS custom properties drive the paint.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/LiquidType/LiquidTypeHero.svelte',
		componentName: 'LiquidTypeHero',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#liquid-type',
		inspiredBy: DAVE_VAULT('Liquid Type'),
		plugins: [],
		propsSignature: `{
  words?: string[];                 // ['Words', 'have', 'weight']
  baseWeight?: number;              // 300
  peakWeight?: number;              // 850
  baseScale?: number;               // 1
  peakScale?: number;               // 1.18
  influenceRadius?: number;         // 160 px
  ariaLabel?: string;               // 'Liquid Type hero'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import LiquidTypeHero from '$lib/components/LiquidType/LiquidTypeHero.svelte';
</script>
<LiquidTypeHero words={['Words', 'have', 'weight']} />`,
		agentNotes:
			'GSAP core stages a per-glyph fade+lift entrance via gsap.from with stagger. rAF runs the per-character damped-spring on font-weight + scale (stiffness 0.18/0.20, damping 0.74/0.72) and writes --lt-weight + --lt-scale custom properties each frame. Variable font (Inter Variable / Geist with wght axis) gives smooth interpolation; falls back to discrete font-weight on non-variable fonts. Per-character spans are aria-hidden; the joined word string is exposed via .lt-sr-only for assistive tech.',
		category: 'physics'
	},
	{
		slug: 'cardwall',
		title: 'Cardwall',
		tagline: '42 portrait cards on a 3D ribbon — Gaussian wave under the cursor, FLIP modal on click.',
		summary:
			'A full-viewport hero of 42 premium cards arranged on a diagonal 3D ribbon. Cursor pushes a Gaussian lift wave through the deck; clicking flies the deck card itself into a side-by-side FLIP modal.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/Cardwall/Cardwall.svelte',
		componentName: 'Cardwall',
		inspiredBy: DAVE_VAULT('Cardwall'),
		plugins: ['Flip'],
		propsSignature: `{
  cards?: CardDesign[];     // defaults to 14-palette × 3-tile internal set
  repeats?: number;         // 3
}`,
		category: 'flip'
	},
	{
		slug: 'membrane',
		title: 'Membrane Hero',
		tagline: 'Soft elastic membrane that follows the cursor, ripples on click.',
		summary:
			'A canvas-rendered "membrane" of springs. Drag dimples it; click ripples through; respects reduced motion by collapsing to a static rest pose.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/MembraneHero/MembraneHero.svelte',
		componentName: 'MembraneHero',
		inspiredBy: DAVE_VAULT('Membrane'),
		propsSignature: `{
  resolution?: number;      // 28
  tension?: number;         // 0.025
  damping?: number;         // 0.92
}`,
		category: 'canvas'
	},
	{
		slug: 'photo-portfolio',
		title: 'Photo Portfolio',
		tagline: 'Photographer reel hero with FLIP-from-thumbnail to lightbox.',
		summary:
			'A photographer-style reel hero — thumbnail strip, FLIP transition into a centred lightbox, scroll-driven caption stagger. Built on @gsap/Flip + ScrollTrigger.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/PortfolioPhotographer/PhotoReelHero.svelte',
		componentName: 'PhotoReelHero',
		inspiredBy: DAVE_VAULT('Photo Portfolio'),
		plugins: ['Flip', 'ScrollTrigger'],
		category: 'flip'
	},
	{
		slug: 'momentum-slider',
		title: 'Momentum Slider',
		tagline: 'Editorial 3D carousel — momentum scrolling, modal handshake, perspective depth.',
		summary:
			'A horizontal carousel with momentum-driven scrolling and perspective depth (cards rotate into the page based on distance from active). Click the active card and a GSAP timeline handshakes it into a modal with backdrop fade. Native pointer events + rAF for the inertia; gsap core for the snap easing and the modal handshake.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/MomentumSlider/MomentumSlider.svelte',
		componentName: 'MomentumSlider',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#momentum-slider',
		inspiredBy: DAVE_VAULT('Momentum Slider'),
		plugins: [],
		propsSignature: `{
  items: MomentumSliderItem[];                                   // [{ id, title, eyebrow?, subtitle?, description?, image?, alt?, color? }, …]
  initialIndex?: number;                                          // 0
  cardWidth?: number;                                             // 280
  cardGap?: number;                                               // 32
  ariaLabel?: string;                                             // 'Momentum slider'
  onSelect?: (item: MomentumSliderItem, index: number) => void;
  onExpand?: (item: MomentumSliderItem, index: number) => void;
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import MomentumSlider from '$lib/components/MomentumSlider/MomentumSlider.svelte';
  const scenes = [
    { id: '1', title: 'Establishing', eyebrow: 'Wide',  subtitle: 'Take 1', description: 'Wide, slow, deliberate.' },
    { id: '2', title: 'Reveal',       eyebrow: 'Cut',   subtitle: 'Take 2', description: 'Cut to close-up.' },
    { id: '3', title: 'Tension',      eyebrow: 'Hold',  subtitle: 'Take 3', description: 'Let the audience breathe.' },
    { id: '4', title: 'Coda',         eyebrow: 'Pull',  subtitle: 'Take 4', description: 'Pull back. The frame becomes a memory.' }
  ];
</script>
<MomentumSlider items={scenes} />`,
		agentNotes:
			'GSAP core (no Draggable/Observer/Flip required): native pointer drag + rAF velocity decay (0.93/frame); gsap.to with power3.out for snap, gsap.timeline for the modal handshake (backdrop fade @0 + modal scale-in @0.05 with power3.out). prefers-reduced-motion skips inertia + the timeline; modal appears/disappears instantly. Keyboard: Arrow keys + Home/End to navigate, Enter to expand, Escape to close.',
		category: 'editorial'
	},
	{
		slug: 'cinema-reel',
		title: 'Cinema Reel',
		tagline: 'Letterboxed scroll-reel of cinematic stills.',
		summary:
			'A vertical scroll-driven reel of cinematic stills with horizontal letterbox masks. IntersectionObserver picks the active frame as it crosses the centre of the viewport; GSAP core drives the eased transitions on filter, scale, mask height and caption opacity.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/CinemaReel/CinemaReel.svelte',
		componentName: 'CinemaReel',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#cinema-reel',
		inspiredBy: DAVE_VAULT('Cinema Reel'),
		plugins: [],
		propsSignature: `{
  stills: CinemaReelStill[];   // [{ id, image?, title?, caption?, scene?, color? }, …]
  letterboxRatio?: number;     // 0.18 — top/bottom bar height as % of frame
  activeThreshold?: number;    // 0.55 — IntersectionObserver ratio to activate
  ariaLabel?: string;          // 'Cinema reel'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import CinemaReel from '$lib/components/CinemaReel/CinemaReel.svelte';
  const stills = [
    { id: '1', title: 'Opening',  caption: 'Wide shot',   scene: '01', color: '#1d4ed8' },
    { id: '2', title: 'Reveal',   caption: 'Cut in',      scene: '02', image: '/scene-2.jpg' },
    { id: '3', title: 'Coda',     caption: 'Slow pull',   scene: '03', color: '#0f766e' }
  ];
</script>
<CinemaReel {stills} />`,
		agentNotes:
			'IntersectionObserver picks the active frame; gsap.to drives the easing for filter/scale/mask height/caption opacity. GSAP core only — no business plugins. Falls back to first-still-active + static class when IO unavailable, and to a static .cr-frame--reduced.cr-frame--active CSS rule under prefers-reduced-motion.',
		category: 'scroll'
	},
	{
		slug: 'picasso',
		title: 'Picasso Portfolio',
		tagline: 'Scroll-driven portfolio — paintings dissect and reassemble.',
		summary:
			'A scroll-driven editorial portfolio where each painting starts as scattered colour fields displaced along a Fibonacci-spaced ring, then reassembles into the canvas with a random-order GSAP stagger. IntersectionObserver fires the trigger; gsap.timeline orchestrates the dissect → reassemble + title + caption fade-up.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/Picasso/PicassoPortfolio.svelte',
		componentName: 'PicassoPortfolio',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#picasso',
		inspiredBy: DAVE_VAULT('Picasso'),
		plugins: [],
		propsSignature: `{
  paintings: PicassoPainting[];      // [{ id, title, caption?, scene?, palette }]
  gridSize?: number;                  // 4 (4x4 grid of swatches)
  duration?: number;                  // 1.4s reassemble timeline
  ariaLabel?: string;                 // 'Picasso portfolio'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import PicassoPortfolio from '$lib/components/Picasso/PicassoPortfolio.svelte';
  const works = [
    { id: '1', title: 'Cubist Calm', caption: 'Soft geometric harmony.', scene: 'Suite I',
      palette: ['#1d4ed8', '#0f766e', '#fde68a', '#f87171', '#9333ea'] },
    { id: '2', title: 'Aurora', caption: 'Cool tones, hot accent.', scene: 'Suite II',
      palette: ['#0891b2', '#9333ea', '#e879f9', '#fbbf24'] }
  ];
</script>
<PicassoPortfolio paintings={works} />`,
		agentNotes:
			'GSAP core (no ScrollTrigger / Flip plugins needed): IntersectionObserver fires once per panel at threshold 0.4, gsap.timeline scatters swatches via Fibonacci-spaced angle (cos/sin of i * 137.5°) and reassembles with stagger.from "random". Title + caption fades follow. prefers-reduced-motion + .pp-panel--reduced CSS rule pin the assembled state without animation.',
		category: 'editorial'
	},
	{
		slug: 'stream-showcase',
		title: 'Stream Showcase',
		tagline: 'Pinned hero + carousel that streams content through a single viewport.',
		summary:
			'A pinned hero followed by a horizontal carousel of content panels driven by ScrollTrigger. Carousel items pulse subtly on focus.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/StreamShowcase/StreamShowcaseHero.svelte',
		componentName: 'StreamShowcaseHero',
		inspiredBy: DAVE_VAULT('Stream Showcase'),
		plugins: ['ScrollTrigger'],
		category: 'scroll'
	},
	{
		slug: 'drag-gallery',
		title: 'Drag Gallery',
		tagline: 'Fan-stack ecommerce slider you can flick through with momentum.',
		summary:
			'A fan-stacked product slider. Native pointer events + rAF own the velocity sampling and inertia decay; GSAP core stages the entrance card stagger and drives the snap-on-release ease. Click any card to jump; arrow keys + Home/End for keyboard parity.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/DragGallery/DragGallery.svelte',
		componentName: 'DragGallery',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#drag-gallery',
		inspiredBy: DAVE_VAULT('Drag Gallery'),
		plugins: [],
		propsSignature: `{
  items: DragGalleryItem[];                                     // [{ id, title, eyebrow?, subtitle?, image?, alt? }, …]
  initialIndex?: number;                                        // 0
  cardWidth?: number;                                           // 220
  cardGap?: number;                                             // 32
  ariaLabel?: string;                                           // 'Drag gallery'
  onSelect?: (item: DragGalleryItem, index: number) => void;
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import DragGallery from '$lib/components/DragGallery/DragGallery.svelte';
  const products = [
    { id: 'a', title: 'Linen Tote',    eyebrow: 'Bags',  subtitle: '£64' },
    { id: 'b', title: 'Cedar Tray',    eyebrow: 'Home',  subtitle: '£42' },
    { id: 'c', title: 'Brass Compass', eyebrow: 'Gifts', subtitle: '£38' },
    { id: 'd', title: 'Wool Throw',    eyebrow: 'Home',  subtitle: '£120' }
  ];
</script>
<DragGallery items={products} onSelect={(item) => console.log(item.title)} />`,
		agentNotes:
			'GSAP core (no Draggable/InertiaPlugin/Observer required): native pointer events + setPointerCapture for the drag, rAF velocity decay (0.93/frame) for inertia, gsap.to with power3.out for the snap-on-release. Keyboard parity: ArrowLeft/Right + Home/End. role="listbox" + role="option" + aria-selected wired correctly.',
		category: 'deck'
	},
	{
		slug: 'gsap-timeline',
		title: 'GSAP Timeline',
		tagline: 'Timeline events with gsap.timeline entrance — the GSAP variant of native Timeline.',
		summary:
			'A GSAP-driven sibling of the native Timeline component. Same TimelineEvent[] data shape (drop-in compatible at the prop boundary), but gsap.timeline composes the per-item slide-up + marker scale/rotate (back.out overshoot) + optional progress-line draw. IntersectionObserver fires the one-shot trigger.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/GsapTimeline.svelte',
		componentName: 'GsapTimeline',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#gsap-timeline',
		inspiredBy: DAVE_VAULT('Timeline'),
		plugins: [],
		propsSignature: `{
  events: TimelineEvent[];
  alignment?: 'left' | 'right' | 'alternate';      // 'alternate'
  showProgress?: boolean;                           // false
  dateFormat?: (date: Date) => string;
  onEventClick?: (event: TimelineEvent) => void;
  ariaLabel?: string;                               // 'GSAP timeline'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import GsapTimeline from '$lib/components/GsapTimeline.svelte';
  const milestones = [
    { id: '1', date: '2024-01-15', title: 'Discovery', completed: true },
    { id: '2', date: '2024-03-01', title: 'MVP',       completed: true },
    { id: '3', date: '2024-06-15', title: 'Beta' },
    { id: '4', date: '2024-09-01', title: 'GA' }
  ];
</script>
<GsapTimeline events={milestones} showProgress />`,
		agentNotes:
			'Drop-in for native Timeline with GSAP-composed entrance: items slide-up (power3.out, 0.08s stagger), markers scale + rotate with back.out(1.6) overshoot at +0.05s, optional progress line draws (scaleY 0→1 power2.inOut). IntersectionObserver fires once at threshold 0.15. prefers-reduced-motion paints the assembled state via .gsap-timeline--reduced CSS rule.',
		category: 'editorial'
	},
	{
		slug: 'gsap-gantt',
		title: 'GSAP Gantt',
		tagline: 'Gantt schedule with gsap.timeline entrance — the GSAP variant of native Gantt.',
		summary:
			'A GSAP-driven sibling of the native Gantt component. Same GanttTask[] data shape (drop-in compatible), but gsap.timeline composes the entrance: bars draw left → right via scaleX (0→1, power3.out, 0.06s stagger), milestones pop with back.out(1.7), dependency arrows fade in once their endpoints land. Static context (axis, weekend bands, today line) does not animate by design.',
		status: 'shipped',
		componentImportPath: 'src/lib/components/GsapGantt.svelte',
		componentName: 'GsapGantt',
		demoRoutePath: 'src/routes/gsap-suite/+page.svelte',
		demoUrl: '/gsap-suite#gsap-gantt',
		inspiredBy: DAVE_VAULT('Gantt'),
		plugins: [],
		propsSignature: `{
  tasks: GanttTask[];
  startDate?: string | Date;
  endDate?: string | Date;
  dayWidth?: number;                                // 32
  rowHeight?: number;                               // 36
  labelWidth?: number;                              // 220
  showWeekends?: boolean;                           // true
  showToday?: boolean;                              // true
  showDependencies?: boolean;                       // true
  showProgress?: boolean;                           // true
  dateFormat?: 'short' | 'long' | (d: Date) => string;
  onTaskClick?: (task: GanttTask) => void;
  ariaLabel?: string;                               // 'GSAP Gantt chart'
  class?: string;
}`,
		usageExample: `<script lang="ts">
  import GsapGantt from '$lib/components/GsapGantt.svelte';
  const schedule = [
    { id: 'spec',   name: 'Spec',     start: '2026-05-01', end: '2026-05-05', progress: 100 },
    { id: 'kick',   name: 'Kick-off', start: '2026-05-06', end: '2026-05-06', isMilestone: true, dependencies: ['spec'] },
    { id: 'build',  name: 'Build',    start: '2026-05-07', end: '2026-05-15', progress: 35, dependencies: ['kick'] },
    { id: 'launch', name: 'Launch',   start: '2026-05-20', end: '2026-05-20', isMilestone: true, dependencies: ['build'] }
  ];
</script>
<GsapGantt tasks={schedule} />`,
		agentNotes:
			'Drop-in for native Gantt with GSAP-composed entrance: bars scaleX 0→1 from left (0.06s stagger, power3.out), milestones scale 0→1 with back.out(1.7) at +0.15s, arrows opacity 0→1 at +0.45s once bars have landed. IntersectionObserver fires once at threshold 0.15. Static context (axis, weekend bands, today line, labels) does not animate by design — entrance focuses on bars + milestones + arrows.',
		category: 'editorial'
	}
];

/** Look up a single entry by its slug. */
export function getGsapSuiteEntry(slug: string): GsapSuiteEntry | undefined {
	return gsapSuiteRegistry.find((entry) => entry.slug === slug);
}

/** Resolve the demo URL for a registry entry, defaulting to /gsap-suite/<slug>. */
export function getGsapSuiteDemoUrl(entry: GsapSuiteEntry): string {
	return entry.demoUrl ?? `/gsap-suite/${entry.slug}`;
}

/** Group entries by status — handy for status reports + chat updates. */
export function groupGsapSuiteByStatus(): Record<GsapSuiteStatus, GsapSuiteEntry[]> {
	const groups: Record<GsapSuiteStatus, GsapSuiteEntry[]> = {
		shipped: [],
		'in-progress': [],
		spec: []
	};
	for (const entry of gsapSuiteRegistry) groups[entry.status].push(entry);
	return groups;
}
