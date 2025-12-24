<!--
  DomeGallery.svelte - Interactive 3D Spherical Image Gallery

  A stunning 3D dome-shaped gallery where images are arranged on a spherical surface.
  Users can drag to rotate the dome with momentum/inertia and click images to enlarge.

  Features:
  - 3D spherical layout using CSS transforms
  - Smooth drag-to-rotate with velocity-based inertia
  - Click-to-enlarge with animated transitions
  - Responsive radius calculation
  - Optional grayscale filter
  - Keyboard and touch support
  - Scroll lock during enlargement

  Usage:
    <DomeGallery
      images={[
        { src: 'image1.jpg', alt: 'Description 1' },
        { src: 'image2.jpg', alt: 'Description 2' },
      ]}
      segments={35}
      grayscale={true}
    />

  Zero external dependencies - pure Svelte 5 implementation.
  Inspired by ReactBits DomeGallery (https://reactbits.dev/components/dome-gallery)
-->
<script lang="ts">
	import type { DomeGalleryProps, DomeGalleryImage, DomeGalleryItem } from '$lib/types';

	// ========================================
	// PROPS WITH DEFAULTS
	// ========================================
	let {
		images = [],
		fit = 0.5,
		fitBasis = 'auto',
		minRadius = 600,
		maxRadius = Infinity,
		padFactor = 0.25,
		overlayBlurColor = '#060010',
		maxVerticalRotationDeg = 5,
		dragSensitivity = 20,
		enlargeTransitionMs = 300,
		segments = 35,
		dragDampening = 2,
		openedImageWidth = '250px',
		openedImageHeight = '350px',
		imageBorderRadius = '30px',
		openedImageBorderRadius = '30px',
		grayscale = true
	}: DomeGalleryProps = $props();

	// ========================================
	// REFS (element bindings)
	// ========================================
	let rootEl: HTMLDivElement | undefined = $state();
	let mainEl: HTMLElement | undefined = $state();
	let sphereEl: HTMLDivElement | undefined = $state();
	let frameEl: HTMLDivElement | undefined = $state();
	let viewerEl: HTMLDivElement | undefined = $state();
	let scrimEl: HTMLDivElement | undefined = $state();

	// ========================================
	// STATE
	// ========================================
	let rotation = $state({ x: 0, y: 0 });
	let startRot = { x: 0, y: 0 };
	let startPos: { x: number; y: number } | null = null;
	let dragging = false;
	let moved = false;
	let lastDragEndTime = 0;
	let inertiaRAF: number | null = null;
	let opening = false;
	let openStartedAt = 0;
	let scrollLocked = false;
	let lockedRadius: number | null = null;

	// Enlarged image state
	let focusedEl: HTMLElement | null = null;
	let originalTilePosition: { left: number; top: number; width: number; height: number } | null =
		null;
	let enlarging = $state(false);

	// ========================================
	// UTILITY FUNCTIONS
	// ========================================
	const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

	const wrapAngleSigned = (deg: number): number => {
		const a = (((deg + 180) % 360) + 360) % 360;
		return a - 180;
	};

	const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;

	const getDataNumber = (el: HTMLElement, name: string, fallback: number): number => {
		const attr = el.dataset[name];
		const n = attr == null ? NaN : parseFloat(attr);
		return Number.isFinite(n) ? n : fallback;
	};

	// ========================================
	// BUILD ITEMS ON SPHERE
	// ========================================
	function buildItems(pool: (string | DomeGalleryImage)[], seg: number): DomeGalleryItem[] {
		// Create grid coordinates for tiles arranged on the sphere
		const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
		const evenYs = [-4, -2, 0, 2, 4];
		const oddYs = [-3, -1, 1, 3, 5];

		const coords = xCols.flatMap((x, c) => {
			const ys = c % 2 === 0 ? evenYs : oddYs;
			return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
		});

		const totalSlots = coords.length;
		if (pool.length === 0) {
			return coords.map((c) => ({ ...c, src: '', alt: '' }));
		}

		if (pool.length > totalSlots) {
			console.warn(
				`[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
			);
		}

		// Normalise images (support string or object format)
		const normalizedImages = pool.map((image) => {
			if (typeof image === 'string') {
				return { src: image, alt: '' };
			}
			return { src: image.src || '', alt: image.alt || '' };
		});

		// Cycle through images to fill all slots
		const usedImages = Array.from(
			{ length: totalSlots },
			(_, i) => normalizedImages[i % normalizedImages.length]
		);

		// Prevent consecutive duplicates
		for (let i = 1; i < usedImages.length; i++) {
			if (usedImages[i].src === usedImages[i - 1].src) {
				for (let j = i + 1; j < usedImages.length; j++) {
					if (usedImages[j].src !== usedImages[i].src) {
						const tmp = usedImages[i];
						usedImages[i] = usedImages[j];
						usedImages[j] = tmp;
						break;
					}
				}
			}
		}

		return coords.map((c, i) => ({
			...c,
			src: usedImages[i].src,
			alt: usedImages[i].alt
		}));
	}

	// Compute base rotation for an item on the sphere
	function computeItemBaseRotation(
		offsetX: number,
		offsetY: number,
		sizeX: number,
		sizeY: number,
		segs: number
	) {
		const unit = 360 / segs / 2;
		const rotateY = unit * (offsetX + (sizeX - 1) / 2);
		const rotateX = unit * (offsetY - (sizeY - 1) / 2);
		return { rotateX, rotateY };
	}

	// ========================================
	// DERIVED STATE
	// ========================================
	let items = $derived(buildItems(images, segments));

	// ========================================
	// TRANSFORM APPLICATION
	// ========================================
	function applyTransform(xDeg: number, yDeg: number) {
		if (sphereEl) {
			sphereEl.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
		}
	}

	// ========================================
	// SCROLL LOCK
	// ========================================
	function lockScroll() {
		if (scrollLocked) return;
		scrollLocked = true;
		document.body.classList.add('dg-scroll-lock');
	}

	function unlockScroll() {
		if (!scrollLocked) return;
		if (enlarging) return;
		scrollLocked = false;
		document.body.classList.remove('dg-scroll-lock');
	}

	// ========================================
	// INERTIA ANIMATION
	// ========================================
	function stopInertia() {
		if (inertiaRAF) {
			cancelAnimationFrame(inertiaRAF);
			inertiaRAF = null;
		}
	}

	function startInertia(vx: number, vy: number) {
		const MAX_V = 1.4;
		let vX = clamp(vx, -MAX_V, MAX_V) * 80;
		let vY = clamp(vy, -MAX_V, MAX_V) * 80;
		let frames = 0;
		const d = clamp(dragDampening ?? 0.6, 0, 1);
		const frictionMul = 0.94 + 0.055 * d;
		const stopThreshold = 0.015 - 0.01 * d;
		const maxFrames = Math.round(90 + 270 * d);

		const step = () => {
			vX *= frictionMul;
			vY *= frictionMul;

			if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
				inertiaRAF = null;
				return;
			}
			if (++frames > maxFrames) {
				inertiaRAF = null;
				return;
			}

			const nextX = clamp(rotation.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
			const nextY = wrapAngleSigned(rotation.y + vX / 200);
			rotation = { x: nextX, y: nextY };
			applyTransform(nextX, nextY);
			inertiaRAF = requestAnimationFrame(step);
		};

		stopInertia();
		inertiaRAF = requestAnimationFrame(step);
	}

	// ========================================
	// DRAG HANDLERS
	// ========================================
	let lastMoveTime = 0;
	let lastMovePos: { x: number; y: number } | null = null;
	let velocity = { x: 0, y: 0 };

	function handlePointerDown(e: PointerEvent) {
		if (focusedEl) return;
		stopInertia();

		dragging = true;
		moved = false;
		startRot = { ...rotation };
		startPos = { x: e.clientX, y: e.clientY };
		lastMoveTime = performance.now();
		lastMovePos = { x: e.clientX, y: e.clientY };
		velocity = { x: 0, y: 0 };

		mainEl?.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || !startPos || focusedEl) return;

		const now = performance.now();
		const dt = Math.max(1, now - lastMoveTime);

		if (lastMovePos) {
			velocity = {
				x: (e.clientX - lastMovePos.x) / dt,
				y: (e.clientY - lastMovePos.y) / dt
			};
		}

		lastMoveTime = now;
		lastMovePos = { x: e.clientX, y: e.clientY };

		const dxTotal = e.clientX - startPos.x;
		const dyTotal = e.clientY - startPos.y;

		if (!moved) {
			const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
			if (dist2 > 16) moved = true;
		}

		const nextX = clamp(
			startRot.x - dyTotal / dragSensitivity,
			-maxVerticalRotationDeg,
			maxVerticalRotationDeg
		);
		const nextY = wrapAngleSigned(startRot.y + dxTotal / dragSensitivity);

		if (rotation.x !== nextX || rotation.y !== nextY) {
			rotation = { x: nextX, y: nextY };
			applyTransform(nextX, nextY);
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragging) return;

		dragging = false;
		mainEl?.releasePointerCapture(e.pointerId);

		// Apply inertia based on velocity
		const vx = velocity.x * 10;
		const vy = velocity.y * 10;

		if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
			startInertia(vx, vy);
		}

		if (moved) {
			lastDragEndTime = performance.now();
		}
		moved = false;
	}

	// ========================================
	// TILE CLICK HANDLER
	// ========================================
	function openItemFromElement(el: HTMLElement) {
		if (opening) return;
		opening = true;
		openStartedAt = performance.now();
		lockScroll();

		const parent = el.parentElement!;
		focusedEl = el;
		el.setAttribute('data-focused', 'true');

		const offsetX = getDataNumber(parent, 'offsetX', 0);
		const offsetY = getDataNumber(parent, 'offsetY', 0);
		const sizeX = getDataNumber(parent, 'sizeX', 2);
		const sizeY = getDataNumber(parent, 'sizeY', 2);

		const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
		const parentY = normalizeAngle(parentRot.rotateY);
		const globalY = normalizeAngle(rotation.y);

		let rotY = -(parentY + globalY) % 360;
		if (rotY < -180) rotY += 360;
		const rotX = -parentRot.rotateX - rotation.x;

		parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
		parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

		// Create reference element to get position
		const refDiv = document.createElement('div');
		refDiv.className = 'item__image item__image--reference';
		refDiv.style.opacity = '0';
		refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
		parent.appendChild(refDiv);

		// Force layout
		void refDiv.offsetHeight;

		const tileR = refDiv.getBoundingClientRect();
		const mainR = mainEl?.getBoundingClientRect();
		const frameR = frameEl?.getBoundingClientRect();

		if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
			opening = false;
			focusedEl = null;
			parent.removeChild(refDiv);
			unlockScroll();
			return;
		}

		originalTilePosition = {
			left: tileR.left,
			top: tileR.top,
			width: tileR.width,
			height: tileR.height
		};

		el.style.visibility = 'hidden';
		el.style.zIndex = '0';

		// Create enlarged overlay
		const overlay = document.createElement('div');
		overlay.className = 'enlarge';
		overlay.style.position = 'absolute';
		overlay.style.left = frameR.left - mainR.left + 'px';
		overlay.style.top = frameR.top - mainR.top + 'px';
		overlay.style.width = frameR.width + 'px';
		overlay.style.height = frameR.height + 'px';
		overlay.style.opacity = '0';
		overlay.style.zIndex = '30';
		overlay.style.willChange = 'transform, opacity';
		overlay.style.transformOrigin = 'top left';
		overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

		const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
		const img = document.createElement('img');
		img.src = rawSrc;
		overlay.appendChild(img);
		viewerEl?.appendChild(overlay);

		// Calculate initial transform from tile position
		const tx0 = tileR.left - frameR.left;
		const ty0 = tileR.top - frameR.top;
		const sx0 = tileR.width / frameR.width;
		const sy0 = tileR.height / frameR.height;

		const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
		const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

		overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

		// Animate to full size
		setTimeout(() => {
			if (!overlay.parentElement) return;
			overlay.style.opacity = '1';
			overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
			enlarging = true;
		}, 16);

		// Handle custom sizing
		const wantsResize = openedImageWidth || openedImageHeight;
		if (wantsResize) {
			const onFirstEnd = (ev: TransitionEvent) => {
				if (ev.propertyName !== 'transform') return;
				overlay.removeEventListener('transitionend', onFirstEnd);

				const prevTransition = overlay.style.transition;
				overlay.style.transition = 'none';

				const tempWidth = openedImageWidth || `${frameR.width}px`;
				const tempHeight = openedImageHeight || `${frameR.height}px`;

				overlay.style.width = tempWidth;
				overlay.style.height = tempHeight;
				const newRect = overlay.getBoundingClientRect();

				overlay.style.width = frameR.width + 'px';
				overlay.style.height = frameR.height + 'px';
				void overlay.offsetWidth;

				overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;

				const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
				const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;

				requestAnimationFrame(() => {
					overlay.style.left = `${centeredLeft}px`;
					overlay.style.top = `${centeredTop}px`;
					overlay.style.width = tempWidth;
					overlay.style.height = tempHeight;
				});

				const cleanupSecond = () => {
					overlay.removeEventListener('transitionend', cleanupSecond);
					overlay.style.transition = prevTransition;
				};
				overlay.addEventListener('transitionend', cleanupSecond, { once: true });
			};
			overlay.addEventListener('transitionend', onFirstEnd);
		}
	}

	function closeEnlarged() {
		if (performance.now() - openStartedAt < 250) return;
		if (!focusedEl) return;

		const el = focusedEl;
		const parent = el.parentElement!;
		const overlay = viewerEl?.querySelector('.enlarge');

		if (!overlay) return;

		const refDiv = parent.querySelector('.item__image--reference');
		const originalPos = originalTilePosition;

		if (!originalPos || !rootEl) {
			overlay.remove();
			if (refDiv) refDiv.remove();
			parent.style.setProperty('--rot-y-delta', '0deg');
			parent.style.setProperty('--rot-x-delta', '0deg');
			el.style.visibility = '';
			el.style.zIndex = '0';
			focusedEl = null;
			enlarging = false;
			opening = false;
			unlockScroll();
			return;
		}

		const currentRect = overlay.getBoundingClientRect();
		const rootRect = rootEl.getBoundingClientRect();

		const originalPosRelativeToRoot = {
			left: originalPos.left - rootRect.left,
			top: originalPos.top - rootRect.top,
			width: originalPos.width,
			height: originalPos.height
		};

		const overlayRelativeToRoot = {
			left: currentRect.left - rootRect.left,
			top: currentRect.top - rootRect.top,
			width: currentRect.width,
			height: currentRect.height
		};

		// Create closing animation overlay
		const animatingOverlay = document.createElement('div');
		animatingOverlay.className = 'enlarge-closing';
		animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

		const originalImg = overlay.querySelector('img');
		if (originalImg) {
			const img = originalImg.cloneNode() as HTMLImageElement;
			img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
			animatingOverlay.appendChild(img);
		}

		overlay.remove();
		rootEl.appendChild(animatingOverlay);
		void animatingOverlay.getBoundingClientRect();

		requestAnimationFrame(() => {
			animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
			animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
			animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
			animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
			animatingOverlay.style.opacity = '0';
		});

		const cleanup = () => {
			animatingOverlay.remove();
			originalTilePosition = null;

			if (refDiv) refDiv.remove();

			parent.style.transition = 'none';
			el.style.transition = 'none';
			parent.style.setProperty('--rot-y-delta', '0deg');
			parent.style.setProperty('--rot-x-delta', '0deg');

			requestAnimationFrame(() => {
				el.style.visibility = '';
				el.style.opacity = '0';
				el.style.zIndex = '0';
				focusedEl = null;
				enlarging = false;

				requestAnimationFrame(() => {
					parent.style.transition = '';
					el.style.transition = 'opacity 300ms ease-out';

					requestAnimationFrame(() => {
						el.style.opacity = '1';

						setTimeout(() => {
							el.style.transition = '';
							el.style.opacity = '';
							opening = false;
							if (!dragging && !enlarging) {
								document.body.classList.remove('dg-scroll-lock');
							}
						}, 300);
					});
				});
			});
		};

		animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
	}

	function handleTileClick(e: MouseEvent) {
		if (dragging) return;
		if (moved) return;
		if (performance.now() - lastDragEndTime < 80) return;
		if (opening) return;
		openItemFromElement(e.currentTarget as HTMLElement);
	}

	function handleTilePointerUp(e: PointerEvent) {
		if (e.pointerType !== 'touch') return;
		if (dragging) return;
		if (moved) return;
		if (performance.now() - lastDragEndTime < 80) return;
		if (opening) return;
		openItemFromElement(e.currentTarget as HTMLElement);
	}

	// ========================================
	// KEYBOARD HANDLER
	// ========================================
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeEnlarged();
		}
	}

	// ========================================
	// RESIZE OBSERVER
	// ========================================
	$effect(() => {
		if (!rootEl) return;

		const ro = new ResizeObserver((entries) => {
			const cr = entries[0].contentRect;
			const w = Math.max(1, cr.width);
			const h = Math.max(1, cr.height);
			const minDim = Math.min(w, h);
			const maxDim = Math.max(w, h);
			const aspect = w / h;

			let basis: number;
			switch (fitBasis) {
				case 'min':
					basis = minDim;
					break;
				case 'max':
					basis = maxDim;
					break;
				case 'width':
					basis = w;
					break;
				case 'height':
					basis = h;
					break;
				default:
					basis = aspect >= 1.3 ? w : minDim;
			}

			let radius = basis * fit;
			const heightGuard = h * 1.35;
			radius = Math.min(radius, heightGuard);
			radius = clamp(radius, minRadius, maxRadius);
			lockedRadius = Math.round(radius);

			const viewerPad = Math.max(8, Math.round(minDim * padFactor));

			rootEl!.style.setProperty('--radius', `${lockedRadius}px`);
			rootEl!.style.setProperty('--viewer-pad', `${viewerPad}px`);
			rootEl!.style.setProperty('--overlay-blur-color', overlayBlurColor);
			rootEl!.style.setProperty('--tile-radius', imageBorderRadius);
			rootEl!.style.setProperty('--enlarge-radius', openedImageBorderRadius);
			rootEl!.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');

			applyTransform(rotation.x, rotation.y);
		});

		ro.observe(rootEl);
		return () => ro.disconnect();
	});

	// Initial transform
	$effect(() => {
		applyTransform(rotation.x, rotation.y);
	});

	// Scrim click and keyboard handlers
	$effect(() => {
		if (!scrimEl) return;

		scrimEl.addEventListener('click', closeEnlarged);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			scrimEl?.removeEventListener('click', closeEnlarged);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Cleanup scroll lock on unmount
	$effect(() => {
		return () => {
			document.body.classList.remove('dg-scroll-lock');
		};
	});
</script>

<div
	bind:this={rootEl}
	class="sphere-root"
	data-enlarging={enlarging}
	style="--segments-x: {segments}; --segments-y: {segments}; --overlay-blur-color: {overlayBlurColor}; --tile-radius: {imageBorderRadius}; --enlarge-radius: {openedImageBorderRadius}; --image-filter: {grayscale
		? 'grayscale(1)'
		: 'none'};"
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<main
		bind:this={mainEl}
		class="sphere-main"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<div class="stage">
			<div bind:this={sphereEl} class="sphere">
				{#each items as item, i (`${item.x},${item.y},${i}`)}
					<div
						class="item"
						data-src={item.src}
						data-offset-x={item.x}
						data-offset-y={item.y}
						data-size-x={item.sizeX}
						data-size-y={item.sizeY}
						style="--offset-x: {item.x}; --offset-y: {item.y}; --item-size-x: {item.sizeX}; --item-size-y: {item.sizeY};"
					>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="item__image"
							role="button"
							tabindex="0"
							aria-label={item.alt || 'Open image'}
							onclick={handleTileClick}
							onpointerup={handleTilePointerUp}
							onkeydown={(e) => e.key === 'Enter' && handleTileClick(e as unknown as MouseEvent)}
						>
							<img src={item.src} draggable="false" alt={item.alt} />
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="overlay"></div>
		<div class="overlay overlay--blur"></div>
		<div class="edge-fade edge-fade--top"></div>
		<div class="edge-fade edge-fade--bottom"></div>

		<div bind:this={viewerEl} class="viewer">
			<div bind:this={scrimEl} class="scrim"></div>
			<div bind:this={frameEl} class="frame"></div>
		</div>
	</main>
</div>

<style>
	/* Global scroll lock style - injected via classList */
	:global(.dg-scroll-lock) {
		overflow: hidden !important;
	}

	.sphere-root {
		position: relative;
		width: 100%;
		height: 100%;
		--radius: 520px;
		--viewer-pad: 72px;
		--circ: calc(var(--radius) * 3.14);
		--rot-y: calc((360deg / var(--segments-x)) / 2);
		--rot-x: calc((360deg / var(--segments-y)) / 2);
		--item-width: calc(var(--circ) / var(--segments-x));
		--item-height: calc(var(--circ) / var(--segments-y));
	}

	.sphere-root :global(*) {
		box-sizing: border-box;
	}

	.sphere,
	.item,
	.item__image {
		transform-style: preserve-3d;
	}

	main.sphere-main {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		overflow: hidden;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		background: transparent;
	}

	.stage {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		perspective: calc(var(--radius) * 2);
		perspective-origin: 50% 50%;
		contain: layout paint size;
	}

	.sphere {
		transform: translateZ(calc(var(--radius) * -1));
		will-change: transform;
	}

	.overlay,
	.overlay--blur {
		position: absolute;
		inset: 0;
		margin: auto;
		z-index: 3;
		pointer-events: none;
	}

	.overlay {
		background-image: radial-gradient(
			rgba(235, 235, 235, 0) 65%,
			var(--overlay-blur-color, #060010) 100%
		);
	}

	.overlay--blur {
		-webkit-mask-image: radial-gradient(
			rgba(235, 235, 235, 0) 70%,
			var(--overlay-blur-color, #060010) 90%
		);
		mask-image: radial-gradient(
			rgba(235, 235, 235, 0) 70%,
			var(--overlay-blur-color, #060010) 90%
		);
		backdrop-filter: blur(3px);
	}

	.item {
		width: calc(var(--item-width) * var(--item-size-x));
		height: calc(var(--item-height) * var(--item-size-y));
		position: absolute;
		top: -999px;
		bottom: -999px;
		left: -999px;
		right: -999px;
		margin: auto;
		transform-origin: 50% 50%;
		backface-visibility: hidden;
		transition: transform 300ms;
		transform: rotateY(
				calc(
					var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)
				)
			)
			rotateX(
				calc(
					var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)
				)
			)
			translateZ(var(--radius));
	}

	.item__image {
		position: absolute;
		display: block;
		inset: 10px;
		border-radius: var(--tile-radius, 12px);
		background: transparent;
		overflow: hidden;
		backface-visibility: hidden;
		transition: transform 300ms;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		pointer-events: auto;
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}

	.item__image:focus {
		outline: none;
	}

	.item__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		backface-visibility: hidden;
		filter: var(--image-filter, none);
	}

	.viewer {
		position: absolute;
		inset: 0;
		z-index: 20;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--viewer-pad);
	}

	.viewer .frame {
		height: 100%;
		aspect-ratio: 1;
		border-radius: var(--enlarge-radius, 32px);
		display: flex;
	}

	@media (max-aspect-ratio: 1/1) {
		.viewer .frame {
			height: auto;
			width: 100%;
		}
	}

	.viewer .scrim {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: rgba(0, 0, 0, 0.4);
		pointer-events: none;
		opacity: 0;
		transition: opacity 500ms ease;
		backdrop-filter: blur(3px);
	}

	.sphere-root[data-enlarging='true'] .viewer .scrim {
		opacity: 1;
		pointer-events: all;
	}

	.viewer :global(.enlarge) {
		position: absolute;
		z-index: 30;
		border-radius: var(--enlarge-radius, 32px);
		overflow: hidden;
		transition:
			transform 500ms ease,
			opacity 500ms ease;
		transform-origin: top left;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
	}

	.viewer :global(.enlarge img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: var(--image-filter, none);
	}

	.sphere-root :global(.enlarge-closing img) {
		filter: var(--image-filter, none);
	}

	.edge-fade {
		position: absolute;
		left: 0;
		right: 0;
		height: 120px;
		z-index: 5;
		pointer-events: none;
		background: linear-gradient(to bottom, transparent, var(--overlay-blur-color, #060010));
	}

	.edge-fade--top {
		top: 0;
		transform: rotate(180deg);
	}

	.edge-fade--bottom {
		bottom: 0;
	}
</style>
