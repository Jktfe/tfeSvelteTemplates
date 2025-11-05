<script>
	import { onMount } from 'svelte';

	let { cards = [], cardWidth = 300, cardHeight = 400 } = $props();

	let currentIndex = $state(0);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let dragCurrent = $state({ x: 0, y: 0 });
	let containerRef = $state(null);

	// Calculate card transforms based on index and drag
	function getCardTransform(index) {
		const offset = index - currentIndex;
		
		if (offset < 0) return { scale: 0, rotation: 0, opacity: 0 };
		
		// Base scale progression: 0.34 to 0.94
		const baseScale = 0.34 + (offset * 0.084);
		const scale = Math.min(baseScale, 0.94);
		
		// Random-ish rotation for each card position
		const baseRotation = 30 + offset * 3;
		const rotation = baseRotation + (isDragging ? (dragCurrent.x - dragStart.x) * 0.1 : 0);
		
		// Opacity for cards beyond visible range
		const opacity = offset > 8 ? 0 : 1;
		
		return { scale, rotation, opacity };
	}

	function handleMouseDown(e) {
		if (e.button !== 0) return;
		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		dragCurrent = { ...dragStart };
	}

	function handleMouseMove(e) {
		if (!isDragging) return;
		dragCurrent = { x: e.clientX, y: e.clientY };
	}

	function handleMouseUp(e) {
		if (!isDragging) return;
		isDragging = false;

		const deltaX = dragCurrent.x - dragStart.x;
		const threshold = 30;

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
	}

	function handleTouchMove(e) {
		if (!isDragging) return;
		dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	function handleTouchEnd(e) {
		if (!isDragging) return;
		isDragging = false;

		const deltaY = dragCurrent.y - dragStart.y;
		const threshold = 30;

		// Swipe up = next card
		if (deltaY < -threshold && currentIndex < cards.length - 1) {
			currentIndex++;
		} else if (deltaY > threshold && currentIndex > 0) {
			currentIndex--;
		}
	}

	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
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
					<img src={card.image} alt={card.title} class="card-image" />
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
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
	}

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
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform;
	}

	.card {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: white;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
	}

	.card-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-title {
		position: absolute;
		top: 20px;
		left: 24px;
		font-size: 24px;
		font-weight: 700;
		z-index: 10;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.card-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
		color: white;
		z-index: 10;
	}

	@media (max-width: 768px) {
		.stack-container {
			width: 280px;
			height: 380px;
		}

		.card-wrapper {
			transform-origin: 50% 100%;
		}
	}
</style>
