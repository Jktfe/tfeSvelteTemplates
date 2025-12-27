<!--
  ============================================================
  Navbar - Responsive Navigation with Sliding Panel
  ============================================================

  [CR] WHAT IT DOES
  A responsive navigation bar with a hamburger menu that opens a left-side
  sliding panel. Features collapsible category sections for organising 28+
  components into logical groups with smooth animations and full a11y support.

  [NTL] THE SIMPLE VERSION
  This is the menu bar at the top of every page! Click the hamburger button
  (those three lines) and a panel slides in from the left with all the
  navigation options organised into categories you can expand and collapse.

  ✨ FEATURES
  • Hamburger button that transforms into an X when open
  • Left-sliding panel with categorised, collapsible sections
  • Categories expand/collapse with smooth animations
  • Active page highlighting within categories
  • Backdrop overlay when panel is open
  • Sticky positioning with backdrop blur effect
  • Conditional auth UI (Clerk when configured, demo badge otherwise)

  ♿ ACCESSIBILITY
  • Keyboard: Tab navigation, Enter to toggle, Escape to close
  • Screen readers: ARIA labels, expanded states, current page
  • Focus trap: Tab stays within panel when open
  • Motion: Respects prefers-reduced-motion

  📦 DEPENDENCIES
  Zero external dependencies (except optional Clerk for auth)

  ⚠️ WARNINGS
  • a11y_no_noninteractive_element_interactions: Intentional - nav element needs
    keyboard handling for Escape key and focus trap (WCAG 2.1.1, 2.4.3)
  • CSS :global() selectors: Required because ClerkProvider breaks Svelte 5
    reactivity, forcing manual DOM manipulation that needs unscoped CSS

  🎨 USAGE
  <Navbar {menuCategories} currentPageTitle="Home" isClerkConfigured={true} />

  📋 PROPS
  | Prop             | Type            | Default           | Description                    |
  |------------------|-----------------|-------------------|--------------------------------|
  | menuCategories   | MenuCategory[]  | []                | Categorised navigation items   |
  | menuItems        | MenuItem[]      | []                | Legacy flat list (deprecated)  |
  | currentPageTitle | string          | 'Home'            | Current page title             |
  | logoIcon         | string          | '⚡'              | Logo emoji/icon                |
  | logoText         | string          | 'Svelte Templates'| Logo text                      |
  | logoHref         | string          | '/'               | Logo link destination          |
  | isClerkConfigured| boolean         | false             | Show Clerk auth UI             |
  | githubUrl        | string          | ''                | GitHub repo URL (shows button) |

  ============================================================
-->

