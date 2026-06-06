<!--
  ===========================================================
  KANBAN
  ===========================================================
  WHAT — A drag-and-drop board: columns hold cards you can drag between/within
         columns, with full keyboard move support and optional WIP limits.
  WHY  — Reach for this when you need a Trello-style board without a heavy
         drag library. Native HTML5 DnD for mouse/touch-pointer, plus a
         keyboard "pick up → move → drop" model so it works without a pointer.
  FEATURES
    - Native HTML5 drag-and-drop (dragstart / dragover / drop) within and across columns
    - Reorder cards inside a column and move them between columns
    - Keyboard: focus a card, Space to pick up, Arrow keys to move, Space to drop, Escape to cancel
    - Optional per-column WIP limit (blocks drops that would exceed it; shows count)
    - Bindable board state + onChange callback fired on every move
    - Cards render via a `card` snippet so consumers fully control card markup
  ACCESSIBILITY
    - Each card is a focusable button-like element with aria-grabbed during keyboard lift
    - aria-live region announces pick-up, target column/position, drop and cancel
    - Columns are labelled regions; :focus-visible outlines; honours prefers-reduced-motion
  DEPENDENCIES — zero
  PERFORMANCE — Plain array splices; suited to typical board sizes (hundreds of cards).
  USAGE
    <Kanban bind:columns onChange={(c) => save(c)}>
      {#snippet card(item)}<strong>{item.title}</strong>{/snippet}
    </Kanban>
  PROPS
    | Prop      | Type                                    | Default | Description |
    | columns   | KanbanColumn<T>[]  (bindable)           | []      | Board state |
    | card      | Snippet<[T, KanbanColumn<T>]>           | —       | Card renderer |
    | onChange  | (columns: KanbanColumn<T>[]) => void    | —       | Fires after each move |
    | getId     | (item: T) => string                     | item.id | Stable card key |
  ===========================================================
-->
<script module lang="ts">
	export interface KanbanColumn<C> {
		/** Stable column identifier */
		id: string;
		/** Column heading shown to users */
		title: string;
		/** Cards in display order */
		cards: C[];
		/** Optional work-in-progress limit — drops that exceed it are refused */
		wipLimit?: number;
	}
</script>

<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';

	interface Props {
		/** The board: an ordered list of columns, each with ordered cards. Bindable. */
		columns?: KanbanColumn<T>[];
		/** Renders a single card. Receives the card item and its owning column. */
		card: Snippet<[T, KanbanColumn<T>]>;
		/** Called with the new board after any successful move. */
		onChange?: (columns: KanbanColumn<T>[]) => void;
		/** Derive a stable key from a card. Defaults to `item.id`. */
		getId?: (item: T) => string;
	}

	let {
		columns = $bindable([]),
		card,
		onChange,
		getId = (item: T) => item.id
	}: Props = $props();

	// --- Pointer drag state (HTML5 DnD) ----------------------------------
	// We track the source column + card index of whatever is being dragged so a
	// drop knows what to remove and where to insert.
	let dragSource = $state<{ col: number; idx: number } | null>(null);
	// The live drop indicator: which column, and the slot the card would land in.
	let dropTarget = $state<{ col: number; idx: number } | null>(null);

	// --- Keyboard "lift" state -------------------------------------------
	// When a card is picked up with the keyboard we remember where it came from
	// (origin*, fixed for the whole lift) and where it currently hovers (col/idx,
	// mutated by arrow keys), mirroring the pointer model.
	let keyboardLift = $state<{
		originCol: number;
		originIdx: number;
		col: number;
		idx: number;
	} | null>(null);

	// aria-live announcements for screen-reader users.
	let announcement = $state('');

	function announce(message: string) {
		announcement = message;
	}

	// Move a card out of (fromCol, fromIdx) and into (toCol) at toIdx.
	// Returns false (and does nothing) if the target column's WIP limit would
	// be exceeded by an incoming card from another column.
	function moveCard(fromCol: number, fromIdx: number, toCol: number, toIdx: number): boolean {
		const target = columns[toCol];
		const crossingColumns = fromCol !== toCol;
		if (crossingColumns && target.wipLimit !== undefined && target.cards.length >= target.wipLimit) {
			announce(`Cannot move — ${target.title} is at its limit of ${target.wipLimit}.`);
			return false;
		}

		// Clone shallowly so Svelte's reactivity sees a new structure.
		const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
		const [moved] = next[fromCol].cards.splice(fromIdx, 1);
		// When reordering within the same column, removing an earlier item shifts
		// later indices down by one — account for that so the card lands where intended.
		let insertAt = toIdx;
		if (fromCol === toCol && fromIdx < toIdx) insertAt -= 1;
		insertAt = Math.max(0, Math.min(insertAt, next[toCol].cards.length));
		next[toCol].cards.splice(insertAt, 0, moved);

		columns = next;
		onChange?.(columns);
		return true;
	}

	// --- Pointer handlers -------------------------------------------------
	function handleDragStart(event: DragEvent, col: number, idx: number) {
		dragSource = { col, idx };
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			// Some browsers require data to be set for the drag to "take".
			event.dataTransfer.setData('text/plain', getId(columns[col].cards[idx]));
		}
	}

	function handleDragOverCard(event: DragEvent, col: number, idx: number) {
		if (!dragSource) return;
		event.preventDefault(); // allow the drop
		// Decide whether the card would land before or after the hovered card
		// based on which half of it the pointer is over.
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const after = event.clientY - rect.top > rect.height / 2;
		dropTarget = { col, idx: after ? idx + 1 : idx };
	}

	function handleDragOverColumn(event: DragEvent, col: number) {
		if (!dragSource) return;
		event.preventDefault();
		// Hovering empty column space drops at the end.
		if (!dropTarget || dropTarget.col !== col) {
			dropTarget = { col, idx: columns[col].cards.length };
		}
	}

	function handleDrop(event: DragEvent, col: number) {
		if (!dragSource) return;
		event.preventDefault();
		const toIdx = dropTarget && dropTarget.col === col ? dropTarget.idx : columns[col].cards.length;
		moveCard(dragSource.col, dragSource.idx, col, toIdx);
		dragSource = null;
		dropTarget = null;
	}

	function handleDragEnd() {
		dragSource = null;
		dropTarget = null;
	}

	// --- Keyboard handlers ------------------------------------------------
	function handleCardKeydown(event: KeyboardEvent, col: number, idx: number) {
		// Space / Enter toggles the lift.
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			if (!keyboardLift) {
				keyboardLift = { originCol: col, originIdx: idx, col, idx };
				announce(`Picked up card in ${columns[col].title}. Use arrow keys to move, Space to drop, Escape to cancel.`);
			} else {
				// Drop: move from the fixed origin to the current target slot.
				const ok = moveCard(
					keyboardLift.originCol,
					keyboardLift.originIdx,
					keyboardLift.col,
					keyboardLift.idx
				);
				if (ok) {
					announce(`Dropped in ${columns[keyboardLift.col].title} at position ${keyboardLift.idx + 1}.`);
				}
				keyboardLift = null;
			}
			return;
		}

		if (event.key === 'Escape' && keyboardLift) {
			event.preventDefault();
			announce('Move cancelled.');
			keyboardLift = null;
			return;
		}

		// Arrow keys only move things while a card is lifted.
		if (!keyboardLift) return;
		const lift = keyboardLift;

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			lift.idx = Math.max(0, lift.idx - 1);
			keyboardLift = { ...lift };
			announce(`Position ${lift.idx + 1} in ${columns[lift.col].title}.`);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			const max = columns[lift.col].cards.length - 1;
			lift.idx = Math.min(max, lift.idx + 1);
			keyboardLift = { ...lift };
			announce(`Position ${lift.idx + 1} in ${columns[lift.col].title}.`);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			if (lift.col > 0) {
				lift.col -= 1;
				lift.idx = Math.min(lift.idx, columns[lift.col].cards.length);
				keyboardLift = { ...lift };
				announce(`Moved to ${columns[lift.col].title}, position ${lift.idx + 1}.`);
			}
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			if (lift.col < columns.length - 1) {
				lift.col += 1;
				lift.idx = Math.min(lift.idx, columns[lift.col].cards.length);
				keyboardLift = { ...lift };
				announce(`Moved to ${columns[lift.col].title}, position ${lift.idx + 1}.`);
			}
		}
	}

	// True when this card is the one currently lifted via keyboard. The card stays
	// rendered at its origin until the move commits, so we match the origin slot.
	function isLifted(col: number, idx: number): boolean {
		return keyboardLift?.originCol === col && keyboardLift?.originIdx === idx;
	}

	// True when the live drop indicator should render before this index in a column.
	function showDropBefore(col: number, idx: number): boolean {
		return dragSource !== null && dropTarget?.col === col && dropTarget?.idx === idx;
	}

	function atLimit(c: KanbanColumn<T>): boolean {
		return c.wipLimit !== undefined && c.cards.length >= c.wipLimit;
	}
