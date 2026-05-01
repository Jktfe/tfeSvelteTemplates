import type { MenuCategory } from './types';

export interface ComponentCatalogItem {
	name: string;
	href: string;
	icon: string;
	description: string;
	screenshot: string;
	themeSupport: 'light' | 'dual';
	source: string;
	docs: string;
	demo: string;
	dependencies: string[];
	relatedFiles: string[];
	usage: string;
	agentHint?: string;
}

export interface ComponentCatalogCategory {
	name: string;
	icon: string;
	summary: string;
	components: ComponentCatalogItem[];
}

export interface ComponentCatalogEntry {
	category: ComponentCatalogCategory;
	item: ComponentCatalogItem;
}

interface ComponentCatalogOptions {
	screenshotFile?: string;
	source?: string;
	docs?: string;
	demo?: string;
	themeSupport?: ComponentCatalogItem['themeSupport'];
	dependencies?: string[];
	relatedFiles?: string[];
	usage?: string;
	agentHint?: string;
}

const screenshot = (fileName: string) => `/ComponentScreenshots/${fileName}`;
const componentFileName = (name: string) => name.replaceAll(' ', '');
const componentIdentifier = (name: string) =>
	name
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.trim()
		.split(/\s+/)
		.map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
		.join('') || 'ComponentTemplate';

const component = (
	name: string,
	href: string,
	icon: string,
	description: string,
	screenshotOrOptions: string | ComponentCatalogOptions = `${componentFileName(name)}Shot.png`,
	options: ComponentCatalogOptions = {}
): ComponentCatalogItem => {
	const resolvedOptions =
		typeof screenshotOrOptions === 'string'
			? { ...options, screenshotFile: screenshotOrOptions }
			: screenshotOrOptions;
	const baseName = componentFileName(name);

	return {
		name,
		href,
		icon,
		description,
		screenshot: screenshot(resolvedOptions.screenshotFile ?? `${baseName}Shot.png`),
		themeSupport: resolvedOptions.themeSupport ?? 'light',
		source: resolvedOptions.source ?? `src/lib/components/${baseName}.svelte`,
		docs: resolvedOptions.docs ?? `src/lib/components/${baseName}.md`,
		demo: resolvedOptions.demo ?? `src/routes${href}/+page.svelte`,
		dependencies: resolvedOptions.dependencies ?? [],
		relatedFiles: resolvedOptions.relatedFiles ?? [],
		usage: resolvedOptions.usage ?? `<${componentIdentifier(name)} />`,
		agentHint: resolvedOptions.agentHint
	};
};

