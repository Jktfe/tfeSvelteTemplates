<!--
  ===========================================================
  DateRangePicker
  ===========================================================
  WHAT — A two-month calendar that selects a start/end date range with a live hover-range preview.

  FEATURES
  • Two months side by side (stack on mobile), navigable with prev/next
  • First click sets the start, second click sets the end; clicking before the
    start resets the selection to a fresh start
  • Hovering (or focusing) a day previews the in-progress range before commit
  • Bindable value object: { start, end } as ISO yyyy-mm-dd strings (or null)
  • Optional min / max ISO bounds disable out-of-range days
  • Self-contained calendar-grid maths — no external date library

  ACCESSIBILITY
  • Grid is a real <table> with role="grid"; days are buttons
  • Arrow keys move focus day-by-day; focus drives the same range preview as hover
  • aria-pressed marks selected days, aria-disabled marks out-of-bounds days
  • Visible :focus-visible ring; honours prefers-reduced-motion

  DEPENDENCIES — Zero external dependencies.

  USAGE
  <script lang="ts">
    let range = $state<{ start: string | null; end: string | null }>({ start: null, end: null });
  </script>
  <DateRangePicker bind:value={range} min="2026-01-01" max="2026-12-31" />

  PROPS
  | Prop          | Type                                       | Default                      | Description                                   |
  |---------------|--------------------------------------------|------------------------------|-----------------------------------------------|
  | value         | { start: string\|null; end: string\|null } | { start: null, end: null }   | Bindable selected range as ISO strings        |
  | min           | string \| null                             | null                         | Earliest selectable ISO date (inclusive)      |
  | max           | string \| null                             | null                         | Latest selectable ISO date (inclusive)        |
  | initialMonth  | string \| null                             | null                         | ISO date whose month opens on the left panel  |
  | weekStartsOn  | 0 \| 1                                      | 1                            | First column: 0 = Sunday, 1 = Monday          |
  ===========================================================
