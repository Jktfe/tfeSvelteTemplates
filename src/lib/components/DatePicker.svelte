<!--
  ===========================================================
  DATE PICKER
  ===========================================================
  WHAT — An accessible single-date picker: a trigger button reveals a month
         grid popover with full keyboard navigation and ISO value binding.

  FEATURES
    • role="grid" month calendar with roving-tabindex day buttons
    • Arrow keys move by day, PageUp/PageDown change month, Home/End jump to
      week edges, Enter/Space select, Escape closes and returns focus
    • min / max bounds disable out-of-range days
    • Intl.DateTimeFormat drives month + weekday labels (locale prop)
    • Bindable value as an ISO yyyy-mm-dd string
    • Optional "today" prop (ISO string) for today highlighting — no reliance
      on the system clock at module load

  ACCESSIBILITY
    • Trigger is aria-haspopup="dialog" / aria-expanded, labelled by its text
    • Grid cells use role="gridcell"; the focused day is the single tabbable
      element (roving tabindex); aria-selected marks the chosen date
    • aria-current="date" marks today; aria-disabled marks out-of-range days
    • Escape closes and restores focus to the trigger; click-outside closes
    • Visible :focus-visible ring; honours prefers-reduced-motion

  DEPENDENCIES — Zero external dependencies (Intl is a platform built-in).

  USAGE
    <script lang="ts">
      let date = $state('2026-06-15');
    </script>
    <DatePicker bind:value={date} min="2026-01-01" max="2026-12-31" />

  PROPS
    | Prop        | Type     | Default       | Description                          |
    | ----------- | -------- | ------------- | ------------------------------------ |
    | value       | string   | ''            | Bindable ISO yyyy-mm-dd value        |
    | min         | string   | ''            | Earliest selectable ISO date         |
    | max         | string   | ''            | Latest selectable ISO date           |
    | today       | string   | ''            | ISO date to highlight as today       |
    | locale      | string   | 'en-GB'       | BCP-47 locale for labels             |
    | placeholder | string   | 'Select date' | Trigger text when no value           |
    | label       | string   | 'Choose date' | Accessible name for the trigger      |
    | disabled    | boolean  | false         | Disables the trigger                 |
  ===========================================================
