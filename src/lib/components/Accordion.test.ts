/**
 * ============================================================
 * Accordion Tests
 * ============================================================
 *
 * Verifies single/multiple modes, defaultOpen, preventCollapseLast,
 * disabled items, ARIA wiring (aria-expanded, aria-controls,
 * aria-labelledby), and onToggle callback firing.
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Accordion from './Accordion.svelte';

const items = [
	{ id: 'a', title: 'Section A', content: 'Content A' },
	{ id: 'b', title: 'Section B', content: 'Content B' },
	{ id: 'c', title: 'Section C', content: 'Content C' }
];

describe('Accordion', () => {
	it('renders one trigger per item', () => {
		render(Accordion, { props: { items } });
		expect(screen.getAllByRole('button')).toHaveLength(3);
	});

	it('all items closed by default', () => {
		render(Accordion, { props: { items } });
		const triggers = screen.getAllByRole('button');
		for (const t of triggers) {
			expect(t.getAttribute('aria-expanded')).toBe('false');
		}
	});

	it('clicking a trigger opens its panel', async () => {
		const user = userEvent.setup();
		render(Accordion, { props: { items } });
		const triggerA = screen.getByRole('button', { name: /Section A/ });
		await user.click(triggerA);
		expect(triggerA.getAttribute('aria-expanded')).toBe('true');
	});

	it('clicking an open trigger again closes it', async () => {
		const user = userEvent.setup();
		render(Accordion, { props: { items } });
		const triggerA = screen.getByRole('button', { name: /Section A/ });
		await user.click(triggerA);
		await user.click(triggerA);
		expect(triggerA.getAttribute('aria-expanded')).toBe('false');
	});

	it('single mode (default): opening one closes the others', async () => {
		const user = userEvent.setup();
		render(Accordion, { props: { items, defaultOpen: ['a'] } });
		const triggerA = screen.getByRole('button', { name: /Section A/ });
		const triggerB = screen.getByRole('button', { name: /Section B/ });
		expect(triggerA.getAttribute('aria-expanded')).toBe('true');

		await user.click(triggerB);
		expect(triggerB.getAttribute('aria-expanded')).toBe('true');
		expect(triggerA.getAttribute('aria-expanded')).toBe('false');
	});

	it('multiple mode: opening a second leaves the first open', async () => {
		const user = userEvent.setup();
		render(Accordion, { props: { items, multiple: true } });
		const triggerA = screen.getByRole('button', { name: /Section A/ });
		const triggerB = screen.getByRole('button', { name: /Section B/ });

		await user.click(triggerA);
		await user.click(triggerB);
		expect(triggerA.getAttribute('aria-expanded')).toBe('true');
		expect(triggerB.getAttribute('aria-expanded')).toBe('true');
	});

	it('preventCollapseLast: cannot close the last open in single mode', async () => {
		const user = userEvent.setup();
		render(Accordion, {
			props: { items, preventCollapseLast: true, defaultOpen: ['a'] }
		});
		const triggerA = screen.getByRole('button', { name: /Section A/ });
		expect(triggerA.getAttribute('aria-expanded')).toBe('true');

		await user.click(triggerA);
		// Still open — preventCollapseLast blocked the close
		expect(triggerA.getAttribute('aria-expanded')).toBe('true');
	});

	it('defaultOpen items start expanded', () => {
		render(Accordion, { props: { items, defaultOpen: ['b', 'c'], multiple: true } });
		expect(screen.getByRole('button', { name: /Section A/ }).getAttribute('aria-expanded')).toBe(
			'false'
		);
		expect(screen.getByRole('button', { name: /Section B/ }).getAttribute('aria-expanded')).toBe(
			'true'
		);
		expect(screen.getByRole('button', { name: /Section C/ }).getAttribute('aria-expanded')).toBe(
			'true'
		);
	});

	it('disabled items have disabled attribute and ignore clicks', async () => {
		const user = userEvent.setup();
		const disabledItems = [
			{ id: 'a', title: 'Active', content: 'X' },
			{ id: 'b', title: 'Locked', content: 'Y', disabled: true }
		];
		render(Accordion, { props: { items: disabledItems } });
		const lockedTrigger = screen.getByRole('button', { name: /Locked/ });
		expect((lockedTrigger as HTMLButtonElement).disabled).toBe(true);

		// Even if we try to click programmatically, aria-expanded stays false
		await user.click(lockedTrigger).catch(() => {});
		expect(lockedTrigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('onToggle fires with id and new open state', async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();
		render(Accordion, { props: { items, onToggle } });
		const triggerA = screen.getByRole('button', { name: /Section A/ });

		await user.click(triggerA);
		expect(onToggle).toHaveBeenCalledWith('a', true);

		await user.click(triggerA);
		expect(onToggle).toHaveBeenCalledWith('a', false);
	});

	it('each panel has aria-labelledby pointing to its trigger', () => {
		const { container } = render(Accordion, { props: { items } });
		const triggerA = container.querySelector('#trigger-a') as HTMLElement;
		const panelA = container.querySelector('#panel-a') as HTMLElement;
		expect(triggerA).toBeTruthy();
		expect(panelA).toBeTruthy();
		expect(panelA.getAttribute('aria-labelledby')).toBe('trigger-a');
		expect(panelA.getAttribute('role')).toBe('region');
	});

	it('each trigger has aria-controls pointing to its panel', () => {
		const { container } = render(Accordion, { props: { items } });
		const triggerB = container.querySelector('#trigger-b') as HTMLElement;
		expect(triggerB.getAttribute('aria-controls')).toBe('panel-b');
	});

	it('forwards extra classes', () => {
		const { container } = render(Accordion, {
			props: { items, class: 'my-extra' }
		});
		expect(container.querySelector('.my-extra')).toBeTruthy();
	});

	it('applies the size class', () => {
		const { container } = render(Accordion, { props: { items, size: 'sm' } });
		expect(container.querySelector('.accordion-sm')).toBeTruthy();
	});

	it('omits the bordered class when bordered=false', () => {
		const { container } = render(Accordion, { props: { items, bordered: false } });
		expect(container.querySelector('.accordion-bordered')).toBeNull();
	});
});