<script lang="ts">
	// =========================================================================
	// [CR] IMPORTS
	// [NTL] These bring in the tools we need - Svelte helpers, types, and auth UI
	// =========================================================================

	import { untrack } from 'svelte';
	import type { NavbarProps, MenuCategory } from '$lib/types';
	import { SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';
	import { lockScroll } from '$lib/scrollLock';

	// =========================================================================
	// [CR] PROPS - All configurable options with sensible defaults
	// [NTL] These are the settings you pass when using the Navbar component
	// =========================================================================

	let {
		menuCategories = [],      // [NTL] Navigation items grouped by category
		menuItems = [],           // [NTL] Legacy flat list (for backwards compatibility)
		currentPageTitle = 'Home', // [NTL] Shows which page you're on
		logoIcon = '⚡',          // [NTL] The emoji/icon next to the logo
		logoText = 'Svelte Templates', // [NTL] The text in the logo
		logoHref = '/',           // [NTL] Where clicking the logo takes you
		isClerkConfigured = false, // [NTL] Whether authentication is enabled
		githubUrl = ''            // [NTL] GitHub repo URL - shows button when provided
	}: NavbarProps = $props();

	// =========================================================================
	// [CR] CATEGORY EXPANSION STATE
	// [NTL] This tracks which menu categories are currently open/closed.
	//       Think of it like an accordion - only some sections are expanded!
	// =========================================================================

	// [CR] Using a Set for O(1) lookup performance when checking expanded state
	let expandedCategories = $state<Set<string>>(new Set());

	// [CR] Auto-expand the category containing the active page on initial render
	// [NTL] When the page loads, we automatically open the section that contains
	//       the current page - so users can see where they are in the menu!
	$effect(() => {
		// [CR] Only depend on menuCategories, not expandedCategories (avoid infinite loop)
		const activeCategory = menuCategories.find((category) =>
			category.items.some((item) => item.active)
		);
		if (activeCategory) {
			// [CR] Uses untrack() to write state without creating a reactive dependency
			// [NTL] This prevents the effect from running forever in a loop
			untrack(() => {
				expandedCategories.add(activeCategory.name);
				expandedCategories = new Set(expandedCategories);
			});
		}
	});

	// [CR] Toggle category expansion - add if missing, remove if present
	function toggleCategory(categoryName: string) {
		if (expandedCategories.has(categoryName)) {
			expandedCategories.delete(categoryName);
		} else {
			expandedCategories.add(categoryName);
		}
		// [CR] Create new Set to trigger Svelte 5 reactivity (Sets are reference-compared)
		expandedCategories = new Set(expandedCategories);
	}

	// [CR] Helper function for checking expansion state
	function isCategoryExpanded(categoryName: string): boolean {
		return expandedCategories.has(categoryName);
	}

	// =========================================================================
	// [CR] PANEL STATE
	// [NTL] This controls whether the sliding menu panel is open or closed
	// =========================================================================

	let isPanelOpen = $state(false);

	// [CR] Workaround for Svelte 5 reactivity issue with ClerkProvider
	// [NTL] ClerkProvider sometimes breaks Svelte's automatic updates, so we
	//       calculate the CSS class names manually to ensure they always update
	let panelClass = $derived(isPanelOpen ? 'panel open' : 'panel');
	let hamburgerClass = $derived(isPanelOpen ? 'hamburger-button open' : 'hamburger-button');

	// =========================================================================
	// [CR] SCROLL LOCK MANAGEMENT
	// [NTL] When the menu is open, we stop the page from scrolling behind it.
	//       This shared utility prevents conflicts with other components.
	// =========================================================================

	let unlockScroll: (() => void) | null = null;

	// =========================================================================
	// [CR] PANEL TOGGLE FUNCTIONS
	// [NTL] These handle opening/closing the sliding menu panel
	// =========================================================================

	function togglePanel() {
		isPanelOpen = !isPanelOpen;

		// [CR] WORKAROUND: Force DOM update since ClerkProvider breaks Svelte 5 reactivity
		// [NTL] Sometimes Svelte doesn't update the screen properly when Clerk is running,
		//       so we manually add/remove CSS classes to make sure the animation works
		if (typeof document !== 'undefined') {
			const panel = document.getElementById('panel-menu');
			const button = document.querySelector('.hamburger-button, [class*="hamburger-button"]');

			if (isPanelOpen) {
				panel?.classList.add('open');
				button?.classList.add('open');
			} else {
				panel?.classList.remove('open');
				button?.classList.remove('open');
			}
		}
	}

	function closePanel() {
		isPanelOpen = false;

		// [CR] WORKAROUND: Force DOM update (same ClerkProvider issue as togglePanel)
		if (typeof document !== 'undefined') {
			const panel = document.getElementById('panel-menu');
			const button = document.querySelector('.hamburger-button, [class*="hamburger-button"]');

			panel?.classList.remove('open');
			button?.classList.remove('open');
		}
	}

	// =========================================================================
	// [CR] KEYBOARD ACCESSIBILITY
	// [NTL] These functions make sure keyboard users can navigate the menu
	//       just as easily as mouse users - this is super important for a11y!
	// =========================================================================

	// [CR] Reference to the panel element for focus management
	let panelElement: HTMLElement | null = null;

	// [CR] Handle keyboard events on the panel (element-scoped, not window-level)
	// [NTL] When you press Escape, the menu closes - nice and intuitive!
	function handlePanelKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePanel();
		}
	}

	// [CR] Focus trap for panel accessibility (WCAG 2.4.3)
	// [NTL] This is clever! When you Tab through the menu, it wraps around instead
	//       of letting focus escape to the page behind. Like a merry-go-round!
	function setupFocusTrap(node: HTMLElement) {
		panelElement = node;

		function handleFocusTrap(e: KeyboardEvent) {
			if (e.key !== 'Tab') return;

			// [CR] Find all focusable elements in the panel
			const focusableElements = node.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			// [CR] Wrap focus from last to first (or first to last with Shift+Tab)
			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			} else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
		}

		node.addEventListener('keydown', handleFocusTrap);

		// [CR] Svelte action cleanup pattern - remove listener when component unmounts
		return {
			destroy() {
				node.removeEventListener('keydown', handleFocusTrap);
				panelElement = null;
			}
		};
	}

	// =========================================================================
	// [CR] PANEL STATE SIDE EFFECTS
	// [NTL] When the panel opens/closes, we need to do a few housekeeping tasks
	// =========================================================================

	$effect(() => {
		if (isPanelOpen) {
			// [CR] Lock scroll when panel opens to prevent background scrolling
			unlockScroll = lockScroll();
			// [CR] Focus the panel for keyboard navigation after render
			// [NTL] The setTimeout ensures the panel is visible before we try to focus it
			setTimeout(() => panelElement?.focus(), 0);
		} else if (unlockScroll) {
			// [CR] Unlock scroll when panel closes
			unlockScroll();
			unlockScroll = null;
		}

		// [CR] Cleanup on component unmount - always unlock scroll!
		return () => {
			if (unlockScroll) {
				unlockScroll();
				unlockScroll = null;
			}
		};
	});