-->
<script lang="ts">
	interface Props {
		/** Bindable selected date as an ISO yyyy-mm-dd string. */
		value?: string;
		/** Earliest selectable ISO date (inclusive). */
		min?: string;
		/** Latest selectable ISO date (inclusive). */
		max?: string;
		/** ISO date to highlight as "today" — passed in rather than read from the clock. */
		today?: string;
		/** BCP-47 locale used for month and weekday labels. */
		locale?: string;
		/** Trigger text shown when no date is selected. */
		placeholder?: string;
		/** Accessible name for the trigger button. */
		label?: string;
		/** Disables the trigger entirely. */
		disabled?: boolean;
	}

	let {
		value = $bindable(''),
		min = '',
		max = '',
		today = '',
		locale = 'en-GB',
		placeholder = 'Select date',
		label = 'Choose date',
		disabled = false
	}: Props = $props();

	// ---------------------------------------------------------------------------
	// Date helpers — we work in calendar-day space, never wall-clock time, so we
	// build dates from explicit y/m/d parts to dodge timezone drift entirely.
	// ---------------------------------------------------------------------------

	/** Parse an ISO yyyy-mm-dd string into a local Date (midday avoids DST edges). */
	function parseISO(iso: string): Date | null {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
		if (!match) return null;
		const y = Number(match[1]);
		const m = Number(match[2]);
		const d = Number(match[3]);
		const date = new Date(y, m - 1, d, 12, 0, 0, 0);
		// Reject impossible dates like 2026-02-31 that JS would roll over.
		if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
			return null;
		}
		return date;
	}

	/** Format a Date back to ISO yyyy-mm-dd. */
	function toISO(date: Date): string {
		const y = String(date.getFullYear()).padStart(4, '0');
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	/** True if a and b fall on the same calendar day. */
	function sameDay(a: Date | null, b: Date | null): boolean {
		if (!a || !b) return false;
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	const minDate = $derived(parseISO(min));
	const maxDate = $derived(parseISO(max));
	const todayDate = $derived(parseISO(today));
	const selectedDate = $derived(parseISO(value));

	/** A day is selectable only when it sits inside the [min, max] bounds. */
	function inRange(date: Date): boolean {
		if (minDate && date < startOfDay(minDate)) return false;
		if (maxDate && date > endOfDay(maxDate)) return false;
		return true;
	}

	function startOfDay(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
	}
	function endOfDay(date: Date): Date {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
	}

	// ---------------------------------------------------------------------------
	// Open state + the focused day (the cursor the keyboard moves around).
	// ---------------------------------------------------------------------------

	let open = $state(false);

	/** Sensible starting point: the selected day, else today, else the 1st of now. */
	function initialFocus(): Date {
		return selectedDate ?? todayDate ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
	}

	let focusDate = $state(initialFocus());

	let triggerEl = $state<HTMLButtonElement | null>(null);
	let gridEl = $state<HTMLDivElement | null>(null);

	// The view month is derived from whichever day currently holds the cursor.
	const viewYear = $derived(focusDate.getFullYear());
	const viewMonth = $derived(focusDate.getMonth());

	// ---------------------------------------------------------------------------
	// Intl-driven labels.
	// ---------------------------------------------------------------------------
	const monthLabel = $derived(
		new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
			new Date(viewYear, viewMonth, 1, 12)
		)
	);

	const triggerText = $derived(
		selectedDate
			? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
					selectedDate
				)
			: placeholder
	);

	/** Weekday short names, ordered to match the locale's first day of week. */
	const weekdayNames = $derived.by(() => {
		const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		const first = firstDayOfWeek(locale);
		const names: string[] = [];
		// 2026-06-07 is a Sunday; offset by the locale's first weekday.
		for (let i = 0; i < 7; i++) {
			const day = new Date(2026, 5, 7 + ((first + i) % 7), 12);
			names.push(fmt.format(day));
		}
		return names;
	});

	/** Resolve the locale's first day of week (0 = Sunday … 6 = Saturday). */
	function firstDayOfWeek(loc: string): number {
		try {
			// weekInfo is the modern API; fall back to Monday for the wide UK/EU default.
			const info = new Intl.Locale(loc) as Intl.Locale & {
				weekInfo?: { firstDay?: number };
				getWeekInfo?: () => { firstDay?: number };
			};
			const wi = info.getWeekInfo ? info.getWeekInfo() : info.weekInfo;
			if (wi && typeof wi.firstDay === 'number') {
				// Intl uses 1 = Monday … 7 = Sunday; convert to 0 = Sunday.
				return wi.firstDay % 7;
			}
		} catch {
			// Older engines: fall through to the default.
		}
		return 1; // Monday — matches en-GB and most of Europe.
	}

	// ---------------------------------------------------------------------------
	// Build the 6-week grid for the current view month.
	// ---------------------------------------------------------------------------
	interface DayCell {
		date: Date;
		iso: string;
		inMonth: boolean;
		selectable: boolean;
	}

	const weeks = $derived.by(() => {
		const first = firstDayOfWeek(locale);
		const monthStart = new Date(viewYear, viewMonth, 1, 12);
		// Step back to the grid's first cell (the week containing the 1st).
		const offset = (monthStart.getDay() - first + 7) % 7;
		const gridStart = new Date(viewYear, viewMonth, 1 - offset, 12);

		const rows: DayCell[][] = [];
		for (let w = 0; w < 6; w++) {
			const row: DayCell[] = [];
			for (let d = 0; d < 7; d++) {
				const date = new Date(
					gridStart.getFullYear(),
					gridStart.getMonth(),
					gridStart.getDate() + w * 7 + d,
					12
				);
				row.push({
					date,
					iso: toISO(date),
					inMonth: date.getMonth() === viewMonth,
					selectable: inRange(date)
				});
			}
			rows.push(row);
		}
		return rows;
	});

	// ---------------------------------------------------------------------------
	// Open / close lifecycle.
	// ---------------------------------------------------------------------------
	function openPopover() {
		if (disabled) return;
		focusDate = initialFocus();
		open = true;
	}

	function closePopover(restoreFocus = true) {
		open = false;
		if (restoreFocus) triggerEl?.focus();
	}

	function toggle() {
		if (open) closePopover();
		else openPopover();
	}

	/** Whenever the popover opens, move DOM focus onto the active day button. */
	$effect(() => {
		if (!open) return;
		// Wait a tick for the grid to render, then focus the roving cell.
		const id = requestAnimationFrame(() => {
			const active = gridEl?.querySelector<HTMLButtonElement>('button[tabindex="0"]');
			active?.focus();
		});
		return () => cancelAnimationFrame(id);
	});

	// ---------------------------------------------------------------------------
	// Selection + keyboard movement.
	// ---------------------------------------------------------------------------
	function selectDate(date: Date) {
		if (!inRange(date)) return;
		value = toISO(date);
		focusDate = date;
		closePopover();
	}

	/** Move the cursor by a number of days, then refocus the new active cell. */
	function moveFocus(deltaDays: number) {
		const next = new Date(
			focusDate.getFullYear(),
			focusDate.getMonth(),
			focusDate.getDate() + deltaDays,
			12
		);
		focusDate = next;
		refocusActiveCell();
	}

	function moveMonth(deltaMonths: number) {
		const year = focusDate.getFullYear();
		const month = focusDate.getMonth() + deltaMonths;
		// Clamp the day to the target month's length so 31 Jan → 28/29 Feb.
		const lastDay = new Date(year, month + 1, 0).getDate();
		const day = Math.min(focusDate.getDate(), lastDay);
		focusDate = new Date(year, month, day, 12);
		refocusActiveCell();
	}

	/** Jump to the first / last day of the focused week. */
	function moveToWeekEdge(edge: 'start' | 'end') {
		const first = firstDayOfWeek(locale);
		const dow = focusDate.getDay();
		const fromStart = (dow - first + 7) % 7;
		const delta = edge === 'start' ? -fromStart : 6 - fromStart;
		moveFocus(delta);
	}

	function refocusActiveCell() {
		requestAnimationFrame(() => {
			const active = gridEl?.querySelector<HTMLButtonElement>('button[tabindex="0"]');
			active?.focus();
		});
	}

	function onGridKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				moveFocus(-1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				moveFocus(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				moveFocus(-7);
				break;
			case 'ArrowDown':
				event.preventDefault();
				moveFocus(7);
				break;
			case 'PageUp':
				event.preventDefault();
				moveMonth(-1);
				break;
			case 'PageDown':
				event.preventDefault();
				moveMonth(1);
				break;
			case 'Home':
				event.preventDefault();
				moveToWeekEdge('start');
				break;
			case 'End':
				event.preventDefault();
				moveToWeekEdge('end');
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				selectDate(focusDate);
				break;
			case 'Escape':
				event.preventDefault();
				closePopover();
				break;
		}
	}

	/** Close when focus or a pointer leaves the whole widget. */
	let rootEl = $state<HTMLDivElement | null>(null);

	function onPointerDown(event: PointerEvent) {
		if (!open) return;
		if (rootEl && !rootEl.contains(event.target as Node)) {
			closePopover(false);
		}
	}

	function onFocusOut(event: FocusEvent) {
		if (!open) return;
		const next = event.relatedTarget as Node | null;
		if (next && rootEl && !rootEl.contains(next)) {
			closePopover(false);
		}
	}
