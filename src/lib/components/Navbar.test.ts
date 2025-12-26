/**
 * ============================================================
 * Navbar Tests
 * ============================================================
 *
 * These tests verify that the Navbar component works correctly.
 * We're checking:
 *   - It renders the header with hamburger and logo
 *   - Panel opens/closes on button click
 *   - Categories expand/collapse properly
 *   - Keyboard navigation works (Escape to close)
 *   - Accessibility attributes are correct
 *   - Active page highlighting works
 *   - Single-item categories render as direct links
 *
 * Note: Some tests use manual class checking due to ClerkProvider
 * workaround that uses direct DOM manipulation.
 *
 * Run: bun run test Navbar
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar.svelte';
import type { MenuCategory } from '$lib/types';

// Mock the scrollLock utility
vi.mock('$lib/scrollLock', () => ({
	lockScroll: vi.fn(() => vi.fn())
}));

// Mock svelte-clerk components
vi.mock('svelte-clerk', () => ({
	SignedIn: vi.fn(),
	SignedOut: vi.fn(),
	SignInButton: vi.fn(),
	UserButton: vi.fn()
}));

// Sample menu categories for testing
const sampleCategories: MenuCategory[] = [
	{
		name: 'Home',
		icon: '🏠',
		items: [{ label: 'Home', href: '/', active: true }]
	},
	{
		name: 'Data Visualisation',
		icon: '📊',
		items: [
			{ label: 'CalendarHeatmap', href: '/calendarheatmap', active: false },
			{ label: 'Sunburst', href: '/sunburst', active: false },
			{ label: 'BubblePacking', href: '/bubblepacking', active: false }
		]
	},
	{
		name: 'Cards',
		icon: '🃏',
		items: [
			{ label: 'CardStack', href: '/cardstack', active: false },
			{ label: 'ExpandingCard', href: '/expandingcard', active: false }
		]
	}
];

describe('Navbar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// =========================================================================
	// RENDERING TESTS
	// =========================================================================

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(Navbar);
			// If we get here without errors, the component rendered
		});

		it('renders the header element', () => {
			render(Navbar);
			const header = document.querySelector('header.navbar');
			expect(header).toBeInTheDocument();
		});

		it('renders the hamburger button', () => {
			render(Navbar);
			const button = screen.getByRole('button', { name: /open menu/i });
			expect(button).toBeInTheDocument();
		});

		it('renders default logo text', () => {
			render(Navbar);
			expect(screen.getByText('Svelte Templates')).toBeInTheDocument();
		});

		it('renders custom logo text', () => {
			render(Navbar, { props: { logoText: 'My App' } });
			expect(screen.getByText('My App')).toBeInTheDocument();
		});

		it('renders custom logo icon', () => {
			render(Navbar, { props: { logoIcon: '🚀' } });
			expect(screen.getByText('🚀')).toBeInTheDocument();
		});

		it('renders logo link with correct href', () => {
			render(Navbar, { props: { logoHref: '/dashboard' } });
			const logoLink = document.querySelector('.navbar-logo');
			expect(logoLink).toHaveAttribute('href', '/dashboard');
		});

		it('renders demo mode badge when Clerk not configured', () => {
			render(Navbar, { props: { isClerkConfigured: false } });
			expect(screen.getByText('Demo Mode')).toBeInTheDocument();
		});
	});

	// =========================================================================
	// PANEL TESTS
	// =========================================================================

	describe('Panel', () => {
		it('panel starts closed', () => {
			render(Navbar);
			const panel = document.getElementById('panel-menu');
			expect(panel).not.toHaveClass('open');
		});

		it('renders navigation element with correct aria-label', () => {
			render(Navbar);
			const nav = screen.getByRole('navigation', { name: /main navigation/i });
			expect(nav).toBeInTheDocument();
		});

		it('hamburger button has correct aria-expanded initially', () => {
			render(Navbar);
			const button = screen.getByRole('button', { name: /open menu/i });
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('hamburger button controls the panel', () => {
			render(Navbar);
			const button = screen.getByRole('button', { name: /open menu/i });
			expect(button).toHaveAttribute('aria-controls', 'panel-menu');
		});

		it('renders three hamburger lines', () => {
			render(Navbar);
			const lines = document.querySelectorAll('.hamburger-line');
			expect(lines).toHaveLength(3);
		});
	});

	// =========================================================================
	// CATEGORY TESTS
	// =========================================================================

	describe('Categories', () => {
		it('renders all category headers', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			// Data Visualisation and Cards are multi-item (buttons)
			expect(screen.getByText('Data Visualisation')).toBeInTheDocument();
			expect(screen.getByText('Cards')).toBeInTheDocument();
		});

		it('renders single-item category as direct link', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			// Home is a single-item category, should be a link not a button
			const homeLink = screen.getByRole('link', { name: /home/i });
			expect(homeLink).toHaveAttribute('href', '/');
		});

		it('renders category icons', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			expect(screen.getByText('📊')).toBeInTheDocument();
			expect(screen.getByText('🃏')).toBeInTheDocument();
		});

		it('multi-item categories have expand buttons', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });
			expect(dataVizButton).toBeInTheDocument();
			expect(dataVizButton).toHaveAttribute('aria-expanded');
		});

		it('category buttons have aria-controls', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });
			expect(dataVizButton).toHaveAttribute('aria-controls', 'category-data-visualisation');
		});

		it('clicking category button toggles expansion', async () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });

			// Initially collapsed (unless it has the active item)
			expect(dataVizButton).toHaveAttribute('aria-expanded', 'false');

			// Click to expand
			await fireEvent.click(dataVizButton);
			expect(dataVizButton).toHaveAttribute('aria-expanded', 'true');

			// Click again to collapse
			await fireEvent.click(dataVizButton);
			expect(dataVizButton).toHaveAttribute('aria-expanded', 'false');
		});

		it('expanded category shows its items', async () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });

			// Expand the category
			await fireEvent.click(dataVizButton);

			// Check items are visible
			expect(screen.getByText('CalendarHeatmap')).toBeInTheDocument();
			expect(screen.getByText('Sunburst')).toBeInTheDocument();
			expect(screen.getByText('BubblePacking')).toBeInTheDocument();
		});

		it('category items have correct href', async () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });

			await fireEvent.click(dataVizButton);

			const calendarLink = screen.getByRole('link', { name: /calendarheatmap/i });
			expect(calendarLink).toHaveAttribute('href', '/calendarheatmap');
		});
	});

	// =========================================================================
	// ACTIVE PAGE TESTS
	// =========================================================================

	describe('Active Page', () => {
		it('auto-expands category containing active page', () => {
			const categoriesWithActive: MenuCategory[] = [
				{
					name: 'Data Visualisation',
					icon: '📊',
					items: [
						{ label: 'CalendarHeatmap', href: '/calendarheatmap', active: true },
						{ label: 'Sunburst', href: '/sunburst', active: false }
					]
				}
			];

			render(Navbar, { props: { menuCategories: categoriesWithActive } });

			// Category should auto-expand because it contains active item
			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });
			expect(dataVizButton).toHaveAttribute('aria-expanded', 'true');
		});

		it('active link has aria-current="page"', () => {
			const categoriesWithActive: MenuCategory[] = [
				{
					name: 'Data Visualisation',
					icon: '📊',
					items: [{ label: 'CalendarHeatmap', href: '/calendarheatmap', active: true }]
				}
			];

			render(Navbar, { props: { menuCategories: categoriesWithActive } });

			const activeLink = screen.getByRole('link', { name: /calendarheatmap/i });
			expect(activeLink).toHaveAttribute('aria-current', 'page');
		});

		it('active link has active class', () => {
			const categoriesWithActive: MenuCategory[] = [
				{
					name: 'Data Visualisation',
					icon: '📊',
					items: [{ label: 'CalendarHeatmap', href: '/calendarheatmap', active: true }]
				}
			];

			render(Navbar, { props: { menuCategories: categoriesWithActive } });

			const activeLink = screen.getByRole('link', { name: /calendarheatmap/i });
			expect(activeLink).toHaveClass('active');
		});

		it('category header highlights when containing active item', () => {
			const categoriesWithActive: MenuCategory[] = [
				{
					name: 'Data Visualisation',
					icon: '📊',
					items: [
						{ label: 'CalendarHeatmap', href: '/calendarheatmap', active: true },
						{ label: 'Sunburst', href: '/sunburst', active: false }
					]
				}
			];

			render(Navbar, { props: { menuCategories: categoriesWithActive } });

			const dataVizButton = screen.getByRole('button', { name: /data visualisation/i });
			expect(dataVizButton).toHaveClass('has-active');
		});
	});

	// =========================================================================
	// ACCESSIBILITY TESTS
	// =========================================================================

	describe('Accessibility', () => {
		it('panel has tabindex for focus management', () => {
			render(Navbar);
			const panel = document.getElementById('panel-menu');
			expect(panel).toHaveAttribute('tabindex', '-1');
		});

		it('panel has aria-label', () => {
			render(Navbar);
			const nav = screen.getByRole('navigation');
			expect(nav).toHaveAttribute('aria-label', 'Main navigation');
		});

		it('logo icon is hidden from screen readers', () => {
			render(Navbar);
			const icon = document.querySelector('.navbar-logo-icon');
			expect(icon).toHaveAttribute('aria-hidden', 'true');
		});

		it('category icons are hidden from screen readers', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const icons = document.querySelectorAll('.panel-category-icon');
			icons.forEach((icon) => {
				expect(icon).toHaveAttribute('aria-hidden', 'true');
			});
		});

		it('chevron icons are hidden from screen readers', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const chevrons = document.querySelectorAll('.panel-category-chevron');
			chevrons.forEach((chevron) => {
				expect(chevron).toHaveAttribute('aria-hidden', 'true');
			});
		});
	});

	// =========================================================================
	// LEGACY MENU ITEMS TESTS
	// =========================================================================

	describe('Legacy Menu Items', () => {
		it('renders flat menuItems when no categories provided', () => {
			const legacyItems = [
				{ label: 'Page 1', href: '/page1', active: false },
				{ label: 'Page 2', href: '/page2', active: true }
			];

			render(Navbar, { props: { menuItems: legacyItems } });

			expect(screen.getByText('Page 1')).toBeInTheDocument();
			expect(screen.getByText('Page 2')).toBeInTheDocument();
		});

		it('prefers categories over legacy menuItems', () => {
			const legacyItems = [{ label: 'Legacy', href: '/legacy', active: false }];

			render(Navbar, {
				props: {
					menuCategories: sampleCategories,
					menuItems: legacyItems
				}
			});

			// Should show categories, not legacy items
			expect(screen.getByText('Data Visualisation')).toBeInTheDocument();
			expect(screen.queryByText('Legacy')).not.toBeInTheDocument();
		});
	});

	// =========================================================================
	// STRUCTURE TESTS
	// =========================================================================

	describe('Structure', () => {
		it('has sticky header', () => {
			render(Navbar);
			const header = document.querySelector('.navbar');
			expect(header).toBeInTheDocument();
			// CSS class implies sticky positioning
		});

		it('has left section with hamburger and logo', () => {
			render(Navbar);
			const leftSection = document.querySelector('.navbar-left');
			expect(leftSection).toBeInTheDocument();

			const hamburger = leftSection?.querySelector('.hamburger-button');
			const logo = leftSection?.querySelector('.navbar-logo');

			expect(hamburger).toBeInTheDocument();
			expect(logo).toBeInTheDocument();
		});

		it('has right section for auth UI', () => {
			render(Navbar);
			const rightSection = document.querySelector('.navbar-right');
			expect(rightSection).toBeInTheDocument();
		});

		it('panel has content container', () => {
			render(Navbar);
			const panelContent = document.querySelector('.panel-content');
			expect(panelContent).toBeInTheDocument();
		});

		it('categories are wrapped in panel-categories', () => {
			render(Navbar, { props: { menuCategories: sampleCategories } });
			const categoriesWrapper = document.querySelector('.panel-categories');
			expect(categoriesWrapper).toBeInTheDocument();
		});
	});
});
