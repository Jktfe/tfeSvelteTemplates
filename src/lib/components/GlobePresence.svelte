<!--
	============================================================
	GlobePresence - High-Performance 3D Globe Visualization
	============================================================

	WHAT IT DOES
	Renders a stunning 3D globe using HTML5 Canvas. Supports auto-rotation,
	interactive drag, and plottable markers. Uses Svelte 5 runes for
	reactive state management and a zero-dependency math implementation.

	============================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { GlobePresenceProps } from '$lib/types';
	import { cn } from '$lib/utils';

	let {
		markers = [],
		autoRotate = true,
		rotationSpeed = 0.005,
		interactive = true,
		theme = 'dark',
		class: className = ''
	}: GlobePresenceProps = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let rotation = $state(0);
	let isDragging = $state(false);
	let lastPointerX = $state(0);
	let mouseX = $state(-100);
	let mouseY = $state(-100);
	let hoveredMarkerId = $state<string | null>(null);
	let respectReducedMotion = $state(false);
	let isVisible = $state(true);

	// Animation frame reference
	let frameId: number | null = null;
	// Tracks the DPR last applied to the canvas transform so we only re-scale
	// when the device pixel ratio actually changes (setting canvas.width resets
	// the transform, so we re-apply ctx.scale only inside the resize block).
	let lastScaledDpr = 0;

	// Globe constants
	const DOT_COUNT = 800; // Number of background dots forming the sphere
	const GLOBE_RADIUS_RATIO = 0.4; // Radius relative to canvas size

	// Derived dots for the globe surface (memoized conceptually)
	const globeDots = Array.from({ length: DOT_COUNT }, () => {
		const phi = Math.acos(-1 + (2 * Math.random()));
		const theta = Math.random() * 2 * Math.PI;
		return { phi, theta };
	});

	function project(phi: number, theta: number, radius: number, currentRotation: number) {
		// Apply rotation around Y axis
		const rotatedTheta = theta + currentRotation;

		// Spherical to Cartesian
		const x = radius * Math.sin(phi) * Math.cos(rotatedTheta);
		const y = radius * Math.cos(phi);
		const z = radius * Math.sin(phi) * Math.sin(rotatedTheta);

		// Simple perspective projection (orthogonal for this flat look)
		return { x, y, z };
	}

	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Handle high-DPI displays for maximum crispness.
		// Setting canvas.width/height resets the 2D context transform, so we
		// only re-apply ctx.scale inside this resize block. lastScaledDpr
		// guards against compounding scale calls if the DPR ever changes
		// without a width/height change (rare, but cheap insurance).
		const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
		if (
			canvas.width !== containerWidth * dpr ||
			canvas.height !== containerHeight * dpr ||
			lastScaledDpr !== dpr
		) {
			canvas.width = containerWidth * dpr;
			canvas.height = containerHeight * dpr;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(dpr, dpr);
			lastScaledDpr = dpr;
		}

		const centerX = containerWidth / 2;
		const centerY = containerHeight / 2;
		const radius = Math.min(containerWidth, containerHeight) * GLOBE_RADIUS_RATIO;

		ctx.clearRect(0, 0, containerWidth, containerHeight);

		// Draw background dots
		globeDots.forEach(dot => {
			const { x, y, z } = project(dot.phi, dot.theta, radius, rotation);
			// Draw if on front side, or very faded if on back side for "translucent" effect
			const isFront = z > 0;
			const opacity = isFront ? (0.2 + (z / radius) * 0.3) : 0.05;
			
			ctx.fillStyle = theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
			const size = isFront ? (1 + (z / radius)) : 0.5;
			
			ctx.beginPath();
			ctx.arc(centerX + x, centerY + y, size, 0, Math.PI * 2);
			ctx.fill();
		});

		// Draw outer atmosphere glow. Both themes get a halo so light mode
		// retains the same sense of "energy" — light mode uses a softer
		// blue tint at lower opacity so it doesn't overwhelm the dots.
		const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.1);
		if (theme === 'dark') {
			glow.addColorStop(0, 'rgba(0, 242, 255, 0.0)');
			glow.addColorStop(0.5, 'rgba(0, 242, 255, 0.1)');
			glow.addColorStop(1, 'rgba(0, 242, 255, 0.0)');
		} else {
			glow.addColorStop(0, 'rgba(59, 130, 246, 0.0)');
			glow.addColorStop(0.5, 'rgba(59, 130, 246, 0.06)');
			glow.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
		}
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
		ctx.fill();

		// Draw markers
		const time = Date.now() * 0.002;
		let currentHoveredId: string | null = null;

		markers.forEach(marker => {
			// Convert lat/long to phi/theta
			// lat: [-90, 90] -> phi: [PI, 0]
			// long: [-180, 180] -> theta: [0, 2PI]
			const phi = (90 - marker.lat) * (Math.PI / 180);
			const theta = (marker.long + 180) * (Math.PI / 180);

			const { x, y, z } = project(phi, theta, radius, rotation);

			if (z > 0) {
				const screenX = centerX + x;
				const screenY = centerY + y;

				// Check for hover
				const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
				if (dist < 10) {
					currentHoveredId = marker.id;
				}

				// Marker is on the visible hemisphere
				const isHovered = hoveredMarkerId === marker.id;
				const color = marker.color || (theme === 'dark' ? '#00f2ff' : '#0066cc');
				
				// Pulse effect
				const pulse = isHovered ? 1.2 : (Math.sin(time) * 0.3 + 0.7);
				const glowSize = (isHovered ? 15 : 10) * pulse;
				
				// Draw glow
				const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
				gradient.addColorStop(0, color);
				gradient.addColorStop(1, 'transparent');
				
				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
				ctx.fill();

				// Draw core point
				ctx.fillStyle = isHovered ? '#fff' : color;
				ctx.beginPath();
				ctx.arc(screenX, screenY, isHovered ? 4 : 3, 0, Math.PI * 2);
				ctx.fill();

				// Tooltip/Label
				if (isHovered || marker.label) {
					ctx.fillStyle = theme === 'dark' ? '#fff' : '#000';
					ctx.font = isHovered ? 'bold 12px Inter, system-ui' : '10px Inter, system-ui';
					const labelText = isHovered ? marker.name : (marker.label || '');
					ctx.fillText(labelText, screenX + 12, screenY + 4);
				}
			}
		});

		hoveredMarkerId = currentHoveredId;

		if (autoRotate && !isDragging && !respectReducedMotion) {
			rotation += rotationSpeed;
		}

		if (isVisible) {
			frameId = requestAnimationFrame(draw);
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (!interactive) return;
		isDragging = true;
		lastPointerX = e.clientX;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (rect) {
			mouseX = e.clientX - rect.left;
			mouseY = e.clientY - rect.top;
		}

		if (!isDragging) return;
		const deltaX = e.clientX - lastPointerX;
		rotation += deltaX * 0.01;
		lastPointerX = e.clientX;
	}

	function handlePointerUp(e: PointerEvent) {
		isDragging = false;
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
	}

	function handlePointerLeave(e: PointerEvent) {
		isDragging = false;
		mouseX = -100;
		mouseY = -100;
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
	}

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		respectReducedMotion = mq.matches;
		const motionHandler = (e: MediaQueryListEvent) => respectReducedMotion = e.matches;
		mq.addEventListener('change', motionHandler);

		const observer = new IntersectionObserver((entries) => {
			const wasVisible = isVisible;
			isVisible = entries[0]?.isIntersecting ?? true;
			if (!wasVisible && isVisible) {
				draw();
			}
		});
		if (canvas) observer.observe(canvas);

		draw();
		return () => {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
				frameId = null;
			}
			mq.removeEventListener('change', motionHandler);
			observer.disconnect();
		};
	});
</script>

<div 
	class={cn("globe-container relative w-full aspect-square overflow-hidden cursor-grab active:cursor-grabbing touch-none", className)}
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	onpointerleave={handlePointerLeave}
	role="img"
	aria-label="Interactive 3D Globe showing global presence"
>
	<canvas 
		bind:this={canvas} 
		class="w-full h-full"
	></canvas>

	<!-- Accessible Data List Fallback -->
	<div class="sr-only">
		<h3>Global Presence Locations</h3>
		<ul>
			{#each markers as marker (marker.id)}
				<li>{marker.name}: {marker.lat}, {marker.long} {marker.label ? `(${marker.label})` : ''}</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.globe-container {
		user-select: none;
	}
</style>
