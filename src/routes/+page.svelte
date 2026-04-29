<!--
	Component Template Library Home Page

	Redesigned homepage using CardStack components to showcase categories.
	Each category displays its components as a stacked card deck with screenshots.
-->

<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import type { Card } from '$lib/types';

	// ============================================================
	// Category data structure matching navbar organization
	// ============================================================

	interface ComponentInfo {
		name: string;
		href: string;
		icon: string;
		description: string;
		screenshot: string; // Path to screenshot image
	}

	interface Category {
		name: string;
		icon: string;
		components: ComponentInfo[];
	}

	// Screenshot path helper - maps component names to actual filenames
	const screenshotPath = (filename: string) => `/ComponentScreenshots/${filename}`;

	// Categories matching navbar structure (excluding Home)
	const categories: Category[] = [
		{
			name: 'Navigation',
			icon: '☰',
			components: [
				{
					name: 'Navbar',
					href: '/navbar',
					icon: '☰',
					description: 'Framework7-style nav with sliding panel',
					screenshot: screenshotPath('NavBarShot.png')
				},
				{
					name: 'SpeedDial',
					href: '/speeddial',
					icon: '⚡',
					description: 'Floating action button with expandable menu',
					screenshot: screenshotPath('SpeedDialShot.png')
				},
				{
					name: 'FloatingDock',
					href: '/floatingdock',
					icon: '🧲',
					description: 'macOS-style dock with proximity magnification',
					screenshot: screenshotPath('FloatingDockShot.png')
				},
				{
					name: 'LiquidTabBar',
					href: '/liquidtabbar',
					icon: '💧',
					description: 'Tab bar with a gooey SVG filter that flows the active pill between tabs',
					screenshot: screenshotPath('LiquidTabBarShot.png')
				}
			]
		},
		{
			name: 'Native UI',
			icon: '💫',
			components: [
				{
					name: 'ShineBorder',
					href: '/shineborder',
					icon: '💫',
					description: 'Animated border with sweeping shine effect',
					screenshot: screenshotPath('ShineBorderShot.png')
				},
				{
					name: 'SwishButton',
					href: '/swishbutton',
					icon: '🎯',
					description: 'Animated button with text slide effect',
					screenshot: screenshotPath('SwishButtonShot.png')
				},
				{
					name: 'MagneticButton',
					href: '/magneticbutton',
					icon: '🧲',
					description: 'Buttons drift towards the cursor with configurable strength and radius',
					screenshot: screenshotPath('MagneticButtonShot.png')
				},
				{
					name: 'MagicCard',
					href: '/magiccard',
					icon: '✨',
					description: 'Cards with dynamic spotlight effects',
					screenshot: screenshotPath('MagicCardShot.png')
				},
				{
					name: 'MorphingDialog',
					href: '/morphingdialog',
					icon: '🪄',
					description: 'Shared-element morph dialog transition',
					screenshot: screenshotPath('MorphingDialogShot.png')
				},
				{
					name: 'ClickSpark',
					href: '/clickspark',
					icon: '💥',
					description: 'Wrap anything to spray particles outward from the click point — four spark shapes (dot, plus, line, star), composable rapid bursts, prefers-reduced-motion safe',
					screenshot: screenshotPath('ClickSparkShot.png')
				}
			]
		},
		{
			name: 'Helpful UX',
			icon: '🎭',
			components: [
				{
					name: 'Marquee',
					href: '/marquee',
					icon: '🎭',
					description: 'Infinite scrolling with pause-on-hover',
					screenshot: screenshotPath('MarqueeShot.png')
				},
				{
					name: 'LinkImageHover',
					href: '/linkimagehover',
					icon: '🔗',
					description: 'Links with floating image preview',
					screenshot: screenshotPath('LinkImageHoverShot.png')
				},
				{
					name: 'AnimatedBeam',
					href: '/animatedbeam',
					icon: '⚡',
					description: 'SVG beams for data flow visualization',
					screenshot: screenshotPath('AnimatedBeamShot.png')
				},
				{
					name: 'CommandPalette',
					href: '/commandpalette',
					icon: '🔎',
					description: 'Spotlight-style fuzzy command launcher',
					screenshot: screenshotPath('CommandPaletteShot.png')
				},
				{
					name: 'ToastNotification',
					href: '/toastnotification',
					icon: '🔔',
					description: 'Stackable global alerts with actions',
					screenshot: screenshotPath('ToastNotificationShot.png')
				},
				{
					name: 'Typewriter',
					href: '/typewriter',
					icon: '⌨️',
					description: 'Cycling typewriter text with blinking cursor',
					screenshot: screenshotPath('TypewriterShot.png')
				},
				{
					name: 'ShinyText',
					href: '/shinytext',
					icon: '✨',
					description: 'CSS gradient shimmer that sweeps a brighter highlight band through your text — configurable colours, LR/RL direction, loop or one-shot, prefers-reduced-motion safe',
					screenshot: screenshotPath('ShinyTextShot.png')
				},
				{
					name: 'ScrambledText',
					href: '/scrambledtext',
					icon: '🔀',
					description: 'Glyph-shuffle reveal — characters scramble through a configurable pool then settle to the final string. Left-to-right or random order, replay-on-hover, prefers-reduced-motion safe',
					screenshot: screenshotPath('ScrambledTextShot.png')
				},
				{
					name: 'TrueFocus',
					href: '/truefocus',
					icon: '🔦',
					description: 'Cycle through highlighting one word at a time inside a phrase, with a single morphing focus box that slides and resizes between words. Hover-to-pause, click-to-pin, prefers-reduced-motion safe',
					screenshot: screenshotPath('TrueFocusShot.png')
				},
				{
					name: 'VariableProximity',
					href: '/variableproximity',
					icon: '🅰️',
					description: 'Cursor-reactive typography — each letter independently morphs along variable-font axes (wght/wdth/slnt/opsz) as the pointer approaches. Three falloff curves, rAF-throttled, CSS-eased, capability-detected, prefers-reduced-motion safe',
					screenshot: screenshotPath('VariableProximityShot.png')
				},
				{
					name: 'AvatarStack',
					href: '/avatarstack',
					icon: '👥',
					description: 'Overlapping avatars with +N overflow and image-to-initials fallback',
					screenshot: screenshotPath('AvatarStackShot.png')
				},
				{
					name: 'BadgePill',
					href: '/badgepill',
					icon: '🏷️',
					description: '3 variants × 6 tones × 3 sizes — status pills, tags, dismissible chips',
					screenshot: screenshotPath('BadgePillShot.png')
				},
				{
					name: 'EmptyState',
					href: '/emptystate',
					icon: '📭',
					description: 'Universal "nothing here yet" placeholder with optional CTA',
					screenshot: screenshotPath('EmptyStateShot.png')
				},
				{
					name: 'SkeletonLoader',
					href: '/skeletonloader',
					icon: '💀',
					description: 'Three-shape primitive for content placeholders while data loads',
					screenshot: screenshotPath('SkeletonLoaderShot.png')
				},
				{
					name: 'ProgressRing',
					href: '/progressring',
					icon: '⭕',
					description: 'Circular progress indicator with determinate and indeterminate modes',
					screenshot: screenshotPath('ProgressRingShot.png')
				},
				{
					name: 'ProgressBar',
					href: '/progressbar',
					icon: '📊',
					description: 'Linear progress indicator with determinate, indeterminate, sizes, variants, and labels',
					screenshot: screenshotPath('ProgressBarShot.png')
				},
				{
					name: 'Spinner',
					href: '/spinner',
					icon: '🌀',
					description: 'Indeterminate loading indicator — ring / dots / bars / pulse, three sizes, currentColor inheritance',
					screenshot: screenshotPath('SpinnerShot.png')
				},
				{
					name: 'Drawer',
					href: '/drawer',
					icon: '📥',
					description: 'Slide-in modal panel from any edge — focus trap, scroll lock, focus restore, persistent flag, prefers-reduced-motion fallback',
					screenshot: screenshotPath('DrawerShot.png')
				},
				{
					name: 'KbdShortcut',
					href: '/kbdshortcut',
					icon: '🎹',
					description: 'Keyboard key cap display — auto Mac/Windows glyph swap (⌘ vs Ctrl), sizes, custom separators',
					screenshot: screenshotPath('KbdShortcutShot.png')
				},
				{
					name: 'CopyButton',
					href: '/copybutton',
					icon: '📋',
					description: 'One-click copy-to-clipboard with a brief Copied! confirmation',
					screenshot: screenshotPath('CopyButtonShot.png')
				},
				{
					name: 'Stepper',
					href: '/stepper',
					icon: '🪜',
					description: 'Multi-step progress indicator with done/current/pending states',
					screenshot: screenshotPath('StepperShot.png')
				},
				{
					name: 'RatingStars',
					href: '/ratingstars',
					icon: '⭐',
					description: 'Interactive 1–N star rating with hover preview and keyboard a11y',
					screenshot: screenshotPath('RatingStarsShot.png')
				},
				{
					name: 'AlertBanner',
					href: '/alertbanner',
					icon: '🚨',
					description: 'Inline status banner — info, success, warning, error',
					screenshot: screenshotPath('AlertBannerShot.png')
				},
				{
					name: 'FilterChips',
					href: '/filterchips',
					icon: '🎚️',
					description: 'Toggleable chip row for filtering content (multi/single, removable, sizes)',
					screenshot: screenshotPath('FilterChipsShot.png')
				},
				{
					name: 'SegmentedControl',
					href: '/segmentedcontrol',
					icon: '🎛️',
					description: 'iOS-style joined picker for mutually-exclusive options with sliding indicator',
					screenshot: screenshotPath('SegmentedControlShot.png')
				},
				{
					name: 'Tooltip',
					href: '/tooltip',
					icon: '💬',
					description: 'Accessible hover/focus tooltip with four placements and keyboard support',
					screenshot: screenshotPath('TooltipShot.png')
				},
				{
					name: 'Pagination',
					href: '/pagination',
					icon: '📑',
					description: 'Page-number navigation with smart ellipsis, two-way bind, ARIA-correct buttons',
					screenshot: screenshotPath('PaginationShot.png')
				},
				{
					name: 'Breadcrumbs',
					href: '/breadcrumbs',
					icon: '🍞',
					description: 'Hierarchical path navigation with smart truncation and ARIA-correct semantics',
					screenshot: screenshotPath('BreadcrumbsShot.png')
				},
				{
					name: 'Accordion',
					href: '/accordion',
					icon: '🪗',
					description: 'Collapsible content sections with single/multiple-open modes and smooth grid-row animation',
					screenshot: screenshotPath('AccordionShot.png')
				},
				{
					name: 'Switch',
					href: '/switch',
					icon: '🔘',
					description: 'iOS-style boolean toggle with sliding thumb, two-way binding, three sizes/variants, role="switch" semantics',
					screenshot: screenshotPath('SwitchShot.png')
				},
				{
					name: 'Slider',
					href: '/slider',
					icon: '🎚',
					description: 'Continuous-value range input with styled track + thumb, value bubble, custom formatters, full keyboard a11y',
					screenshot: screenshotPath('SliderShot.png')
				},
				{
					name: 'Divider',
					href: '/divider',
					icon: '➖',
					description: 'Section separator with optional label, horizontal or vertical orientation, three thicknesses, three line styles, and proper ARIA semantics',
					screenshot: screenshotPath('DividerShot.png')
				},
				{
					name: 'Tabs',
					href: '/tabs',
					icon: '🗂',
					description: 'Tabbed content switcher with full WAI-ARIA tablist, roving tabindex, underline + pill variants, horizontal + vertical, full keyboard nav',
					screenshot: screenshotPath('TabsShot.png')
				},
				{
					name: 'Avatar',
					href: '/avatar',
					icon: '🙂',
					description: 'Single user identity element — image with onerror auto-fallback to initials, deterministic colour-from-name palette, three sizes, three shapes, optional status dot',
					screenshot: screenshotPath('AvatarShot.png')
				},
				{
					name: 'ScrollReveal',
					href: '/scrollreveal',
					icon: '🎬',
					description: 'Viewport-entry stagger primitive — IntersectionObserver-driven cascading reveal as direct children cross the threshold. Six directions (up / down / left / right / scale / rotate), per-child stagger via CSS custom properties, one-shot or replay, prefers-reduced-motion safe. Zero rAF, zero scroll listeners, zero dependencies',
					screenshot: screenshotPath('ScrollRevealShot.png')
				},
				{
					name: 'OrbitalRing',
					href: '/orbitalring',
					icon: '🛸',
					description: 'Circular orbital layout primitive — N children distributed evenly around a ring that auto-rotates clockwise or counter-clockwise. World-frame upright (planet orientation) or rotates with the ring (constellation orientation). Optional centred snippet, pause on hover, pause when offscreen via IntersectionObserver. Pure CSS transforms via cascaded custom properties, single rAF dispatcher updates one transform per frame regardless of item count, prefers-reduced-motion safe',
					screenshot: screenshotPath('OrbitalRingShot.png')
				},
				{
					name: 'MagnetGrid',
					href: '/magnetgrid',
					icon: '🧲',
					description: 'Cursor-driven displacement field — N×M grid of arbitrary cells where every cell shifts toward (or away from) the pointer with a smooth quadratic falloff, like iron filings under a roving magnet. Pass a cell snippet to render glyphs, icons, or anything else; default is a styled dot. Attract or repel mode, configurable radius and strength, settle-on-leave via CSS transition. Pure CSS transforms driven by pointer events writing custom properties, no rAF loop, no canvas, prefers-reduced-motion safe',
					screenshot: screenshotPath('MagnetGridShot.png')
				},
				{
					name: 'PixelTrail',
					href: '/pixeltrail',
					icon: '🌠',
					description: 'Cursor-tracked decaying pixel trail — mousemove spawns small squares that fade + scale + drift on a CSS keyframe and self-clean on a per-pixel setTimeout. Distance-throttled spawn keeps trail density consistent at any cursor speed. Three sizes (small/medium/large), three palettes (mono-white/cyber-cyan/sunset-warm), trail-length cap with FIFO eviction. Pure helpers exported, prefers-reduced-motion safe, no rAF',
					screenshot: screenshotPath('PixelTrailShot.png')
				},
				{
					name: 'NoiseField',
					href: '/noisefield',
					icon: '🌫️',
					description: 'Ambient grain / film-noise / TV-static overlay — a single SVG feTurbulence + feColorMatrix filter renders noise, layered over the slot via mix-blend-mode. Three intensities (fine/medium/coarse), three modes (mono/chroma/retro with scanlines), optional stuttering shimmer via steps() keyframe. SSR-safe filter ID, pure SVG + CSS, zero rAF, prefers-reduced-motion settles to static grain',
					screenshot: screenshotPath('NoiseFieldShot.png')
				},
				{
					name: 'TickerTape',
					href: '/tickertape',
					icon: '📈',
					description: 'Horizontal infinite-scroll strip of structured TickerItem tuples — {label, value, delta, trend, href}. Bloomberg / airport-board energy as a Svelte 5 primitive. Four variants (default / finance / sports / minimal) each with their own colour grammar. Trend chevrons inferred from delta sign or set explicitly. Pure CSS keyframe scroll on a 2× back-to-back track, hover-to-pause via animation-play-state, edge fade via mask-image, configurable speed + direction. Zero rAF, zero deps, prefers-reduced-motion settles to static frame.',
					screenshot: screenshotPath('TickerTapeShot.png')
				},
				{
					name: 'PerspectiveGrid',
					href: '/perspectivegrid',
					icon: '🛣️',
					description: 'Ambient 3D-perspective grid backdrop — two infinite grid planes (floor and optional ceiling) tilted in real CSS 3D space via transform-style: preserve-3d, drifting toward the viewer through a single background-position keyframe. Synthwave / TRON / arcade-tunnel energy. Three intensities (calm / standard / rush) bundling drift duration + cell size + line opacity. Three modes (mono achromatic / neon cyan-and-magenta with drop-shadow glow / wireframe hairline). Pure CSS — no canvas, no WebGL, no rAF — horizon fade via mask-image, prefers-reduced-motion safe.',
					screenshot: screenshotPath('PerspectiveGridShot.png')
				},
				{
					name: 'EqualizerBars',
					href: '/equalizerbars',
					icon: '🎵',
					description: 'Compact "things are alive" indicator — N vertical bars oscillating in concert via phased CSS keyframes, like a frozen-in-motion audio spectrum analyser. Four variants (equalizer smooth sine / spectrum peak-biased FFT / pulse binary high-low / heartbeat sparse double-spike). Configurable bar count (1–64), speed (0.25–4×), height, colour. Inactive state freezes bars at deterministic seeded heights via mulberry32 LCG — SSR-stable. Pure CSS — zero rAF, zero canvas, GPU-composited transform: scaleY(). Phase stagger via negative animation-delay per bar; role="img" + aria-label; prefers-reduced-motion safe.',
					screenshot: screenshotPath('EqualizerBarsShot.png')
				}
			]
		},
		{
			name: 'Time',
			icon: '⏱️',
			components: [
				{
					name: 'Countdown',
					href: '/countdown',
					icon: '⏱️',
					description: 'Animated countdown timer with multiple formats',
					screenshot: screenshotPath('CountdownShot.png')
				},
				{
					name: 'Timeline',
					href: '/timeline',
					icon: '📅',
					description: 'Animated event timeline with anime.js',
					screenshot: screenshotPath('TimelineShot.png')
				}
			]
		},
		{
			name: 'Cards',
			icon: '🃏',
			components: [
				{
					name: 'BentoGrid',
					href: '/bentogrid',
					icon: '🍱',
					description: 'Responsive grid system for modern layouts',
					screenshot: screenshotPath('BentoGridShot.png')
				},
				{
					name: 'ScratchToReveal',
					href: '/scratchtoreveal',
					icon: '🎰',
					description: 'Canvas-based scratch-off component',
					screenshot: screenshotPath('ScratchToRevealShot.png')
				},
				{
					name: 'ExpandingCard',
					href: '/expandingcard',
					icon: '🎴',
					description: 'Smooth layout transitions on click',
					screenshot: screenshotPath('ExpandingCardShot.png')
				},
				{
					name: 'CardStack',
					href: '/cardstack',
					icon: '🃏',
					description: 'Interactive horizontal card displays',
					screenshot: screenshotPath('CardStackShot.png')
				},
				{
					name: 'StreamShowcase',
					href: '/streamshowcase',
					icon: '📺',
					description: 'Editorial streaming-platform shelf — brush-script hero with a 10-card fan carousel splayed around a shared pivot, click/drag/keyboard interaction, asset-free CSS-only motion, reduced-motion fallback',
					screenshot: screenshotPath('StreamShowcaseShot.png')
				}
			]
		},
		{
			name: 'Data Visualisation',
			icon: '📊',
			components: [
				{
					name: 'DataGrid',
					href: '/datagrid',
					icon: '📊',
					description: 'Two grid implementations for any dataset',
					screenshot: screenshotPath('DataGridShot.png')
				},
				{
					name: 'CalendarHeatmap',
					href: '/calendarheatmap',
					icon: '📅',
					description: 'GitHub-style contribution calendar',
					screenshot: screenshotPath('CalendarHeatmapShot.png')
				},
				{
					name: 'BubblePacking',
					href: '/bubblepacking',
					icon: '🫧',
					description: 'D3 force-directed circle packing',
					screenshot: screenshotPath('BubblePackingShot.png')
				},
				{
					name: 'RadialCluster',
					href: '/radialcluster',
					icon: '🎯',
					description: 'Hierarchical radial dendrogram',
					screenshot: screenshotPath('RadialClusterShot.png')
				},
				{
					name: 'Sunburst',
					href: '/sunburst',
					icon: '☀️',
					description: 'Zoomable hierarchical chart',
					screenshot: screenshotPath('SunburstShot.png')
				},
				{
					name: 'StatCard',
					href: '/statcard',
					icon: '📈',
					description: 'KPI card with sentiment-aware trend',
					screenshot: screenshotPath('StatCardShot.png')
				},
				{
					name: 'WordCloud',
					href: '/wordcloud',
					icon: '☁️',
					description: 'Frequency-weighted text-cloud — organic, grid, radial',
					screenshot: screenshotPath('WordCloudShot.png')
				}
			]
		},
		{
			name: 'Interactive',
			icon: '🌊',
			components: [
				{
					name: 'Sankey',
					href: '/sankey',
					icon: '🌊',
					description: 'Expandable flow visualization',
					screenshot: screenshotPath('SankeyShot.png')
				},
				{
					name: 'FolderFiles',
					href: '/folderfiles',
					icon: '🗂️',
					description: '3D filing cabinet with drag-and-drop',
					screenshot: screenshotPath('FolderFilesShot.png')
				},
				{
					name: 'ExplainerCanvas',
					href: '/explainercanvas',
					icon: '🎓',
					description: 'Connected cards for concept mapping',
					screenshot: screenshotPath('ExplainerCanvasShot.png')
				}
			]
		},
		{
			name: 'Media & Images',
			icon: '🖼️',
			components: [
				{
					name: 'BeforeAfter',
					href: '/beforeafter',
					icon: '↔️',
					description: 'Draggable comparison slider',
					screenshot: screenshotPath('BeforeAfterShot.png')
				},
				{
					name: 'DomeGallery',
					href: '/domegallery',
					icon: '🎪',
					description: '3D spherical image gallery',
					screenshot: screenshotPath('DomeGalleryShot.png')
				},
				{
					name: 'PortfolioPhotographer',
					href: '/portfolio-photographer',
					icon: '📷',
					description: 'Editorial photographer-portfolio hero — wireframe lens background, drifting CSS-gradient photo reel, Halton-sequence focal scatter, serif display name, asset-free, reduced-motion-aware',
					screenshot: screenshotPath('PortfolioPhotographerShot.png')
				},
				{
					name: 'MembraneHero',
					href: '/membrane-hero',
					icon: '🌊',
					description: 'Warped-fluid-mesh full-bleed editorial hero — CSS conic gradient displaced by inline-SVG feTurbulence/feDisplacementMap, Lissajous focal dot, per-glyph deal-in headline, three palette presets, asset-free, reduced-motion-aware',
					screenshot: screenshotPath('MembraneHeroShot.png')
				},
				{
					name: 'Cardwall',
					href: '/cardwall',
					icon: '🎴',
					description: 'Full-bleed perspective billboard wall — multi-row marquee of CSS-gradient tiles drifting on a tilted 3D plane, click-to-pin interaction, Halton-sequence palette/label selection, asset-free, SSR-deterministic, reduced-motion-aware',
					screenshot: screenshotPath('CardwallShot.png')
				},
				{
					name: 'AuroraBackdrop',
					href: '/aurora-backdrop',
					icon: '🌌',
					description: 'Full-bleed pure-CSS aurora — four conic-gradient ribbons stack with mix-blend-mode screen and rotate at non-harmonic periods, fading at the corners through a soft radial veil. Three palettes (classic / dawn / deep), zero JS in the steady state, asset-free, prefers-reduced-motion safe',
					screenshot: screenshotPath('AuroraBackdropShot.png')
				},
				{
					name: 'MeshGradient',
					href: '/meshgradient',
					icon: '🎨',
					description: 'Ambient animated mesh-gradient backdrop — N (1–12) large blurry radial-gradient blobs drifting on a single filter:blur layer with cascaded CSS custom properties + @keyframes. Six named palettes (sunset / aurora / ember / cosmic / mint / monochrome) cycled per-blob, configurable blur and opacity, speed multiplier (0 freezes), zero JS animation loop, GPU-composited, prefers-reduced-motion safe',
					screenshot: screenshotPath('MeshGradientShot.png')
				},
				{
					name: 'SplitFlap',
					href: '/splitflap',
					icon: '🪧',
					description: 'Mechanical Solari-board character flip — 3D top-half drops down through intermediate charset positions, bottom catches the new glyph, per-character stagger creates a left-to-right cascade. Four charsets (digits/alpha/alnum/solari), forward or shortest traversal, asset-free, prefers-reduced-motion safe',
					screenshot: screenshotPath('SplitFlapShot.png')
				},
				{
					name: 'NeonSign',
					href: '/neonsign',
					icon: '💡',
					description: 'Glowing neon-tube text — five-stop CSS text-shadow stack creates the inner-tube core through to the outer atmospheric haze. Six palettes (pink / cyan / yellow / green / red / purple), deterministic flicker (none / subtle / broken), per-character burnt-out mode, on/off power state. Asset-free, prefers-reduced-motion safe',
					screenshot: screenshotPath('NeonSignShot.png')
				},
				{
					name: 'CRTScreen',
					href: '/crtscreen',
					icon: '🖥️',
					description: 'Retro CRT-monitor frame for arbitrary content — repeating-gradient scanlines, RGB chromatic aberration via channel-split text-shadow, optional vertical tracking roll, corner vignette. Four named profiles (amber / green-phosphor / broadcast / modern), curved-glass option, asset-free, prefers-reduced-motion safe',
					screenshot: screenshotPath('CRTScreenShot.png')
				},
				{
					name: 'CountUp',
					href: '/countup',
					icon: '💯',
					description: 'Number-animation primitive — eases a value from start → end on viewport entry, mount, or manual trigger. Five easings (linear / quad / cubic / quart / expo), locale-aware Intl.NumberFormat, prefix/suffix, decimal precision, optional flash-on-complete. Direction-agnostic for count-down, asset-free, prefers-reduced-motion safe',
					screenshot: screenshotPath('CountUpShot.png')
				},
				{
					name: 'Tilt3D',
					href: '/tilt3d',
					icon: '📐',
					description: 'Cursor-driven 3D rotation wrapper — Stripe / Linear / Apple product-page card depth. Pure CSS perspective + rotateX / rotateY, optional radial-gradient glare overlay tracks the pointer, three reset modes (spring / instant / none). Pure helpers exported for unit tests, prefers-reduced-motion safe at the stylesheet level',
					screenshot: screenshotPath('Tilt3DShot.png')
				},
				{
					name: 'GlitchText',
					href: '/glitchtext',
					icon: '📼',
					description: 'RGB-channel-split text glitch primitive — cyan / magenta offset clones drift behind the base layer, occasional clip-path tear bands slice and shove a horizontal strip. Three intensities (subtle / moderate / wild), three triggers (auto / hover with keyboard parity / one-shot viewport). Pure CSS pseudo-elements, deterministic per-seed jitter, prefers-reduced-motion safe',
					screenshot: screenshotPath('GlitchTextShot.png')
				},
				{
					name: 'Pendulum',
					href: '/pendulum',
					icon: '🪀',
					description: 'Damped-harmonic swing wrapper for any element — pivots from a configurable offset transform-origin under theta(t) = A·exp(-decay·t)·cos(2π·f·t). Four triggers (mount / viewport / click / manual), imperative swing() and stop(). Pure helpers exported for unit tests, auto-halts when envelope drops below 0.05°, prefers-reduced-motion safe at the stylesheet level',
					screenshot: screenshotPath('PendulumShot.png')
				},
				{
					name: 'HoloCard',
					href: '/holocard',
					icon: '🪩',
					description: 'Holographic-foil shimmer wrapper — cursor-driven CSS conic-gradient ring rotates with the cursor angle from center, plus a diagonal sheen overlay that tracks pointer position. Pokemon-card foil aesthetic. Three intensities (subtle / iridescent / cosmic), four palettes (rainbow / pastel / cosmic / gold). Composes with Tilt3D for full physical-collectible-card behaviour. Pure helpers exported, prefers-reduced-motion safe',
					screenshot: screenshotPath('HoloCardShot.png')
				},
				{
					name: 'ElectricBorder',
					href: '/electricborder',
					icon: '⚡',
					description: 'Animated electric-arc border — SVG feTurbulence + feDisplacementMap distort a stroked rectangle while a turbulence-frequency animation drives the live crackling motion. Three intensities (mild / crackling / lightning), three palettes (electric-blue / plasma-purple / volt-yellow). Per-instance unique filter IDs, zero per-frame JS, GPU-accelerated. Composes with Tilt3D for the full sci-fi UI panel feel. Pure helpers exported, prefers-reduced-motion safe',
					screenshot: screenshotPath('ElectricBorderShot.png')
				}
			]
		},
		{
			name: 'Forms & CRUD',
			icon: '📝',
			components: [
				{
					name: 'Forms',
					href: '/forms',
					icon: '📝',
					description: '14 reusable form field components',
					screenshot: screenshotPath('FormsShot.png')
				},
				{
					name: 'PinInput',
					href: '/pininput',
					icon: '🔢',
					description: 'Segmented OTP / verification code entry — auto-advance, paste-distribute, masking',
					screenshot: screenshotPath('PinInputShot.png')
				},
				{
					name: 'UploadDropzone',
					href: '/uploaddropzone',
					icon: '📤',
					description: 'Drag, paste and validate file uploads',
					screenshot: screenshotPath('UploadDropzoneShot.png')
				},
				{
					name: 'Editor',
					href: '/editor',
					icon: '✏️',
					description: 'Complete CRUD with database integration',
					screenshot: screenshotPath('EditorShot.png')
				}
			]
		},
		{
			name: 'Location Ops',
			icon: '🗺️',
			components: [
				{
					name: 'Maps',
					href: '/maps',
					icon: '🗺️',
					description: 'Interactive Leaflet maps with search',
					screenshot: screenshotPath('MapsShot.png')
				},
				{
					name: 'Location',
					href: '/location',
					icon: '📍',
					description: 'Locate me, delivery & routing demos',
					screenshot: screenshotPath('LocationShot.png')
				},
				{
					name: 'GlobePresence',
					href: '/globepresence',
					icon: '🌍',
					description: 'High-performance 3D globe visualization',
					screenshot: screenshotPath('GlobePresenceShot.png')
				},
				{
					name: 'GeoViz',
					href: '/geo',
					icon: '🌍',
					description: 'Choropleth and spike map visualization',
					screenshot: screenshotPath('GeoVizShot.png')
				}
			]
		},
		{
			name: 'Authentication',
			icon: '🔐',
			components: [
				{
					name: 'Auth Demo',
					href: '/auth',
					icon: '🔐',
					description: 'Complete Clerk integration showcase',
					screenshot: screenshotPath('AuthShot.png')
				},
				{
					name: 'Dashboard',
					href: '/dashboard',
					icon: '📊',
					description: 'Protected route example',
					screenshot: screenshotPath('DashboardShot.png')
				},
				{
					name: 'Profile',
					href: '/profile',
					icon: '👤',
					description: 'User profile management',
					screenshot: screenshotPath('ProfileShot.png')
				}
			]
		}
	];

	// Colour palette for category icons
	const iconColors: Record<string, { bg: string; text: string }> = {
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
		'➖': { bg: '#f3f4f6', text: '#374151' },
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
		'🎵': { bg: '#0d0d1a', text: '#38bdf8' }
	};

	// Convert components to Card format with screenshots
	function toCards(components: ComponentInfo[]): Card[] {
		return components.map((c) => {
			const colors = iconColors[c.icon] || { bg: '#f3f4f6', text: '#374151' };
			return {
				image: c.screenshot,
				title: c.name,
				content: `
				<p style="margin: 0 0 1rem 0; color: #4a5568; font-size: 0.9rem;">${c.description}</p>
				<a href="${c.href}"
				   class="view-demo-btn"
				   data-sveltekit-preload-data="tap"
				   style="
					display: inline-flex;
					align-items: center;
					gap: 0.375rem;
					padding: 0.5rem 1rem;
					background: ${colors.bg};
					color: ${colors.text};
					font-weight: 600;
					font-size: 0.85rem;
					text-decoration: none;
					border-radius: 6px;
					transition: all 0.2s ease;
					position: relative;
					z-index: 10;
				   ">
					View Demo <span style="margin-left: 0.25rem;">→</span>
				</a>
			`
			};
		});
	}

	// Total component count
	const totalComponents = categories.reduce((sum, cat) => sum + cat.components.length, 0);