-->
<script lang="ts">
	import { untrack } from 'svelte';

	interface RangeValue {
		start: string | null;
		end: string | null;
	}

	interface Props {
		/** Bindable selected range as ISO yyyy-mm-dd strings (or null). */
		value?: RangeValue;
		/** Earliest selectable ISO date (inclusive). */
		min?: string | null;
		/** Latest selectable ISO date (inclusive). */
		max?: string | null;
		/** ISO date whose month opens on the left panel. */
		initialMonth?: string | null;
		/** First column of the week: 0 = Sunday, 1 = Monday. */
		weekStartsOn?: 0 | 1;
	}

	let {
		value = $bindable({ start: null, end: null }),
		min = null,
		max = null,
		initialMonth = null,
		weekStartsOn = 1
	}: Props = $props();

	// --- Pure date helpers (kept local so the component stays copy-paste portable) ---

	/** Format a Date as a local yyyy-mm-dd string — no timezone surprises. */
	function toISO(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	/** Parse a yyyy-mm-dd string into a local Date at midnight. */
	function fromISO(iso: string): Date {
		const [y, m, d] = iso.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	/** First day-of-month for the month containing `d`. */
	function startOfMonth(d: Date): Date {
		return new Date(d.getFullYear(), d.getMonth(), 1);
	}

	function addMonths(d: Date, n: number): Date {
		return new Date(d.getFullYear(), d.getMonth() + n, 1);
	}

	/** Whole-day difference iso-a minus iso-b (negative if a is before b). */
	function compareISO(a: string, b: string): number {
		return a < b ? -1 : a > b ? 1 : 0;
	}

	const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const MONTH_LABELS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	// The left-hand month anchor. The right panel is always anchor + 1 month.
	// We only need the *initial* prop values to seed it, so untrack keeps Svelte
	// from treating this one-time read as an ongoing reactive dependency.
	const initialAnchor = untrack(() =>
		initialMonth
			? startOfMonth(fromISO(initialMonth))
			: value.start
				? startOfMonth(fromISO(value.start))
				: startOfMonth(new Date())
	);

	let anchorISO = $state(toISO(initialAnchor));
	const anchor = $derived(fromISO(anchorISO));

	// The day currently hovered or focused — drives the live range preview.
	let previewISO = $state<string | null>(null);

	/** When a start is set but no end, this is the "other end" of the preview. */
	const effectiveEnd = $derived.by(() => {
		if (value.start && !value.end && previewISO) return previewISO;
		return value.end;
	});

	/** Ordered [lo, hi] of the range being shown (commit or preview), or null. */
	const span = $derived.by((): [string, string] | null => {
		const a = value.start;
		const b = effectiveEnd;
		if (!a || !b) return null;
		return compareISO(a, b) <= 0 ? [a, b] : [b, a];
	});

	function isDisabled(iso: string): boolean {
		if (min && compareISO(iso, min) < 0) return true;
		if (max && compareISO(iso, max) > 0) return true;
		return false;
	}

	function dayState(iso: string): 'start' | 'end' | 'in-range' | 'none' {
		const s = span;
		if (value.start && iso === value.start) return 'start';
		if (value.end && iso === value.end) return 'end';
		if (s && compareISO(iso, s[0]) > 0 && compareISO(iso, s[1]) < 0) return 'in-range';
		// Preview endpoints (no committed end yet) read as endpoints too.
		if (value.start && !value.end && previewISO === iso) return 'end';
		return 'none';
	}

	/** Build the 6×7 grid of Dates for the month containing `monthAnchor`. */
	function buildGrid(monthAnchor: Date): Date[] {
		const first = startOfMonth(monthAnchor);
		// How many leading days from the previous month to show.
		const offset = (first.getDay() - weekStartsOn + 7) % 7;
		const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
		const cells: Date[] = [];
		for (let i = 0; i < 42; i++) {
			cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
		}
		return cells;
	}

	const leftGrid = $derived(buildGrid(anchor));
	const rightGrid = $derived(buildGrid(addMonths(anchor, 1)));

	const orderedWeekdays = $derived(
		weekStartsOn === 1 ? [...WEEKDAY_LABELS.slice(1), WEEKDAY_LABELS[0]] : WEEKDAY_LABELS
	);

	function monthTitle(d: Date): string {
		return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
	}

	// --- Selection logic: first click = start, second = end, before-start = reset ---
	function selectDay(iso: string) {
		if (isDisabled(iso)) return;

		if (!value.start || value.end) {
			// Begin a new range.
			value = { start: iso, end: null };
		} else {
			// We have a start, no end yet.
			if (compareISO(iso, value.start) < 0) {
				// Clicking before the start resets to a fresh start.
				value = { start: iso, end: null };
			} else {
				value = { start: value.start, end: iso };
				previewISO = null;
			}
		}
	}

	function previousMonth() {
		anchorISO = toISO(addMonths(anchor, -1));
	}
	function nextMonth() {
		anchorISO = toISO(addMonths(anchor, 1));
	}

	function inAnchorMonth(d: Date, monthIndex: number): boolean {
		return d.getMonth() === monthIndex;
	}

	// Keyboard: arrows move focus a day at a time, driving the same preview as hover.
	function onDayKeydown(event: KeyboardEvent, iso: string) {
		const key = event.key;
		const delta =
			key === 'ArrowRight' ? 1 :
			key === 'ArrowLeft' ? -1 :
			key === 'ArrowDown' ? 7 :
			key === 'ArrowUp' ? -7 : 0;

		if (delta !== 0) {
			event.preventDefault();
			const target = fromISO(iso);
			target.setDate(target.getDate() + delta);
			const targetISO = toISO(target);
			// Ensure the target month is visible.
			const startLeft = startOfMonth(anchor);
			const endRight = addMonths(anchor, 2); // exclusive
			if (compareISO(targetISO, toISO(startLeft)) < 0) {
				anchorISO = toISO(startOfMonth(target));
			} else if (compareISO(targetISO, toISO(endRight)) >= 0) {
				anchorISO = toISO(addMonths(startOfMonth(target), -1));
			}
			// Focus the newly targeted cell after the grid re-renders.
			queueMicrotask(() => {
				const el = document.querySelector<HTMLButtonElement>(
					`[data-drp-day="${targetISO}"]`
				);
				el?.focus();
			});
		}
	}
</script>

<div class="drp" role="group" aria-label="Date range picker">
	<div class="drp-nav">
		<button
			type="button"
			class="drp-arrow"
			onclick={previousMonth}
			aria-label="Previous month"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<div class="drp-titles">
			<span class="drp-month-title">{monthTitle(anchor)}</span>
			<span class="drp-month-title drp-month-title--right">{monthTitle(addMonths(anchor, 1))}</span>
		</div>
		<button
			type="button"
			class="drp-arrow"
			onclick={nextMonth}
			aria-label="Next month"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	</div>

	<div class="drp-months">
		{#each [{ grid: leftGrid, anchor: anchor }, { grid: rightGrid, anchor: addMonths(anchor, 1) }] as panel (toISO(panel.anchor))}
			<table class="drp-grid" role="grid" aria-label={monthTitle(panel.anchor)}>
				<caption class="drp-caption">{monthTitle(panel.anchor)}</caption>
				<thead>
					<tr>
						{#each orderedWeekdays as wd (wd)}
							<th scope="col" class="drp-weekday" abbr={wd}>{wd.slice(0, 2)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array.from({ length: 6 }, (_, w) => w) as week (week)}
						<tr>
							{#each panel.grid.slice(week * 7, week * 7 + 7) as day (toISO(day))}
								{@const iso = toISO(day)}
								{@const outside = !inAnchorMonth(day, panel.anchor.getMonth())}
								{@const disambiguateName = outside || panel.anchor.getMonth() !== anchor.getMonth()}
								{@const disabled = isDisabled(iso)}
								{@const state = dayState(iso)}
								<td role="gridcell" class="drp-cell">
									<button
										type="button"
										class="drp-day"
										class:drp-day--outside={outside}
										class:drp-day--start={state === 'start'}
										class:drp-day--end={state === 'end'}
										class:drp-day--in-range={state === 'in-range'}
										data-drp-day={iso}
										aria-label={disambiguateName ? `${monthTitle(panel.anchor)} ${day.getDate()}` : undefined}
										aria-pressed={state === 'start' || state === 'end'}
										aria-disabled={disabled}
										disabled={disabled}
										onclick={() => selectDay(iso)}
										onmouseenter={() => (previewISO = iso)}
										onmouseleave={() => (previewISO = null)}
										onfocus={() => (previewISO = iso)}
										onkeydown={(e) => onDayKeydown(e, iso)}
									>
										{day.getDate()}
									</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/each}
	</div>
</div>

<style>
	.drp {
		/* Light defaults; the dark block below flips chrome tokens. */
		--drp-bg: #ffffff;
		--drp-fg: #1f2430;
		--drp-muted: #9aa3b2;
		--drp-border: #e3e7ee;
		--drp-hover: #eef2f8;
		--drp-accent: #4f46e5;
		--drp-accent-fg: #ffffff;
		--drp-range-bg: #e0e7ff;
		--drp-range-fg: #312e81;
		--drp-focus: #6366f1;

		display: inline-block;
		background: var(--drp-bg);
		color: var(--drp-fg);
		border: 1px solid var(--drp-border);
		border-radius: 14px;
		padding: 0.85rem;
		font-family: inherit;
		box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06);
	}

	.drp-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.drp-titles {
		display: flex;
		flex: 1;
		justify-content: space-around;
		gap: 1rem;
	}

	.drp-month-title {
		font-weight: 600;
		font-size: 0.95rem;
	}
	/* On desktop the captions inside each table are hidden; the nav titles show. */
	.drp-caption {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	.drp-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--drp-border);
		border-radius: 8px;
		background: var(--drp-bg);
		color: var(--drp-fg);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}
	.drp-arrow:hover {
		background: var(--drp-hover);
	}
	.drp-arrow svg {
		width: 1rem;
		height: 1rem;
	}

	.drp-months {
		display: flex;
		gap: 1.25rem;
	}

	.drp-grid {
		border-collapse: collapse;
		table-layout: fixed;
	}

	.drp-weekday {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--drp-muted);
		text-transform: uppercase;
		padding-bottom: 0.35rem;
		text-align: center;
		width: 2.25rem;
	}

	.drp-cell {
		padding: 1px;
		text-align: center;
	}

	.drp-day {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: none;
		background: transparent;
		color: var(--drp-fg);
		font: inherit;
		font-size: 0.85rem;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.12s ease, color 0.12s ease;
	}
	.drp-day:hover:not(:disabled) {
		background: var(--drp-hover);
	}
	.drp-day:focus-visible {
		outline: 2px solid var(--drp-focus);
		outline-offset: 2px;
	}
	.drp-day:disabled {
		color: var(--drp-muted);
		cursor: not-allowed;
		opacity: 0.45;
	}
	.drp-day--outside {
		color: var(--drp-muted);
	}

	.drp-day--in-range {
		background: var(--drp-range-bg);
		color: var(--drp-range-fg);
		border-radius: 0;
	}
	.drp-day--start,
	.drp-day--end {
		background: var(--drp-accent);
		color: var(--drp-accent-fg);
		font-weight: 600;
	}
	.drp-day--start {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.drp-day--end {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	@media (max-width: 560px) {
		.drp-months {
			flex-direction: column;
			gap: 1rem;
		}
		.drp-titles {
			display: none;
		}
		/* On mobile the per-table caption replaces the hidden nav titles. */
		.drp-caption {
			position: static;
			width: auto;
			height: auto;
			clip: auto;
			font-weight: 600;
			font-size: 0.9rem;
			padding-bottom: 0.4rem;
		}
		.drp-grid {
			width: 100%;
		}
		.drp-weekday,
		.drp-day {
			width: auto;
		}
		.drp-day {
			margin: 0 auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drp-arrow,
		.drp-day {
			transition: none;
		}
	}

	@media (prefers-color-scheme: dark) {
		.drp {
			--drp-bg: #161922;
			--drp-fg: #e7eaf0;
			--drp-muted: #6b7280;
			--drp-border: #2a2f3a;
			--drp-hover: #232834;
			--drp-accent: #818cf8;
			--drp-accent-fg: #0b0d12;
			--drp-range-bg: #2b3354;
			--drp-range-fg: #c7d2fe;
			--drp-focus: #a5b4fc;
			box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
		}
	}
</style>
