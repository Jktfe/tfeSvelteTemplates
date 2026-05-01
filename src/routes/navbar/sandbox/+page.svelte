<!--
  Navbar sandbox — embedded as an iframe by /navbar.

  The `@` suffix on the filename breaks out of every ancestor layout,
  so the global Navbar in src/routes/+layout.svelte is NOT mounted on
  this page. That avoids two Navbars stacking with conflicting focus
  traps, scroll locks, and z-index.

  Loads app.css explicitly because there's no inherited layout to do
  it for us. Marked noindex so it doesn't show up in search.
-->
<script lang="ts">
	import '../../../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { MenuCategory } from '$lib/types';

	const menuCategories: MenuCategory[] = [
		{
			name: 'Cards & Layout',
			icon: '🃏',
			items: [
				{ label: 'CardStack', href: '#cardstack', icon: '🃏', active: false },
				{ label: 'MagicCard', href: '#magiccard', icon: '✨', active: false },
				{ label: 'ExpandingCard', href: '#expandingcard', icon: '🎴', active: false },
				{ label: 'BentoGrid', href: '#bentogrid', icon: '🍱', active: false }
			]
		},
		{
			name: 'Navigation & Shell',
			icon: '☰',
			items: [
				{ label: 'Navbar', href: '#navbar', icon: '☰', active: true },
				{ label: 'SpeedDial', href: '#speeddial', icon: '⚡', active: false },
				{ label: 'Drawer', href: '#drawer', icon: '📥', active: false },
				{ label: 'FloatingDock', href: '#floatingdock', icon: '🧲', active: false }
			]
		},
		{
			name: 'Forms',
			icon: '📝',
			items: [{ label: 'TextField', href: '#textfield', icon: '🔤', active: false }]
		},
		{
			name: 'Single link',
			icon: '🏠',
			items: [{ label: 'Home', href: '#home', icon: '🏠', active: false }]
		}
	];

	// Pre-render four scroll sections so users can see how the navbar
	// behaves while the page scrolls beneath it.
	const sections = ['Welcome', 'Layout', 'Behaviour', 'Accessibility'];
</script>

<svelte:head>
	<title>Navbar sandbox · TFE</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="sb">
	<Navbar
		{menuCategories}
		logoIcon="⚡"
		logoText="Demo App"
		logoHref="#"
		currentPageTitle="Navbar sandbox"
	/>

	<main class="sb-main">
		<header class="sb-hero">
			<p class="sb-eyebrow">EMBEDDED PREVIEW</p>
			<h1>Click <span aria-hidden="true">☰</span> to open the panel</h1>
			<p class="sb-lede">
				This page is sandboxed inside the demo on <code>/navbar</code>. The category panel slides
				from the left, traps focus, locks <em>this iframe's</em> scroll while it's open, and
				restores focus to the trigger on close.
			</p>
		</header>

		<section class="sb-card sb-instructions">
			<h2>Try it</h2>
			<ul>
				<li>Click <kbd>☰</kbd> top-left — the panel slides in.</li>
				<li>Click any category header — its items expand or collapse.</li>
				<li><kbd>Tab</kbd> cycles inside the panel — focus stays trapped.</li>
				<li><kbd>Esc</kbd> or click outside — closes; focus returns to <kbd>☰</kbd>.</li>
				<li>Notice the active page (Navbar) is highlighted and its category auto-expanded.</li>
			</ul>
		</section>

		{#each sections as title, i (title)}
			<article class="sb-card">
				<h3>{String(i + 2).padStart(2, '0')}. {title}</h3>
				<p>
					Scroll past this block — the sticky header stays put. When the panel is open,
					scrolling here is locked so focus and scroll position stay coherent.
				</p>
				<p>
					This is a self-contained mini-app: the sandbox page breaks out of the site layout so
					the demo's Navbar doesn't fight the real one at the top of <code>/navbar</code>.
				</p>
			</article>
		{/each}
	</main>
</div>

<style>
	/* Scope to .sb so we don't restyle the actual Navbar inside. */
	.sb {
		min-height: 100vh;
		background: var(--bg, #ffffff);
		color: var(--fg, #111315);
	}
	.sb-main {
		max-width: 720px;
		margin: 0 auto;
		padding: 28px 22px 56px;
		display: grid;
		gap: 18px;
	}
	.sb-hero {
		padding: 14px 0 6px;
	}
	.sb-eyebrow {
		margin: 0 0 10px;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 11px;
		letter-spacing: 0.16em;
		color: var(--fg-3, #6b7280);
		text-transform: uppercase;
	}
	.sb-hero h1 {
		font-family: var(--font-display, inherit);
		font-weight: 400;
		font-size: clamp(28px, 4.5vw, 40px);
		text-transform: uppercase;
		letter-spacing: 0.01em;
		line-height: 1.1;
		margin: 0 0 12px;
		color: var(--fg-1, #111315);
	}
	.sb-lede {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		color: var(--fg-2, #4b5563);
		max-width: 56ch;
	}
	.sb-card {
		background: var(--surface, #ffffff);
		border: 1px solid var(--border, #d7deea);
		border-radius: var(--r-2, 12px);
		padding: 18px 20px;
	}
	.sb-card h2,
	.sb-card h3 {
		margin: 0 0 10px;
		font-family: var(--font-display, inherit);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1, #111315);
	}
	.sb-card p {
		margin: 0 0 8px;
		font-size: 14px;
		line-height: 1.55;
		color: var(--fg-2, #4b5563);
	}
	.sb-card p:last-child {
		margin-bottom: 0;
	}
	.sb-card ul {
		margin: 0;
		padding-left: 20px;
		display: grid;
		gap: 6px;
	}
	.sb-card li {
		font-size: 14px;
		line-height: 1.55;
		color: var(--fg-2, #4b5563);
	}
	.sb-card kbd {
		display: inline-block;
		padding: 1px 5px;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.85em;
		background: var(--surface-2, #f3f3ee);
		border: 1px solid var(--border, #d7deea);
		border-bottom-width: 2px;
		border-radius: 4px;
		color: var(--fg-1, #111315);
	}
	.sb-card code {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.9em;
		background: var(--surface-2, #f3f3ee);
		padding: 1px 5px;
		border-radius: 3px;
	}
</style>
