<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Kanban from '$lib/components/Kanban.svelte';
	import type { KanbanColumn } from '$lib/components/Kanban.svelte';

	const shell = catalogShellPropsForSlug('/kanban')!;

	interface Task {
		id: string;
		title: string;
		tag?: string;
	}

	// --- Basic board -----------------------------------------------------
	let board = $state<KanbanColumn<Task>[]>([
		{
			id: 'todo',
			title: 'To Do',
			cards: [
				{ id: 't1', title: 'Draft release notes' },
				{ id: 't2', title: 'Audit colour tokens' },
				{ id: 't3', title: 'Reply to support thread' }
			]
		},
		{
			id: 'doing',
			title: 'In Progress',
			cards: [{ id: 't4', title: 'Kanban keyboard moves' }]
		},
		{
			id: 'done',
			title: 'Done',
			cards: [{ id: 't5', title: 'Ship dark mode' }]
		}
	]);

	let lastMove = $state('');
	function onBoardChange() {
		const summary = board.map((c) => `${c.title}: ${c.cards.length}`).join(' · ');
		lastMove = summary;
	}

	// --- WIP-limited board ----------------------------------------------
	let wipBoard = $state<KanbanColumn<Task>[]>([
		{
			id: 'backlog',
			title: 'Backlog',
			cards: [
				{ id: 'w1', title: 'Spec the API' },
				{ id: 'w2', title: 'Wireframe board' },
				{ id: 'w3', title: 'Pick a font' }
			]
		},
		{
			id: 'active',
			title: 'Active',
			cards: [{ id: 'w4', title: 'Build component' }],
			wipLimit: 2
		},
		{ id: 'shipped', title: 'Shipped', cards: [], wipLimit: 3 }
	]);

	// --- Custom-card board ----------------------------------------------
	let richBoard = $state<KanbanColumn<Task>[]>([
		{
			id: 'inbox',
			title: 'Inbox',
			cards: [
				{ id: 'r1', title: 'Customer feedback', tag: 'research' },
				{ id: 'r2', title: 'Perf regression', tag: 'bug' }
			]
		},
		{
			id: 'triaged',
			title: 'Triaged',
			cards: [{ id: 'r3', title: 'New onboarding flow', tag: 'feature' }]
		}
	]);
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Drag and drop', 'Zero-deps']}
	codeExplanation="Kanban owns the board: native HTML5 drag-and-drop reorders cards within a column and moves them between columns, while a parallel keyboard model (Space to pick up, arrows to steer, Space to drop, Escape to cancel) makes every move possible without a pointer. An aria-live region narrates each step. Optional per-column wipLimit refuses cross-column drops that would overflow, and a card snippet hands full markup control to the consumer."
>
	{#snippet demo()}
		<div class="kb-demo">
			<section class="kb-demo__section">
				<h3>Basic board · drag or keyboard</h3>
				<p class="kb-demo__hint">
					Drag a card between columns, or focus one and press <kbd>Space</kbd>, steer with
					<kbd>↑ ↓ ← →</kbd>, then <kbd>Space</kbd> to drop. <kbd>Esc</kbd> cancels.
				</p>
				<Kanban bind:columns={board} onChange={onBoardChange}>
					{#snippet card(item)}
						<span>{item.title}</span>
					{/snippet}
				</Kanban>
				{#if lastMove}
					<p class="kb-demo__state" role="status" aria-live="polite">
						Counts: <code>{lastMove}</code>
					</p>
				{/if}
			</section>

			<section class="kb-demo__section">
				<h3>WIP limits · capped columns</h3>
				<p class="kb-demo__hint">
					Active is capped at 2 and Shipped at 3. Try to overfill one — the move is refused and
					announced.
				</p>
				<Kanban bind:columns={wipBoard}>
					{#snippet card(item)}
						<span>{item.title}</span>
					{/snippet}
				</Kanban>
			</section>

			<section class="kb-demo__section">
				<h3>Custom cards · your markup via snippet</h3>
				<p class="kb-demo__hint">
					The card snippet receives the item and its column, so you decide the layout — here a
					coloured tag chip.
				</p>
				<Kanban bind:columns={richBoard}>
					{#snippet card(item)}
						<div class="kb-rich">
							<span class="kb-rich__title">{item.title}</span>
							{#if item.tag}
								<span class="kb-rich__tag kb-rich__tag--{item.tag}">{item.tag}</span>
							{/if}
						</div>
					{/snippet}
				</Kanban>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>columns</code></td>
					<td><code>KanbanColumn&lt;T&gt;[]</code> (bindable)</td>
					<td><code>[]</code></td>
					<td>The board: ordered columns, each <code>{`{ id, title, cards, wipLimit? }`}</code>.</td>
				</tr>
				<tr>
					<td><code>card</code></td>
					<td><code>Snippet&lt;[T, KanbanColumn&lt;T&gt;]&gt;</code></td>
					<td>—</td>
					<td>Renders one card; receives the card item and its owning column.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(columns) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Called with the new board after each successful move.</td>
				</tr>
				<tr>
					<td><code>getId</code></td>
					<td><code>(item: T) =&gt; string</code></td>
					<td><code>item.id</code></td>
					<td>Derives the stable key / drag payload for a card.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.kb-demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.kb-demo__section h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 700;
	}
	.kb-demo__hint {
		margin: 0 0 0.75rem;
		font-size: 0.85rem;
		color: #64748b;
	}
	.kb-demo__hint kbd {
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		background: #e2e8f0;
		color: #0f172a;
		border-radius: 4px;
		padding: 0.05rem 0.35rem;
	}
	.kb-demo__state {
		margin: 0.75rem 0 0;
		font-size: 0.85rem;
		color: #64748b;
	}
	.kb-demo__state code {
		font-family: ui-monospace, monospace;
	}

	.kb-rich {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.kb-rich__title {
		font-weight: 600;
	}
	.kb-rich__tag {
		align-self: flex-start;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
	}
	.kb-rich__tag--bug {
		background: #fee2e2;
		color: #b91c1c;
	}
	.kb-rich__tag--feature {
		background: #dcfce7;
		color: #15803d;
	}
	.kb-rich__tag--research {
		background: #e0e7ff;
		color: #4338ca;
	}

	@media (prefers-color-scheme: dark) {
		.kb-demo__hint,
		.kb-demo__state {
			color: #94a3b8;
		}
		.kb-demo__hint kbd {
			background: #334155;
			color: #e2e8f0;
		}
		.kb-rich__tag--bug {
			background: #7f1d1d;
			color: #fecaca;
		}
		.kb-rich__tag--feature {
			background: #14532d;
			color: #bbf7d0;
		}
		.kb-rich__tag--research {
			background: #312e81;
			color: #c7d2fe;
		}
	}
</style>
