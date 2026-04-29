<!--
  ============================================================
  ReadingTOC

  🎯 WHAT IT DOES
  Auto-tracking table of contents for long-form content.
  Renders a hierarchical list of headings inside a target
  container, highlights the heading the user is currently
  reading, and smooth-scrolls to a section on click.

  Pairs with ScrollProgressBar — together they form a
  complete long-form reading toolkit:
    • ScrollProgressBar = "how much" (passive position)
    • ReadingTOC        = "where" (active section awareness)

  Tracking uses IntersectionObserver with a top-band
  rootMargin so the active item updates as the user scrolls
  past each heading. When nothing is intersecting (e.g.,
  scrolled past all visible headings) the most recently
  passed heading remains active.

  ✨ FEATURES
  • 3 variants — rail (vertical sidebar), top (horizontal
    pill row for short docs), drawer (mobile-collapsible
    floating button + tray)
  • 3 sizes — sm / md / lg
  • Auto-extracts h2/h3/h4 from a target selector or accepts
    pre-supplied `headings` array
  • Configurable heading levels via `levels` prop
  • Auto-IDs missing heading IDs (slugifies textContent)
  • Hierarchical tree from flat heading list
  • Smooth scroll on click; respects prefers-reduced-motion

  ♿ ACCESSIBILITY
  • role="navigation" + aria-label on the wrapper
  • aria-current="location" on the active item
  • Real <a href="#id"> links — work without JS, support
    open-in-new-tab, are keyboard reachable by default
  • Drawer toggle is a real <button> with aria-expanded /
    aria-controls referencing the panel id
  • prefers-reduced-motion → instant scrollIntoView, no
    smooth animation

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS +
  native IntersectionObserver.

  ⚡ PERFORMANCE
  • Single IntersectionObserver covers all tracked headings
  • Ratios cached in a Map and recomputed only on intersect
  • No scroll listener — observer fires only when a heading
    crosses a threshold
  • Tree built once when headings list changes (memoised
    via $derived)

  🎨 USAGE
  <ReadingTOC />

  <ReadingTOC
    target="#article"
    levels={[2, 3]}
    variant="rail"
    position="right"
  />

  <ReadingTOC
    headings={[
      { id: 'intro', text: 'Introduction', level: 2 },
      { id: 'usage', text: 'Usage', level: 2 }
    ]}
    variant="top"
  />

  📋 PROPS
  | Prop         | Type                                  | Default              |
  |--------------|---------------------------------------|----------------------|
  | target       | string (CSS selector)                 | 'main'               |
  | headings     | Heading[] (override extraction)       | undefined            |
  | levels       | number[] (h-tags to track)            | [2, 3, 4]            |
  | variant      | 'rail' \| 'top' \| 'drawer'           | 'rail'               |
  | size         | 'sm' \| 'md' \| 'lg'                  | 'md'                 |
  | position     | 'left' \| 'right' (rail variant)      | 'left'               |
  | title        | string                                | 'On this page'       |
  | aria-label   | string                                | 'Table of contents'  |
  | class        | string                                | ''                   |

  ============================================================
-->

