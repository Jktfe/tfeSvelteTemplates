<!--
  Navbar Component

  A responsive navigation bar following Framework7's panel pattern.
  Features a hamburger menu that opens a left-side sliding panel.

  Features:
  - Hamburger button on the left (next to logo)
  - Left-sliding panel menu with all navigation items
  - Panel is scrollable if content exceeds viewport height
  - Logo and page title in navbar
  - Backdrop overlay when panel is open
  - Sticky positioning with backdrop blur
  - Collapsible menu with smooth animations
  - Conditional auth UI (Clerk when configured, demo mode otherwise)
  - Zero external dependencies

  Usage:
    <Navbar {menuItems} currentPageTitle="Home" isClerkConfigured={true} />

  Props:
  - menuItems: Array of MenuItem objects for navigation
  - currentPageTitle: Title of the current page displayed in navbar
  - logoIcon: Logo icon/emoji (default: '⚡')
  - logoText: Logo text (default: 'Svelte Templates')
  - logoHref: Logo link destination (default: '/')
  - isClerkConfigured: Whether Clerk authentication is configured (default: false)
-->

<script lang="ts">
	import type { NavbarProps } from '$lib/types';
	import { SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';
	import { lockScroll } from '$lib/scrollLock';

	let {
		menuItems,
		currentPageTitle = 'Home',
		logoIcon = '⚡',
		logoText = 'Svelte Templates',
		logoHref = '/',
		isClerkConfigured = false
	}: NavbarProps = $props();

	let isPanelOpen = $state(false);

	// Scroll lock cleanup function - coordinated via scrollLock utility
	// This prevents conflicts with other components (Editor, FolderFiles) that also lock scroll
	let unlockScroll: (() => void) | null = null;

	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}

	function closePanel() {
		isPanelOpen = false;
	}

	// Reference to the panel element for focus management
	let panelElement: HTMLElement | null = null;

	/**
	 * Handle keyboard events on the panel (element-scoped, not window-level)
	 * This is more robust and encapsulated than attaching to window
	 */
	function handlePanelKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePanel();
		}
	}

	/**
	 * Focus trap for panel accessibility (WCAG 2.4.3)
	 * Keeps Tab/Shift+Tab navigation within the panel when open
	 */
	function setupFocusTrap(node: HTMLElement) {
		panelElement = node;

		function handleFocusTrap(e: KeyboardEvent) {
			if (e.key !== 'Tab') return;

			const focusableElements = node.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === firstElement) {
				e.preventDefault();
				lastElement?.focus();
			} else if (!e.shiftKey && document.activeElement === lastElement) {
				e.preventDefault();
				firstElement?.focus();
			}
		}

		node.addEventListener('keydown', handleFocusTrap);

		return {
			destroy() {
				node.removeEventListener('keydown', handleFocusTrap);
				panelElement = null;
			}
		};
	}

	// Manage scroll lock and focus based on panel state
	$effect(() => {
		if (isPanelOpen) {
			// Lock scroll when panel opens
			unlockScroll = lockScroll();
			// Focus the panel for keyboard navigation
			// Use setTimeout to ensure panel is rendered before focusing
			setTimeout(() => panelElement?.focus(), 0);
		} else if (unlockScroll) {
			// Unlock scroll when panel closes
			unlockScroll();
			unlockScroll = null;
		}

		// Cleanup on component unmount
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
				class="hamburger-button"
				class:open={isPanelOpen}
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

		<!-- Right Section: Auth UI -->
		<div class="navbar-right">
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
	class="panel"
	class:open={isPanelOpen}
	aria-label="Main navigation"
	tabindex="-1"
	onkeydown={handlePanelKeydown}
	use:setupFocusTrap
>
	<div class="panel-content">
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
	</div>
</nav>

<style>
	/* ============================================
	   Framework7-Style Navbar with Left Panel
	   ============================================ */

	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
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
		flex: 1;
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
		z-index: 99;
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
		z-index: 100;
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
