<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Marquee from '$lib/components/Marquee.svelte';
	import MarqueeDraggable from '$lib/components/MarqueeDraggable.svelte';
	import type { PageData } from './$types';

	const shell = catalogShellPropsForSlug('/marquee')!;

	let { data }: { data: PageData } = $props();

	let testimonials = $derived(data.staticTestimonials);
	let testimonialsInteractive = $derived(data.interactiveTestimonials);

	const companies = ['🚀 SpaceX', '🍎 Apple', '🔍 Google', '💼 Microsoft', '⚡ Tesla', '🎵 Spotify'];

	const features = [
		'⚡ Lightning Fast',
		'📱 Mobile Responsive',
		'♿ Fully Accessible',
		'🎨 Customisable',
		'🚀 Zero Dependencies',
		'📝 TypeScript Support'
	];

	const products = [
		{ emoji: '⌚', name: 'Smartwatch' },
		{ emoji: '🎧', name: 'Headphones' },
		{ emoji: '💻', name: 'Laptop' },
		{ emoji: '📱', name: 'Smartphone' },
		{ emoji: '🖥️', name: 'Monitor' },
		{ emoji: '⌨️', name: 'Keyboard' }
	];

	const featuresInteractive = [
		'👆 Click & Drag',
		'🚀 Momentum Scrolling',
		'🔄 Direction Control',
		'📱 Touch Support',
		'⚡ GPU Accelerated',
		'♿ Accessible'
	];
</script>

<svelte:head>
	<title>Marquee — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Continuous scrolling marquee — static (CSS only, pause-on-hover) and interactive (click-and-drag with momentum) variants share an API."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Marquee', 'Database', 'A11y']}
	codeExplanation="Marquee.svelte duplicates its content and runs a CSS keyframe scroll, pausing via animation-play-state when pauseOnHover is set. MarqueeDraggable.svelte adds a pointerdown/pointermove/pointerup pipeline with momentum decay, letting users grab the rail and fling it. The demo loads testimonials from Neon with graceful fallback so the page works whether DATABASE_URL is configured or not."
>
	{#snippet demo()}
		<div class="mq-demo">
			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Static Marquee · testimonials</h3>
					<p>Hover to pause. Default 60 s loop.</p>
				</header>
				<div class="mq-stage">
					<Marquee pauseOnHover={true} duration={60}>
						{#each testimonials as testimonial (testimonial.id)}
							<div class="mq-testimonial">
								<div class="mq-avatar">{testimonial.avatar}</div>
								<p class="mq-quote">"{testimonial.quote}"</p>
								<div class="mq-author">
									<strong>{testimonial.name}</strong>
									<span class="mq-role">{testimonial.role} at {testimonial.company}</span>
								</div>
							</div>
						{/each}
					</Marquee>
				</div>
			</section>

			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Static Marquee · company logos</h3>
					<p>Faster 20 s loop.</p>
				</header>
				<div class="mq-stage">
					<Marquee pauseOnHover={true} duration={20}>
						{#each companies as company (company)}
							<div class="mq-logo">{company}</div>
						{/each}
					</Marquee>
				</div>
			</section>

			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Static Marquee · reverse direction</h3>
					<p>reverse={true} flips the scroll.</p>
				</header>
				<div class="mq-stage">
					<Marquee pauseOnHover={true} reverse={true} duration={40}>
						{#each features as feature (feature)}
							<div class="mq-feature">{feature}</div>
						{/each}
					</Marquee>
				</div>
			</section>

			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Draggable Marquee · products</h3>
					<p>Grab and fling. Momentum decays after release.</p>
				</header>
				<div class="mq-stage">
					<MarqueeDraggable duration={30} dragMomentum={true}>
						{#each products as product (product.name)}
							<div class="mq-product">
								<div class="mq-product-emoji">{product.emoji}</div>
								<p class="mq-product-name">{product.name}</p>
							</div>
						{/each}
					</MarqueeDraggable>
				</div>
			</section>

			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Draggable Marquee · testimonials</h3>
					<p>Slow loop, drag to read at your own pace.</p>
				</header>
				<div class="mq-stage">
					<MarqueeDraggable duration={50} dragMomentum={true}>
						{#each testimonialsInteractive as testimonial (testimonial.id)}
							<div class="mq-testimonial">
								<div class="mq-avatar">{testimonial.avatar}</div>
								<p class="mq-quote">"{testimonial.quote}"</p>
								<div class="mq-author">
									<strong>{testimonial.name}</strong>
									<span class="mq-role">{testimonial.role} at {testimonial.company}</span>
								</div>
							</div>
						{/each}
					</MarqueeDraggable>
				</div>
			</section>

			<section class="mq-section">
				<header class="mq-section-head">
					<h3>Draggable Marquee · features</h3>
					<p>Fast 20 s loop with reverse direction.</p>
				</header>
				<div class="mq-stage">
					<MarqueeDraggable duration={20} reverse={true} dragMomentum={true}>
						{#each featuresInteractive as feature (feature)}
							<div class="mq-feature mq-feature--alt">{feature}</div>
						{/each}
					</MarqueeDraggable>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>duration</code></td><td><code>number</code></td><td><code>40</code></td><td>Loop duration in seconds.</td></tr>
				<tr><td><code>reverse</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Flip scroll direction.</td></tr>
				<tr><td><code>pauseOnHover</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Static variant only — pause on hover.</td></tr>
				<tr><td><code>dragEnabled</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Draggable variant only — enable click-and-drag.</td></tr>
				<tr><td><code>dragMomentum</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Draggable variant only — apply momentum after release.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mq-demo {
		display: grid;
		gap: 1.5rem;
	}
	.mq-section {
		display: grid;
		gap: 0.75rem;
	}
	.mq-section-head h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.mq-section-head p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
	.mq-stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2rem 0;
		overflow: hidden;
	}

	:global(.mq-testimonial) {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		min-width: 320px;
		max-width: 320px;
		color: var(--fg-1);
	}
	:global(.mq-testimonial .mq-avatar) {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
	}
	:global(.mq-testimonial .mq-quote) {
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.55;
		margin: 0 0 1rem;
		font-style: italic;
	}
	:global(.mq-testimonial .mq-author) {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	:global(.mq-testimonial .mq-author strong) {
		font-size: 0.95rem;
	}
	:global(.mq-testimonial .mq-role) {
		font-size: 0.85rem;
		color: var(--fg-2);
	}

	.mq-logo {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem 2.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--fg-1);
		white-space: nowrap;
	}
	.mq-feature {
		background: linear-gradient(135deg, #146ef5 0%, #667eea 100%);
		color: white;
		padding: 0.6rem 1.25rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.95rem;
		white-space: nowrap;
	}
	.mq-feature--alt {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
	}

	.mq-product {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem 1.25rem;
		min-width: 150px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		color: var(--fg-1);
	}
	.mq-product-emoji {
		font-size: 2.5rem;
	}
	.mq-product-name {
		font-weight: 600;
		font-size: 0.95rem;
		margin: 0;
	}
</style>
