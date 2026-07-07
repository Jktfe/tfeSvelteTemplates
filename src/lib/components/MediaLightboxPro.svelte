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
	let panelEl = $state<HTMLElement | null>(null);
	let previouslyFocused: HTMLElement | null = null;

	const active = $derived(items[activeIndex]);

	function openAt(index: number) {
		previouslyFocused = document.activeElement as HTMLElement | null;
		activeIndex = index;
		open = true;
	}

	function close() {
		open = false;
		// Restore focus to the thumbnail that opened the lightbox.
		previouslyFocused?.focus();
		previouslyFocused = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			activeIndex = previousMediaIndex(activeIndex, items.length);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			activeIndex = nextMediaIndex(activeIndex, items.length);
		}
	}

	// On open: move focus into the dialog and lock body scroll; restore on close.
	$effect(() => {
		if (!open || typeof document === 'undefined') return;
		panelEl?.focus();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

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
			<div class="ml-panel" bind:this={panelEl} tabindex="-1">
				<header>
					<div>
						<p>{mediaCounter(activeIndex, items.length)}</p>
						<h3>{active.title}</h3>
					</div>
					<button type="button" aria-label="Close lightbox" onclick={close}>Close</button>
				</header>

				<figure>
					{#if active.type === 'video'}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video src={active.src} controls aria-label={active.alt}></video>
					{:else}
						<img src={active.src} alt={active.alt} />
					{/if}
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

	.ml-panel figure img,
	.ml-panel figure video {
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
