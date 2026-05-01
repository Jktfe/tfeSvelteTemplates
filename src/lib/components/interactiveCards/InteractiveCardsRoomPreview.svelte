<!--
	============================================================
	InteractiveCardsRoomPreview — bottom-left room mockup overlay
	============================================================

	🎯 WHAT IT DOES
	Shows a room mockup with the currently-featured painting composited into
	the wall cutout. Fades in once the cards transition fully into the diagonal
	conveyor (scroll section ~20%+), and scroll-cycles through the paintings as
	the conveyor advances.

	The painting window position (top/right/bottom/left percentages) comes from
	the original spec — they line up with the cutout in `painter-sample-bottom.png`.

	📋 PROPS
	| Prop       | Type                        | Description                          |
	|------------|-----------------------------|--------------------------------------|
	| projects   | InteractiveCardsProject[]   | Same list used by the card fan       |
	| imageIdx   | number                      | Which painting is in the cutout now  |
	| visible    | boolean                     | Fade-in flag (parent scroll state)   |
	| roomImage  | string                      | URL for the room mockup PNG          |
	============================================================
-->

<script lang="ts">
	import type { InteractiveCardsProject } from '$lib/types';

	interface Props {
		projects: InteractiveCardsProject[];
		imageIdx: number;
		visible: boolean;
		roomImage: string;
	}

	let { projects, imageIdx, visible, roomImage }: Props = $props();

	// Clamp index defensively — scroll math rounds to `Math.floor(progress * N)`
	// which at exactly progress=1 would overflow by one on a floating-point boundary.
	let safeIdx = $derived(
		projects.length === 0 ? 0 : ((imageIdx % projects.length) + projects.length) % projects.length
	);
</script>

<div
	class="room-overlay"
	class:visible
	aria-hidden="true"
>
	<div class="room-wrap">
		<!-- Painting slot — sits *behind* the room PNG so the frame cutout masks it. -->
		<div class="painting-slot">
			{#if projects[safeIdx]}
				<img
					src={projects[safeIdx].image}
					alt=""
					draggable="false"
				/>
			{/if}
		</div>

		<!-- Room PNG sits on top; its alpha channel acts as the mask. -->
		<img class="room-png" src={roomImage} alt="" draggable="false" />
	</div>
</div>

<style>
	.room-overlay {
		position: absolute;
		left: 0;
		bottom: 0;
		z-index: 0;
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.room-overlay.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.room-wrap {
		position: relative;
		/* Mobile: full-width strip anchored to the bottom. */
		width: 100%;
		height: auto;
	}

	/* Painting position follows the spec — these percentages line up with the
	   frame cutout in the room mockup. */
	.painting-slot {
		position: absolute;
		top: 20.7%;
		right: 63.8%;
		bottom: 34%;
		left: 5.2%;
		overflow: hidden;
		z-index: 1;
	}

	.painting-slot img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.2s ease;
	}

	.room-png {
		position: relative;
		z-index: 2;
		width: 100%;
		height: auto;
		display: block;
	}

	@media (min-width: 768px) {
		.room-overlay {
			top: 0;
			bottom: auto;
			height: 100vh;
			width: auto;
		}

		.room-wrap {
			width: auto;
			height: 100%;
		}

		.room-png {
			height: 100%;
			width: auto;
		}
	}
</style>
