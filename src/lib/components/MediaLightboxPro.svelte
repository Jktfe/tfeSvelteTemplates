<!--
  ============================================================
  MediaLightboxPro — Thumbnail Gallery with Modal Viewer
  ============================================================
  WHAT — A responsive thumbnail grid that opens any item in a larger
  viewer with title, caption, counter and wrapping previous/next.

  WHY — Dependency-free screenshot or media proof for component docs,
  QA dashboards and release notes.

  FEATURES
  - Lazy-loaded thumbnails in an auto-fit grid
  - Viewer with "3 / 8" counter and optional caption
  - Previous/next wrap round the ends
  - Pure helpers exported: nextMediaIndex, previousMediaIndex, mediaCounter

  ACCESSIBILITY
  - Thumbnails and controls are native buttons
  - Viewer uses role="dialog" with aria-modal and an aria-label
  - Close button has an explicit aria-label
  - Escape-to-close and focus trapping are not built in — add them if
    you use it as a true modal
  - No motion

  DEPENDENCIES — Zero. Pure Svelte 5 runes and scoped CSS.

  PERFORMANCE — Only the active item renders at full size; thumbnails
  use loading="lazy".

  USAGE
      <MediaLightboxPro items={[
        { id: 'home', title: 'Home', src: '/shots/home.png', alt: 'Home page', caption: 'Light theme' }
      ]} />

  PROPS
  | Prop  | Type                | Default              | Description |
  |-------|---------------------|----------------------|-------------|
  | items | MediaLightboxItem[] | required             | Media (id, title, src, alt, caption?, type?) |
  | title | string              | 'Media lightbox pro' | Heading |
  | class | string              | ''                   | Extra classes on the root |
  ============================================================
-->
<script lang="ts" module>
	export interface MediaLightboxItem {
		id: string;
		title: string;
		src: string;
		alt: string;
		caption?: string;
		type?: 'image' | 'video';
	}

	export function nextMediaIndex(current: number, length: number): number {
		if (length <= 0) return 0;
		return (current + 1) % length;
	}

	export function previousMediaIndex(current: number, length: number): number {
		if (length <= 0) return 0;
		return (current - 1 + length) % length;
	}

	export function mediaCounter(index: number, length: number): string {
		return length <= 0 ? '0 / 0' : `${index + 1} / ${length}`;
	}
</script>

<script lang="ts">
	interface Props {
		items: MediaLightboxItem[];
		title?: string;
		class?: string;
	}

	let { items, title = 'Media lightbox pro', class: extraClass = '' }: Props = $props();

	let open = $state(false);
	let activeIndex = $state(0);

	const active = $derived(items[activeIndex]);

	function openAt(index: number) {
		activeIndex = index;
		open = true;
	}
</script>

<section class="media-lightbox {extraClass}" aria-labelledby="media-lightbox-title">
	<header>
		<p>Media viewer</p>
		<h2 id="media-lightbox-title">{title}</h2>
	</header>

	<div class="ml-grid">
		{#each items as item, index (item.id)}
			<button type="button" onclick={() => openAt(index)}>
				<img src={item.src} alt={item.alt} loading="lazy" />
				<span>{item.title}</span>
			</button>
		{/each}
	</div>

	{#if open && active}
		<div class="ml-dialog" role="dialog" aria-modal="true" aria-label={active.title}>
			<div class="ml-panel">
				<header>
					<div>
						<p>{mediaCounter(activeIndex, items.length)}</p>
						<h3>{active.title}</h3>
					</div>
					<button type="button" aria-label="Close lightbox" onclick={() => (open = false)}>Close</button>
				</header>

				<figure>
					<img src={active.src} alt={active.alt} />
					{#if active.caption}<figcaption>{active.caption}</figcaption>{/if}
				</figure>

				<nav aria-label="Media controls">
					<button type="button" onclick={() => (activeIndex = previousMediaIndex(activeIndex, items.length))}>Previous</button>
					<button type="button" onclick={() => (activeIndex = nextMediaIndex(activeIndex, items.length))}>Next</button>
				</nav>
			</div>
		</div>
	{/if}
</section>

<style>
	.media-lightbox {
		display: grid;
		gap: 18px;
	}

	.media-lightbox > header p,
	.ml-panel header p {
		margin: 0 0 6px;
		color: #be123c;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.media-lightbox h2,
	.media-lightbox h3 {
		margin: 0;
		font-family: var(--font-display, Georgia, serif);
	}

	.media-lightbox h2 {
		font-size: clamp(1.7rem, 3vw, 2.5rem);
		line-height: 1;
	}

	.ml-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}

	.ml-grid button {
		display: grid;
		gap: 8px;
		padding: 8px;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.ml-grid img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: 4px;
		background: #f1f5f9;
	}

	.ml-grid span {
		font-weight: 850;
	}

	.ml-dialog {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(15, 23, 42, 0.74);
	}

	.ml-panel {
		display: grid;
		gap: 14px;
		width: min(960px, 100%);
		max-height: min(900px, 92vh);
		padding: 16px;
		overflow: auto;
		border-radius: 6px;
		background: white;
		color: #111827;
	}

	.ml-panel header,
	.ml-panel nav {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: center;
	}

	.ml-panel button {
		min-height: 38px;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		background: #f8fafc;
		color: #111827;
		padding: 0 12px;
		font-weight: 850;
		cursor: pointer;
	}

	.ml-panel figure {
		display: grid;
		gap: 8px;
		margin: 0;
	}

	.ml-panel figure img {
		width: 100%;
		max-height: 64vh;
		object-fit: contain;
		background: #0f172a;
		border-radius: 4px;
	}

	.ml-panel figcaption {
		color: #475569;
	}
</style>
