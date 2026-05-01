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
		tagline: 'Geometric morph hero — shapes follow the cursor, settle into form.',
		summary:
			'A hero canvas where simple geometric primitives morph between shapes following the cursor and a scroll-driven timeline. Pure 2D canvas, GSAP timeline + ScrollTrigger.',
		status: 'spec',
		componentImportPath: 'src/lib/components/ShapeTrail/ShapeTrailHero.svelte',
		componentName: 'ShapeTrailHero',
		inspiredBy: DAVE_VAULT('Shape Trail'),
		plugins: ['ScrollTrigger'],
		propsSignature: `{
  density?: number;         // 32
  palette?: 'mono' | 'aurora' | 'amber';
  morphSpeed?: number;      // 0.6
}`,
		usageExample: `<ShapeTrailHero palette="aurora" />`,
		category: 'canvas'
	},
	{
		slug: 'liquid-type',
		title: 'Liquid Type',
		tagline: 'Variable-font hero — characters inflate under the cursor with spring physics.',
		summary:
			'Per-character font-weight + scale spring physics, click shockwaves, and an idle breathing wave. Built on raw rAF for the physics loop and GSAP for the entrance.',
		status: 'spec',
		componentImportPath: 'src/lib/components/LiquidType/LiquidTypeHero.svelte',
		componentName: 'LiquidTypeHero',
		inspiredBy: DAVE_VAULT('Liquid Type'),
		propsSignature: `{
  words?: string[];         // ['Words','have','weight']
  baseWeight?: number;      // 300
  peakWeight?: number;      // 850
  radius?: number;          // 180
}`,
		usageExample: `<LiquidTypeHero words={['Words','have','weight']} />`,
		agentNotes:
			'Variable font required (Inter or Geist with wght axis). Width-locking happens on first mousemove.',
		category: 'physics'
	},
	{
		slug: 'cardwall',
		title: 'Cardwall',
		tagline: '42 portrait cards on a 3D ribbon — Gaussian wave under the cursor, FLIP modal on click.',
		summary:
			'A full-viewport hero of 42 premium cards arranged on a diagonal 3D ribbon. Cursor pushes a Gaussian lift wave through the deck; clicking flies the deck card itself into a side-by-side FLIP modal.',
		status: 'in-progress',
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
		status: 'in-progress',
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
		status: 'in-progress',
		componentImportPath: 'src/lib/components/PortfolioPhotographer/PhotoReelHero.svelte',
		componentName: 'PhotoReelHero',
		inspiredBy: DAVE_VAULT('Photo Portfolio'),
		plugins: ['Flip', 'ScrollTrigger'],
		category: 'flip'
	},
	{
		slug: 'momentum-slider',
		title: 'Momentum Slider',
		tagline: 'Editorial 3D carousel — momentum scrolling, modal handoff, depth shadows.',
		summary:
			'A horizontal carousel with momentum-driven scrolling, perspective depth, and a modal that handshakes from the active card.',
		status: 'spec',
		componentImportPath: 'src/lib/components/MomentumSlider/MomentumSlider.svelte',
		componentName: 'MomentumSlider',
		inspiredBy: DAVE_VAULT('Momentum Slider'),
		plugins: ['Draggable', 'Observer', 'Flip'],
		category: 'editorial'
	},
	{
		slug: 'cinema-reel',
		title: 'Cinema Reel',
		tagline: 'Letterboxed scroll-reel of cinematic stills.',
		summary:
			'A vertical scroll-driven reel of cinematic stills with horizontal letterbox masks, shutter-style transitions, and a closing credits stagger.',
		status: 'spec',
		componentImportPath: 'src/lib/components/CinemaReel/CinemaReel.svelte',
		componentName: 'CinemaReel',
		inspiredBy: DAVE_VAULT('Cinema Reel'),
		plugins: ['ScrollTrigger'],
		category: 'scroll'
	},
	{
		slug: 'picasso',
		title: 'Picasso Portfolio',
		tagline: 'Scroll-driven portfolio — paintings dissect and reassemble.',
		summary:
			'A scroll-driven editorial layout where paintings dissect into colour fields and reassemble. Heavy use of ScrollTrigger pinning + Flip.',
		status: 'spec',
		componentImportPath: 'src/lib/components/Picasso/PicassoPortfolio.svelte',
		componentName: 'PicassoPortfolio',
		inspiredBy: DAVE_VAULT('Picasso'),
		plugins: ['ScrollTrigger', 'Flip'],
		category: 'editorial'
	},
	{
		slug: 'stream-showcase',
		title: 'Stream Showcase',
		tagline: 'Pinned hero + carousel that streams content through a single viewport.',
		summary:
			'A pinned hero followed by a horizontal carousel of content panels driven by ScrollTrigger. Carousel items pulse subtly on focus.',
		status: 'in-progress',
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
			'A fan-stacked product slider — drag to flick through, releases with inertia, snaps to active card. Built on Draggable + Observer.',
		status: 'spec',
		componentImportPath: 'src/lib/components/DragGallery/DragGallery.svelte',
		componentName: 'DragGallery',
		inspiredBy: DAVE_VAULT('Drag Gallery'),
		plugins: ['Draggable', 'Observer'],
		category: 'deck'
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