</script>

<div class="kb" role="group" aria-label="Kanban board">
	<!-- Off-screen live region: announces every pick-up, move, drop and cancel. -->
	<div class="kb-sr" aria-live="assertive" aria-atomic="true">{announcement}</div>

	{#each columns as column, col (column.id)}
		<section
			class="kb-col"
			class:kb-col--full={atLimit(column)}
			aria-label={column.title}
			ondragover={(e) => handleDragOverColumn(e, col)}
			ondrop={(e) => handleDrop(e, col)}
		>
			<header class="kb-col__head">
				<h3 class="kb-col__title">{column.title}</h3>
				<span class="kb-col__count" aria-label="{column.cards.length} cards">
					{column.cards.length}{#if column.wipLimit !== undefined}&nbsp;/&nbsp;{column.wipLimit}{/if}
				</span>
			</header>

			<ul class="kb-list">
				{#each column.cards as item, idx (getId(item))}
					{#if showDropBefore(col, idx)}
						<li class="kb-drop" aria-hidden="true"></li>
					{/if}
					<li>
						<div
							class="kb-card"
							class:kb-card--lifted={isLifted(col, idx)}
							role="button"
							tabindex="0"
							draggable="true"
							aria-grabbed={isLifted(col, idx)}
							aria-roledescription="Draggable card"
							ondragstart={(e) => handleDragStart(e, col, idx)}
							ondragover={(e) => handleDragOverCard(e, col, idx)}
							ondragend={handleDragEnd}
							onkeydown={(e) => handleCardKeydown(e, col, idx)}
						>
							{@render card(item, column)}
						</div>
					</li>
				{/each}
				{#if showDropBefore(col, column.cards.length)}
					<li class="kb-drop" aria-hidden="true"></li>
				{/if}
				{#if column.cards.length === 0}
					<li class="kb-empty" aria-hidden="true">Drop cards here</li>
				{/if}
			</ul>
		</section>
	{/each}
</div>

<style>
	.kb {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		overflow-x: auto;
		padding: 0.25rem;
		--kb-bg: #f1f5f9;
		--kb-col-bg: #ffffff;
		--kb-border: #e2e8f0;
		--kb-card-bg: #ffffff;
		--kb-card-border: #e2e8f0;
		--kb-text: #0f172a;
		--kb-muted: #64748b;
		--kb-accent: #6366f1;
		--kb-drop: #6366f1;
		--kb-full: #ef4444;
	}

	.kb-sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.kb-col {
		flex: 0 0 16rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--kb-bg);
		border: 1px solid var(--kb-border);
		border-radius: 0.75rem;
		padding: 0.75rem;
		min-height: 6rem;
	}

	.kb-col__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.kb-col__title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--kb-text);
		letter-spacing: 0.01em;
	}

	.kb-col__count {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--kb-muted);
		background: var(--kb-col-bg);
		border: 1px solid var(--kb-border);
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		white-space: nowrap;
	}

	.kb-col--full .kb-col__count {
		color: var(--kb-full);
		border-color: var(--kb-full);
	}

	.kb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.kb-card {
		background: var(--kb-card-bg);
		border: 1px solid var(--kb-card-border);
		border-radius: 0.5rem;
		padding: 0.625rem 0.75rem;
		color: var(--kb-text);
		font-size: 0.875rem;
		cursor: grab;
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
		transition:
			box-shadow 0.15s ease,
			transform 0.15s ease,
			border-color 0.15s ease;
	}

	.kb-card:hover {
		border-color: var(--kb-accent);
	}

	.kb-card:focus-visible {
		outline: 2px solid var(--kb-accent);
		outline-offset: 2px;
	}

	.kb-card:active {
		cursor: grabbing;
	}

	.kb-card--lifted {
		border-color: var(--kb-accent);
		box-shadow: 0 6px 16px rgb(99 102 241 / 0.35);
		transform: scale(1.02);
	}

	.kb-drop {
		height: 0.375rem;
		border-radius: 999px;
		background: var(--kb-drop);
		list-style: none;
		opacity: 0.85;
	}

	.kb-empty {
		text-align: center;
		font-size: 0.8rem;
		color: var(--kb-muted);
		border: 1px dashed var(--kb-border);
		border-radius: 0.5rem;
		padding: 1rem 0.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.kb-card {
			transition: none;
		}
		.kb-card--lifted {
			transform: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.kb {
			--kb-bg: #1e293b;
			--kb-col-bg: #0f172a;
			--kb-border: #334155;
			--kb-card-bg: #1e293b;
			--kb-card-border: #334155;
			--kb-text: #e2e8f0;
			--kb-muted: #94a3b8;
			--kb-accent: #818cf8;
			--kb-drop: #818cf8;
			--kb-full: #f87171;
		}
		.kb-card {
			box-shadow: 0 1px 2px rgb(0 0 0 / 0.4);
		}
	}
</style>