<script lang="ts" module>
	export interface Heading {
		id: string;
		text: string;
		level: number;
	}

	export interface HeadingNode extends Heading {
		children: HeadingNode[];
	}

	export type ReadingTOCVariant = 'rail' | 'top' | 'drawer';
	export type ReadingTOCSize = 'sm' | 'md' | 'lg';

	export const VALID_VARIANTS: readonly ReadingTOCVariant[] = ['rail', 'top', 'drawer'];
	export const VALID_SIZES: readonly ReadingTOCSize[] = ['sm', 'md', 'lg'];

	export function isValidVariant(v: unknown): v is ReadingTOCVariant {
		return typeof v === 'string' && (VALID_VARIANTS as readonly string[]).includes(v);
	}
	export function pickVariant(v: unknown): ReadingTOCVariant {
		return isValidVariant(v) ? v : 'rail';
	}

	export function isValidSize(s: unknown): s is ReadingTOCSize {
		return typeof s === 'string' && (VALID_SIZES as readonly string[]).includes(s);
	}
	export function pickSize(s: unknown): ReadingTOCSize {
		return isValidSize(s) ? s : 'md';
	}

	/**
	 * Convert text into a URL-safe slug for use as a heading id.
	 * Strips diacritics, lowercases, collapses whitespace to '-',
	 * removes anything that isn't alphanumeric or hyphen.
	 */
	export function slugify(text: string): string {
		if (typeof text !== 'string' || text.length === 0) return '';
		return text
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9\s-]/g, '')
			.trim()
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	/**
	 * Build a hierarchical tree from a flat list of headings ordered by document position.
	 * Each heading becomes a child of the most recent heading with a smaller level number.
	 * Handles non-monotonic level sequences gracefully (e.g., h2 → h4 with no h3).
	 */
	export function buildHeadingTree(headings: Heading[]): HeadingNode[] {
		const root: HeadingNode[] = [];
		const stack: HeadingNode[] = [];

		for (const h of headings) {
			const node: HeadingNode = { id: h.id, text: h.text, level: h.level, children: [] };

			while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
				stack.pop();
			}

			if (stack.length === 0) {
				root.push(node);
			} else {
				stack[stack.length - 1].children.push(node);
			}
			stack.push(node);
		}

		return root;
	}

	/**
	 * Flatten a hierarchical tree back into a document-ordered list of headings.
	 * Inverse of buildHeadingTree (children are walked depth-first).
	 */
	export function flattenTree(nodes: HeadingNode[]): Heading[] {
		const out: Heading[] = [];
		function walk(ns: HeadingNode[]): void {
			for (const n of ns) {
				out.push({ id: n.id, text: n.text, level: n.level });
				walk(n.children);
			}
		}
		walk(nodes);
		return out;
	}

	export interface ResolverEntry {
		id: string;
		intersectionRatio: number;
		isIntersecting: boolean;
		top: number;
	}

	/**
	 * Determine which heading should be marked active given current intersection data.
	 *
	 * Strategy:
	 *   1. If any heading is intersecting → pick the one with the highest ratio
	 *      (tiebreak by document order — smallest top first).
	 *   2. Else if any heading has scrolled past the top of the viewport
	 *      (top < 0) → pick the most recently passed (largest top, i.e. closest to 0).
	 *   3. Else → return the supplied fallback (preserves last known active).
	 */
	export function resolveActiveHeading(
		entries: ResolverEntry[],
		fallback: string | null = null
	): string | null {
		if (!Array.isArray(entries) || entries.length === 0) return fallback;

		const visible = entries.filter((e) => e && e.isIntersecting);
		if (visible.length > 0) {
			visible.sort((a, b) => {
				if (b.intersectionRatio !== a.intersectionRatio) {
					return b.intersectionRatio - a.intersectionRatio;
				}
				return a.top - b.top;
			});
			return visible[0].id;
		}

		const passed = entries.filter((e) => e && e.top < 0);
		if (passed.length > 0) {
			passed.sort((a, b) => b.top - a.top);
			return passed[0].id;
		}

		return fallback;
	}

	/**
	 * Extract headings from a container element, auto-assigning IDs when missing.
	 * Mutates the DOM (assigns id) on heading elements that lack one — required
	 * so that <a href="#id"> links can target them.
	 */
	export function extractHeadings(
		container: HTMLElement,
		levels: number[] = [2, 3, 4]
	): Heading[] {
		if (!container || typeof container.querySelectorAll !== 'function') return [];
		const valid = levels.filter((l) => l >= 1 && l <= 6);
		if (valid.length === 0) return [];
		const selector = valid.map((l) => `h${l}`).join(',');
		const elements = container.querySelectorAll(selector);
		const headings: Heading[] = [];
		const seen: Record<string, number> = {};

		elements.forEach((el, i) => {
			const h = el as HTMLHeadingElement;
			const level = Number(h.tagName.charAt(1));
			const text = (h.textContent ?? '').trim();
			if (!text) return;
			let id = h.id;
			if (!id) {
				const base = slugify(text) || `heading-${i}`;
				const count = seen[base] ?? 0;
				id = count === 0 ? base : `${base}-${count}`;
				seen[base] = count + 1;
				h.id = id;
			}
			headings.push({ id, text, level });
		});

		return headings;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';

	interface Props {
		target?: string;
		headings?: Heading[];
		levels?: number[];
		variant?: ReadingTOCVariant | string;
		size?: ReadingTOCSize | string;
		position?: 'left' | 'right';
		title?: string;
		'aria-label'?: string;
		class?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props -- 'aria-label' false-positive on hyphenated key (destructured to ariaLabel)
	let {
		target = 'main',
		headings: providedHeadings,
		levels = [2, 3, 4],
		variant = 'rail',
		size = 'md',
		position = 'left',
		title = 'On this page',
		'aria-label': ariaLabel = 'Table of contents',
		class: className = ''
	}: Props = $props();

	const resolvedVariant = $derived(pickVariant(variant));
	const resolvedSize = $derived(pickSize(size));

	let extractedHeadings = $state<Heading[]>([]);
	const headingsToUse = $derived(providedHeadings ?? extractedHeadings);
	const tree = $derived(buildHeadingTree(headingsToUse));

	let activeId = $state<string | null>(null);
	let drawerOpen = $state(false);
	let reduced = $state(false);

	let observer: IntersectionObserver | null = null;
	// Plain object — non-reactive lookup keyed by heading id (svelte/prefer-svelte-reactivity)
	let entryCache: Record<string, ResolverEntry> = {};
	const panelId = `reading-toc-panel-${Math.random().toString(36).slice(2, 9)}`;

	function handleIntersect(entries: IntersectionObserverEntry[]): void {
		for (const e of entries) {
			entryCache[e.target.id] = {
				id: e.target.id,
				intersectionRatio: e.intersectionRatio,
				isIntersecting: e.isIntersecting,
				top: e.boundingClientRect.top
			};
		}
		activeId = resolveActiveHeading(Object.values(entryCache), activeId);
	}

	async function setupObserver(): Promise<void> {
		await tick();
		if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

		observer?.disconnect();
		entryCache = {};

		observer = new IntersectionObserver(handleIntersect, {
			rootMargin: '0px 0px -60% 0px',
			threshold: [0, 0.25, 0.5, 0.75, 1]
		});

		for (const h of headingsToUse) {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		}
	}

	function handleClick(e: MouseEvent | KeyboardEvent, id: string): void {
		e.preventDefault();
		const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
		if (!el) return;
		el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
		if (resolvedVariant === 'drawer') drawerOpen = false;
		activeId = id;
		if (typeof history !== 'undefined' && history.replaceState) {
			try {
				history.replaceState(null, '', `#${id}`);
			} catch {
				// ignore — some sandboxes throw on replaceState
			}
		}
	}

	function toggleDrawer(): void {
		drawerOpen = !drawerOpen;
	}

	function handleDrawerKey(e: KeyboardEvent): void {
		if (e.key === 'Escape' && drawerOpen) {
			drawerOpen = false;
		}
	}

	onMount(() => {
		reduced = isReducedMotion();

		if (!providedHeadings && typeof document !== 'undefined') {
			const containerEl = document.querySelector(target) as HTMLElement | null;
			if (containerEl) {
				extractedHeadings = extractHeadings(containerEl, levels);
			}
		}

		void setupObserver();
	});

	$effect(() => {
		// Re-observe when the headings list changes (e.g., consumer updated `headings`)
		void headingsToUse;
		if (typeof window !== 'undefined' && observer) {
			void setupObserver();
		}
	});

	onDestroy(() => {
		observer?.disconnect();
		observer = null;
		entryCache = {};
	});
</script>

<svelte:window onkeydown={handleDrawerKey} />

{#snippet itemList(nodes: HeadingNode[], depth: number)}
	<ul class="toc-list" data-depth={depth}>
		{#each nodes as node (node.id)}
			<li class="toc-item">
				<a
					href="#{node.id}"
					class="toc-link"
					class:active={activeId === node.id}
					aria-current={activeId === node.id ? 'location' : undefined}
					data-level={node.level}
					onclick={(e) => handleClick(e, node.id)}
				>
					{node.text}
				</a>
				{#if node.children.length > 0}
					{@render itemList(node.children, depth + 1)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#if resolvedVariant === 'drawer'}
	<div class="reading-toc drawer size-{resolvedSize} {className}" class:reduced>
		<button
			type="button"
			class="drawer-toggle"
			aria-expanded={drawerOpen}
			aria-controls={panelId}
			aria-label={drawerOpen ? 'Close table of contents' : 'Open table of contents'}
			onclick={toggleDrawer}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
				<path
					fill="currentColor"
					d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h10v2H3v-2zm0 4h14v2H3v-2z"
				/>
			</svg>
			<span>{title}</span>
		</button>
		{#if drawerOpen}
			<nav id={panelId} class="drawer-panel" aria-label={ariaLabel}>
				<div class="panel-header">
					<span class="panel-title">{title}</span>
					<button
						type="button"
						class="panel-close"
						aria-label="Close table of contents"
						onclick={toggleDrawer}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
							<path
								fill="currentColor"
								d="M6 6l12 12M18 6L6 18"
								stroke="currentColor"
								stroke-width="2"
							/>
						</svg>
					</button>
				</div>
				{#if tree.length > 0}
					{@render itemList(tree, 0)}
				{:else}
					<p class="empty">No headings found.</p>
				{/if}
			</nav>
		{/if}
	</div>
{:else if resolvedVariant === 'top'}
	<nav
		class="reading-toc top size-{resolvedSize} {className}"
		class:reduced
		aria-label={ariaLabel}
	>
		{#if tree.length > 0}
			<ul class="top-list">
				{#each tree as node (node.id)}
					<li>
						<a
							href="#{node.id}"
							class="toc-link"
							class:active={activeId === node.id}
							aria-current={activeId === node.id ? 'location' : undefined}
							onclick={(e) => handleClick(e, node.id)}
						>
							{node.text}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<span class="empty">No headings found.</span>
		{/if}
	</nav>
{:else}
	<nav
		class="reading-toc rail pos-{position} size-{resolvedSize} {className}"
		class:reduced
		aria-label={ariaLabel}
	>
		<div class="rail-header">{title}</div>
		{#if tree.length > 0}
			{@render itemList(tree, 0)}
		{:else}
			<p class="empty">No headings found.</p>
		{/if}
	</nav>
{/if}

<style>
	.reading-toc {
		--toc-fg: #1f2937;
		--toc-fg-muted: #6b7280;
		--toc-accent: #6366f1;
		--toc-bg: #ffffff;
		--toc-border: #e5e7eb;
		--toc-active-bg: rgba(99, 102, 241, 0.08);
		font-family: inherit;
		color: var(--toc-fg);
	}

	.reading-toc.size-sm {
		font-size: 0.8125rem;
	}
	.reading-toc.size-md {
		font-size: 0.875rem;
	}
	.reading-toc.size-lg {
		font-size: 1rem;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc-list[data-depth='1'],
	.toc-list[data-depth='2'],
	.toc-list[data-depth='3'] {
		padding-left: 0.875em;
		border-left: 1px solid var(--toc-border);
		margin-left: 0.25em;
	}

	.toc-item {
		margin: 0;
	}

	.toc-link {
		display: block;
		padding: 0.35em 0.5em;
		border-radius: 4px;
		color: var(--toc-fg-muted);
		text-decoration: none;
		line-height: 1.35;
		transition: color 120ms ease, background-color 120ms ease;
	}

	.toc-link:hover {
		color: var(--toc-fg);
		background-color: rgba(0, 0, 0, 0.03);
	}

	.toc-link:focus-visible {
		outline: 2px solid var(--toc-accent);
		outline-offset: 2px;
	}

	.toc-link.active {
		color: var(--toc-accent);
		background-color: var(--toc-active-bg);
		font-weight: 500;
	}

	.toc-link[data-level='3'] {
		font-size: 0.95em;
	}
	.toc-link[data-level='4'] {
		font-size: 0.9em;
		opacity: 0.85;
	}

	.empty {
		color: var(--toc-fg-muted);
		font-style: italic;
		padding: 0.5em;
		margin: 0;
	}

	/* Rail variant */
	.reading-toc.rail {
		position: sticky;
		top: 1.5rem;
		max-height: calc(100vh - 3rem);
		overflow-y: auto;
		padding: 0.75rem 1rem;
		background: var(--toc-bg);
		border-radius: 8px;
		border: 1px solid var(--toc-border);
	}

	.rail-header {
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--toc-fg-muted);
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--toc-border);
	}

	/* Top variant */
	.reading-toc.top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--toc-bg);
		border: 1px solid var(--toc-border);
		border-radius: 999px;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.top-list {
		display: flex;
		gap: 0.25rem;
		list-style: none;
		padding: 0;
		margin: 0;
		flex-wrap: nowrap;
	}

	.reading-toc.top .toc-link {
		white-space: nowrap;
		padding: 0.35em 0.85em;
		border-radius: 999px;
	}

	.reading-toc.top .toc-link.active {
		background-color: var(--toc-accent);
		color: #ffffff;
	}

	/* Drawer variant */
	.reading-toc.drawer {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 50;
	}

	.drawer-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1rem;
		background: var(--toc-accent);
		color: #ffffff;
		border: none;
		border-radius: 999px;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: transform 120ms ease, box-shadow 120ms ease;
	}

	.drawer-toggle:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.drawer-toggle:focus-visible {
		outline: 2px solid #ffffff;
		outline-offset: 2px;
	}

	.drawer-panel {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		right: 0;
		width: min(20rem, calc(100vw - 2rem));
		max-height: 60vh;
		overflow-y: auto;
		padding: 0.75rem 1rem 1rem;
		background: var(--toc-bg);
		border-radius: 12px;
		border: 1px solid var(--toc-border);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
		animation: toc-fade-in 150ms ease;
	}

	@keyframes toc-fade-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--toc-border);
	}

	.panel-title {
		font-weight: 600;
		font-size: 0.8125rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--toc-fg-muted);
	}

	.panel-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 6px;
		color: var(--toc-fg-muted);
		cursor: pointer;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.panel-close:hover {
		background: rgba(0, 0, 0, 0.04);
		color: var(--toc-fg);
	}

	.panel-close:focus-visible {
		outline: 2px solid var(--toc-accent);
		outline-offset: 2px;
	}

	/* Reduced motion */
	.reading-toc.reduced .drawer-panel,
	.reading-toc.reduced .toc-link {
		animation: none !important;
		transition: none !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.drawer-panel,
		.toc-link,
		.drawer-toggle {
			animation: none;
			transition: none;
		}
	}

	/* Dark theme support via CSS custom properties */
	@media (prefers-color-scheme: dark) {
		.reading-toc {
			--toc-fg: #e5e7eb;
			--toc-fg-muted: #9ca3af;
			--toc-bg: #1f2937;
			--toc-border: #374151;
			--toc-active-bg: rgba(99, 102, 241, 0.18);
		}
	}
</style>
