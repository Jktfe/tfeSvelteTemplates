/*
 * Tabs Tests
 *
 * Covers:
 *   ✓ Renders all tabs in tablist
 *   ✓ Roving tabindex (active=0, others=-1)
 *   ✓ aria-selected on active tab
 *   ✓ aria-controls + aria-labelledby paired correctly
 *   ✓ Click activates tab
 *   ✓ ArrowRight moves focus to next
 *   ✓ ArrowLeft wraps to last
 *   ✓ Home jumps to first
 *   ✓ End jumps to last
 *   ✓ Disabled tab cannot be activated by click
 *   ✓ Vertical orientation sets aria-orientation
 *   ✓ Pill variant applies pill class
 *
 * Run:
 *   bun run test -- Tabs
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Tabs from './Tabs.svelte';

const TABS = [
	{ id: 'a', label: 'Overview' },
	{ id: 'b', label: 'Specs' },
	{ id: 'c', label: 'Reviews' }
];

describe('Tabs', () => {
	it('renders all tabs in tablist', () => {
		const { container } = render(Tabs, { props: { tabs: TABS } });
		const list = container.querySelector('[role="tablist"]');
		expect(list).toBeTruthy();
		const buttons = list!.querySelectorAll('[role="tab"]');
		expect(buttons.length).toBe(3);
	});

	it('roving tabindex — active=0, others=-1', () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'b' } });
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		expect(buttons[0].getAttribute('tabindex')).toBe('-1');
		expect(buttons[1].getAttribute('tabindex')).toBe('0');
		expect(buttons[2].getAttribute('tabindex')).toBe('-1');
	});

	it('aria-selected reflects active tab', () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'c' } });
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		expect(buttons[0].getAttribute('aria-selected')).toBe('false');
		expect(buttons[2].getAttribute('aria-selected')).toBe('true');
	});

	it('aria-controls + aria-labelledby paired correctly', () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'a' } });
		const tab = container.querySelector('[role="tab"][aria-selected="true"]') as HTMLElement;
		expect(tab.getAttribute('aria-controls')).toBe('panel-a');
		expect(tab.id).toBe('tab-a');
		const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
		expect(panel.id).toBe('panel-a');
		expect(panel.getAttribute('aria-labelledby')).toBe('tab-a');
	});

	it('click activates tab', async () => {
		const { container } = render(Tabs, { props: { tabs: TABS } });
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		await fireEvent.click(buttons[2]);
		expect(buttons[2].getAttribute('aria-selected')).toBe('true');
		expect(buttons[2].getAttribute('tabindex')).toBe('0');
	});

	it('ArrowRight moves focus to next tab', async () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'a' } });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		buttons[0].focus();
		await fireEvent.keyDown(list, { key: 'ArrowRight' });
		expect(document.activeElement).toBe(buttons[1]);
	});

	it('ArrowLeft from first wraps to last', async () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'a' } });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		buttons[0].focus();
		await fireEvent.keyDown(list, { key: 'ArrowLeft' });
		expect(document.activeElement).toBe(buttons[2]);
	});

	it('Home jumps to first tab', async () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'c' } });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		buttons[2].focus();
		await fireEvent.keyDown(list, { key: 'Home' });
		expect(document.activeElement).toBe(buttons[0]);
	});

	it('End jumps to last tab', async () => {
		const { container } = render(Tabs, { props: { tabs: TABS, active: 'a' } });
		const list = container.querySelector('[role="tablist"]') as HTMLElement;
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		buttons[0].focus();
		await fireEvent.keyDown(list, { key: 'End' });
		expect(document.activeElement).toBe(buttons[2]);
	});

	it('disabled tab cannot be activated by click', async () => {
		const tabs = [
			{ id: 'a', label: 'A' },
			{ id: 'b', label: 'B', disabled: true },
			{ id: 'c', label: 'C' }
		];
		const { container } = render(Tabs, { props: { tabs } });
		const buttons = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
		await fireEvent.click(buttons[1]);
		expect(buttons[1].getAttribute('aria-selected')).toBe('false');
		expect(buttons[0].getAttribute('aria-selected')).toBe('true');
	});

	it('vertical orientation sets aria-orientation', () => {
		const { container } = render(Tabs, {
			props: { tabs: TABS, orientation: 'vertical' }
		});
		const list = container.querySelector('[role="tablist"]');
		expect(list?.getAttribute('aria-orientation')).toBe('vertical');
	});

	it('pill variant applies pill class', () => {
		const { container } = render(Tabs, { props: { tabs: TABS, variant: 'pill' } });
		expect(container.querySelector('.tabs-pill')).toBeTruthy();
	});
});