export const componentCategories: ComponentCatalogCategory[] = [
	{
		name: 'Navigation & Shell',
		icon: '☰',
		summary: 'Application chrome, orientation, page position, and primary movement.',
		components: [
			component('Navbar', '/navbar', '☰', 'Responsive app navigation with a sliding panel.', 'NavBarShot.png'),
			component('SpeedDial', '/speeddial', '⚡', 'Floating action trigger with radial shortcuts.'),
			component('FloatingDock', '/floatingdock', '🧲', 'Dock-style navigation with proximity magnification.'),
			component('LiquidTabBar', '/liquidtabbar', '💧', 'Gooey active-tab motion for compact navigation.'),
			component('Drawer', '/drawer', '📥', 'Slide-in modal panel from any edge.'),
			component('Breadcrumbs', '/breadcrumbs', '🍞', 'Hierarchical path navigation with smart truncation.'),
			component('Pagination', '/pagination', '📑', 'Page-number navigation with ellipsis handling.'),
			component('ReadingTOC', '/readingtoc', '📖', 'Auto-tracking document table of contents.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/ReadingTOC.test.ts',
					'src/lib/components/ReadingTOCTestHarness.test.svelte'
				],
				usage: '<ReadingTOC target="#article" levels={[2, 3]} variant="rail" />',
				agentHint:
					'Use a target selector for rendered articles or pass headings for static data; keep the real anchor links for no-JS navigation.'
			}),
			component('ScrollProgressBar', '/scrollprogressbar', '📜', 'Viewport reading-progress indicator.')
		]
	},
	{
		name: 'Controls & Input',
		icon: '🎛️',
		summary: 'Form fields, selectors, menus, and compact interaction controls.',
		components: [
			component('Forms', '/forms', '📝', 'Reusable Svelte form field suite.', {
				source: 'src/lib/components/forms/FormField.svelte',
				docs: 'src/lib/components/forms/Forms.md',
				relatedFiles: [
					'src/lib/components/forms/TextField.svelte',
					'src/lib/components/forms/SelectField.svelte',
					'src/lib/components/forms/CheckboxField.svelte',
					'src/lib/components/forms/RadioGroup.svelte',
					'src/lib/components/forms/RangeField.svelte'
				],
				usage: '<TextField label="Email" bind:value={email} />',
				agentHint: 'Copy the field components you need, or copy the whole forms folder for the full suite.'
			}),
			component('PinInput', '/pininput', '🔢', 'Segmented OTP and verification-code entry.'),
			component('UploadDropzone', '/uploaddropzone', '📤', 'Drag, paste, and validate file uploads.'),
			component('Switch', '/switch', '🔘', 'Accessible boolean toggle with three sizes.'),
			component('Slider', '/slider', '🎚', 'Styled range input with value formatting.', {
				themeSupport: 'dual',
				relatedFiles: [],
				usage: '<Slider bind:value={volume} label="Volume" min={0} max={100} />',
				agentHint: 'Native input[type=range] under the hood — keyboard a11y is free (arrows/Home/End/PageUp/PageDown). Three sizes (sm/md/lg), three variants (default/success/danger). Dual-mode via six CSS vars (--slider-track-bg / --slider-thumb-bg / --slider-label-fg / --slider-bubble-bg / --slider-bubble-fg / --slider-focus-ring) that flip under prefers-color-scheme: dark; --fill-color stays variant-driven.'
			}),
			component('SegmentedControl', '/segmentedcontrol', '🎛️', 'Joined picker for mutually exclusive options.'),
			component('FilterChips', '/filterchips', '🎚️', 'Toggleable chips for search and filtering.'),
			component('RatingStars', '/ratingstars', '⭐', 'Keyboard-friendly star rating control.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/RatingStars.test.ts'],
				usage: '<RatingStars value={4} onChange={(v) => rating = v} />',
				agentHint: 'Real input[type=radio] elements under the hood — keyboard a11y is free (Left/Right + Space/Enter). Supports half-stars in readonly mode via fractional values. Dual-mode via three CSS vars: --rating-star-filled (brand gold, deliberately stays un-flipped on both schemes), --rating-star-empty (chrome, flips dark), --rating-focus-ring (chrome, flips dark). Legacy filledColor / emptyColor props still accepted as inline-style overrides.'
			}),
			component('Stepper', '/stepper', '🪜', 'Multi-step progress and completion control.'),
			component('Accordion', '/accordion', '🪗', 'Collapsible content sections with smooth motion.'),
			component('Tabs', '/tabs', '🗂', 'ARIA-correct tabbed content switcher.'),
			component('CommandPalette', '/commandpalette', '🔎', 'Spotlight-style fuzzy command launcher.'),
			component('ContextMenu', '/contextmenu', '🖱️', 'Right-click and keyboard context menu.'),
			component(
				'HoldToConfirm',
				'/holdtoconfirm',
				'⏳',
				'Press-and-hold confirmation for risky actions.',
				{
					relatedFiles: [
						'src/lib/components/HoldToConfirm.test.ts',
						'src/lib/components/HoldToConfirmTestHarness.test.svelte'
					],
					usage:
						'<HoldToConfirm variant="bar" duration={2000} label="Hold to send" onConfirm={sendIrrevocably} />',
					agentHint:
						'Keep pointer and keyboard parity together; the reduced-motion path intentionally becomes a single explicit press.'
				}
			),
			component('CopyButton', '/copybutton', '📋', 'Clipboard button with copied-state feedback.'),
			component('KbdShortcut', '/kbdshortcut', '🎹', 'Platform-aware keyboard shortcut display.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/KbdShortcut.test.ts'],
				usage: '<KbdShortcut keys={[\'Cmd\', \'K\']} />',
				agentHint: 'Native <kbd> element under the hood — semantic for keyboard input, free a11y. Auto-detects Mac vs Windows for Cmd→⌘/Win, Ctrl→⌃/Ctrl glyph swap (override with `mac` prop). Default aria-label spells keys ("Cmd plus K") so SR says words, not glyphs. Dual-mode via seven CSS vars (--kbd-fg / --kbd-bg-top / --kbd-bg-bottom / --kbd-border / --kbd-shadow-inner / --kbd-shadow-drop / --kbd-sep-color) that flip together under prefers-color-scheme: dark — no brand variants on a kbd cap so the whole set flips (Pattern #67 does not split here). Zero deps, pure CSS bevel.'
			}),
			component('Tooltip', '/tooltip', '💬', 'Accessible hover and focus tooltip.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/components/Tooltip.test.ts'],
				usage: '<Tooltip text="Save changes"><button>Save</button></Tooltip>',
				agentHint:
					'Wrap any focusable trigger; pass plain text or a `tip` snippet for rich content. Dark-aware via three CSS custom properties (--tooltip-fg / --tooltip-bg / --tooltip-shadow) that flip under prefers-color-scheme: dark.'
			})
		]
	},
	{
		name: 'Feedback & Identity',
		icon: '🔔',
		summary: 'Status, loading, profile, and empty-state primitives.',
		components: [
			component('ToastNotification', '/toastnotification', '🔔', 'Stackable global alerts with actions.'),
			component('AlertBanner', '/alertbanner', '🚨', 'Inline status banner for common tones.'),
			component('EmptyState', '/emptystate', '📭', 'Reusable nothing-here-yet placeholder.'),
			component('SkeletonLoader', '/skeletonloader', '💀', 'Placeholder primitives for loading content.'),
			component('ProgressRing', '/progressring', '⭕', 'Circular determinate and indeterminate progress.'),
			component('ProgressBar', '/progressbar', '📊', 'Linear progress indicator with labels and variants.'),
			component('Spinner', '/spinner', '🌀', 'Indeterminate loading indicator in multiple styles.'),
			component('BadgePill', '/badgepill', '🏷️', 'Status pills, tags, and dismissible chips.'),
			component('Avatar', '/avatar', '🙂', 'User image with initials and status fallback.'),
			component('AvatarStack', '/avatarstack', '👥', 'Overlapping avatars with overflow handling.'),
			component('StatCard', '/statcard', '📈', 'KPI card with trend-aware sentiment.')
		]
	},
	{
		name: 'Text, Time & Content Motion',
		icon: '⌨️',
		summary: 'Animated copy, counters, time displays, and content rhythm.',
		components: [
			component('Typewriter', '/typewriter', '⌨️', 'Cycling typewriter text with a cursor.'),
			component('ShinyText', '/shinytext', '✨', 'Configurable shimmer sweep for text.'),
			component('ScrambledText', '/scrambledtext', '🔀', 'Glyph shuffle that resolves into readable copy.'),
			component('TrueFocus', '/truefocus', '🔦', 'Word-by-word phrase focus with a moving frame.'),
			component('VariableProximity', '/variableproximity', '🅰️', 'Cursor-reactive variable-font typography.'),
			component('GlitchText', '/glitchtext', '📼', 'RGB channel split and clip-band text glitch.'),
			component('SplitFlap', '/splitflap', '🪧', 'Mechanical board character flip animation.'),
			component('TickerTape', '/tickertape', '📈', 'Structured infinite-scroll information strip.'),
			component('Marquee', '/marquee', '🎭', 'Infinite scrolling content rail with pause-on-hover.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/MarqueeDraggable.svelte',
					'src/lib/server/testimonials.ts',
					'src/routes/marquee/+page.server.ts'
				],
				usage: '<Marquee items={testimonials} speed={50} pauseOnHover />',
				agentHint:
					'The demo route uses loadTestimonialsWithSource for database-backed static and interactive testimonial rails.'
			}),
			component('CodeBlock', '/codeblock', '💻', 'Token-coloured code display with copy support.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/tokenize.ts',
					'src/lib/components/CodeBlock.test.ts',
					'src/lib/components/CodeBlockTestHarness.test.svelte'
				],
				usage:
					'<CodeBlock code={snippet} language="svelte" variant="titled" fileName="Component.svelte" theme="light" />',
				agentHint:
					'Copy src/lib/tokenize.ts with the component; it is the local tokenizer that replaces a heavyweight highlighter dependency.'
			}),
			component('Countdown', '/countdown', '⏱️', 'Animated timer for deadlines and launches.'),
			component('CountUp', '/countup', '💯', 'Locale-aware number animation primitive.'),
			component('Timeline', '/timeline', '📅', 'Animated timeline for milestones and events.')
		]
	},
	{
		name: 'Cards & Layout',
		icon: '🃏',
		summary: 'Composed surfaces, showcases, and reusable content layouts.',
		components: [
			component('CardStack', '/cardstack', '🃏', 'Interactive horizontal card stack.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/server/cards.ts',
					'src/routes/cardstack/+page.server.ts',
					'src/lib/scrollLock.ts',
					'src/lib/types.ts'
				],
				usage: '<CardStack cards={data.cards} />',
				agentHint:
					'Use loadCardsWithSource on demo routes so the card data reports database/fallback provenance.'
			}),
			component(
				'CardStackMotionFlip',
				'/cardstackmotionflip',
				'🎴',
				'4-direction rolling deck with scoped keyboard control.',
				{
					screenshotFile: 'CardStackMotionFlipShot.svg',
					themeSupport: 'dual',
					relatedFiles: ['src/lib/scrollLock.ts', 'src/lib/types.ts'],
					usage:
						'<CardStackMotionFlip cards={cards} cardWidth={280} cardHeight={380} cardGap={38} />',
					agentHint:
						'Keyboard arrows are intentionally scoped to focus inside the deck; do not attach global arrow handlers.'
				}
			),
			component('BentoGrid', '/bentogrid', '🍱', 'Responsive grid system for modern layouts.'),
			component('Divider', '/divider', '➖', 'Section separator with optional label and orientation.'),
			component('ExpandingCard', '/expandingcard', '🎴', 'Card that smoothly expands into detail.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/server/expandingCards.ts',
					'src/routes/expandingcard/+page.server.ts',
					'src/lib/components/ExpandingCard.test.ts'
				],
				usage:
					'<ExpandingCard heading={card.heading} compactText={card.compactText} expandedText={card.expandedText} imageSrc={card.imageSrc} imageAlt={card.imageAlt} bgColor={card.bgColor} />',
				agentHint:
					'crossfade does not auto-disable for reduced motion; database bgColor values need matching Tailwind classes in source or safelist.'
			}),
			component('ScratchToReveal', '/scratchtoreveal', '🎰', 'Canvas scratch-off reveal interaction.'),
			component('StreamShowcase', '/streamshowcase', '📺', 'Editorial carousel for streaming-style shelves.', {
				source: 'src/lib/components/StreamShowcase/StreamShowcase.svelte',
				relatedFiles: [
					'src/lib/components/StreamShowcase/StreamShowcaseHero.svelte',
					'src/lib/components/StreamShowcase/StreamShowcaseCarousel.svelte',
					'src/lib/components/StreamShowcase/playlists.ts',
					'src/lib/components/StreamShowcase/types.ts'
				],
				usage: '<StreamShowcase playlists={playlists} />'
			}),
			component('Cardwall', '/cardwall', '🎴', 'Perspective billboard wall with drifting cards.', {
				source: 'src/lib/components/Cardwall/Cardwall.svelte',
				relatedFiles: [
					'src/lib/components/Cardwall/CardwallTile.svelte',
					'src/lib/components/Cardwall/types.ts'
				],
				usage: '<Cardwall tiles={tiles} />'
			}),
			component(
				'InteractiveCards',
				'/interactivecards',
				'🖼️',
				'Scroll-driven paintings portfolio with fan, conveyor, and detail-view phases.',
				{
					screenshotFile: 'InteractiveCardsShot.svg',
					themeSupport: 'dual',
					source: 'src/lib/components/InteractiveCards.svelte',
					relatedFiles: [
						'src/lib/components/interactiveCards/geometry.ts',
						'src/lib/components/interactiveCards/InteractiveCardItem.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsDetail.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsRoomPreview.svelte',
						'src/lib/components/interactiveCards/InteractiveCardsAwards.svelte',
						'src/lib/constants.ts'
					],
					usage: '<InteractiveCards projects={projects} testimonials={testimonials} />',
					agentHint:
						'Use this for editorial or product storytelling where scroll position drives a multi-phase card choreography.'
				}
			),
			component('MagicCard', '/magiccard', '✨', 'Card spotlight driven by pointer position.', {
				themeSupport: 'dual',
				relatedFiles: ['src/lib/utils.ts', 'src/lib/components/MagicCard.test.ts'],
				usage:
					'<MagicCard gradientColor="#146ef5" gradientOpacity={0.15}><div>Feature content</div></MagicCard>',
				agentHint:
					'This is a pointer spotlight wrapper; keep the wrapped content fully readable without hover or pointer movement.'
			}),
			component('MorphingDialog', '/morphingdialog', '🪄', 'Shared-element transition dialog.')
		]
	},
	{
		name: 'Motion Primitives',
		icon: '🎬',
		summary: 'Composable motion wrappers and pointer-driven effects.',
		components: [
			component('ShineBorder', '/shineborder', '💫', 'Animated border with sweeping shine.'),
			component('SwishButton', '/swishbutton', '🎯', 'Button text slide and accent motion.'),
			component('MagneticButton', '/magneticbutton', '🧲', 'Button that drifts toward the cursor.'),
			component('ClickSpark', '/clickspark', '💥', 'Click-triggered particle burst wrapper.'),
			component('LinkImageHover', '/linkimagehover', '🔗', 'Links with floating image preview on hover.'),
			component('AnimatedBeam', '/animatedbeam', '⚡', 'SVG beams for connected-flow diagrams.'),
			component('ScrollReveal', '/scrollreveal', '🎬', 'Viewport-entry stagger reveal primitive.'),
			component('OrbitalRing', '/orbitalring', '🛸', 'Circular orbital layout with auto-rotation.'),
			component('MagnetGrid', '/magnetgrid', '🧲', 'Grid cells displaced by cursor proximity.'),
			component('PixelTrail', '/pixeltrail', '🌠', 'Cursor-tracked decaying pixel trail.'),
			component('RippleGrid', '/ripplegrid', '〰️', 'Event-driven ripple waves across a grid.'),
			component(
				'GSAP Suite',
				'/gsap-suite',
				'🎞️',
				'Reusable GSAP primitives for Svelte sequencing, text, canvas, deck, and grid motion.',
				{
					screenshotFile: 'GsapSuiteShot.svg',
					themeSupport: 'dual',
					source: 'src/lib/components/GsapSplitTextHero.svelte',
					docs: 'src/lib/components/GsapSplitTextHero.md',
					dependencies: ['gsap'],
					relatedFiles: [
						'src/lib/components/GsapRevealSequence.svelte',
						'src/lib/components/GsapFlipGrid.svelte',
						'src/lib/components/KineticCanvasField.svelte',
						'src/lib/components/FanDeckCarousel.svelte',
						'src/lib/components/VariableShockText.svelte',
						'src/lib/gsapMotion.ts'
					],
					usage: '<GsapSplitTextHero title="Launch faster" />',
					agentHint: 'Use the route as the suite demo and copy only the GSAP primitive your target UI needs.'
				}
			),
			component('EqualizerBars', '/equalizerbars', '🎵', 'CSS equalizer indicator with phased bars.'),
			component('ConfettiBurst', '/confettiburst', '🎉', 'Imperative canvas celebration burst.', {
				themeSupport: 'dual',
				relatedFiles: [
					'src/lib/components/ConfettiBurst.test.ts',
					'src/lib/components/ConfettiBurstTestHarness.test.svelte'
				],
				usage:
					'<ConfettiBurst bind:this={burst} onComplete={handleComplete} />\n<button onclick={() => burst.fire()}>Celebrate</button>',
				agentHint:
					'This is decorative canvas; pair it with a toast, banner, or aria-live success message owned by the calling UI.'
			}),
			component('Tilt3D', '/tilt3d', '📐', 'Cursor-driven 3D rotation wrapper.'),
			component('Pendulum', '/pendulum', '🪀', 'Damped swing wrapper with imperative control.')
		]
	},
	{
		name: 'Ambient Surfaces',
		icon: '🌌',
		summary: 'Full-bleed backgrounds, display shells, and atmospheric visual systems.',
		components: [
			component('AuroraBackdrop', '/aurora-backdrop', '🌌', 'Layered pure-CSS aurora surface.'),
			component('MeshGradient', '/meshgradient', '🎨', 'Animated mesh-gradient backdrop.'),
			component('MembraneHero', '/membrane-hero', '🌊', 'Fluid-mesh editorial hero surface.', {
				source: 'src/lib/components/MembraneHero/MembraneHero.svelte',
				relatedFiles: [
					'src/lib/components/MembraneHero/MembraneSurface.svelte',
					'src/lib/components/MembraneHero/types.ts'
				],
				usage: '<MembraneHero headline="Fluid launch surface" />'
			}),
			component('PerspectiveGrid', '/perspectivegrid', '🛣️', 'CSS 3D perspective grid backdrop.'),
			component('NoiseField', '/noisefield', '🌫️', 'Ambient grain, film-noise, and TV-static overlay.'),
			component('NeonSign', '/neonsign', '💡', 'Glowing neon-tube text treatment.'),
			component('CRTScreen', '/crtscreen', '🖥️', 'Retro screen frame with scanlines and roll.'),
			component('HoloCard', '/holocard', '🪩', 'Holographic foil shimmer wrapper.'),
			component('ElectricBorder', '/electricborder', '⚡', 'SVG-filter electric border effect.'),
			component(
				'TopologyColorGrid',
				'/topologycolorgrid',
				'🧬',
				'Three.js and GSAP colour topology scene with hover extrusion.',
				{
					screenshotFile: 'TopologyColorGridShot.svg',
					themeSupport: 'dual',
					dependencies: ['three', 'gsap'],
					agentHint: 'Mount this client-side; the component owns its Three.js renderer and GSAP cleanup.'
				}
			)
		]
	},
	{
		name: 'Data & Visualisation',
		icon: '📊',
		summary: 'Tables, charts, hierarchy, graph, and relationship visualisations.',
		components: [
			component('DataGrid', '/datagrid', '📊', 'Two grid implementations for tabular data.', {
				source: 'src/lib/components/DataGridBasic.svelte',
				docs: 'src/lib/components/DataGridBasic.md',
				dependencies: ['@svar-ui/svelte-grid'],
				relatedFiles: [
					'src/lib/components/DataGridAdvanced.svelte',
					'src/lib/components/DataGridFilters.svelte',
					'src/lib/components/DataGridAdvanced.md',
					'src/lib/components/DataGridFilters.md'
				],
				usage: '<DataGridBasic data={rows} columns={columns} />',
				agentHint: 'Use DataGridBasic for copy-paste portability; include DataGridAdvanced only when SVAR Grid is acceptable.'
			}),
			component('CalendarHeatmap', '/calendarheatmap', '📅', 'GitHub-style contribution calendar.'),
			component('BubblePacking', '/bubblepacking', '🫧', 'Force-directed circle packing view.'),
			component('RadialCluster', '/radialcluster', '🎯', 'Hierarchical radial dendrogram.'),
			component('Sunburst', '/sunburst', '☀️', 'Zoomable hierarchical chart.'),
			component('WordCloud', '/wordcloud', '☁️', 'Frequency-weighted text cloud.'),
			component('Sankey', '/sankey', '🌊', 'Expandable flow visualisation.', {
				themeSupport: 'dual',
				source: 'src/lib/components/ExpandableSankey.svelte',
				docs: 'src/lib/components/ExpandableSankey.md',
				dependencies: ['@unovis/svelte', '@unovis/ts'],
				relatedFiles: [
					'src/lib/components/sankeyData.ts',
					'src/lib/server/sankeyData.ts',
					'src/routes/sankey/+page.server.ts',
					'src/lib/types.ts'
				],
				usage: '<ExpandableSankey nodes={data.sankeyData.nodes} links={data.sankeyData.links} height={600} />',
				agentHint:
					'Unovis owns the SVG interaction layer; keyboard node expansion is honestly not implemented yet, so document that limitation if you copy it.'
			}),
			component('ExplainerCanvas', '/explainercanvas', '🎓', 'Connected concept-mapping canvas.', {
				source: 'src/lib/components/ExplainerCanvas/ExplainerCanvas.svelte',
				relatedFiles: [
					'src/lib/components/ExplainerCanvas/Card.svelte',
					'src/lib/components/ExplainerCanvas/CardContent.svelte',
					'src/lib/components/ExplainerCanvas/CanvasViewport.svelte',
					'src/lib/components/ExplainerCanvas/CanvasControls.svelte',
					'src/lib/components/ExplainerCanvas/ConnectionLines.svelte',
					'src/lib/components/ExplainerCanvas/MobileView.svelte',
					'src/lib/components/ExplainerCanvas/SearchPanel.svelte',
					'src/lib/components/ExplainerCanvas/TooltipPortal.svelte',
					'src/lib/components/ExplainerCanvas/utils/geometry.ts',
					'src/lib/components/ExplainerCanvas/utils/loader.ts',
					'src/lib/components/ExplainerCanvas/utils/markdown.ts',
					'src/lib/components/ExplainerCanvas/utils/search.ts',
					'src/lib/components/ExplainerCanvas/ExplainerCanvas.test.ts'
				],
				usage: '<ExplainerCanvas data={canvasData} />',
				agentHint:
					'Copy the whole ExplainerCanvas folder; the public component depends on its local cards, canvas viewport, controls, mobile view, search panel, tooltip portal, and utility modules.'
			})
		]
	},
	{
		name: 'Media & Portfolio',
		icon: '🖼️',
		summary: 'Image comparison, galleries, and portfolio-grade presentation.',
		components: [
			component('BeforeAfter', '/beforeafter', '↔️', 'Draggable before/after image comparison.'),
			component('DomeGallery', '/domegallery', '🎪', '3D spherical image gallery.'),
			component('PortfolioPhotographer', '/portfolio-photographer', '📷', 'Editorial photo-portfolio hero.', {
				source: 'src/lib/components/PortfolioPhotographer/PortfolioPhotographer.svelte',
				relatedFiles: [
					'src/lib/components/PortfolioPhotographer/PhotoReelHero.svelte',
					'src/lib/components/PortfolioPhotographer/photos.ts',
					'src/lib/components/PortfolioPhotographer/types.ts'
				],
				usage: '<PortfolioPhotographer photos={photos} />'
			})
		]
	},
	{
		name: 'Data-Backed Workflows',
		icon: '✏️',
		summary: 'Examples that benefit from real persistence and public demo data.',
		components: [
			component('Editor', '/editor', '✏️', 'CRUD editor backed by database data when configured.', {
				themeSupport: 'dual',
				source: 'src/lib/components/Editor.svelte',
				docs: 'src/lib/components/Editor.md',
				relatedFiles: [
					'src/lib/server/editorData.ts',
					'src/routes/editor/+page.server.ts',
					'src/routes/editor/api/+server.ts'
				],
				usage:
					'<Editor mode="edit" initialData={item} usingDatabase={data.usingDatabase} onSave={handleSave} onCancel={handleCancel} />',
				agentHint:
					'Pair the component with editorData server helpers and API routes; create/update/delete require DATABASE_URL.'
			}),
			component('FolderFiles', '/folderfiles', '🗂️', '3D filing cabinet with database-ready folders and files.')
		]
	},
	{
		name: 'Maps & Location',
		icon: '🗺️',
		summary: 'Geographic interfaces, routing demos, and location-aware visualisations.',
		components: [
			component('Maps', '/maps', '🗺️', 'Interactive Leaflet maps with markers and search.', {
				source: 'src/lib/components/MapBasic.svelte',
				docs: 'src/lib/components/Maps.md',
				dependencies: ['leaflet', '@types/leaflet'],
				relatedFiles: [
					'src/lib/components/MapSearch.svelte',
					'src/lib/components/MapMarkers.svelte',
					'src/lib/components/MapLive.svelte'
				],
				usage: '<MapBasic center={DEFAULT_MAP_CENTER} zoom={13} />',
				agentHint: 'Include Leaflet CSS in app.html before using these components.'
			}),
			component('Location', '/location', '📍', 'Locate-me, delivery, and routing demos.', {
				source: 'src/lib/components/MapLocateMe.svelte',
				docs: 'src/lib/components/Location.md',
				dependencies: ['leaflet', '@types/leaflet'],
				relatedFiles: ['src/lib/components/MapRouting.svelte'],
				usage: '<MapLocateMe onLocate={handleLocate} />',
				agentHint: 'Browser geolocation needs HTTPS or localhost; routing uses OSRM demo endpoints by default.'
			}),
			component('GlobePresence', '/globepresence', '🌍', 'High-performance 3D globe visualisation.'),
			component('GeoViz', '/geo', '🌍', 'Choropleth and spike-map visualisations.', {
				screenshotFile: 'GeoVizShot.png',
				source: 'src/lib/components/GeoChoropleth.svelte',
				docs: 'src/lib/components/GeoViz.md',
				relatedFiles: [
					'src/lib/components/GeoSpikeMap.svelte',
					'src/lib/components/GeoBubbleMap.svelte'
				],
				usage: '<GeoChoropleth features={features} values={values} />'
			})
		]
	},
	{
		name: 'Auth & OSS Demo',
		icon: '🔐',
		summary: 'Better Auth flows and protected-route examples for public demos.',
		components: [
			component('Auth Demo', '/auth', '🔐', 'Better Auth sign-in, sign-up, and demo-account entry.', {
				screenshotFile: 'AuthShot.png',
				source: 'src/routes/auth/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				dependencies: ['better-auth'],
				relatedFiles: [
					'src/hooks.server.ts',
					'src/lib/server/auth.ts',
					'src/lib/server/betterAuth.ts',
					'src/lib/auth-client.ts',
					'src/lib/components/AuthStatus.svelte',
					'src/routes/auth/sign-in/[...rest]/+page.svelte',
					'src/routes/auth/sign-up/[...rest]/+page.svelte',
					'database/schema_better_auth.sql'
				],
				usage: '<AuthStatus isConfigured={isConfigured} />',
				agentHint:
					'Copy the Better Auth server/client wiring together; do not copy only the visual auth page.'
			}),
			component('Dashboard', '/dashboard', '📊', 'Protected route example with session data.', {
				source: 'src/routes/(protected)/dashboard/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				demo: 'src/routes/(protected)/dashboard/+page.svelte',
				dependencies: ['better-auth'],
				usage: '<AuthStatus isConfigured={isConfigured} />',
				agentHint:
					'This is a protected route example; pair it with hooks.server.ts and the Better Auth setup.'
			}),
			component('Profile', '/profile', '👤', 'Protected user profile view.', {
				source: 'src/routes/(protected)/profile/+page.svelte',
				docs: 'src/lib/components/AuthStatus.md',
				demo: 'src/routes/(protected)/profile/+page.svelte',
				dependencies: ['better-auth'],
				usage: '<AuthStatus isConfigured={isConfigured} />',
				agentHint:
					'This is a protected route example; pair it with hooks.server.ts and the Better Auth setup.'
			})
		]
	}
];

