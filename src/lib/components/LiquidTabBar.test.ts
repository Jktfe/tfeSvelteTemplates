/**
 * ============================================================
 * LiquidTabBar Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Basic rendering (labels, gooey filter SVG)
 *   ✓ Click selects a tab
 *   ✓ Keyboard navigation (←/→ wrap, Home/End jump)
 *   ✓ Roving tabindex (only active tab has tabindex=0)
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LiquidTabBar from './LiquidTabBar.svelte';

const tabs = [
	{ id: 't1', label: 'Tab 1' },
	{ id: 't2', label: 'Tab 2' },
	{ id: 't3', label: 'Tab 3' }
];

describe('LiquidTabBar', () => {
	it('renders without crashing', () => {
		const { container } = render(LiquidTabBar, { tabs });
		expect(container).toBeTruthy();
	});

	it('renders all tab labels', () => {
		const { getByText } = render(LiquidTabBar, { tabs });
		expect(getByText('Tab 1')).toBeTruthy();
		expect(getByText('Tab 2')).toBeTruthy();
		expect(getByText('Tab 3')).toBeTruthy();
	});

	it('applies gooey filter SVG', () => {
		const { container } = render(LiquidTabBar, { tabs });
		const filter = container.querySelector('#gooey-filter');
		expect(filter).toBeTruthy();
	});

	it('exposes tablist semantics', () => {
		const { container, getAllByRole } = render(LiquidTabBar, { tabs });
		expect(container.querySelector('[role="tablist"]')).toBeTruthy();
		expect(getAllByRole('tab')).toHaveLength(3);
	});

	it('changes active tab on click', async () => {
		const { getByText } = render(LiquidTabBar, { tabs, activeTab: 't1' });
		const tab2 = getByText('Tab 2');
		await fireEvent.click(tab2);
		expect(tab2.getAttribute('aria-selected')).toBe('true');
	});

	it('uses roving tabindex (only the active tab is in tab order)', () => {
		const { getByText } = render(LiquidTabBar, { tabs, activeTab: 't1' });
		expect(getByText('Tab 1').getAttribute('tabindex')).toBe('0');
		expect(getByText('Tab 2').getAttribute('tabindex')).toBe('-1');
		expect(getByText('Tab 3').getAttribute('tabindex')).toBe('-1');
	});

	it('moves selection on ArrowRight (wraps at end)', async () => {
		const { getByText } = render(LiquidTabBar, { tabs, activeTab: 't1' });
		const tab1 = getByText('Tab 1');
		await fireEvent.keyDown(tab1, { key: 'ArrowRight' });
		expect(getByText('Tab 2').getAttribute('aria-selected')).toBe('true');

		await fireEvent.keyDown(getByText('Tab 2'), { key: 'ArrowRight' });
		expect(getByText('Tab 3').getAttribute('aria-selected')).toBe('true');

		await fireEvent.keyDown(getByText('Tab 3'), { key: 'ArrowRight' });
		expect(getByText('Tab 1').getAttribute('aria-selected')).toBe('true');
	});

	it('moves selection on ArrowLeft (wraps at start)', async () => {
		const { getByText } = render(LiquidTabBar, { tabs, activeTab: 't1' });
		await fireEvent.keyDown(getByText('Tab 1'), { key: 'ArrowLeft' });
		expect(getByText('Tab 3').getAttribute('aria-selected')).toBe('true');
	});

	it('jumps to first/last with Home/End', async () => {
		const { getByText } = render(LiquidTabBar, { tabs, activeTab: 't2' });
		await fireEvent.keyDown(getByText('Tab 2'), { key: 'End' });
		expect(getByText('Tab 3').getAttribute('aria-selected')).toBe('true');

		await fireEvent.keyDown(getByText('Tab 3'), { key: 'Home' });
		expect(getByText('Tab 1').getAttribute('aria-selected')).toBe('true');
	});
});
