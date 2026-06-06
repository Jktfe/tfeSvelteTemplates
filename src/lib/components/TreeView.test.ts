/**
 * ============================================================
 * TreeView Tests
 * ============================================================
 *
 * Verifies the ARIA tree wiring (role=tree/treeitem/group, aria-level,
 * aria-expanded), roving tabindex (a single tab stop), expand/collapse on
 * click, keyboard activation, and the tri-state checkbox cascade (a leaf
 * tick bubbles a branch to indeterminate; toggling a branch checks all
 * leaves beneath it).
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import TreeView from './TreeView.svelte';

const nodes = [
	{
		id: 'src',
		label: 'src',
		children: [
			{ id: 'app', label: 'app.ts' },
			{ id: 'utils', label: 'utils.ts' }
		]
	},
	{ id: 'readme', label: 'README.md' }
];

describe('TreeView', () => {
	it('renders a tree with treeitems', () => {
		render(TreeView, { props: { nodes, defaultExpandAll: true } });
		expect(screen.getByRole('tree')).toBeTruthy();
		// 2 top-level + 2 children = 4 treeitems when fully expanded
		expect(screen.getAllByRole('treeitem')).toHaveLength(4);
	});

	it('branch treeitems carry aria-expanded; leaves do not', () => {
		render(TreeView, { props: { nodes, defaultExpandAll: true } });
		const srcItem = screen.getByRole('treeitem', { name: /src/ });
		expect(srcItem.getAttribute('aria-expanded')).toBe('true');
		const readme = screen.getByRole('treeitem', { name: /README/ });
		expect(readme.hasAttribute('aria-expanded')).toBe(false);
	});

	it('exposes aria-level reflecting depth', () => {
		const { container } = render(TreeView, { props: { nodes, defaultExpandAll: true } });
		// A treeitem's accessible name includes descendant labels, so query the
		// rows by their stable data-tree-id and read aria-level off the <li> parent.
		const srcLi = container.querySelector('[data-tree-id="src"]')!.closest('[role="treeitem"]')!;
		const appLi = container.querySelector('[data-tree-id="app"]')!.closest('[role="treeitem"]')!;
		expect(srcLi.getAttribute('aria-level')).toBe('1');
		expect(appLi.getAttribute('aria-level')).toBe('2');
	});

	it('uses a single tab stop (roving tabindex)', () => {
		const { container } = render(TreeView, { props: { nodes, defaultExpandAll: true } });
		const stops = container.querySelectorAll('[data-tree-id][tabindex="0"]');
		expect(stops).toHaveLength(1);
	});

	it('collapsed branch hides its children', () => {
		render(TreeView, { props: { nodes } });
		// Not expanded by default -> children absent from the DOM
		expect(screen.queryByText('app.ts')).toBeNull();
		expect(screen.getByText('src')).toBeTruthy();
	});

	it('clicking a branch expands it', async () => {
		const user = userEvent.setup();
		render(TreeView, { props: { nodes } });
		await user.click(screen.getByText('src'));
		expect(screen.getByText('app.ts')).toBeTruthy();
		expect(screen.getByRole('treeitem', { name: /src/ }).getAttribute('aria-expanded')).toBe('true');
	});

	it('ArrowRight expands a collapsed branch', async () => {
		const user = userEvent.setup();
		const { container } = render(TreeView, { props: { nodes } });
		const srcRow = container.querySelector<HTMLElement>('[data-tree-id="src"]')!;
		srcRow.focus();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByRole('treeitem', { name: /src/ }).getAttribute('aria-expanded')).toBe('true');
	});

	it('tri-state: ticking one child leaves the parent indeterminate', async () => {
		const user = userEvent.setup();
		render(TreeView, { props: { nodes, checkboxes: true, defaultExpandAll: true } });
		await user.click(screen.getByText('app.ts'));
		const srcItem = screen.getByRole('treeitem', { name: /src/ });
		// Parent is not fully selected -> aria-selected stays false (indeterminate)
		expect(srcItem.getAttribute('aria-selected')).toBe('false');
	});

	it('tri-state: ticking a branch checks all its leaves', async () => {
		const user = userEvent.setup();
		const { container } = render(TreeView, {
			props: { nodes, checkboxes: true, defaultExpandAll: true }
		});
		await user.click(screen.getByText('src'));
		const srcLi = container.querySelector('[data-tree-id="src"]')!.closest('[role="treeitem"]')!;
		const appLi = container.querySelector('[data-tree-id="app"]')!.closest('[role="treeitem"]')!;
		const utilsLi = container
			.querySelector('[data-tree-id="utils"]')!
			.closest('[role="treeitem"]')!;
		// Branch is fully checked, and so are both leaves beneath it.
		expect(srcLi.getAttribute('aria-selected')).toBe('true');
		expect(appLi.getAttribute('aria-selected')).toBe('true');
		expect(utilsLi.getAttribute('aria-selected')).toBe('true');
	});

	it('renders an empty-state message when there are no nodes', () => {
		render(TreeView, { props: { nodes: [] } });
		expect(screen.getByText(/No items to display/i)).toBeTruthy();
	});
});
