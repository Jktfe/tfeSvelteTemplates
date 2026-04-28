<script lang="ts">
	import Slider from '$lib/components/Slider.svelte';

	let basic = $state(50);
	let withBubble = $state(70);

	let smValue = $state(25);
	let mdValue = $state(50);
	let lgValue = $state(75);

	let defaultV = $state(40);
	let successV = $state(60);
	let dangerV = $state(80);

	let opacity = $state(0.6);
	let price = $state(45);

	let volume = $state(60);
	let brightness = $state(80);
	let opacityFx = $state(0.9);
	const totalIntensity = $derived(
		Math.round((volume / 100 + brightness / 100 + opacityFx) / 3 * 100)
	);
</script>

<svelte:head>
	<title>Slider | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Slider</h1>
			<p class="text-xl text-muted-foreground">
				Continuous-value range input with styled track + thumb, optional value bubble, three sizes, three variants,
				custom formatters, and full keyboard a11y.
			</p>
		</header>

		<section class="bg-white rounded-2xl p-12 border border-neutral-200 shadow-xl space-y-12">
			<div class="space-y-3">
				<h3 class="text-sm font-medium text-neutral-500">Basic — uncontrolled</h3>
				<Slider bind:value={basic} ariaLabel="Basic slider" />
				<p class="text-xs text-neutral-500">
					Current value: <code>{basic}</code>. Default range 0–100, step 1.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">With value bubble</h3>
				<Slider bind:value={withBubble} label="Volume" showValue />
				<p class="text-xs text-neutral-500">
					Bubble follows the thumb. <code>showValue</code> only affects rendering — the value is still the same.
				</p>
			</div>

			<div class="space-y-6 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Three sizes</h3>
				<Slider bind:value={smValue} label="Small" size="sm" showValue />
				<Slider bind:value={mdValue} label="Medium" size="md" showValue />
				<Slider bind:value={lgValue} label="Large" size="lg" showValue />
				<p class="text-xs text-neutral-500">Track 4 / 6 / 8 px. Thumb 14 / 18 / 22 px.</p>
			</div>

			<div class="space-y-6 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Three variants — fill colour</h3>
				<Slider bind:value={defaultV} label="Default (blue)" variant="default" showValue />
				<Slider bind:value={successV} label="Success (green)" variant="success" showValue />
				<Slider bind:value={dangerV} label="Danger (red)" variant="danger" showValue />
			</div>

			<div class="space-y-6 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Custom step + formatter</h3>
				<Slider
					bind:value={opacity}
					label="Opacity"
					min={0}
					max={1}
					step={0.05}
					showValue
					formatValue={(v) => `${Math.round(v * 100)}%`}
				/>
				<Slider
					bind:value={price}
					label="Max price"
					min={0}
					max={500}
					step={5}
					showValue
					formatValue={(v) => `£${v}`}
					variant="success"
				/>
				<p class="text-xs text-neutral-500">
					Step controls granularity. <code>formatValue</code> renders the bubble — render percentages,
					currency, time, anything.
				</p>
			</div>

			<div class="space-y-3 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Disabled state</h3>
				<Slider value={35} label="System reserved (admin only)" disabled showValue />
				<p class="text-xs text-neutral-500">
					Real <code>disabled</code> attribute — keyboard focus and pointer interaction blocked.
				</p>
			</div>

			<div class="space-y-6 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Live demo — three controls + computed total</h3>
				<Slider bind:value={volume} label="Volume" showValue />
				<Slider bind:value={brightness} label="Brightness" showValue variant="success" />
				<Slider
					bind:value={opacityFx}
					label="Opacity"
					min={0}
					max={1}
					step={0.05}
					showValue
					formatValue={(v) => `${Math.round(v * 100)}%`}
				/>
				<div class="flex items-center justify-between pt-2 border-t border-dashed border-neutral-300">
					<span class="text-sm font-medium text-neutral-700">Avg intensity</span>
					<span class="text-2xl font-bold tabular-nums text-blue-600">{totalIntensity}%</span>
				</div>
				<p class="text-xs text-neutral-500">
					All three sliders feed a derived total. Each is independently bindable; the total reactively
					updates via <code>$derived</code>.
				</p>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Native <code>&lt;input type="range"&gt;</code> — built-in <code>role="slider"</code> ARIA</li>
					<li>Two-way binding via <code>$bindable</code> (<code>bind:value</code>)</li>
					<li>Three sizes — sm / md / lg</li>
					<li>Three variants — default / success / danger</li>
					<li>Optional value bubble that follows the thumb</li>
					<li>Custom <code>formatValue</code> for label rendering</li>
					<li>Real <code>disabled</code> attribute</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Keyboard</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> — step by <code>step</code></li>
					<li><kbd>Home</kbd> / <kbd>End</kbd> — jump to <code>min</code> / <code>max</code></li>
					<li><kbd>PageUp</kbd> / <kbd>PageDown</kbd> — large step</li>
					<li><kbd>Tab</kbd> — focus</li>
				</ul>

				<h2 class="text-2xl font-semibold pt-4">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Volume, brightness, opacity, zoom</li>
					<li>Price filters, numeric range pickers</li>
					<li>Any continuous-value input where feel matters</li>
				</ul>
			</div>
		</section>
	</div>
</div>
