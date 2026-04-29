<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { MenuCategory } from '$lib/types';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { ClerkProvider } from 'svelte-clerk';
	import type { LayoutData } from './$types';

	// Get layout data from server
	let { data, children } = $props<{ data: LayoutData; children: any }>();

	// Check if Clerk is configured from server data
	const isClerkConfigured = $derived(data.isClerkConfigured);

	// Initialize Vercel Analytics (client-side only)
	if (browser) {
		inject({ mode: dev ? 'development' : 'production' });
	}

	// Get current path for active menu highlighting
	let currentPath = $derived($page.url.pathname);

	// Helper to check if a path is active
	const isActive = (href: string) =>
		href === '/' ? currentPath === '/' : currentPath.startsWith(href);

	// Categorised navigation menu - components organised by purpose
	const menuCategories: MenuCategory[] = $derived([
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: isActive('/') }]
		},
		{
			name: 'Navigation',
			icon: '☰',
			items: [
				{ label: 'Navbar', href: '/navbar', icon: '☰', active: isActive('/navbar') },
				{ label: 'SpeedDial', href: '/speeddial', icon: '⚡', active: isActive('/speeddial') },
				{
					label: 'FloatingDock',
					href: '/floatingdock',
					icon: '🧲',
					active: isActive('/floatingdock')
				},
				{
					label: 'LiquidTabBar',
					href: '/liquidtabbar',
					icon: '💧',
					active: isActive('/liquidtabbar')
				}
			]
		},
		{
			name: 'Native UI',
			icon: '💫',
			items: [
				{ label: 'ShineBorder', href: '/shineborder', icon: '💫', active: isActive('/shineborder') },
				{ label: 'SwishButton', href: '/swishbutton', icon: '🎯', active: isActive('/swishbutton') },
				{
					label: 'MagneticButton',
					href: '/magneticbutton',
					icon: '🧲',
					active: isActive('/magneticbutton')
				},
				{ label: 'MagicCard', href: '/magiccard', icon: '✨', active: isActive('/magiccard') },
				{
					label: 'MorphingDialog',
					href: '/morphingdialog',
					icon: '🪄',
					active: isActive('/morphingdialog')
				},
				{
					label: 'ClickSpark',
					href: '/clickspark',
					icon: '💥',
					active: isActive('/clickspark')
				}
			]
		},
		{
			name: 'Helpful UX',
			icon: '🎭',
			items: [
				{ label: 'Marquee', href: '/marquee', icon: '🎭', active: isActive('/marquee') },
				{
					label: 'LinkImageHover',
					href: '/linkimagehover',
					icon: '🔗',
					active: isActive('/linkimagehover')
				},
				{
					label: 'AnimatedBeam',
					href: '/animatedbeam',
					icon: '✨',
					active: isActive('/animatedbeam')
				},
				{
					label: 'CommandPalette',
					href: '/commandpalette',
					icon: '🔎',
					active: isActive('/commandpalette')
				},
				{
					label: 'ToastNotification',
					href: '/toastnotification',
					icon: '🔔',
					active: isActive('/toastnotification')
				},
				{
					label: 'Typewriter',
					href: '/typewriter',
					icon: '⌨️',
					active: isActive('/typewriter')
				},
				{
					label: 'ShinyText',
					href: '/shinytext',
					icon: '✨',
					active: isActive('/shinytext')
				},
				{
					label: 'ScrambledText',
					href: '/scrambledtext',
					icon: '🔀',
					active: isActive('/scrambledtext')
				},
				{
					label: 'TrueFocus',
					href: '/truefocus',
					icon: '🔦',
					active: isActive('/truefocus')
				},
				{
					label: 'VariableProximity',
					href: '/variableproximity',
					icon: '🅰️',
					active: isActive('/variableproximity')
				},
				{
					label: 'AvatarStack',
					href: '/avatarstack',
					icon: '👥',
					active: isActive('/avatarstack')
				},
				{
					label: 'BadgePill',
					href: '/badgepill',
					icon: '🏷️',
					active: isActive('/badgepill')
				},
				{
					label: 'EmptyState',
					href: '/emptystate',
					icon: '📭',
					active: isActive('/emptystate')
				},
				{
					label: 'SkeletonLoader',
					href: '/skeletonloader',
					icon: '💀',
					active: isActive('/skeletonloader')
				},
				{
					label: 'ProgressRing',
					href: '/progressring',
					icon: '⭕',
					active: isActive('/progressring')
				},
				{
					label: 'ProgressBar',
					href: '/progressbar',
					icon: '📊',
					active: isActive('/progressbar')
				},
				{
					label: 'ScrollProgressBar',
					href: '/scrollprogressbar',
					icon: '📜',
					active: isActive('/scrollprogressbar')
				},
				{
					label: 'Spinner',
					href: '/spinner',
					icon: '🌀',
					active: isActive('/spinner')
				},
				{
					label: 'Drawer',
					href: '/drawer',
					icon: '📥',
					active: isActive('/drawer')
				},
				{
					label: 'KbdShortcut',
					href: '/kbdshortcut',
					icon: '🎹',
					active: isActive('/kbdshortcut')
				},
				{
					label: 'CopyButton',
					href: '/copybutton',
					icon: '📋',
					active: isActive('/copybutton')
				},
				{
					label: 'Stepper',
					href: '/stepper',
					icon: '🪜',
					active: isActive('/stepper')
				},
				{
					label: 'RatingStars',
					href: '/ratingstars',
					icon: '⭐',
					active: isActive('/ratingstars')
				},
				{
					label: 'AlertBanner',
					href: '/alertbanner',
					icon: '🚨',
					active: isActive('/alertbanner')
				},
				{
					label: 'FilterChips',
					href: '/filterchips',
					icon: '🎚️',
					active: isActive('/filterchips')
				},
				{
					label: 'SegmentedControl',
					href: '/segmentedcontrol',
					icon: '🎛️',
					active: isActive('/segmentedcontrol')
				},
				{
					label: 'Tooltip',
					href: '/tooltip',
					icon: '💬',
					active: isActive('/tooltip')
				},
				{
					label: 'Pagination',
					href: '/pagination',
					icon: '📑',
					active: isActive('/pagination')
				},
				{
					label: 'Breadcrumbs',
					href: '/breadcrumbs',
					icon: '🍞',
					active: isActive('/breadcrumbs')
				},
				{
					label: 'Accordion',
					href: '/accordion',
					icon: '🪗',
					active: isActive('/accordion')
				},
				{
					label: 'Switch',
					href: '/switch',
					icon: '🔘',
					active: isActive('/switch')
				},
				{
					label: 'Slider',
					href: '/slider',
					icon: '🎚',
					active: isActive('/slider')
				},
				{
					label: 'Divider',
					href: '/divider',
					icon: '➖',
					active: isActive('/divider')
				},
				{
					label: 'Tabs',
					href: '/tabs',
					icon: '🗂',
					active: isActive('/tabs')
				},
				{
					label: 'Avatar',
					href: '/avatar',
					icon: '🙂',
					active: isActive('/avatar')
				},
				{
					label: 'ScrollReveal',
					href: '/scrollreveal',
					icon: '🎬',
					active: isActive('/scrollreveal')
				},
				{
					label: 'OrbitalRing',
					href: '/orbitalring',
					icon: '🛸',
					active: isActive('/orbitalring')
				},
				{
					label: 'MagnetGrid',
					href: '/magnetgrid',
					icon: '🧲',
					active: isActive('/magnetgrid')
				},
				{
					label: 'PixelTrail',
					href: '/pixeltrail',
					icon: '🌠',
					active: isActive('/pixeltrail')
				},
				{
					label: 'NoiseField',
					href: '/noisefield',
					icon: '🌫️',
					active: isActive('/noisefield')
				},
				{
					label: 'TickerTape',
					href: '/tickertape',
					icon: '📈',
					active: isActive('/tickertape')
				},
				{
					label: 'PerspectiveGrid',
					href: '/perspectivegrid',
					icon: '🛣️',
					active: isActive('/perspectivegrid')
				},
				{
					label: 'EqualizerBars',
					href: '/equalizerbars',
					icon: '🎵',
					active: isActive('/equalizerbars')
				}
			]
		},
		{
			name: 'Time',
			icon: '⏱️',
			items: [
				{ label: 'Countdown', href: '/countdown', icon: '⏱️', active: isActive('/countdown') },
				{ label: 'Timeline', href: '/timeline', icon: '📅', active: isActive('/timeline') }
			]
		},
		{
			name: 'Cards',
			icon: '🃏',
			items: [
				{ label: 'CardStack', href: '/cardstack', icon: '🃏', active: isActive('/cardstack') },
				{ label: 'BentoGrid', href: '/bentogrid', icon: '🍱', active: isActive('/bentogrid') },
				{
					label: 'ExpandingCard',
					href: '/expandingcard',
					icon: '🎴',
					active: isActive('/expandingcard')
				},
				{
					label: 'ScratchToReveal',
					href: '/scratchtoreveal',
					icon: '🎰',
					active: isActive('/scratchtoreveal')
				},
				{
					label: 'StreamShowcase',
					href: '/streamshowcase',
					icon: '📺',
					active: isActive('/streamshowcase')
				}
			]
		},
		{
			name: 'Data Visualisation',
			icon: '📊',
			items: [
				{ label: 'DataGrid', href: '/datagrid', icon: '📊', active: isActive('/datagrid') },
				{
					label: 'CalendarHeatmap',
					href: '/calendarheatmap',
					icon: '📅',
					active: isActive('/calendarheatmap')
				},
				{
					label: 'BubblePacking',
					href: '/bubblepacking',
					icon: '🫧',
					active: isActive('/bubblepacking')
				},
				{
					label: 'RadialCluster',
					href: '/radialcluster',
					icon: '🎯',
					active: isActive('/radialcluster')
				},
				{ label: 'Sunburst', href: '/sunburst', icon: '☀️', active: isActive('/sunburst') },
				{ label: 'StatCard', href: '/statcard', icon: '📈', active: isActive('/statcard') },
				{ label: 'WordCloud', href: '/wordcloud', icon: '☁️', active: isActive('/wordcloud') }
			]
		},
		{
			name: 'Interactive',
			icon: '🌊',
			items: [
				{ label: 'Sankey', href: '/sankey', icon: '🌊', active: isActive('/sankey') },
				{ label: 'FolderFiles', href: '/folderfiles', icon: '🗂️', active: isActive('/folderfiles') },
				{
					label: 'ExplainerCanvas',
					href: '/explainercanvas',
					icon: '🎓',
					active: isActive('/explainercanvas')
				}
			]
		},
		{
			name: 'Media & Images',
			icon: '🖼️',
			items: [
				{ label: 'BeforeAfter', href: '/beforeafter', icon: '↔️', active: isActive('/beforeafter') },
				{ label: 'DomeGallery', href: '/domegallery', icon: '🎪', active: isActive('/domegallery') },
				{
					label: 'PortfolioPhotographer',
					href: '/portfolio-photographer',
					icon: '📷',
					active: isActive('/portfolio-photographer')
				},
				{
					label: 'MembraneHero',
					href: '/membrane-hero',
					icon: '🌊',
					active: isActive('/membrane-hero')
				},
				{
					label: 'Cardwall',
					href: '/cardwall',
					icon: '🎴',
					active: isActive('/cardwall')
				},
				{
					label: 'AuroraBackdrop',
					href: '/aurora-backdrop',
					icon: '🌌',
					active: isActive('/aurora-backdrop')
				},
				{
					label: 'MeshGradient',
					href: '/meshgradient',
					icon: '🎨',
					active: isActive('/meshgradient')
				},
				{
					label: 'SplitFlap',
					href: '/splitflap',
					icon: '🪧',
					active: isActive('/splitflap')
				},
				{
					label: 'NeonSign',
					href: '/neonsign',
					icon: '💡',
					active: isActive('/neonsign')
				},
				{
					label: 'CRTScreen',
					href: '/crtscreen',
					icon: '🖥️',
					active: isActive('/crtscreen')
				},
				{
					label: 'CountUp',
					href: '/countup',
					icon: '💯',
					active: isActive('/countup')
				},
				{
					label: 'Tilt3D',
					href: '/tilt3d',
					icon: '📐',
					active: isActive('/tilt3d')
				},
				{
					label: 'GlitchText',
					href: '/glitchtext',
					icon: '📼',
					active: isActive('/glitchtext')
				},
				{
					label: 'Pendulum',
					href: '/pendulum',
					icon: '🪀',
					active: isActive('/pendulum')
				},
				{
					label: 'HoloCard',
					href: '/holocard',
					icon: '🪩',
					active: isActive('/holocard')
				},
				{
					label: 'ElectricBorder',
					href: '/electricborder',
					icon: '⚡',
					active: isActive('/electricborder')
				}
			]
		},
		{
			name: 'Forms & CRUD',
			icon: '📝',
			items: [
				{ label: 'Forms', href: '/forms', icon: '📝', active: isActive('/forms') },
				{
					label: 'PinInput',
					href: '/pininput',
					icon: '🔢',
					active: isActive('/pininput')
				},
				{
					label: 'UploadDropzone',
					href: '/uploaddropzone',
					icon: '📤',
					active: isActive('/uploaddropzone')
				},
				{ label: 'Editor', href: '/editor', icon: '✏️', active: isActive('/editor') }
			]
		},
		{
			name: 'Location Ops',
			icon: '🗺️',
			items: [
				{ label: 'Maps', href: '/maps', icon: '🗺️', active: isActive('/maps') },
				{ label: 'Location', href: '/location', icon: '📍', active: isActive('/location') },
				{ label: 'GlobePresence', href: '/globepresence', icon: '🌍', active: isActive('/globepresence') },
				{ label: 'GeoViz', href: '/geo', icon: '🌍', active: isActive('/geo') }
			]
		},
		{
			name: 'Authentication',
			icon: '🔐',
			items: [
				{ label: 'Auth Demo', href: '/auth', icon: '🔐', active: isActive('/auth') },
				{ label: 'Dashboard', href: '/dashboard', icon: '📊', active: isActive('/dashboard') },
				{ label: 'Profile', href: '/profile', icon: '👤', active: isActive('/profile') }
			]
		}
	]);

	// Determine current page title based on path
	let currentPageTitle = $derived.by(() => {
		for (const category of menuCategories) {
			const activeItem = category.items.find((item) => item.active);
			if (activeItem) return activeItem.label;
		}
		return 'Svelte Templates';
	});
