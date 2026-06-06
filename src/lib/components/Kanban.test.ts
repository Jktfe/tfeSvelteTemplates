/**
 * ============================================================
 * Kanban Tests
 * ============================================================
 *
 * Verifies the board renders, keyboard pick-up/move/drop works,
 * WIP limits block cross-column drops, and ARIA wiring is present.
 *
 * Run: bun run test -- Kanban
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { createRawSnippet, type Snippet } from 'svelte';
import Kanban, { type KanbanColumn } from './Kanban.svelte';

interface Task {
	id: string;
	title: string;
}

// A minimal card snippet — renders the card's title text. Cast to the two-arg
// card snippet shape the component expects (item + owning column).
const cardSnippet = createRawSnippet((item: () => Task) => ({
	render: () => `<span>${item().title}</span>`
})) as unknown as Snippet<[{ id: string }, KanbanColumn<{ id: string }>]>;

function makeColumns() {
	return [
		{
			id: 'todo',
			title: 'To Do',
			cards: [
				{ id: 'a', title: 'Alpha' },
				{ id: 'b', title: 'Beta' }
			]
		},
		{ id: 'doing', title: 'In Progress', cards: [{ id: 'c', title: 'Gamma' }] },
		{ id: 'done', title: 'Done', cards: [] as Task[], wipLimit: 1 }
	];
}

describe('Kanban', () => {
	it('renders without crashing', () => {
		const { container } = render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		expect(container).toBeTruthy();
	});

	it('renders all columns as labelled regions', () => {
		render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		expect(screen.getByRole('region', { name: 'To Do' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'In Progress' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument();
	});

	it('renders cards via the snippet', () => {
		render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		expect(screen.getByText('Alpha')).toBeInTheDocument();
		expect(screen.getByText('Gamma')).toBeInTheDocument();
	});

	it('marks each card as draggable and focusable', () => {
		render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		const cards = screen.getAllByRole('button');
		expect(cards[0]).toHaveAttribute('draggable', 'true');
		expect(cards[0]).toHaveAttribute('aria-grabbed', 'false');
		expect(cards[0]).toHaveAttribute('tabindex', '0');
	});

	it('picks a card up on Space, setting aria-grabbed', async () => {
		render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		const first = screen.getAllByRole('button')[0];
		await fireEvent.keyDown(first, { key: ' ' });
		expect(first).toHaveAttribute('aria-grabbed', 'true');
	});

	it('moves a card across columns with arrows + Space and fires onChange', async () => {
		const onChange = vi.fn();
		const columns = makeColumns();
		render(Kanban, { props: { columns, card: cardSnippet, onChange } });
		const alpha = screen.getByText('Alpha').closest('[role="button"]') as HTMLElement;

		await fireEvent.keyDown(alpha, { key: ' ' }); // pick up
		await fireEvent.keyDown(alpha, { key: 'ArrowRight' }); // hop to In Progress
		await fireEvent.keyDown(alpha, { key: ' ' }); // drop

		expect(onChange).toHaveBeenCalled();
		const next = onChange.mock.lastCall?.[0];
		expect(next[0].cards.map((c: Task) => c.id)).not.toContain('a');
		expect(next[1].cards.map((c: Task) => c.id)).toContain('a');
	});

	it('refuses a cross-column move into a full WIP column', async () => {
		const onChange = vi.fn();
		// "Done" has wipLimit 1 and is pre-filled so it is at capacity.
		const columns = [
			{ id: 'todo', title: 'To Do', cards: [{ id: 'a', title: 'Alpha' }] },
			{ id: 'done', title: 'Done', cards: [{ id: 'z', title: 'Zeta' }], wipLimit: 1 }
		];
		render(Kanban, { props: { columns, card: cardSnippet, onChange } });
		const alpha = screen.getByText('Alpha').closest('[role="button"]') as HTMLElement;

		await fireEvent.keyDown(alpha, { key: ' ' });
		await fireEvent.keyDown(alpha, { key: 'ArrowRight' }); // try to enter full Done
		await fireEvent.keyDown(alpha, { key: ' ' }); // attempt drop — should be refused

		const moved = onChange.mock.calls.some((call) =>
			call[0][1].cards.some((c: Task) => c.id === 'a')
		);
		expect(moved).toBe(false);
	});

	it('cancels a keyboard lift on Escape', async () => {
		render(Kanban, { props: { columns: makeColumns(), card: cardSnippet } });
		const first = screen.getAllByRole('button')[0];
		await fireEvent.keyDown(first, { key: ' ' });
		expect(first).toHaveAttribute('aria-grabbed', 'true');
		await fireEvent.keyDown(first, { key: 'Escape' });
		expect(first).toHaveAttribute('aria-grabbed', 'false');
	});
});
