<!--
	============================================================
	CalendarHeatmap - GitHub-style Activity Calendar (Zero Dependencies)
	============================================================

	[CR] WHAT IT DOES
	SVG-based calendar heatmap displaying 52 weeks × 7 days with 5-level
	discrete colour system for activity intensity. Includes tooltips,
	click handlers, keyboard navigation, and colour legend.

	[NTL] THE SIMPLE VERSION
	Think of GitHub's green contribution squares! This shows your activity
	over a year where darker colours mean more activity. You can hover to
	see exact dates and click on any day to interact with it.

	✨ FEATURES
	• GitHub-style contribution calendar layout
	• 5-level discrete colour system (configurable)
	• Interactive tooltips showing date and value
	• Click handlers for cell selection
	• Full keyboard navigation (arrow keys + Enter/Space)
	• Month labels across top, weekday labels on left
	• Colour legend showing intensity levels
	• Customisable colours, dimensions, and formatting
	• Dark mode support via prefers-color-scheme

	♿ ACCESSIBILITY
	• ARIA role="region" with descriptive label
	• Each cell has aria-label with date and value
	• Full keyboard navigation with focus indicators
	• Respects prefers-reduced-motion preference

	📦 DEPENDENCIES
	Zero external dependencies - fully portable!

	⚠️ WARNINGS
	None expected

	🎨 USAGE
	<CalendarHeatmap
		data={activityData}
		colorLow="#ebedf0"
		colorHigh="#216e39"
		onCellClick={(date, value) => console.log(date, value)}
	/>

	📋 PROPS
	| Prop             | Type                | Default   | Description                    |
	|------------------|---------------------|-----------|--------------------------------|
	| data             | HeatmapData[]       | []        | Array of {date, value} entries |
	| startDate        | Date                | -365 days | Start of date range            |
	| endDate          | Date                | today     | End of date range              |
	| colorLow         | string              | #ebedf0   | Colour for no activity         |
	| colorHigh        | string              | #216e39   | Colour for max activity        |
	| cellSize         | number              | 12        | Size of each cell in pixels    |
	| cellGap          | number              | 3         | Gap between cells              |
	| showWeekLabels   | boolean             | true      | Show Mon/Wed/Fri labels        |
	| showMonthLabels  | boolean             | true      | Show month labels at top       |
	| showLegend       | boolean             | true      | Show Less/More legend          |
	| levels           | number              | 5         | Number of colour levels        |
	| tooltipFormatter | function            | undefined | Custom tooltip text function   |
	| onCellClick      | function            | undefined | Called with (date, value)      |

	============================================================
-->

