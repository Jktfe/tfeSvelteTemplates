<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
</script>

<svelte:head>
	<title>Tooltip | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Tooltip</h1>
			<p class="text-xl text-muted-foreground">
				Accessible hover/focus tooltip wrapping any trigger. ARIA-described,
				keyboard-friendly, dismissable with Escape.
			</p>
		</header>

		<section class="bg-neutral-950 rounded-2xl p-12 border border-neutral-800 shadow-2xl space-y-12">
			<div class="flex flex-col items-center space-y-6">
				<h3 class="text-sm font-medium text-neutral-400">Four placements</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-12 mt-12">
					<div class="flex justify-center">
						<Tooltip text="Save your changes" placement="top">
							<button class="demo-btn">Top</button>
						</Tooltip>
					</div>
					<div class="flex justify-center">
						<Tooltip text="Open settings" placement="right">
							<button class="demo-btn">Right</button>
						</Tooltip>
					</div>
					<div class="flex justify-center">
						<Tooltip text="Permanent action" placement="bottom">
							<button class="demo-btn">Bottom</button>
						</Tooltip>
					</div>
					<div class="flex justify-center">
						<Tooltip text="Cancel and close" placement="left">
							<button class="demo-btn">Left</button>
						</Tooltip>
					</div>
				</div>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Keyboard accessible</h3>
				<p class="text-xs text-neutral-500 max-w-sm text-center">
					Tab to focus the button — the tooltip appears. Press Escape to dismiss while focused.
				</p>
				<Tooltip text="Triggered by hover OR keyboard focus">
					<button class="demo-btn">Try Tab + Esc</button>
				</Tooltip>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Custom delay</h3>
				<div class="flex flex-wrap gap-6 justify-center items-center">
					<Tooltip text="Instant" showDelay={0}>
						<button class="demo-btn">0ms</button>
					</Tooltip>
					<Tooltip text="Default — 200ms">
						<button class="demo-btn">200ms</button>
					</Tooltip>
					<Tooltip text="Slow — 800ms reveal" showDelay={800}>
						<button class="demo-btn">800ms</button>
					</Tooltip>
				</div>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">On an icon button</h3>
				<Tooltip text="Add to favourites">
					<button class="icon-btn" aria-label="Favourite">
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
						</svg>
					</button>
				</Tooltip>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-800">
				<h3 class="text-sm font-medium text-neutral-400">Rich content via snippet</h3>
				<Tooltip>
					{#snippet tip()}
						<strong style="display:block;margin-bottom:2px">Pro tip</strong>
						<span style="opacity:0.8">Press <kbd>Cmd+S</kbd> instead</span>
					{/snippet}
					<button class="demo-btn">Hover for richer tip</button>
				</Tooltip>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Four placements — <code>top</code>, <code>right</code>, <code>bottom</code>, <code>left</code></li>
					<li>Configurable <code>showDelay</code> and <code>hideDelay</code></li>
					<li>Plain string <code>text</code> or rich <code>tip</code> snippet</li>
					<li>Triggered by hover AND keyboard focus</li>
					<li>Escape closes a visible tooltip</li>
					<li>Linked via <code>aria-describedby</code> for screen readers</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Icon-only buttons that need a textual label for sighted users</li>
					<li>Truncated table cells or short hints next to form inputs</li>
					<li>Keyboard shortcut reminders on toolbar buttons</li>
				</ul>
			</div>
		</section>
	</div>
</div>

<style>
	.demo-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #f3f4f6;
		background-color: #1f2937;
		border: 1px solid #374151;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.demo-btn:hover,
	.demo-btn:focus-visible {
		background-color: #374151;
		outline: none;
	}

	.demo-btn:focus-visible {
		box-shadow: 0 0 0 2px #3b82f6;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		color: #f9a8d4;
		background-color: #1f2937;
		border: 1px solid #374151;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.icon-btn:hover,
	.icon-btn:focus-visible {
		background-color: #374151;
		outline: none;
	}

	kbd {
		display: inline-block;
		padding: 0 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}
</style>