</script>

{#if isClerkConfigured}
	<!-- Full Clerk authentication when configured -->
	<ClerkProvider>
		<div class="app">
			<Navbar {menuCategories} {currentPageTitle} {isClerkConfigured} githubUrl="https://github.com/Jktfe/tfeSvelteTemplates" />

			<main class="main">
				{@render children()}
			</main>

			<footer class="footer">
				<div class="container">
					<p class="footer-text">
						Built with <a href="https://svelte.dev" target="_blank" rel="noopener">Svelte 5</a> •
						<a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit</a> •
						<a href="https://www.typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>
					</p>
				</div>
			</footer>
		</div>
	</ClerkProvider>
{:else}
	<!-- Demo mode when Clerk is not configured -->
	<div class="app">
		<Navbar {menuCategories} {currentPageTitle} {isClerkConfigured} githubUrl="https://github.com/Jktfe/tfeSvelteTemplates" />

		<main class="main">
			{@render children()}
		</main>

		<footer class="footer">
			<div class="container">
				<p class="footer-text">
					Built with <a href="https://svelte.dev" target="_blank" rel="noopener">Svelte 5</a> •
					<a href="https://kit.svelte.dev" target="_blank" rel="noopener">SvelteKit</a> •
					<a href="https://www.typescriptlang.org" target="_blank" rel="noopener">TypeScript</a>
				</p>
			</div>
		</footer>
	</div>
{/if}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #ffffff;
		color: #1a202c;
		line-height: 1.6;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.main {
		flex: 1;
		width: 100%;
	}

	.footer {
		background-color: #f7fafc;
		border-top: 1px solid #e2e8f0;
		padding: 2rem 0;
		margin-top: 4rem;
	}

	.footer-text {
		text-align: center;
		color: #718096;
		font-size: 0.9rem;
		margin: 0;
	}

	.footer-text a {
		color: #146ef5;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-text a:hover {
		color: #0c5dd6;
		text-decoration: underline;
	}

	/* Responsive: Mobile */
	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}
	}
</style>
