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
					name: 'MagicCard',
					href: '/magiccard',
					icon: '✨',
					description: 'Cards with dynamic spotlight effects',
					screenshot: screenshotPath('MagicCardShot.png')
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
					screenshot: screenshotPath('AnimatedBeanShot.png')
				}
			]
		},
		{
			name: 'Cards',
			icon: '🃏',
			components: [
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
		'💫': { bg: '#ede9fe', text: '#7c3aed' },
		'🎯': { bg: '#fce7f3', text: '#db2777' },
		'✨': { bg: '#fef3c7', text: '#d97706' },
		'🎭': { bg: '#f3e8ff', text: '#9333ea' },
		'🔗': { bg: '#dbeafe', text: '#2563eb' },
		'🃏': { bg: '#dcfce7', text: '#16a34a' },
		'🎴': { bg: '#fef3c7', text: '#ea580c' },
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
		'🌍': { bg: '#d1fae5', text: '#10b981' },
		'🔐': { bg: '#fce7f3', text: '#be185d' },
		'👤': { bg: '#e0e7ff', text: '#6366f1' }
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
				{#each categories as category}
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
