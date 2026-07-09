/**
 * ============================================================
 * SplitPane Tests
 * ============================================================
 *
 * Verifies the resizable two-pane split:
 *   - Renders both the start and end panes (both directions)
 *   - The divider is role="separator" with correct aria-orientation
 *   - ARIA value attributes reflect the current size
 *   - Arrow keys nudge the size along the correct axis
 *   - Home / End jump to min / max
 *   - Size clamps to min / max
 *
 * Run: bun run test -- SplitPane
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { createRawSnippet, type Snippet } from 'svelte';
import SplitPane from './SplitPane.svelte';

// Minimal text snippets standing in for real pane content.
const startSnippet = createRawSnippet(() => ({
	render: () => `<div>First pane</div>`
})) as unknown as Snippet;

const endSnippet = createRawSnippet(() => ({
	render: () => `<div>Second pane</div>`
})) as unknown as Snippet;

function renderPane(props: Record<string, unknown> = {}) {
	return render(SplitPane, {
		props: { start: startSnippet, end: endSnippet, ...props }
	});
}

describe('SplitPane', () => {
	it('renders both panes for a horizontal split', () => {
		renderPane({ direction: 'horizontal' });
		expect(screen.getByText('First pane')).toBeTruthy();
		expect(screen.getByText('Second pane')).toBeTruthy();
	});

	it('renders both panes for a vertical split', () => {
		renderPane({ direction: 'vertical' });
		expect(screen.getByText('First pane')).toBeTruthy();
		expect(screen.getByText('Second pane')).toBeTruthy();
	});

	it('exposes the divider as a separator with ARIA values', () => {
		renderPane({ direction: 'horizontal', initial: 40, min: 10, max: 80 });
		const divider = screen.getByRole('separator');

		expect(divider).toHaveAttribute('aria-orientation', 'vertical');
		expect(divider).toHaveAttribute('aria-valuenow', '40');
		expect(divider).toHaveAttribute('aria-valuemin', '10');
		expect(divider).toHaveAttribute('aria-valuemax', '80');
		expect(divider).toHaveAttribute('tabindex', '0');
	});

	it('uses horizontal aria-orientation for a vertical (stacked) split', () => {
		renderPane({ direction: 'vertical' });
		const divider = screen.getByRole('separator');
		expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
	});

	it('ArrowRight grows the first pane in a horizontal split', async () => {
		renderPane({ direction: 'horizontal', initial: 50, step: 5 });
		const divider = screen.getByRole('separator');

		await fireEvent.keyDown(divider, { key: 'ArrowRight' });

		expect(divider).toHaveAttribute('aria-valuenow', '55');
	});

	it('ArrowLeft shrinks the first pane in a horizontal split', async () => {
		renderPane({ direction: 'horizontal', initial: 50, step: 5 });
		const divider = screen.getByRole('separator');

		await fireEvent.keyDown(divider, { key: 'ArrowLeft' });

		expect(divider).toHaveAttribute('aria-valuenow', '45');
	});

	it('ArrowDown grows the first pane in a vertical split', async () => {
		renderPane({ direction: 'vertical', initial: 50, step: 5 });
		const divider = screen.getByRole('separator');

		await fireEvent.keyDown(divider, { key: 'ArrowDown' });

		expect(divider).toHaveAttribute('aria-valuenow', '55');
	});

	it('Home jumps the size to the minimum', async () => {
		renderPane({ direction: 'horizontal', initial: 50, min: 15, max: 85 });
		const divider = screen.getByRole('separator');

		await fireEvent.keyDown(divider, { key: 'Home' });

		expect(divider).toHaveAttribute('aria-valuenow', '15');
	});

	it('End jumps the size to the maximum', async () => {
		renderPane({ direction: 'horizontal', initial: 50, min: 15, max: 85 });
		const divider = screen.getByRole('separator');

		await fireEvent.keyDown(divider, { key: 'End' });

		expect(divider).toHaveAttribute('aria-valuenow', '85');
	});

	it('clamps to the maximum instead of overshooting', async () => {
		renderPane({ direction: 'horizontal', initial: 78, max: 80, step: 5 });
		const divider = screen.getByRole('separator');

		// 78 + 5 = 83, but the ceiling is 80.
		await fireEvent.keyDown(divider, { key: 'ArrowRight' });

		expect(divider).toHaveAttribute('aria-valuenow', '80');
	});

	it('clamps to the minimum instead of undershooting', async () => {
		renderPane({ direction: 'horizontal', initial: 22, min: 20, step: 5 });
		const divider = screen.getByRole('separator');

		// 22 - 5 = 17, but the floor is 20.
		await fireEvent.keyDown(divider, { key: 'ArrowLeft' });

		expect(divider).toHaveAttribute('aria-valuenow', '20');
	});
});