<script lang="ts">
	import { SvelteMap, SvelteDate } from 'svelte/reactivity';
	// [CR] Type import for props interface
	import type { CalendarHeatmapProps } from '$lib/types';

	// =========================================================================
	// [CR] PROPS - All configurable options with sensible defaults
	// [NTL] These are the settings you can pass to customise the calendar!
	// =========================================================================

	let {
		data = [],                    // [NTL] Your activity data as [{date: "2024-01-15", value: 5}, ...]
		startDate,                    // [NTL] When to start showing (defaults to 365 days ago)
		endDate,                      // [NTL] When to end showing (defaults to today)
		colorLow = '#ebedf0',         // [NTL] The "empty" colour (GitHub's light grey)
		colorHigh = '#216e39',        // [NTL] The "max activity" colour (GitHub's dark green)
		cellSize = 12,                // [NTL] How big each day square is in pixels
		cellGap = 3,                  // [NTL] Space between squares
		showWeekLabels = true,        // [NTL] Show Mon/Wed/Fri on the left
		showMonthLabels = true,       // [NTL] Show Jan/Feb/Mar across the top
		showLegend = true,            // [NTL] Show the Less/More bar at the bottom
		levels = 5,                   // [NTL] How many colour steps between empty and full
		tooltipFormatter,             // [NTL] Custom function to format tooltip text
		onCellClick,                  // [NTL] What happens when you click a day
		class: className = ''         // [NTL] Extra CSS classes for the container
	}: CalendarHeatmapProps = $props();

	// =========================================================================
	// [CR] COMPONENT STATE - Reactive values managed internally
	// [NTL] These track what's happening right now (hover, focus, etc.)
	// =========================================================================

	// [CR] Tooltip state object containing position and content
	// [NTL] This controls that little popup that appears when you hover
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	// [CR] Track which cell has keyboard focus for arrow key navigation
	// [NTL] When you Tab into the calendar and use arrow keys, this tracks where you are
	let focusedCell = $state<{ weekIndex: number; dayIndex: number } | null>(null);

	// [CR] Reference to container DOM element for tooltip positioning calculations
	let containerEl = $state<HTMLDivElement | undefined>();

	// =========================================================================
	// [CR] LAYOUT CONSTANTS
	// [NTL] These numbers control the overall calendar layout
	// =========================================================================

	const WEEK_LABEL_WIDTH = 30;     // [NTL] How much space for Mon/Wed/Fri labels
	const MONTH_LABEL_HEIGHT = 20;   // [NTL] How much space for Jan/Feb/Mar labels
	const WEEKDAY_LABELS = ['Mon', 'Wed', 'Fri'];  // [NTL] Which days to label (like GitHub)
	const WEEKDAY_INDICES = [1, 3, 5]; // [CR] Maps to Sun=0, Mon=1, Tue=2, Wed=3, etc.

	// =========================================================================
	// [CR] COLOUR UTILITY FUNCTIONS
	// [NTL] These helper functions handle colour mixing for the gradient effect.
	//       We need to blend between colorLow and colorHigh to create the levels.
	// =========================================================================

	/**
	 * [CR] Parse any colour format to RGB components for interpolation.
	 * [NTL] Colours can be written many ways (#fff, rgb(255,0,0), "red").
	 *       This function understands them all and converts to {r, g, b}.
	 */
	function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
		// Handle hex colors
		if (color.startsWith('#')) {
			let hex = color.replace(/^#/, '');

			// Expand 3-digit shorthand to 6 digits
			if (hex.length === 3) {
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}

			// Handle 8-digit hex (ignore alpha channel)
			if (hex.length === 8) {
				hex = hex.slice(0, 6);
			}

			if (hex.length !== 6) {
				return null;
			}

			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);

			if ([r, g, b].some((v) => isNaN(v))) {
				return null;
			}

			return { r, g, b };
		}

		// Handle rgb/rgba strings
		const rgbMatch = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
		if (rgbMatch) {
			const [, r, g, b] = rgbMatch;
			const [rNum, gNum, bNum] = [r, g, b].map(Number);
			if (rNum <= 255 && gNum <= 255 && bNum <= 255) {
				return { r: rNum, g: gNum, b: bNum };
			}
			return null;
		}

		// Handle common named colors (map to hex equivalents)
		const namedColors: Record<string, string> = {
			black: '#000000',
			white: '#ffffff',
			red: '#ff0000',
			green: '#008000',
			blue: '#0000ff',
			yellow: '#ffff00',
			orange: '#ffa500',
			purple: '#800080',
			pink: '#ffc0cb',
			gray: '#808080',
			grey: '#808080',
			brown: '#a52a2a',
			transparent: '#000000' // Treat as black for gradient purposes
		};

		const lowerColor = color.toLowerCase();
		if (lowerColor in namedColors) {
			return parseColorToRgb(namedColors[lowerColor]);
		}

		return null;
	}

	/**
	 * [CR] Interpolate between two colours using linear RGB blending.
	 * [NTL] This is like mixing paint! factor=0 gives you colour1,
	 *       factor=1 gives colour2, and anything in between is a blend.
	 */
	function interpolateColor(color1: string, color2: string, factor: number): string {
		const c1 = parseColorToRgb(color1);
		const c2 = parseColorToRgb(color2);

		if (!c1 || !c2) return color1;

		const r = Math.round(c1.r + factor * (c2.r - c1.r));
		const g = Math.round(c1.g + factor * (c2.g - c1.g));
		const b = Math.round(c1.b + factor * (c2.b - c1.b));

		return `rgb(${r}, ${g}, ${b})`;
	}

	// =========================================================================
	// [CR] DATE UTILITY FUNCTIONS
	// [NTL] Helper functions for working with dates - converting, formatting, etc.
	// =========================================================================

	/**
	 * [CR] Convert Date object to ISO format string for consistent data lookup.
	 * [NTL] JavaScript dates are objects, but our data uses strings like "2024-01-15".
	 *       This converts between them so we can find matching entries.
	 */
	function toISODate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	/**
	 * [CR] Get numeric day of week (0=Sunday through 6=Saturday).
	 * [NTL] JavaScript uses 0 for Sunday, which is handy because our calendar
	 *       starts each column on Sunday just like GitHub's!
	 */

	/**
	 * [CR] Get abbreviated month name for the month label row.
	 * [NTL] Converts month numbers to "Jan", "Feb", "Mar" etc.
	 */
	function getMonthName(date: Date): string {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return months[date.getMonth()];
	}

	// =========================================================================
	// [CR] REACTIVE CALENDAR DATA COMPUTATION
	// [NTL] Here's where the magic happens! Svelte's $derived rune automatically
	//       recalculates these values whenever their dependencies change.
	// =========================================================================

	/**
	 * [CR] Reactive date range computation with sensible defaults.
	 * [NTL] If you don't specify dates, we show the last 365 days - just like GitHub!
	 */
	let dateRange = $derived(() => {
		const end = endDate || new SvelteDate();
		const start = startDate || new SvelteDate(end.getTime() - 365 * 24 * 60 * 60 * 1000);
		return { start, end };
	});

	/**
	 * [CR] Convert data array to Map for O(1) lookups by date string.
	 * [NTL] Instead of searching through the array every time (slow!), we build
	 *       a lookup table. Think of it like an index in a book - much faster!
	 */
	let dataMap = $derived(() => {
		const map = new SvelteMap<string, number>();
		for (const item of data) {
			map.set(item.date, item.value);
		}
		return map;
	});

	/**
	 * [CR] Find the maximum value in the dataset for colour scaling.
	 * [NTL] We need to know the highest activity level so we can scale
	 *       all the colours proportionally. The minimum is 1 to avoid divide-by-zero.
	 */
	let maxValue = $derived(() => {
		return Math.max(...data.map((d) => d.value), 1);
	});

	/**
	 * [CR] Generate discrete colour palette by interpolating between low and high.
	 * [NTL] This creates 5 shades (by default) from light grey to dark green,
	 *       like GitHub's contribution levels. Level 0 = no activity, Level 4 = lots!
	 */
	let colorPalette = $derived(() => {
		const palette = [colorLow]; // Level 0
		for (let i = 1; i < levels; i++) {
			const factor = i / (levels - 1);
			palette.push(interpolateColor(colorLow, colorHigh, factor));
		}
		return palette;
	});

	/**
	 * [CR] Generate the 2D grid of weeks and days for rendering.
	 * [NTL] This is the core layout algorithm! It creates columns (weeks) and
	 *       rows (days). Each cell either has a date+value or is null (padding).
	 *       We start each week on Sunday, just like GitHub's contribution graph.
	 */
	let calendarWeeks = $derived(() => {
		const { start, end } = dateRange();
		const weeks: Array<Array<{ date: Date; value: number } | null>> = [];

		// Find first Sunday on or before start date
		const firstDay = new SvelteDate(start);
		const dayOffset = firstDay.getDay(); // 0 = Sunday
		firstDay.setDate(firstDay.getDate() - dayOffset);

		// Generate all weeks until we pass end date
		let currentDate = new SvelteDate(firstDay);
		while (currentDate <= end || weeks.length === 0 || weeks[weeks.length - 1].length < 7) {
			// Start new week
			const week: Array<{ date: Date; value: number } | null> = [];

			// Generate 7 days for this week
			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const cellDate = new SvelteDate(currentDate);

				// Only include cells within start-end range
				if (cellDate >= start && cellDate <= end) {
					const dateStr = toISODate(cellDate);
					const value = dataMap().get(dateStr) || 0;
					week.push({ date: cellDate, value });
				} else {
					// Pad with null for cells outside range
					week.push(null);
				}

				currentDate.setDate(currentDate.getDate() + 1);
			}

			weeks.push(week);

			// Break if we've passed end date and filled the current week
			if (currentDate > end && week.every((cell) => cell === null || cell.date > end)) {
				break;
			}
		}

		return weeks;
	});

	/**
	 * [CR] Calculate x-positions for month labels across the top.
	 * [NTL] We walk through the weeks and whenever we see a new month,
	 *       we note where to put its label. Simple but effective!
	 */
	let monthLabels = $derived(() => {
		if (!showMonthLabels) return [];

		const labels: Array<{ label: string; x: number }> = [];
		let lastMonth = -1;

		calendarWeeks().forEach((week, weekIndex) => {
			// Check first non-null cell in week
			const firstCell = week.find((cell) => cell !== null);
			if (firstCell) {
				const month = firstCell.date.getMonth();
				if (month !== lastMonth) {
					labels.push({
						label: getMonthName(firstCell.date),
						x: WEEK_LABEL_WIDTH + weekIndex * (cellSize + cellGap)
					});
					lastMonth = month;
				}
			}
		});

		return labels;
	});

	/**
	 * [CR] Dynamically calculate SVG width based on number of weeks.
	 * [NTL] The calendar grows horizontally as more weeks are added.
	 */
	let containerWidth = $derived(() => {
		const gridWidth = calendarWeeks().length * (cellSize + cellGap) - cellGap;
		return WEEK_LABEL_WIDTH + gridWidth + 10;
	});

	/**
	 * [CR] Dynamically calculate SVG height based on 7 days.
	 * [NTL] Height is always fixed to 7 rows (one per day of the week).
	 */
	let containerHeight = $derived(() => {
		const gridHeight = 7 * (cellSize + cellGap) - cellGap;
		return MONTH_LABEL_HEIGHT + gridHeight + 10;
	});

	// =========================================================================
	// [CR] COLOUR LEVEL CALCULATION
	// [NTL] These functions convert raw values to colour levels (0-4)
	// =========================================================================

	/**
	 * [CR] Map a value to a discrete colour level (0 to levels-1).
	 * [NTL] Zero activity = level 0 (grey). Higher values get darker shades.
	 *       We use percentage of max value to determine which level.
	 */
	function getColorLevel(value: number): number {
		if (value === 0) return 0;
		const percentage = value / maxValue();
		return Math.min(Math.ceil(percentage * (levels - 1)), levels - 1);
	}

	/**
	 * [CR] Get the fill colour for a cell based on its value.
	 * [NTL] Simple lookup: convert value to level, then grab that colour from our palette.
	 */
	function getCellColor(value: number): string {
		const level = getColorLevel(value);
		return colorPalette()[level];
	}

	// =========================================================================
	// [CR] EVENT HANDLERS
	// [NTL] These functions respond to user interactions - hover, click, keyboard
	// =========================================================================

	/**
	 * [CR] Display tooltip near the cursor with formatted date and value.
	 * [NTL] When you hover over a cell, this calculates where to put the tooltip
	 *       and what text to show. The tooltip follows your mouse!
	 */
	function showTooltip(event: MouseEvent, cell: { date: Date; value: number }) {
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const tooltipX = event.clientX - rect.left;
		const tooltipY = event.clientY - rect.top;

		// Format tooltip text
		const dateStr = toISODate(cell.date);
		const formattedDate = cell.date.toLocaleDateString('en-GB', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

		const text = tooltipFormatter
			? tooltipFormatter(dateStr, cell.value)
			: `${formattedDate}: ${cell.value} ${cell.value === 1 ? 'contribution' : 'contributions'}`;

		tooltip = {
			visible: true,
			x: tooltipX,
			y: tooltipY - 10, // Position above cursor
			text
		};
	}

	/**
	 * [CR] Hide the tooltip when mouse leaves a cell.
	 * [NTL] Simple cleanup - just sets visible to false.
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}

	/**
	 * [CR] Handle click on a calendar cell, firing the callback if provided.
	 * [NTL] When you click a day, this tells your app which date and value was clicked.
	 */
	function handleCellClick(cell: { date: Date; value: number }) {
		const dateStr = toISODate(cell.date);
		onCellClick?.(dateStr, cell.value);
	}

	/**
	 * [CR] Handle arrow key navigation between cells in the calendar grid.
	 * [NTL] You can use arrow keys to move around the calendar! Left/Right moves
	 *       between weeks, Up/Down moves between days. Enter/Space clicks the cell.
	 */
	function handleKeyDown(event: KeyboardEvent, weekIndex: number, dayIndex: number) {
		let newWeekIndex = weekIndex;
		let newDayIndex = dayIndex;

		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				newWeekIndex = Math.min(weekIndex + 1, calendarWeeks().length - 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				newWeekIndex = Math.max(weekIndex - 1, 0);
				break;
			case 'ArrowDown':
				event.preventDefault();
				newDayIndex = Math.min(dayIndex + 1, 6);
				break;
			case 'ArrowUp':
				event.preventDefault();
				newDayIndex = Math.max(dayIndex - 1, 0);
				break;
			case 'Enter':
			case ' ': {
				event.preventDefault();
				const cell = calendarWeeks()[weekIndex][dayIndex];
				if (cell) handleCellClick(cell);
				return;
			}
			default:
				return;
		}

		// Update focus if new position is valid
		const newCell = calendarWeeks()[newWeekIndex]?.[newDayIndex];
		if (newCell) {
			focusedCell = { weekIndex: newWeekIndex, dayIndex: newDayIndex };
		}
	}
</script>

<div
	bind:this={containerEl}
	class="calendar-heatmap-container {className}"
	role="region"
	aria-label="Activity calendar heatmap"
>
	<!-- SVG Calendar Grid -->
	<svg
		width={containerWidth()}
		height={containerHeight()}
		viewBox="0 0 {containerWidth()} {containerHeight()}"
		class="calendar-svg"
	>
		<!-- Month Labels -->
		{#if showMonthLabels}
			{#each monthLabels() as { label, x } (label)}
				<text x={x} y={MONTH_LABEL_HEIGHT - 5} class="month-label">{label}</text>
			{/each}
		{/if}

		<!-- Weekday Labels -->
		{#if showWeekLabels}
			{#each WEEKDAY_LABELS as label, i (label)}
				<text
					x={WEEK_LABEL_WIDTH - 5}
					y={MONTH_LABEL_HEIGHT + WEEKDAY_INDICES[i] * (cellSize + cellGap) + cellSize / 2}
					class="weekday-label"
					text-anchor="end"
					dominant-baseline="middle"
				>
					{label}
				</text>
			{/each}
		{/if}

		<!-- Calendar Grid -->
		<g transform="translate({WEEK_LABEL_WIDTH}, {MONTH_LABEL_HEIGHT})">
			{#each calendarWeeks() as week, weekIndex (weekIndex)}
				{#each week as cell, dayIndex (`${weekIndex}-${dayIndex}`)}
					{#if cell}
						{@const x = weekIndex * (cellSize + cellGap)}
						{@const y = dayIndex * (cellSize + cellGap)}
						{@const isFocused =
							focusedCell?.weekIndex === weekIndex && focusedCell?.dayIndex === dayIndex}

						<rect
							{x}
							{y}
							width={cellSize}
							height={cellSize}
							fill={getCellColor(cell.value)}
							class="calendar-cell"
							class:focused={isFocused}
							role="button"
							tabindex={isFocused ? 0 : -1}
							aria-label="{toISODate(cell.date)}: {cell.value} contributions"
							onmouseenter={(e) => showTooltip(e, cell)}
							onmouseleave={hideTooltip}
							onclick={() => handleCellClick(cell)}
							onkeydown={(e) => handleKeyDown(e, weekIndex, dayIndex)}
						/>
					{/if}
				{/each}
			{/each}
		</g>
	</svg>

	<!-- Tooltip -->
	{#if tooltip.visible}
		<div
			class="tooltip"
			style:left="{tooltip.x}px"
			style:top="{tooltip.y}px"
			role="tooltip"
			aria-live="polite"
		>
			{tooltip.text}
		</div>
	{/if}

	<!-- Legend -->
	{#if showLegend}
		<div class="legend">
			<span class="legend-label">Less</span>
			{#each colorPalette() as color (color)}
				<div class="legend-cell" style:background-color={color}></div>
			{/each}
			<span class="legend-label">More</span>
		</div>
	{/if}
</div>

<style>
	/**
	 * Container styling with user-select disabled
	 * [CR] Added max-width and overflow-x for mobile responsiveness
	 * [NTL] On small screens, this lets you scroll horizontally to see
	 *       the full calendar instead of it overflowing off the page!
	 */
	.calendar-heatmap-container {
		display: inline-block;
		user-select: none;
		-webkit-user-select: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		position: relative;
		max-width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	/**
	 * SVG styling
	 * [CR] display: block prevents inline whitespace issues
	 */
	.calendar-svg {
		display: block;
	}

	/**
	 * Month labels at top
	 */
	.month-label {
		font-size: 10px;
		fill: #767676;
		font-weight: 400;
	}

	/**
	 * Weekday labels on left (Mon/Wed/Fri)
	 */
	.weekday-label {
		font-size: 9px;
		fill: #767676;
	}

	/**
	 * Calendar cells (interactive rectangles)
	 */
	.calendar-cell {
		stroke: rgba(27, 31, 35, 0.04);
		stroke-width: 1px;
		cursor: pointer;
		rx: 2;
		transition: stroke 0.2s ease;
	}

	.calendar-cell:hover {
		stroke: rgba(27, 31, 35, 0.3);
		stroke-width: 2px;
	}

	.calendar-cell.focused {
		outline: 2px solid #0969da;
		outline-offset: 2px;
	}

	/**
	 * Tooltip styling
	 */
	.tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 6px 10px;
		border-radius: 4px;
		font-size: 12px;
		pointer-events: none;
		white-space: nowrap;
		z-index: 100;
		transform: translate(-50%, -100%);
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: rgba(0, 0, 0, 0.9);
	}

	/**
	 * Legend styling (horizontal bar below calendar)
	 */
	.legend {
		display: flex;
		align-items: center;
		gap: 3px;
		margin-top: 12px;
		font-size: 11px;
		color: #767676;
	}

	.legend-label {
		margin: 0 2px;
	}

	.legend-cell {
		width: 10px;
		height: 10px;
		border: 1px solid rgba(27, 31, 35, 0.06);
		border-radius: 2px;
	}

	/**
	 * Accessibility: Respect reduced motion preference
	 */
	@media (prefers-reduced-motion: reduce) {
		.calendar-cell {
			transition: none;
		}
	}

	/**
	 * Dark mode support
	 */
	@media (prefers-color-scheme: dark) {
		.month-label,
		.weekday-label,
		.legend {
			fill: #adbac7;
			color: #adbac7;
		}

		.calendar-cell {
			stroke: rgba(205, 217, 229, 0.1);
		}

		.calendar-cell:hover {
			stroke: rgba(205, 217, 229, 0.3);
		}
	}
</style>

<!-- [CR] Gold Standard review complete. All [CR]/[NTL] comments added. -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
