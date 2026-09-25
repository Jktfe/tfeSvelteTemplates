<!--
  ===========================================================
  MediaLightboxPro
  ===========================================================
  WHAT — a thumbnail gallery that opens any item in a modal viewer
  with previous/next navigation, a counter and an optional caption.

  WHY — screenshot proof, QA evidence and portfolio galleries all need
  "click to enlarge" without dragging in a lightbox library.

  FEATURES
  - Thumbnail grid of buttons (one per item)
  - Modal viewer with wrap-around previous/next controls
  - Counter ("2 / 5") and optional caption per item
  - Body scroll lock while the viewer is open

  ACCESSIBILITY
  - role="dialog" + aria-modal="true", labelled by the item title
  - Focus moves into the dialog on open and is trapped there (Tab and
    Shift+Tab cycle through the dialog's controls only)
  - Escape closes; focus returns to the thumbnail that opened it
  - ArrowLeft / ArrowRight step through items when there is more than one
  - Previous/next controls are hidden when there is only one item
  - Visible focus rings; the fade-in honours prefers-reduced-motion

  DEPENDENCIES — zero.

  PERFORMANCE — thumbnails use loading="lazy"; only the active item's
  full image is in the DOM while the viewer is open.

  USAGE
      <MediaLightboxPro items={shots} title="Visual proof" />

  PROPS
  | Prop  | Type                | Default              | Description                  |
  |-------|---------------------|----------------------|------------------------------|
  | items | MediaLightboxItem[] | required             | Items to show                |
  | title | string              | 'Media lightbox pro' | Heading above the gallery    |
  | class | string              | ''                   | Extra classes on the wrapper |
  ===========================================================
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
	import { tick } from 'svelte';

	interface Props {
		items: MediaLightboxItem[];
		title?: string;
		class?: string;
	}

	let { items, title = 'Media lightbox pro', class: extraClass = '' }: Props = $props();

	// Same list browsers treat as tabbable — used for the focus trap.
	const TABBABLE_SELECTOR =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	let open = $state(false);
	let activeIndex = $state(0);
	let panelEl: HTMLDivElement | undefined = $state();

	// Remember who opened the viewer so we can hand focus back on close —
	// otherwise keyboard users are dumped at the top of the document.
	let returnFocusTo: HTMLElement | null = null;
	let previousBodyOverflow = '';

	const active = $derived(items[activeIndex]);
	const hasMultiple = $derived(items.length > 1);

	async function openAt(index: number, event?: MouseEvent) {
		returnFocusTo =
			(event?.currentTarget as HTMLElement | null) ??
			(typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);
		activeIndex = index;
		open = true;
		if (typeof document !== 'undefined') {
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
		await tick();
		panelEl?.querySelector<HTMLElement>('[data-ml-close]')?.focus();
	}

	function close() {
		if (!open) return;
		open = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = previousBodyOverflow;
		}
		const target = returnFocusTo;
		returnFocusTo = null;
		// Only restore focus to an element that still exists in the page.
		if (target && typeof document !== 'undefined' && document.body.contains(target)) {
			target.focus();
		}
	}

	function showPrevious() {
		activeIndex = previousMediaIndex(activeIndex, items.length);
	}

	function showNext() {
		activeIndex = nextMediaIndex(activeIndex, items.length);
	}

	function trapTab(event: KeyboardEvent) {
		if (!panelEl) return;
		const tabbables = Array.from(panelEl.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
		if (tabbables.length === 0) {
			event.preventDefault();
			return;
		}
		const first = tabbables[0];
		const last = tabbables[tabbables.length - 1];
		const current = document.activeElement;
		// If focus has somehow slipped outside the panel, pull it back in.
		const outside = !panelEl.contains(current);
		if (event.shiftKey && (current === first || outside)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (current === last || outside)) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				close();
				break;
			case 'ArrowLeft':
				if (!hasMultiple) return;
				event.preventDefault();
				showPrevious();
				break;
			case 'ArrowRight':
				if (!hasMultiple) return;
				event.preventDefault();
				showNext();
				break;
			case 'Tab':
				trapTab(event);
				break;
		}
	}

	// If the component unmounts while open, don't leave the page scroll-locked.
	$effect(() => {
		return () => {
			if (open && typeof document !== 'undefined') {
				document.body.style.overflow = previousBodyOverflow;
			}
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
			<button type="button" onclick={(event) => openAt(index, event)}>
				<img src={item.src} alt={item.alt} loading="lazy" />
				<span>{item.title}</span>
			</button>
		{/each}
	</div>

	{#if open && active}
		<!-- Clicking the dimmed backdrop (but not the panel) closes the viewer;
		     the keyboard equivalent is Escape, handled on the window. -->
		<div
			class="ml-dialog"
			role="presentation"
			onclick={(event) => {
				if (event.target === event.currentTarget) close();
			}}
		>
			<div
				bind:this={panelEl}
				class="ml-panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="media-lightbox-active-title"
				tabindex="-1"
			>
				<header>
					<div>
						<p>{mediaCounter(activeIndex, items.length)}</p>
						<h3 id="media-lightbox-active-title">{active.title}</h3>
					</div>
					<button type="button" data-ml-close aria-label="Close lightbox" onclick={close}>Close</button>
				</header>

				<figure>
					<img src={active.src} alt={active.alt} />
					{#if active.caption}<figcaption>{active.caption}</figcaption>{/if}
				</figure>

				{#if hasMultiple}
					<nav aria-label="Media controls">
						<button type="button" aria-label="Previous item" onclick={showPrevious}>Previous</button>
						<button type="button" aria-label="Next item" onclick={showNext}>Next</button>
					</nav>
				{/if}
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
		animation: ml-fade-in 160ms ease-out;
	}

	@keyframes ml-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ml-dialog {
			animation: none;
		}
	}

	.ml-grid button:focus-visible,
	.ml-panel button:focus-visible {
		outline: 3px solid #be123c;
		outline-offset: 2px;
	}

	.ml-panel:focus {
		outline: none;
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
