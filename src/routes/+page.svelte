<!--
	Component Template Library Home Page

	Component library homepage.
	Small categories use interactive stacks; larger categories use a dense directory.
-->

<script lang="ts">
	import CardStack from '$lib/components/CardStack.svelte';
	import ComponentDirectory, {
		shouldUseComponentDirectory
	} from '$lib/components/ComponentDirectory.svelte';
	import {
		componentCategories,
		componentCount,
		getIconColors,
		type ComponentCatalogItem
	} from '$lib/componentCatalog';
	import type { Card } from '$lib/types';

	const categories = componentCategories;
	const totalComponents = componentCount;

	function toCards(components: ComponentCatalogItem[]): Card[] {
		return components.map((component) => {
			const colors = getIconColors(component.icon);

			return {
				image: component.screenshot,
				title: component.name,
				content: `
					<p style="margin: 0 0 1rem 0; color: #4a5568; font-size: 0.9rem;">${component.description}</p>
					<a href="${component.href}"
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
				<a href="/gsap-suite" class="cta-gsap">Explore GSAP Suite</a>
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

		<section class="gsap-suite-callout" aria-labelledby="gsap-suite-callout-title">
			<div>
				<p class="callout-kicker">GSAP suite</p>
				<h2 id="gsap-suite-callout-title">Animation primitives built for copy-and-ship agents</h2>
				<p>
					SplitText heroes, reveal wrappers, kinetic canvas fields, fan decks, and the new Flip grid
					are grouped on one route with provenance chips and copy-for-your-agent prompts.
				</p>
			</div>
			<a href="/gsap-suite" class="callout-link">Open /gsap-suite</a>
		</section>

		<!-- Component Categories -->
		<section id="components" class="categories-section">
			<h2 class="section-title">Component Categories</h2>
			<p class="section-subtitle">
				{totalComponents} components organised into {categories.length} categories with compact
				directories for larger groups and interactive stacks for smaller sets.
			</p>

			<div class="categories-list">
				{#each categories as category (category.name)}
					<div class="category-card">
						<h3 class="category-header">
							<span class="category-icon">{category.icon}</span>
							{category.name}
							<span class="category-count">{category.components.length}</span>
						</h3>
						<p class="category-summary">{category.summary}</p>
						{#if shouldUseComponentDirectory(category.components.length)}
							<ComponentDirectory
								components={category.components}
								categoryName={category.name}
							/>
						{:else}
							<div class="category-stack">
								<CardStack
									cards={toCards(category.components)}
									cardWidth={272}
									cardHeight={336}
								/>
							</div>
						{/if}
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
		--home-bg: #f7fafc;
		--home-surface: #ffffff;
		--home-surface-raised: #ffffff;
		--home-surface-muted: #edf2f7;
		--home-text: #1a202c;
		--home-text-muted: #4a5568;
		--home-text-subtle: #718096;
		--home-border: #dfe7f2;
		--home-border-soft: #e2e8f0;
		--home-primary: #146ef5;
		--home-shadow: 0 10px 34px rgba(20, 110, 245, 0.08);
		background: var(--home-bg);
		color: var(--home-text);
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
		color: var(--home-text);
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--home-text-muted);
		margin: 0 auto 1rem;
		max-width: 700px;
		line-height: 1.6;
	}

	.hero-description {
		font-size: 1.1rem;
		color: var(--home-text-subtle);
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

	.cta-gsap {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 1.5rem;
		background: #0c0d10;
		color: #f8fafc;
		font-weight: 700;
		font-size: 1rem;
		text-decoration: none;
		border: 2px solid #0c0d10;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.cta-gsap:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(255, 106, 61, 0.28);
	}

	.cta-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: var(--home-surface-raised);
		color: var(--home-text);
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		border: 2px solid var(--home-border-soft);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.cta-secondary:hover {
		border-color: var(--home-text);
		background: var(--home-surface-muted);
	}

	.hero-credit {
		font-size: 0.95rem;
		color: var(--home-text-subtle);
		margin: 0;
	}

	.gsap-suite-callout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1.5rem;
		margin: -2rem 0 4rem;
		padding: 1.5rem;
		border: 1px solid rgba(255, 106, 61, 0.34);
		border-radius: 8px;
		background:
			linear-gradient(135deg, rgba(255, 106, 61, 0.11), rgba(94, 179, 255, 0.1)),
			#ffffff;
		box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
	}

	.callout-kicker,
	.gsap-suite-callout h2,
	.gsap-suite-callout p {
		margin: 0;
	}

	.callout-kicker {
		color: #d94e24;
		font-size: 0.78rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.gsap-suite-callout h2 {
		margin-top: 0.35rem;
		color: #111827;
		font-size: clamp(1.35rem, 3vw, 2rem);
		line-height: 1.12;
	}

	.gsap-suite-callout p:not(.callout-kicker) {
		max-width: 66ch;
		margin-top: 0.65rem;
		color: #4b5563;
		line-height: 1.55;
	}

	.callout-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0.7rem 1rem;
		border-radius: 8px;
		background: #ff6a3d;
		color: #0c0d10;
		font-weight: 800;
		text-decoration: none;
		white-space: nowrap;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.callout-link:hover,
	.callout-link:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 12px 26px rgba(255, 106, 61, 0.32);
		outline: none;
	}

	/* Section Titles */
	.section-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: var(--home-text);
		text-align: center;
	}

	.section-subtitle {
		font-size: 1.1rem;
		color: var(--home-text-subtle);
		text-align: center;
		max-width: 600px;
		margin: 0 auto 3rem;
	}

	/* Component Categories */
	.categories-section {
		margin-bottom: 5rem;
	}

	.categories-list {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.category-card {
		background: var(--home-surface-raised);
		border: 1px solid var(--home-border);
		border-radius: 8px;
		padding: 2rem;
		transition: all 0.2s ease;
	}

	.category-card:hover {
		border-color: var(--home-primary);
		box-shadow: var(--home-shadow);
	}

	.category-header {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--home-text);
		line-height: 1.2;
	}

	.category-icon {
		font-size: 1.5rem;
	}

	.category-count {
		margin-left: auto;
		background: var(--home-surface-muted);
		color: var(--home-text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
	}

	.category-summary {
		margin: 0 0 1.5rem;
		color: var(--home-text-subtle);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.category-stack {
		height: 520px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
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
		background: var(--home-surface-raised);
		border: 1px solid var(--home-border-soft);
		border-radius: 12px;
		transition: all 0.2s ease;
	}

	.step:hover {
		border-color: var(--home-primary);
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
		color: var(--home-text);
	}

	.step-content p {
		font-size: 0.95rem;
		color: var(--home-text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.step-content code {
		padding: 0.125rem 0.375rem;
		background: var(--home-surface-muted);
		color: var(--home-primary);
		border-radius: 4px;
		font-size: 0.85rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	/* Features */
	.features-section {
		background: linear-gradient(135deg, var(--home-surface) 0%, var(--home-surface-muted) 100%);
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
		color: var(--home-text-muted);
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
		.cta-gsap,
		.cta-secondary {
			width: 100%;
			max-width: 280px;
			justify-content: center;
		}

		.gsap-suite-callout {
			grid-template-columns: 1fr;
			margin: -2rem 0 3rem;
			padding: 1.25rem;
		}

		.callout-link {
			width: 100%;
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

		.category-count {
			margin-left: 0;
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

	@media (prefers-color-scheme: dark) {
		.page {
			--home-bg: #0f172a;
			--home-surface: #111827;
			--home-surface-raised: #182235;
			--home-surface-muted: #263246;
			--home-text: #f8fafc;
			--home-text-muted: #cbd5e1;
			--home-text-subtle: #94a3b8;
			--home-border: rgba(226, 232, 240, 0.14);
			--home-border-soft: rgba(226, 232, 240, 0.12);
			--home-shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
		}

		.gsap-suite-callout {
			border-color: rgba(255, 106, 61, 0.42);
			background:
				linear-gradient(135deg, rgba(255, 106, 61, 0.16), rgba(94, 179, 255, 0.12)),
				#111827;
			box-shadow: 0 18px 50px rgba(0, 0, 0, 0.32);
		}

		.gsap-suite-callout h2 {
			color: #f8fafc;
		}

		.gsap-suite-callout p:not(.callout-kicker) {
			color: #cbd5e1;
		}

		.cta-gsap {
			background: #f8fafc;
			color: #0c0d10;
			border-color: #f8fafc;
		}
	}
</style>
