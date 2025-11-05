<script>
	import { onMount } from 'svelte';

	let { cards = [], cardWidth = 300, cardHeight = 400 } = $props();

	let currentIndex = $state(0);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let dragCurrent = $state({ x: 0, y: 0 });
	let containerRef = $state(null);
	let velocity = $state(0);

	// More precise rotation calculations matching original
	const rotations = [
		39.5, 37.5, 28.96, 32.31, 25.61, 24.3, 15.11, 16.33, 11.22, 1.52, 4.99
	];

	function getRotation(index) {
		if (index < rotations.length) {
			return rotations[index];
		}
		return 0;
	}

	function getCardTransform(index) {
		const offset = index - currentIndex;

		if (offset < 0) return { scale: 0, rotation: 0, opacity: 0 };

		// Scale progression: smaller in back, larger in front
		const scales = [0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94];
		const baseScale = scales[offset] ?? 0.94;
		const scale = Math.min(baseScale, 0.94);

		// Get base rotation for this card
		const baseRotation = getRotation(offset);
		const rotation = baseRotation + (isDragging ? (dragCurrent.x - dragStart.x) * 0.05 : 0);

		// Opacity threshold
		const opacity = offset > 9 ? 0 : 1;

		return { scale, rotation, opacity };
	}

	function handleMouseDown(e) {
		if (e.button !== 0) return;
		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		dragCurrent = { ...dragStart };
		velocity = 0;
	}

	function handleMouseMove(e) {
		if (!isDragging) return;
		dragCurrent = { x: e.clientX, y: e.clientY };
	}

	function handleMouseUp(e) {
		if (!isDragging) return;
		isDragging = false;

		const deltaX = dragCurrent.x - dragStart.x;
		const threshold = 40;

		if (deltaX > threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaX < -threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	function handleTouchStart(e) {
		isDragging = true;
		dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		dragCurrent = { ...dragStart };
		velocity = 0;
	}

	function handleTouchMove(e) {
		if (!isDragging) return;
		dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	function handleTouchEnd(e) {
		if (!isDragging) return;
		isDragging = false;

		const deltaY = dragCurrent.y - dragStart.y;
		const threshold = 40;

		// Mobile: swipe up = next card, swipe down = prev card
		if (deltaY < -threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaY > threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	function handleKeyDown(e) {
		if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (e.key === 'ArrowLeft' && currentIndex > 0) {
			currentIndex--;
		}
	}

	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<svelte:document onmousedown={handleMouseDown} />

<div
	class="stack-container"
	bind:this={containerRef}
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	role="region"
	aria-label="Card stack"
>
	{#each cards as card, index (index)}
		{@const transform = getCardTransform(index)}
		<div
			class="card-wrapper"
			class:dragging={isDragging}
			style="
				--scale: {transform.scale};
				--rotation: {transform.rotation}deg;
				--opacity: {transform.opacity};
				z-index: {index};
				transform: scale(var(--scale)) rotateZ(var(--rotation));
				opacity: var(--opacity);
			"
		>
			<div class="card">
				{#if card.image}
					<img src={card.image} alt={card.title} class="card-image" draggable="false" />
				{/if}
				{#if card.title}
					<div class="card-title">{card.title}</div>
				{/if}
				{#if card.content}
					<div class="card-content">
						{@html card.content}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.stack-container {
		position: relative;
		width: 300px;
		height: 400px;
		perspective: 600px;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
	}

	.stack-container:active {
		cursor: grabbing;
	}

	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-origin: 90% 90%;
		/* Smooth cubic-bezier easing for natural feel */
		transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform, opacity;
	}

	.card-wrapper.dragging {
		transition: none;
	}

	.card {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 16px;
		overflow: hidden;
		background: #f5f5f5;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
	}

	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		-webkit-user-drag: none;
	}

	.card-title {
		position: absolute;
		top: 20px;
		left: 24px;
		font-size: 24px;
		font-weight: 700;
		z-index: 10;
		color: white;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		letter-spacing: 0.5px;
	}

	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.8) 100%);
		color: white;
		z-index: 10;
		font-size: 14px;
		line-height: 1.5;
	}

	/* Mobile optimisations */
	@media (max-width: 768px) {
		.stack-container {
			width: 100%;
			max-width: 320px;
			height: 420px;
		}

		.card-wrapper {
			transform-origin: 50% 100% !important;
		}

		.card {
			border-radius: 20px;
		}

		.card-title {
			font-size: 20px;
		}
	}
</style>