</script>

<svelte:window onpointerdown={onPointerDown} />

<div class="dp-root" bind:this={rootEl} onfocusout={onFocusOut}>
	<button
		class="dp-trigger"
		type="button"
		bind:this={triggerEl}
		{disabled}
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-label={label}
		onclick={toggle}
	>
		<svg class="dp-icon" viewBox="0 0 24 24" aria-hidden="true">
			<rect x="3" y="4.5" width="18" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6" />
			<path d="M3 9h18" stroke="currentColor" stroke-width="1.6" />
			<path d="M8 2.5v4M16 2.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
		<span class="dp-trigger-text" class:is-placeholder={!selectedDate}>{triggerText}</span>
		<svg class="dp-chevron" class:is-open={open} viewBox="0 0 24 24" aria-hidden="true">
			<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if open}
		<div class="dp-popover" role="dialog" aria-label={monthLabel} aria-modal="false">
			<div class="dp-header">
				<button
					class="dp-nav"
					type="button"
					aria-label="Previous month"
					onclick={() => moveMonth(-1)}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
				<span class="dp-month" aria-live="polite">{monthLabel}</span>
				<button
					class="dp-nav"
					type="button"
					aria-label="Next month"
					onclick={() => moveMonth(1)}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>

			<div
				class="dp-grid"
				role="grid"
				aria-label={monthLabel}
				tabindex="-1"
				bind:this={gridEl}
				onkeydown={onGridKeydown}
			>
				<div class="dp-weekdays" role="row">
					{#each weekdayNames as name (name)}
						<span class="dp-weekday" role="columnheader" aria-label={name}>{name}</span>
					{/each}
				</div>

				{#each weeks as week, w (w)}
					<div class="dp-week" role="row">
						{#each week as cell (cell.iso)}
							{@const isFocused = sameDay(cell.date, focusDate)}
							{@const isSelected = sameDay(cell.date, selectedDate)}
							{@const isToday = sameDay(cell.date, todayDate)}
							<div class="dp-cell" role="gridcell" aria-selected={isSelected}>
								<button
									class="dp-day"
									type="button"
									class:is-outside={!cell.inMonth}
									class:is-selected={isSelected}
									class:is-today={isToday}
									tabindex={isFocused ? 0 : -1}
									disabled={!cell.selectable}
									aria-disabled={!cell.selectable}
									aria-current={isToday ? 'date' : undefined}
									aria-label={new Intl.DateTimeFormat(locale, {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
										year: 'numeric'
									}).format(cell.date)}
									onclick={() => selectDate(cell.date)}
								>
									{cell.date.getDate()}
								</button>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.dp-root {
		/* Light defaults — flipped in the dark block below. */
		--dp-bg: #ffffff;
		--dp-fg: #1a1a2e;
		--dp-muted: #8a8aa0;
		--dp-border: #d9d9e3;
		--dp-accent: #4f46e5;
		--dp-accent-fg: #ffffff;
		--dp-hover: #eef0ff;
		--dp-today-ring: #4f46e5;
		--dp-shadow: 0 12px 32px rgba(20, 20, 50, 0.16);
		--dp-ring: #4f46e5;

		position: relative;
		display: inline-block;
		font-family: inherit;
		color: var(--dp-fg);
	}

	.dp-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 14rem;
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--dp-border);
		border-radius: 0.65rem;
		background: var(--dp-bg);
		color: var(--dp-fg);
		font-size: 0.95rem;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.dp-trigger:hover:not(:disabled) {
		border-color: var(--dp-accent);
	}

	.dp-trigger:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.dp-icon {
		width: 1.15rem;
		height: 1.15rem;
		flex: none;
		color: var(--dp-accent);
	}

	.dp-trigger-text {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dp-trigger-text.is-placeholder {
		color: var(--dp-muted);
	}

	.dp-chevron {
		width: 1rem;
		height: 1rem;
		flex: none;
		color: var(--dp-muted);
		transition: transform 0.18s ease;
	}

	.dp-chevron.is-open {
		transform: rotate(180deg);
	}

	.dp-popover {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 0;
		z-index: 40;
		width: 18.5rem;
		max-width: calc(100vw - 1.5rem);
		padding: 0.75rem;
		border: 1px solid var(--dp-border);
		border-radius: 0.85rem;
		background: var(--dp-bg);
		box-shadow: var(--dp-shadow);
		animation: dp-pop 0.16s ease;
	}

	@keyframes dp-pop {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dp-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
	}

	.dp-month {
		font-weight: 600;
		font-size: 0.95rem;
		text-align: center;
		flex: 1;
	}

	.dp-nav {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		background: transparent;
		color: var(--dp-fg);
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.dp-nav:hover {
		background: var(--dp-hover);
	}

	.dp-nav svg {
		width: 1.1rem;
		height: 1.1rem;
	}

	.dp-weekdays,
	.dp-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
	}

	.dp-weekdays {
		margin-bottom: 0.35rem;
	}

	.dp-weekday {
		text-align: center;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--dp-muted);
		padding: 0.2rem 0;
	}

	.dp-cell {
		display: flex;
	}

	.dp-day {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 1 / 1;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		background: transparent;
		color: var(--dp-fg);
		font-size: 0.85rem;
		cursor: pointer;
		transition:
			background 0.12s ease,
			color 0.12s ease;
	}

	.dp-day:hover:not(:disabled) {
		background: var(--dp-hover);
	}

	.dp-day.is-outside {
		color: var(--dp-muted);
	}

	.dp-day:disabled {
		color: var(--dp-muted);
		opacity: 0.4;
		cursor: not-allowed;
	}

	.dp-day.is-today:not(.is-selected) {
		box-shadow: inset 0 0 0 1.5px var(--dp-today-ring);
		font-weight: 700;
	}

	.dp-day.is-selected {
		background: var(--dp-accent);
		color: var(--dp-accent-fg);
		font-weight: 700;
	}

	/* Visible keyboard focus ring on every interactive surface. */
	.dp-trigger:focus-visible,
	.dp-nav:focus-visible,
	.dp-day:focus-visible {
		outline: 2px solid var(--dp-ring);
		outline-offset: 2px;
	}

	@media (prefers-color-scheme: dark) {
		.dp-root {
			--dp-bg: #1a1a2e;
			--dp-fg: #ececf4;
			--dp-muted: #8888a4;
			--dp-border: #34344e;
			--dp-accent: #818cf8;
			--dp-accent-fg: #15152a;
			--dp-hover: #26264a;
			--dp-today-ring: #818cf8;
			--dp-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
			--dp-ring: #818cf8;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dp-popover {
			animation: none;
		}
		.dp-trigger,
		.dp-chevron,
		.dp-nav,
		.dp-day {
			transition: none;
		}
	}
</style>
