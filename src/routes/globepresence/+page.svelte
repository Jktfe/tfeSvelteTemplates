<script lang="ts">
	import GlobePresence from '$lib/components/GlobePresence.svelte';
	import type { GlobeMarker } from '$lib/types';

	const sampleMarkers: GlobeMarker[] = [
		{ id: '1', name: 'San Francisco', lat: 37.7749, long: -122.4194, label: 'Headquarters' },
		{ id: '2', name: 'London', lat: 51.5074, long: -0.1278, label: 'EMEA Hub' },
		{ id: '3', name: 'Tokyo', lat: 35.6762, long: 139.6503, label: 'APAC Hub' },
		{ id: '4', name: 'Sydney', lat: -33.8688, long: 151.2093, label: 'Australia Office' },
		{ id: '5', name: 'São Paulo', lat: -23.5505, long: -46.6333, label: 'LATAM Hub' },
		{ id: '6', name: 'Cape Town', lat: -33.9249, long: 18.4241, label: 'Africa Region' }
	];
</script>

<svelte:head>
	<title>GlobePresence | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-8">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">GlobePresence</h1>
			<p class="text-xl text-muted-foreground">
				High-performance 3D globe visualization for global presence.
			</p>
		</header>

		<div class="bg-neutral-950 rounded-2xl p-8 border border-neutral-800 shadow-2xl overflow-hidden relative">
			<!-- [CR] Stunning decorative background effect -->
			<div class="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none"></div>
			
			<GlobePresence 
				markers={sampleMarkers}
				autoRotate={true}
				rotationSpeed={0.003}
				class="max-w-lg mx-auto"
			/>
		</div>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Smooth 60fps canvas-based 3D rotation</li>
					<li>Interactive mouse/touch drag navigation</li>
					<li>Plottable markers with glowing neon effects</li>
					<li>Lightweight and zero-dependency implementation</li>
					<li>Accessible screen-reader fallback</li>
				</ul>
			</div>
			
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre class="bg-neutral-900 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800">
<code>{`<GlobePresence 
  markers={[
    { lat: 37.77, long: -122.41, label: 'SF' }
  ]}
  autoRotate={true}
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>

<style>
	.bg-radial-gradient {
		background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
	}
</style>
