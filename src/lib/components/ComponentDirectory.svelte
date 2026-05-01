<!--
	============================================================
	ComponentDirectory - Dense Catalog Grid for Large Categories
	============================================================

	[CR] WHAT IT DOES
	Transforms a long component list into a scannable, filterable directory
	powered by GsapFlipGrid. It is used when CardStack becomes too dense for
	categories with more than nine entries.

	[NTL] THE SIMPLE VERSION
	When a section has too many cards, this turns it into a cleaner directory
	where visitors can scan, filter, and open the component they need.

	============================================================

	FEATURES:
	- Switches large categories away from CardStack clutter
	- Highlights the first few components in a featured strip
	- Maps catalog cards into Flip-grid items with source metadata
	- Labels light-only versus light-and-dark component support
	- Uses theme-aware surfaces for light and dark mode

	PERFECT FOR:
	- Homepage categories with 10+ components
	- Component discovery pages
	- Catalog sections that need real links and compact density

	NOT IDEAL FOR:
	- Tiny categories where CardStack has enough breathing room
	- Freeform editorial pages that need custom storytelling

	DEPENDENCIES:
	- GsapFlipGrid.svelte for the animated directory layout
	- No database or server dependency

	ACCESSIBILITY:
	- Links remain real anchors from the underlying grid cards
	- Filter and layout controls stay as native buttons
	- Directory copy is visible text, not image-only content

	WARNINGS:
	- Keep component metadata human-readable; this is the OSS browsing surface.

	============================================================
-->

<script lang="ts" module>
	export const COMPONENT_DIRECTORY_THRESHOLD = 9;

	export interface DirectoryComponentInfo {
		name: string;
		href: string;
		icon: string;
		description: string;
		screenshot: string;
		themeSupport?: 'light' | 'dual';
		source?: string;
	}

	export function shouldUseComponentDirectory(
		componentCount: number,
		threshold = COMPONENT_DIRECTORY_THRESHOLD
	): boolean {
		return componentCount > threshold;
	}

	export function selectFeaturedComponents(
		components: DirectoryComponentInfo[],
		count = 3
	): DirectoryComponentInfo[] {
		return components.slice(0, Math.max(0, count));
	}
</script>

<script lang="ts">
	import GsapFlipGrid, {
		type GsapFlipGridFilter,
		type GsapFlipGridItem
	} from '$lib/components/GsapFlipGrid.svelte';

	const ICON_COLORS: Record<string, { bg: string; text: string }> = {
		'🎞️': { bg: '#fff1eb', text: '#ff6a3d' },
		'🎬': { bg: '#e0f2fe', text: '#0369a1' },
		'📊': { bg: '#dcfce7', text: '#166534' },
		'💻': { bg: '#0d1117', text: '#79c0ff' },
		'🃏': { bg: '#f3e8ff', text: '#7e22ce' },
		'✨': { bg: '#fef3c7', text: '#b45309' },
		'🧲': { bg: '#fce7f3', text: '#be185d' },
		'🌌': { bg: '#1e1b4b', text: '#a5b4fc' },
		'📝': { bg: '#dbeafe', text: '#1d4ed8' },
		'🌍': { bg: '#dcfce7', text: '#15803d' }
	};

	function getIconColors(icon: string): { bg: string; text: string } {
		return ICON_COLORS[icon] ?? { bg: '#eef2ff', text: '#4f46e5' };
	}

	function themeSupportLabel(themeSupport: DirectoryComponentInfo['themeSupport']): string {
		return themeSupport === 'dual' ? 'Light and dark mode' : 'Light mode';
	}

	interface Props {
		components?: DirectoryComponentInfo[];
		categoryName?: string;
		featuredCount?: number;
		class?: string;
	}

	let {
		components = [],
		categoryName = 'Components',
		featuredCount = 3,
		class: className = ''
	}: Props = $props();

	const featured = $derived(selectFeaturedComponents(components, featuredCount));
	const directoryFilters: GsapFlipGridFilter[] = [
		{ id: 'dual', label: 'Light + dark' },
		{ id: 'light', label: 'Light only' }
	];
	const flipGridItems = $derived(components.map(toFlipGridItem));

	function toFlipGridItem(component: DirectoryComponentInfo): GsapFlipGridItem {
		const colors = getIconColors(component.icon);
		const themeSupport = component.themeSupport ?? 'light';
		return {
			id: component.href,
			title: component.name,
			description: component.description,
			href: component.href,
			icon: component.icon,
			image: component.screenshot,
			meta: component.source?.replace('src/lib/components/', '') ?? component.href.replace('/', ''),
			category: themeSupportLabel(themeSupport),
			filter: themeSupport,
			accent: colors.text
		};
	}