</script>

<svelte:head>
	<title>Svelte 5 Component Templates</title>
	<meta
		name="description"
		content="Production-ready Svelte 5 component templates with modern interactions and animations"
	/>
</svelte:head>

<div class="page">
	<div class="container">
		<!-- Hero Section -->
		<section class="hero">
			<h1 class="hero-title">Svelte 5 Component Templates</h1>
			<p class="hero-subtitle">
				Modern interactions. Smooth animations. Clean design. A growing collection of
				production-ready Svelte 5 components, inspired by Magic UI, Aceternity, and Sikandar S.
				Bhide's animation-svelte.
			</p>
			<p class="hero-description">
				Rebuilt with runes, thoroughly documented, made accessible, with some original creations
				mixed in. Copy, customise, and use in your projects.
			</p>

			<div class="hero-ctas">
				<a href="#components" class="cta-primary">Browse {totalComponents} Components</a>
				<a
					href="https://github.com/Jktfe/tfeSvelteTemplates"
					target="_blank"
					rel="noopener noreferrer"
					class="cta-secondary"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					View on GitHub
				</a>
			</div>

			<p class="hero-credit">
				Built by <strong>@Jktfe</strong> with patient support from Claude. Feel free to use, adapt,
				and let me know where you use it!
			</p>
		</section>

		<!-- Category Stacks - Single Column -->
		<section id="components" class="categories-section">
			<h2 class="section-title">Component Categories</h2>
			<p class="section-subtitle">
				{totalComponents} components organised into {categories.length} categories. Hover to preview,
				click to select, then follow the link to see the demo.
			</p>

			<div class="categories-list">
				{#each categories as category (category.name)}
					<div class="category-card">
						<h3 class="category-header">
							<span class="category-icon">{category.icon}</span>
							{category.name}
							<span class="category-count">{category.components.length}</span>
						</h3>
						<div class="category-stack">
							<CardStack
								cards={toCards(category.components)}
								cardWidth={272}
								cardHeight={336}
							/>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Quick Start -->
		<section class="quickstart-section">
			<h2 class="section-title">Quick Start</h2>
			<div class="quickstart-steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Browse Components</h3>
						<p>Explore the categories above to find the components you need.</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Copy to Your Project</h3>
						<p>
							Copy component files from <code>src/lib/components/</code> to your project.
						</p>
					</div>
				</div>

				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Customise & Use</h3>
						<p>Import and use with your data. All props are fully typed and documented.</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Features -->
		<section class="features-section">
			<div class="features-grid">
				<div class="feature">
					<span class="feature-icon">⚡</span>
					<span class="feature-text">Svelte 5 Runes</span>
				</div>
				<div class="feature">
					<span class="feature-icon">📱</span>
					<span class="feature-text">Fully Responsive</span>
				</div>
				<div class="feature">
					<span class="feature-icon">♿</span>
					<span class="feature-text">Accessible</span>
				</div>
				<div class="feature">
					<span class="feature-icon">🚀</span>
					<span class="feature-text">Zero Deps Options</span>
				</div>
				<div class="feature">
					<span class="feature-icon">📝</span>
					<span class="feature-text">TypeScript</span>
				</div>
				<div class="feature">
					<span class="feature-icon">🎨</span>
					<span class="feature-text">Modern Design</span>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.page {
		padding: 3rem 0;
		overflow-x: hidden;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* Hero Section */
	.hero {
		text-align: center;
		margin-bottom: 5rem;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: #1a202c;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: #4a5568;
		margin: 0 auto 1rem;
		max-width: 700px;
		line-height: 1.6;
	}

	.hero-description {
		font-size: 1.1rem;
		color: #718096;
		margin: 0 auto 2rem;
		max-width: 600px;
		line-height: 1.6;
	}

	.hero-ctas {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 2rem;
	}

	.cta-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.cta-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(20, 110, 245, 0.4);
	}

	.cta-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: #ffffff;
		color: #24292f;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.cta-secondary:hover {
		border-color: #24292f;
		background: #f6f8fa;
	}

	.hero-credit {
		font-size: 0.95rem;
		color: #718096;
		margin: 0;
	}

	/* Section Titles */
	.section-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #1a202c;
		text-align: center;
	}

	.section-subtitle {
		font-size: 1.1rem;
		color: #718096;
		text-align: center;
		max-width: 600px;
		margin: 0 auto 3rem;
	}

	/* Categories List - Single Column */
	.categories-section {
		margin-bottom: 5rem;
	}

	.categories-list {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.category-card {
		background: #ffffff;
		border: 2px solid #e2e8f0;
		border-radius: 20px;
		padding: 2rem;
		transition: all 0.2s ease;
	}

	.category-card:hover {
		border-color: #146ef5;
		box-shadow: 0 8px 40px rgba(20, 110, 245, 0.1);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a202c;
	}

	.category-icon {
		font-size: 1.5rem;
	}

	.category-count {
		margin-left: auto;
		background: #edf2f7;
		color: #4a5568;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
	}

	.category-stack {
		height: 520px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Quick Start */
	.quickstart-section {
		margin-bottom: 4rem;
	}

	.quickstart-steps {
		max-width: 700px;
		margin: 0 auto;
	}

	.step {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.step:hover {
		border-color: #146ef5;
		transform: translateX(4px);
	}

	.step-number {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		font-size: 1.25rem;
		font-weight: 700;
		border-radius: 50%;
	}

	.step-content h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: #1a202c;
	}

	.step-content p {
		font-size: 0.95rem;
		color: #4a5568;
		margin: 0;
		line-height: 1.5;
	}

	.step-content code {
		padding: 0.125rem 0.375rem;
		background: #edf2f7;
		color: #146ef5;
		border-radius: 4px;
		font-size: 0.85rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	/* Features */
	.features-section {
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		margin: 0 -2rem;
		padding: 3rem 2rem;
		border-radius: 16px;
	}

	.features-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: #4a5568;
	}

	.feature-icon {
		font-size: 1.25rem;
	}

	.feature-text {
		font-size: 0.95rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page {
			padding: 2rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		.hero-description {
			font-size: 1rem;
		}

		.hero-ctas {
			flex-direction: column;
			align-items: center;
		}

		.cta-primary,
		.cta-secondary {
			width: 100%;
			max-width: 280px;
			justify-content: center;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.categories-list {
			gap: 1.5rem;
		}

		.category-card {
			padding: 1.25rem;
		}

		.category-header {
			font-size: 1.25rem;
		}

		.category-stack {
			height: 450px;
		}

		.step {
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
		}

		.features-section {
			margin: 0 -1rem;
			padding: 2rem 1rem;
		}

		.features-grid {
			gap: 1rem;
		}

		.feature {
			flex: 0 0 calc(50% - 0.5rem);
			justify-content: center;
		}
	}
</style>