</script>

<header class="navbar">
	<div class="navbar-inner">
		<!-- Left Section: Hamburger + Logo -->
		<div class="navbar-left">
			<button
				class={hamburgerClass}
				onclick={togglePanel}
				aria-label={isPanelOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={isPanelOpen}
				aria-controls="panel-menu"
			>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
			</button>

			<a href={logoHref} class="navbar-logo">
				<span class="navbar-logo-icon" aria-hidden="true">{logoIcon}</span>
				<span class="navbar-logo-text">{logoText}</span>
			</a>
		</div>

		<!-- Right Section: GitHub + Auth UI -->
		<div class="navbar-right">
			{#if githubUrl}
				<!-- GitHub link button -->
				<a
					href={githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="github-button"
					aria-label="View on GitHub"
					title="View on GitHub"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
				</a>
			{/if}

			{#if isClerkConfigured}
				<!-- Clerk authentication UI when configured -->
				<div class="auth-buttons">
					<SignedOut>
						<SignInButton mode="modal" class="auth-button" />
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			{:else}
				<!-- Demo mode indicator when Clerk is not configured -->
				<div class="auth-demo-badge" title="Configure Clerk to enable authentication">
					<span class="demo-icon">🔓</span>
					<span class="demo-text">Demo Mode</span>
				</div>
			{/if}
		</div>
	</div>
</header>

<!-- Panel Overlay -->
{#if isPanelOpen}
	<div class="panel-overlay" onclick={closePanel} aria-hidden="true"></div>
{/if}

<!-- Left Panel Menu -->
<!-- Focus trap and element-scoped keyboard handling for accessibility -->
<!-- tabindex="-1" allows programmatic focus without being in tab order when closed -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions - Intentional: nav needs keyboard handling for escape key and focus trap (WCAG 2.1.1, 2.4.3) -->
<nav
	id="panel-menu"
	class={panelClass}
	aria-label="Main navigation"
	tabindex="-1"
	onkeydown={handlePanelKeydown}
	use:setupFocusTrap
>
	<div class="panel-content">
		{#if menuCategories.length > 0}
			<!-- Categorised navigation (preferred) -->
			<div class="panel-categories">
				{#each menuCategories as category, categoryIndex}
					{@const isExpanded = isCategoryExpanded(category.name)}
					{@const hasActiveItem = category.items.some((item) => item.active)}
					{@const isSingleItem = category.items.length === 1}

					<div class="panel-category" style="--category-index: {categoryIndex}">
						{#if isSingleItem}
							<!-- Single-item categories render as direct links (like Home) -->
							<a
								href={category.items[0].href}
								class="panel-category-link"
								class:active={category.items[0].active}
								aria-current={category.items[0].active ? 'page' : undefined}
								onclick={closePanel}
							>
								{#if category.icon}
									<span class="panel-category-icon" aria-hidden="true">{category.icon}</span>
								{/if}
								<span class="panel-category-name">{category.items[0].label}</span>
								{#if category.items[0].active}
									<span class="panel-menu-indicator" aria-hidden="true"></span>
								{/if}
							</a>
						{:else}
							<!-- Multi-item categories are collapsible -->
							<button
								class="panel-category-header"
								class:expanded={isExpanded}
								class:has-active={hasActiveItem}
								onclick={() => toggleCategory(category.name)}
								aria-expanded={isExpanded}
								aria-controls="category-{category.name.replace(/\s+/g, '-').toLowerCase()}"
							>
								{#if category.icon}
									<span class="panel-category-icon" aria-hidden="true">{category.icon}</span>
								{/if}
								<span class="panel-category-name">{category.name}</span>
								<span class="panel-category-chevron" aria-hidden="true">
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
										<path
											d="M3 4.5L6 7.5L9 4.5"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</span>
							</button>

							{#if isExpanded}
								<ul
									id="category-{category.name.replace(/\s+/g, '-').toLowerCase()}"
									class="panel-category-items"
								>
									{#each category.items as item, itemIndex}
										<li class="panel-menu-item" style="--item-index: {itemIndex}">
											<a
												href={item.href}
												class="panel-menu-link"
												class:active={item.active}
												aria-current={item.active ? 'page' : undefined}
												onclick={closePanel}
											>
												{#if item.icon}
													<span class="panel-menu-icon" aria-hidden="true">{item.icon}</span>
												{/if}
												<span class="panel-menu-label">{item.label}</span>
												{#if item.active}
													<span class="panel-menu-indicator" aria-hidden="true"></span>
												{/if}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		{:else if menuItems && menuItems.length > 0}
			<!-- Legacy flat menu (for backwards compatibility) -->
			<ul class="panel-menu">
				{#each menuItems as item, index}
					<li class="panel-menu-item" style="--item-index: {index}">
						<a
							href={item.href}
							class="panel-menu-link"
							class:active={item.active}
							aria-current={item.active ? 'page' : undefined}
							onclick={closePanel}
						>
							{#if item.icon}
								<span class="panel-menu-icon" aria-hidden="true">{item.icon}</span>
							{/if}
							<span class="panel-menu-label">{item.label}</span>
							{#if item.active}
								<span class="panel-menu-indicator" aria-hidden="true"></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</nav>

<style>
	/* ============================================
	   Framework7-Style Navbar with Left Panel
	   ============================================ */

	.navbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 1rem;
		min-height: 56px;
		gap: 1rem;
	}

	/* ============================================
	   Left Section: Hamburger + Logo
	   ============================================ */

	.navbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.hamburger-button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.3125rem;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.2s ease;
	}

	.hamburger-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.hamburger-button:focus {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	.hamburger-line {
		display: block;
		width: 1.25rem;
		height: 2px;
		background-color: #000000;
		border-radius: 2px;
		transition: all 0.3s ease;
		transform-origin: center;
	}

	.hamburger-button.open .hamburger-line:nth-child(1) {
		transform: translateY(0.375rem) rotate(45deg);
	}

	.hamburger-button.open .hamburger-line:nth-child(2) {
		opacity: 0;
		transform: scaleX(0);
	}

	.hamburger-button.open .hamburger-line:nth-child(3) {
		transform: translateY(-0.375rem) rotate(-45deg);
	}

	.navbar-logo {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: #000000;
		font-weight: 600;
		font-size: 1rem;
		transition: opacity 0.2s ease;
		white-space: nowrap;
	}

	.navbar-logo:hover {
		opacity: 0.7;
	}

	.navbar-logo:focus {
		outline: 2px solid #007aff;
		outline-offset: 4px;
		border-radius: 4px;
	}

	.navbar-logo-icon {
		font-size: 1.375rem;
		line-height: 1;
	}

	.navbar-logo-text {
		line-height: 1;
	}

	/* ============================================
	   Right Section: Auth UI
	   ============================================ */

	.navbar-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		flex: 1;
	}

	/* GitHub button styling */
	.github-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		color: #24292f;
		background-color: transparent;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.github-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #000000;
	}

	.github-button:focus {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	.auth-buttons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Style for Clerk's SignInButton - uses :global since button is rendered by Clerk */
	.auth-buttons :global(button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
		white-space: nowrap;
	}

	.auth-buttons :global(button:hover) {
		background-color: #0056b3;
	}

	.auth-buttons :global(button:focus) {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	.auth-demo-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background-color: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
		cursor: help;
	}

	.demo-icon {
		font-size: 0.875rem;
	}

	.demo-text {
		white-space: nowrap;
	}

	/* ============================================
	   Panel Overlay
	   ============================================ */

	.panel-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		z-index: 999;
		animation: fade-in 0.3s ease;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ============================================
	   Left Panel Menu
	   ============================================ */

	.panel {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(80vw, 280px);
		background-color: #ffffff;
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.panel.open {
		transform: translateX(0);
	}

	.panel-content {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		padding: 1rem 0;
	}

	.panel-menu {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.panel-menu-item {
		opacity: 0;
		transform: translateX(-1rem);
	}

	.panel.open .panel-menu-item {
		animation: slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		animation-delay: calc(0.05s * var(--item-index));
	}

	@keyframes slide-in {
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.panel-menu-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		text-decoration: none;
		color: #000000;
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.2s ease;
		position: relative;
		border-left: 3px solid transparent;
	}

	.panel-menu-link:hover {
		background-color: rgba(0, 122, 255, 0.05);
		color: #007aff;
	}

	.panel-menu-link:focus {
		outline: 2px solid #007aff;
		outline-offset: -2px;
		background-color: rgba(0, 122, 255, 0.05);
	}

	.panel-menu-link.active {
		color: #007aff;
		font-weight: 600;
		background-color: rgba(0, 122, 255, 0.08);
		border-left-color: #007aff;
	}

	.panel-menu-icon {
		font-size: 1.375rem;
		line-height: 1;
		width: 1.5rem;
		text-align: center;
		flex-shrink: 0;
	}

	.panel-menu-label {
		flex: 1;
		line-height: 1.4;
	}

	.panel-menu-indicator {
		width: 0.375rem;
		height: 0.375rem;
		background-color: #007aff;
		border-radius: 50%;
		margin-left: auto;
		flex-shrink: 0;
	}

	/* ============================================
	   Category-based Navigation
	   ============================================ */

	.panel-categories {
		display: flex;
		flex-direction: column;
	}

	.panel-category {
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.panel-category:last-child {
		border-bottom: none;
	}

	/* Category header button (for collapsible sections) */
	.panel-category-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.875rem 1.25rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		transition: all 0.2s ease;
	}

	.panel-category-header:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	.panel-category-header:focus {
		outline: 2px solid #007aff;
		outline-offset: -2px;
	}

	.panel-category-header.has-active {
		color: #007aff;
	}

	/* Single-item category link (like Home) */
	.panel-category-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		transition: all 0.2s ease;
	}

	.panel-category-link:hover {
		background-color: rgba(0, 122, 255, 0.05);
		color: #007aff;
	}

	.panel-category-link:focus {
		outline: 2px solid #007aff;
		outline-offset: -2px;
	}

	.panel-category-link.active {
		color: #007aff;
		background-color: rgba(0, 122, 255, 0.08);
	}

	.panel-category-icon {
		font-size: 1.125rem;
		line-height: 1;
		width: 1.25rem;
		text-align: center;
		flex-shrink: 0;
	}

	.panel-category-name {
		flex: 1;
	}

	.panel-category-chevron {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
		transition: transform 0.2s ease;
	}

	.panel-category-header.expanded .panel-category-chevron {
		transform: rotate(180deg);
	}

	/* Category items list (when expanded) */
	/* Using :global() because these elements may be created dynamically via DOM manipulation
	   (workaround for ClerkProvider breaking Svelte 5 reactivity) and need unscoped CSS */
	:global(.panel-category-items) {
		list-style: none;
		margin: 0;
		padding: 0 0 0.5rem 0;
		background-color: rgba(0, 0, 0, 0.02);
	}

	:global(.panel-category-items .panel-menu-item) {
		opacity: 1;
		transform: none;
	}

	:global(.panel-category-items .panel-menu-link) {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.625rem 1.25rem 0.625rem 3rem;
		text-decoration: none;
		color: #000000;
		font-size: 0.875rem;
		font-weight: 500;
		border-left: none;
		transition: all 0.2s ease;
	}

	:global(.panel-category-items .panel-menu-link:hover) {
		background-color: rgba(0, 122, 255, 0.05);
		color: #007aff;
	}

	:global(.panel-category-items .panel-menu-link.active) {
		color: #007aff;
		font-weight: 600;
		background-color: rgba(0, 122, 255, 0.08);
	}

	:global(.panel-category-items .panel-menu-icon) {
		font-size: 1rem;
		width: 1.25rem;
		line-height: 1;
		text-align: center;
		flex-shrink: 0;
	}

	:global(.panel-category-items .panel-menu-label) {
		flex: 1;
		line-height: 1.4;
	}

	:global(.panel-category-items .panel-menu-indicator) {
		width: 0.375rem;
		height: 0.375rem;
		background-color: #007aff;
		border-radius: 50%;
		margin-left: auto;
		flex-shrink: 0;
	}

	/* ============================================
	   Responsive Breakpoints
	   ============================================ */

	@media (min-width: 640px) {
		.navbar-inner {
			padding: 0 1.5rem;
			min-height: 64px;
		}

		.panel {
			width: min(70vw, 320px);
		}
	}

	@media (min-width: 1024px) {
		.navbar-inner {
			padding: 0 2rem;
		}
	}

	/* ============================================
	   Accessibility & Reduced Motion
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.navbar-logo,
		.hamburger-button,
		.hamburger-line,
		.panel,
		.panel-menu-link {
			transition-duration: 0.01ms;
			animation-duration: 0.01ms;
		}

		.panel-menu-item {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
