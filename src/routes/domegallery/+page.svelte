<!--
	============================================================
	DomeGallery Demo Page (TFE shell)
	============================================================

	Migrated onto ComponentPageShell. The full-viewport hero is
	now a sized stage inside the live-demo card so the page
	matches the rest of the catalogue while preserving the 3D
	dome interaction (pure CSS 3D, no Three.js).
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import DomeGallery from '$lib/components/DomeGallery.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/domegallery')!;

	// Sample images — small 300x300 crops keep first paint quick.
	const demoImages = [
		{ src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop', alt: 'Abstract gradient art' },
		{ src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&h=300&fit=crop', alt: 'Colorful gradient' },
		{ src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=300&fit=crop', alt: 'Purple abstract' },
		{ src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&h=300&fit=crop', alt: 'Fluid art' },
		{ src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop', alt: 'Abstract pink gradient' },
		{ src: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=300&h=300&fit=crop', alt: 'Neon lights' },
		{ src: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=300&fit=crop', alt: 'Abstract waves' },
		{ src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=300&h=300&fit=crop', alt: 'Digital art' },
		{ src: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=300&h=300&fit=crop', alt: 'Geometric patterns' },
		{ src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&h=300&fit=crop', alt: 'Holographic texture' },
		{ src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', alt: 'Ocean waves' },
		{ src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop', alt: 'Mountain peaks' },
		{ src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', alt: 'Alpine landscape' },
		{ src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop', alt: 'Forest sunlight' },
		{ src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=300&fit=crop', alt: 'Misty forest' },
		{ src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=300&fit=crop', alt: 'Galaxy nebula' },
		{ src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=300&h=300&fit=crop', alt: 'Starry night' },
		{ src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=300&fit=crop', alt: 'Milky way' },
		{ src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop', alt: 'Neon pink' },
		{ src: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=300&h=300&fit=crop', alt: 'Gradient blur' },
		{ src: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=300&h=300&fit=crop', alt: 'Paint swirl' },
		{ src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop', alt: 'Smoke art' },
		{ src: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=300&h=300&fit=crop', alt: 'Light trails' },
		{ src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', alt: 'Bokeh lights' },
		{ src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=300&h=300&fit=crop', alt: 'Building facade' },
		{ src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop', alt: 'City skyline' },
		{ src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop', alt: 'Urban architecture' },
		{ src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=300&fit=crop', alt: 'Night city' },
		{ src: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&h=300&fit=crop', alt: 'Ocean sunset' },
		{ src: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&h=300&fit=crop', alt: 'Cloud formations' }
	];

	const usageSnippet = `<script>
  import DomeGallery from '$lib/components/DomeGallery.svelte';

  const images = [
    { src: '/photos/01.jpg', alt: 'Photo 1' },
    { src: '/photos/02.jpg', alt: 'Photo 2' },
    '/photos/03.jpg' // strings work too
  ];
</${'script'}>

<div style="height: 70vh;">
  <DomeGallery {images} grayscale segments={35} />
</div>`;

	const codeExplanation =
		'Items are positioned on a sphere using rotateX, rotateY, and translateZ inside a CSS perspective stage. Pointer events track velocity each frame, then on release a friction-based inertia loop coasts the rotation to a stop. Click-to-enlarge uses a FLIP-style transform from the tile rectangle to a centred overlay. ResizeObserver keeps the radius proportional to the container, and the whole thing degrades cleanly when prefers-reduced-motion is set.';
</script>

<svelte:head>
	<title>DomeGallery — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive 3D spherical Svelte 5 gallery with drag-to-rotate, momentum, and click-to-enlarge. Pure CSS 3D — no Three.js."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', '3D CSS', 'Drag', 'Momentum', 'Zero deps']}
>
	{#snippet demo()}
		<div class="dg-stage">
			{#if browser}
				<DomeGallery images={demoImages} grayscale={true} segments={35} />
			{:else}
				<div class="dg-fallback">
					<p>Loading dome…</p>
				</div>
			{/if}
		</div>
		<ul class="dg-tips">
			<li><span aria-hidden="true">👆</span> Drag the dome to rotate</li>
			<li><span aria-hidden="true">🖱️</span> Click any tile to enlarge</li>
			<li><span aria-hidden="true">⌨️</span> Press <kbd>Esc</kbd> to close</li>
			<li><span aria-hidden="true">🎯</span> Release to coast on momentum</li>
		</ul>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>images</code></td>
					<td><code>(string | &#123;src, alt&#125;)[]</code></td>
					<td><code>[]</code></td>
					<td>URLs or objects with <code>src</code>/<code>alt</code>.</td>
				</tr>
				<tr>
					<td><code>segments</code></td>
					<td><code>number</code></td>
					<td><code>35</code></td>
					<td>Grid resolution — affects tile count and density.</td>
				</tr>
				<tr>
					<td><code>grayscale</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Apply a grayscale filter to tiles.</td>
				</tr>
				<tr>
					<td><code>fit</code></td>
					<td><code>number</code></td>
					<td><code>0.5</code></td>
					<td>Sphere radius as a fraction of the container.</td>
				</tr>
				<tr>
					<td><code>fitBasis</code></td>
					<td><code>'auto' | 'min' | 'max' | 'width' | 'height'</code></td>
					<td><code>'auto'</code></td>
					<td>Which dimension drives the radius calculation.</td>
				</tr>
				<tr>
					<td><code>minRadius</code> / <code>maxRadius</code></td>
					<td><code>number</code></td>
					<td><code>600</code> / <code>Infinity</code></td>
					<td>Clamp bounds for the sphere radius (px).</td>
				</tr>
				<tr>
					<td><code>dragSensitivity</code></td>
					<td><code>number</code></td>
					<td><code>20</code></td>
					<td>Higher = less sensitive to drag motion.</td>
				</tr>
				<tr>
					<td><code>dragDampening</code></td>
					<td><code>number</code></td>
					<td><code>0.8</code></td>
					<td>Inertia friction (0–1). Higher numbers coast longer.</td>
				</tr>
				<tr>
					<td><code>maxVerticalRotationDeg</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Clamp on vertical tilt to keep the dome readable.</td>
				</tr>
				<tr>
					<td><code>enlargeTransitionMs</code></td>
					<td><code>number</code></td>
					<td><code>300</code></td>
					<td>FLIP transition duration when enlarging a tile.</td>
				</tr>
				<tr>
					<td><code>overlayBlurColor</code></td>
					<td><code>string</code></td>
					<td><code>'#060010'</code></td>
					<td>Edge fade colour around the dome.</td>
				</tr>
				<tr>
					<td><code>imageBorderRadius</code> / <code>openedImageBorderRadius</code></td>
					<td><code>string</code></td>
					<td><code>'30px'</code></td>
					<td>Tile and enlarged-image corner radius.</td>
				</tr>
				<tr>
					<td><code>openedImageWidth</code> / <code>openedImageHeight</code></td>
					<td><code>string</code></td>
					<td><code>'250px'</code> / <code>'350px'</code></td>
					<td>Size of the enlarged image overlay.</td>
				</tr>
				<tr>
					<td><code>padFactor</code></td>
					<td><code>number</code></td>
					<td><code>0.25</code></td>
					<td>Viewer padding as a fraction of the container.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dg-stage {
		position: relative;
		width: 100%;
		height: clamp(420px, 70vh, 720px);
		border-radius: var(--r-2);
		background: #060010;
		overflow: hidden;
		isolation: isolate;
	}
	.dg-fallback {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
	}

	.dg-tips {
		list-style: none;
		padding: 0;
		margin: 16px 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px;
		font-size: 13px;
		color: var(--fg-2);
	}
	.dg-tips li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.dg-tips kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
</style>
