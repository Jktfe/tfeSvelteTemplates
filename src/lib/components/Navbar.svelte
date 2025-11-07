<!--
  Navbar Component

  A responsive navigation bar with mobile hamburger menu and desktop horizontal layout.
  Inspired by Framework7 design patterns with smooth animations and accessibility features.

  Features:
  - Hamburger menu for mobile devices (< 768px)
  - Horizontal navigation for desktop
  - Smooth slide-in/out animations
  - Backdrop blur and overlay
  - Active state highlighting
  - Keyboard accessible (Escape to close, Tab navigation)
  - Touch-friendly tap targets
  - Zero external dependencies

  Usage:
    <Navbar {menuItems} />

  Props:
  - menuItems: Array of MenuItem objects with label, href, icon, and active state
-->

<script lang="ts">
	import type { NavbarProps } from '$lib/types';
	import { onMount } from 'svelte';

	let {
		menuItems,
		logoIcon = '⚡',
		logoText = 'Svelte Templates',
		logoHref = '/'
	}: NavbarProps = $props();

	// Mobile menu state
	let isMobileMenuOpen = $state(false);

	/**
	 * Toggle mobile menu open/closed state
	 */
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	/**
	 * Close mobile menu
	 */
	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	/**
	 * Handle escape key to close menu
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isMobileMenuOpen) {
			closeMobileMenu();
		}
	}

	/**
	 * Prevent body scroll when mobile menu is open
	 */
	$effect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		// Cleanup on component unmount
		return () => {
			document.body.style.overflow = '';
		};
	});

	onMount(() => {
		// Add global keydown listener
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<header class="navbar">
	<div class="navbar-container">
		<!-- Logo / Brand -->
		<a href={logoHref} class="navbar-logo">
			<span class="navbar-logo-icon" aria-hidden="true">{logoIcon}</span>
			<span class="navbar-logo-text">{logoText}</span>
		</a>

		<!-- Desktop Navigation -->
		<nav class="navbar-desktop" aria-label="Main navigation">
			<ul class="navbar-menu">
				{#each menuItems as item}
					<li class="navbar-menu-item">
						<a
							href={item.href}
							class="navbar-menu-link"
							class:active={item.active}
							aria-current={item.active ? 'page' : undefined}
						>
							{#if item.icon}
								<span class="navbar-menu-icon" aria-hidden="true">{item.icon}</span>
							{/if}
							<span class="navbar-menu-label">{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Mobile Hamburger Button -->
		<button
			class="navbar-hamburger"
			class:open={isMobileMenuOpen}
			onclick={toggleMobileMenu}
			aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={isMobileMenuOpen}
			aria-controls="mobile-menu"
		>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if isMobileMenuOpen}
		<div class="navbar-overlay" onclick={closeMobileMenu} aria-hidden="true"></div>
	{/if}

	<!-- Mobile Menu Panel -->
	<nav
		id="mobile-menu"
		class="navbar-mobile"
		class:open={isMobileMenuOpen}
		aria-label="Mobile navigation"
	>
		<ul class="navbar-mobile-menu">
			{#each menuItems as item, index}
				<li class="navbar-mobile-item" style="--item-index: {index}">
					<a
						href={item.href}
						class="navbar-mobile-link"
						class:active={item.active}
						aria-current={item.active ? 'page' : undefined}
						onclick={closeMobileMenu}
					>
						{#if item.icon}
							<span class="navbar-mobile-icon" aria-hidden="true">{item.icon}</span>
						{/if}
						<span class="navbar-mobile-label">{item.label}</span>
						{#if item.active}
							<span class="navbar-mobile-indicator" aria-hidden="true"></span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	/* ============================================
	   Base Navbar Styles
	   ============================================ */

	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid #e2e8f0;
	}

	.navbar-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	/* ============================================
	   Logo / Brand
	   ============================================ */

	.navbar-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: #1a202c;
		font-weight: 600;
		font-size: 1.25rem;
		transition: transform 0.2s ease;
		z-index: 101;
	}

	.navbar-logo:hover {
		transform: scale(1.02);
	}

	.navbar-logo:focus {
		outline: 2px solid #146ef5;
		outline-offset: 4px;
		border-radius: 4px;
	}

	.navbar-logo-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.navbar-logo-text {
		line-height: 1;
	}

	/* ============================================
	   Desktop Navigation
	   ============================================ */

	.navbar-desktop {
		display: none;
	}

	.navbar-menu {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.navbar-menu-item {
		display: block;
	}

	.navbar-menu-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		text-decoration: none;
		color: #4a5568;
		font-weight: 500;
		font-size: 0.9375rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		position: relative;
		white-space: nowrap;
	}

	.navbar-menu-link:hover {
		color: #146ef5;
		background-color: rgba(20, 110, 245, 0.08);
	}

	.navbar-menu-link:focus {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.navbar-menu-link.active {
		color: #146ef5;
		font-weight: 600;
		background-color: rgba(20, 110, 245, 0.1);
	}

	.navbar-menu-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.navbar-menu-label {
		line-height: 1;
	}

	/* ============================================
	   Mobile Hamburger Button
	   ============================================ */

	.navbar-hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.375rem;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		z-index: 101;
		border-radius: 0.375rem;
		transition: background-color 0.2s ease;
	}

	.navbar-hamburger:hover {
		background-color: rgba(20, 110, 245, 0.08);
	}

	.navbar-hamburger:focus {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.hamburger-line {
		display: block;
		width: 1.5rem;
		height: 2px;
		background-color: #1a202c;
		border-radius: 2px;
		transition: all 0.3s ease;
		transform-origin: center;
	}

	/* Hamburger animation when open */
	.navbar-hamburger.open .hamburger-line:nth-child(1) {
		transform: translateY(0.4375rem) rotate(45deg);
	}

	.navbar-hamburger.open .hamburger-line:nth-child(2) {
		opacity: 0;
		transform: scaleX(0);
	}

	.navbar-hamburger.open .hamburger-line:nth-child(3) {
		transform: translateY(-0.4375rem) rotate(-45deg);
	}

	/* ============================================
	   Mobile Menu Overlay
	   ============================================ */

	.navbar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
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
	   Mobile Menu Panel
	   ============================================ */

	.navbar-mobile {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(80vw, 320px);
		background-color: #ffffff;
		box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
		z-index: 100;
		overflow-y: auto;
		padding-top: 5rem;
		transform: translateX(100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.navbar-mobile.open {
		transform: translateX(0);
	}

	.navbar-mobile-menu {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.navbar-mobile-item {
		opacity: 0;
		transform: translateX(2rem);
	}

	.navbar-mobile.open .navbar-mobile-item {
		animation: slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		animation-delay: calc(0.05s * var(--item-index));
	}

	@keyframes slide-in {
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.navbar-mobile-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.125rem 2rem;
		text-decoration: none;
		color: #1a202c;
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.2s ease;
		position: relative;
		border-left: 3px solid transparent;
	}

	.navbar-mobile-link:hover {
		background-color: rgba(20, 110, 245, 0.05);
		color: #146ef5;
	}

	.navbar-mobile-link:focus {
		outline: 2px solid #146ef5;
		outline-offset: -2px;
		background-color: rgba(20, 110, 245, 0.05);
	}

	.navbar-mobile-link.active {
		color: #146ef5;
		font-weight: 600;
		background-color: rgba(20, 110, 245, 0.1);
		border-left-color: #146ef5;
	}

	.navbar-mobile-icon {
		font-size: 1.375rem;
		line-height: 1;
		width: 1.5rem;
		text-align: center;
	}

	.navbar-mobile-label {
		flex: 1;
		line-height: 1.4;
	}

	.navbar-mobile-indicator {
		width: 0.5rem;
		height: 0.5rem;
		background-color: #146ef5;
		border-radius: 50%;
		margin-left: auto;
	}

	/* ============================================
	   Responsive Breakpoints
	   ============================================ */

	/* Mobile: Show hamburger, hide desktop nav */
	@media (max-width: 768px) {
		.navbar-container {
			padding: 1rem 1.25rem;
		}

		.navbar-logo {
			font-size: 1.1rem;
		}

		.navbar-logo-icon {
			font-size: 1.375rem;
		}

		.navbar-desktop {
			display: none;
		}

		.navbar-hamburger {
			display: flex;
		}
	}

	/* Desktop: Show desktop nav, hide hamburger */
	@media (min-width: 769px) {
		.navbar-desktop {
			display: block;
		}

		.navbar-hamburger {
			display: none;
		}

		.navbar-mobile {
			display: none;
		}

		.navbar-overlay {
			display: none;
		}
	}

	/* ============================================
	   Accessibility & Reduced Motion
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.navbar-logo,
		.navbar-menu-link,
		.navbar-mobile-link,
		.navbar-hamburger,
		.hamburger-line,
		.navbar-mobile {
			transition-duration: 0.01ms;
			animation-duration: 0.01ms;
		}

		.navbar-mobile-item {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