export const componentCount = componentCategories.reduce(
	(total, category) => total + category.components.length,
	0
);

const normalizeHref = (href: string) => {
	const [path] = href.split(/[?#]/);
	if (!path || path === '/') return '/';
	return path.endsWith('/') ? path.slice(0, -1) : path;
};

export const componentCatalogEntries: ComponentCatalogEntry[] = componentCategories.flatMap((category) =>
	category.components.map((item) => ({ category, item }))
);

export function getCatalogEntryByHref(href: string): ComponentCatalogEntry | undefined {
	const currentPath = normalizeHref(href);
	return componentCatalogEntries.find(({ item }) => normalizeHref(item.href) === currentPath);
}

export function isCatalogComponentPath(href: string): boolean {
	return Boolean(getCatalogEntryByHref(href));
}

export function themeSupportLabel(themeSupport: ComponentCatalogItem['themeSupport']): string {
	return themeSupport === 'dual' ? 'Light and dark mode' : 'Light mode';
}

export const iconColors: Record<string, { bg: string; text: string }> = {
	'☰': { bg: '#dbeafe', text: '#1d4ed8' },
	'⚡': { bg: '#fef3c7', text: '#d97706' },
	'🧲': { bg: '#e0f2fe', text: '#0369a1' },
	'💫': { bg: '#ede9fe', text: '#7c3aed' },
	'🎯': { bg: '#fce7f3', text: '#db2777' },
	'✨': { bg: '#fef3c7', text: '#d97706' },
	'🎭': { bg: '#f3e8ff', text: '#9333ea' },
	'🔗': { bg: '#dbeafe', text: '#2563eb' },
	'🔔': { bg: '#fef3c7', text: '#b45309' },
	'🔎': { bg: '#e0e7ff', text: '#4338ca' },
	'⌨️': { bg: '#f3f4f6', text: '#374151' },
	'🎹': { bg: '#e5e7eb', text: '#1f2937' },
	'🔢': { bg: '#dbeafe', text: '#1d4ed8' },
	'🌀': { bg: '#e0e7ff', text: '#4338ca' },
	'📥': { bg: '#ecfdf5', text: '#047857' },
	'⏱️': { bg: '#fef3c7', text: '#d97706' },
	'🍱': { bg: '#fff7ed', text: '#ea580c' },
	'🃏': { bg: '#dcfce7', text: '#16a34a' },
	'🎴': { bg: '#fef3c7', text: '#ea580c' },
	'🌌': { bg: '#e0e7ff', text: '#4338ca' },
	'🪧': { bg: '#1f2937', text: '#fde68a' },
	'💡': { bg: '#0a0815', text: '#ff3aa9' },
	'🎬': { bg: '#f1f5f9', text: '#0f172a' },
	'🖥️': { bg: '#160d05', text: '#ffb84d' },
	'💯': { bg: '#0f172a', text: '#7dd3fc' },
	'🎰': { bg: '#fee2e2', text: '#dc2626' },
	'📊': { bg: '#e0e7ff', text: '#4f46e5' },
	'📅': { bg: '#d1fae5', text: '#059669' },
	'🫧': { bg: '#cffafe', text: '#0891b2' },
	'☀️': { bg: '#fef9c3', text: '#ca8a04' },
	'🌊': { bg: '#dbeafe', text: '#0284c7' },
	'🗂️': { bg: '#fef3c7', text: '#b45309' },
	'🎓': { bg: '#e0e7ff', text: '#6366f1' },
	'↔️': { bg: '#f3e8ff', text: '#a855f7' },
	'🎪': { bg: '#fce7f3', text: '#ec4899' },
	'📝': { bg: '#dcfce7', text: '#22c55e' },
	'✏️': { bg: '#fef3c7', text: '#f59e0b' },
	'🗺️': { bg: '#dbeafe', text: '#3b82f6' },
	'📍': { bg: '#fee2e2', text: '#ef4444' },
	'🌍': { bg: '#d1fae5', text: '#10b981' },
	'🔐': { bg: '#fce7f3', text: '#be185d' },
	'👤': { bg: '#e0e7ff', text: '#6366f1' },
	'📤': { bg: '#e0f2fe', text: '#0369a1' },
	'👥': { bg: '#ccfbf1', text: '#0d9488' },
	'🪄': { bg: '#f5d0fe', text: '#a21caf' },
	'💧': { bg: '#cffafe', text: '#0e7490' },
	'🏷️': { bg: '#fef3c7', text: '#a16207' },
	'📈': { bg: '#dcfce7', text: '#15803d' },
	'☁️': { bg: '#e0f2fe', text: '#0369a1' },
	'📜': { bg: '#fef3c7', text: '#7c3aed' },
	'📭': { bg: '#fef3c7', text: '#a16207' },
	'💀': { bg: '#e5e7eb', text: '#374151' },
	'⭕': { bg: '#dbeafe', text: '#1d4ed8' },
	'📋': { bg: '#fef9c3', text: '#854d0e' },
	'🪜': { bg: '#e0e7ff', text: '#4338ca' },
	'⭐': { bg: '#fef3c7', text: '#b45309' },
	'🚨': { bg: '#fee2e2', text: '#991b1b' },
	'🎚️': { bg: '#e0f2fe', text: '#0369a1' },
	'🎛️': { bg: '#ede9fe', text: '#5b21b6' },
	'💬': { bg: '#f0fdf4', text: '#166534' },
	'📑': { bg: '#fef3c7', text: '#92400e' },
	'🍞': { bg: '#fef3c7', text: '#a16207' },
	'🔘': { bg: '#dbeafe', text: '#1d4ed8' },
	'🎚': { bg: '#e0e7ff', text: '#4338ca' },
	'🪗': { bg: '#fef9c3', text: '#854d0e' },
	'🗂': { bg: '#fef3c7', text: '#a16207' },
	'🙂': { bg: '#dbeafe', text: '#1d4ed8' },
	'📺': { bg: '#fef3c7', text: '#b45309' },
	'💥': { bg: '#fee2e2', text: '#be123c' },
	'🔀': { bg: '#ede9fe', text: '#5b21b6' },
	'🔦': { bg: '#ffe4e6', text: '#be123c' },
	'🅰️': { bg: '#e0e7ff', text: '#4338ca' },
	'📐': { bg: '#1e293b', text: '#a5b4fc' },
	'📼': { bg: '#0a0a0a', text: '#ff00c8' },
	'🪀': { bg: '#fef3c7', text: '#92400e' },
	'🪩': { bg: '#1a0a2e', text: '#ff7eee' },
	'🛸': { bg: '#1e1b4b', text: '#fbbf24' },
	'🎨': { bg: '#1a1a2e', text: '#ff6b9d' },
	'🌠': { bg: '#0a0a14', text: '#00f0ff' },
	'🌫️': { bg: '#14141a', text: '#c9c9d1' },
	'🛣️': { bg: '#050510', text: '#00f0ff' },
	'🎵': { bg: '#0d0d1a', text: '#38bdf8' },
	'⏳': { bg: '#0d0d1a', text: '#10b981' },
	'🖱️': { bg: '#0d0d1a', text: '#a78bfa' },
	'📖': { bg: '#fef3c7', text: '#92400e' },
	'🎉': { bg: '#1a0a2e', text: '#fde047' },
	'💻': { bg: '#0d1117', text: '#79c0ff' },
	'〰️': { bg: '#e0f2fe', text: '#0e7490' },
	'🎞️': { bg: '#111827', text: '#f9a8d4' },
	'🧬': { bg: '#1c1917', text: '#fbbf24' }
};

export function getIconColors(icon: string) {
	return iconColors[icon] ?? { bg: '#f3f4f6', text: '#374151' };
}

function isActivePath(currentPath: string, href: string) {
	return href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);
}

export function buildMenuCategories(currentPath: string): MenuCategory[] {
	return [
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: isActivePath(currentPath, '/') }]
		},
		...componentCategories.map((category) => ({
			name: category.name,
			icon: category.icon,
			items: category.components.map((item) => ({
				label: item.name,
				href: item.href,
				icon: item.icon,
				active: isActivePath(currentPath, item.href)
			}))
		}))
	];
}

export function getCatalogPageTitle(currentPath: string) {
	for (const category of buildMenuCategories(currentPath)) {
		const activeItem = category.items.find((item) => item.active);
		if (activeItem) return activeItem.label;
	}
	return 'Svelte Templates';
}