</script>

<div class={`component-directory ${className}`} data-count={components.length}>
	{#if featured.length > 0}
		<nav class="featured-strip" aria-label={`${categoryName} featured components`}>
			{#each featured as component (component.href)}
				{@const colors = getIconColors(component.icon)}
				<a
					class="featured-link"
					href={component.href}
					style={`--accent-bg: ${colors.bg}; --accent-text: ${colors.text};`}
					data-sveltekit-preload-data="tap"
				>
					<span class="featured-media">
						<img src={component.screenshot} alt={`${component.name} preview`} loading="lazy" />
					</span>
					<span class="featured-copy">
						<span class="featured-kicker">
							<span class="component-icon" aria-hidden="true">{component.icon}</span>
							{component.name}
						</span>
						<span class="theme-chip">{themeSupportLabel(component.themeSupport)}</span>
						<span class="featured-description">{component.description}</span>
					</span>
				</a>
			{/each}
		</nav>
	{/if}

	<nav class="directory-grid" aria-label={`${categoryName} component directory`}>
		<GsapFlipGrid
			items={flipGridItems}
			filters={directoryFilters}
			showHeader={false}
			initialDensity="compact"
			promoteOnClick={false}
			controlsLabel={`Filter ${categoryName} components`}
			class="directory-flip-grid"
		/>
	</nav>
</div>

<style>
	.component-directory {
		--directory-surface: #ffffff;
		--directory-surface-muted: #f7fafc;
		--directory-border: #d7e0ea;
		--directory-text: #111827;
		--directory-muted: #526071;
		--directory-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
		--directory-image-sheen-a: rgba(255, 255, 255, 0.82);
		--directory-image-sheen-b: rgba(255, 255, 255, 0.36);
		display: grid;
		gap: 1rem;
	}

	.featured-strip {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.875rem;
	}

	.featured-link {
		min-width: 0;
		overflow: hidden;
		border: 1px solid var(--directory-border);
		border-radius: 8px;
		background: var(--directory-surface);
		color: inherit;
		text-decoration: none;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.featured-link:hover,
	.featured-link:focus-visible {
		border-color: var(--accent-text);
		box-shadow: var(--directory-shadow);
		transform: translateY(-2px);
		outline: none;
	}

	.featured-media {
		display: block;
		height: 118px;
		overflow: hidden;
		background:
			linear-gradient(135deg, var(--directory-image-sheen-a), var(--directory-image-sheen-b)),
			var(--accent-bg);
	}

	.featured-media img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: center;
	}

	.featured-copy {
		display: grid;
		gap: 0.45rem;
		padding: 0.875rem;
	}

	.featured-kicker {
		min-width: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--directory-text);
		font-size: 0.95rem;
		font-weight: 750;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.component-icon {
		display: inline-grid;
		width: 1.7rem;
		height: 1.7rem;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 8px;
		background: var(--accent-bg);
		color: var(--accent-text);
		font-size: 0.95rem;
	}

	.featured-description {
		display: -webkit-box;
		overflow: hidden;
		color: var(--directory-muted);
		font-size: 0.84rem;
		line-height: 1.45;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.theme-chip {
		justify-self: start;
		width: fit-content;
		padding: 0.14rem 0.45rem;
		border: 1px solid color-mix(in srgb, var(--accent-text), transparent 76%);
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent-bg), var(--directory-surface-muted) 42%);
		color: var(--accent-text);
		font-size: 0.68rem;
		font-weight: 800;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.directory-grid {
		display: block;
	}

	@media (prefers-reduced-motion: reduce) {
		.featured-link {
			transition: none;
		}

		.featured-link:hover,
		.featured-link:focus-visible {
			transform: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.component-directory {
			--directory-surface: #182235;
			--directory-surface-muted: #263246;
			--directory-border: rgba(226, 232, 240, 0.14);
			--directory-text: #f8fafc;
			--directory-muted: #cbd5e1;
			--directory-shadow: 0 14px 36px rgba(0, 0, 0, 0.32);
			--directory-image-sheen-a: rgba(15, 23, 42, 0.12);
			--directory-image-sheen-b: rgba(15, 23, 42, 0.46);
		}
	}

	@media (max-width: 760px) {
		.featured-strip {
			grid-template-columns: 1fr;
		}

		.featured-media {
			height: 154px;
		}
	}
</style>
