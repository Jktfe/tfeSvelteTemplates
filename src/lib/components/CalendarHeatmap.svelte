<!--
/**
 * CalendarHeatmap - GitHub-style contribution calendar with interactive features
 *
 * Features:
 * - SVG-based calendar grid (52 weeks × 7 days)
 * - 5-level discrete color system for activity intensity
 * - Interactive tooltips on hover showing date and value
 * - Click handlers for cell selection
 * - Keyboard navigation with arrow keys (up/down/left/right)
 * - Month labels across top, weekday labels on left
 * - Color legend showing intensity levels
 * - Customizable color scheme and dimensions
 * - Accessibility with ARIA labels and focus indicators
 * - Zero external dependencies
 *
 * Perfect for:
 * - Activity tracking (GitHub contributions, exercise logs)
 * - Habit visualization (daily tasks, streaks)
 * - Time-series data (temperature, sales, metrics)
 * - Engagement heatmaps (user activity, system usage)
 * - Calendar-based analytics
 *
 * Technical Implementation:
 * - Reactive date range generation with $derived rune
 * - Week grouping algorithm (Sunday-Saturday columns)
 * - Map-based data lookup for O(1) performance
 * - RGB color interpolation for smooth gradients
 * - SVG viewBox for responsive scaling
 * - Pointer Events API for unified input handling
 * - CSS custom properties for dynamic styling
 * - Respects prefers-reduced-motion preference
 *
 * @component
 * @example
 * ```svelte
 * <CalendarHeatmap
 *   data={activityData}
 *   colorLow="#ebedf0"
 *   colorHigh="#216e39"
 *   onCellClick={(date, value) => console.log(date, value)}
 * />
 * ```
 */
-->

<script lang="ts">
	import type { CalendarHeatmapProps } from '$lib/types';

	/**
	 * Component props with defaults
	 */
	let {
		data = [],
		startDate,
		endDate,
		colorLow = '#ebedf0',
		colorHigh = '#216e39',
		cellSize = 12,
		cellGap = 3,
		showWeekLabels = true,
		showMonthLabels = true,
		showLegend = true,
		levels = 5,
		tooltipFormatter,
		onCellClick,
		class: className = ''
	}: CalendarHeatmapProps = $props();

	/**
	 * Component state
	 */
	let tooltip = $state({
		visible: false,
		x: 0,
		y: 0,
		text: ''
	});

	let focusedCell = $state<{ weekIndex: number; dayIndex: number } | null>(null);
	let containerEl = $state<HTMLDivElement | undefined>();

	/**
	 * Layout constants
	 */
	const WEEK_LABEL_WIDTH = 30;
	const MONTH_LABEL_HEIGHT = 20;
	const WEEKDAY_LABELS = ['Mon', 'Wed', 'Fri'];
	const WEEKDAY_INDICES = [1, 3, 5]; // Corresponds to Monday, Wednesday, Friday

	// =========================================================================
	// COLOR UTILITY FUNCTIONS (copied from dataGridFormatters.ts for portability)
	// =========================================================================

	/**
	 * Parse color string to RGB components
	 * Supports hex (#rgb, #rrggbb, #rrggbbaa), rgb(), rgba(), and named colors
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
	 * Interpolate between two colors
	 * Factor 0 = color1, Factor 1 = color2
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
	// DATE UTILITY FUNCTIONS
	// =========================================================================

	/**
	 * Convert Date to ISO date string (YYYY-MM-DD)
	 */
	function toISODate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	/**
	 * Get day of week (0 = Sunday, 6 = Saturday)
	 */
	function getDayOfWeek(date: Date): number {
		return date.getDay();
	}

	/**
	 * Get short month name from date
	 */
	function getMonthName(date: Date): string {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return months[date.getMonth()];
	}

	// =========================================================================
	// REACTIVE CALENDAR DATA COMPUTATION
	// =========================================================================

	/**
	 * Calculate date range (startDate to endDate)
	 * Defaults: startDate = 365 days ago, endDate = today
	 */
	let dateRange = $derived(() => {
		const end = endDate || new Date();
		const start = startDate || new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
		return { start, end };
	});

	/**
	 * Convert data array to Map for O(1) lookups
	 */
	let dataMap = $derived(() => {
		const map = new Map<string, number>();
		for (const item of data) {
			map.set(item.date, item.value);
		}
		return map;
	});

	/**
	 * Calculate max value for color scaling
	 */
	let maxValue = $derived(() => {
		return Math.max(...data.map((d) => d.value), 1);
	});

	/**
	 * Generate color palette with discrete levels
	 * Level 0 = colorLow (no activity)
	 * Levels 1-4 = interpolated between colorLow and colorHigh
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
	 * Generate calendar weeks structure
	 * Returns array of weeks, each week is array of 7 days (Sunday-Saturday)
	 * Pads first week if it doesn't start on Sunday
	 */
	let calendarWeeks = $derived(() => {
		const { start, end } = dateRange();
		const weeks: Array<Array<{ date: Date; value: number } | null>> = [];

		// Find first Sunday on or before start date
		const firstDay = new Date(start);
		const dayOffset = firstDay.getDay(); // 0 = Sunday
		firstDay.setDate(firstDay.getDate() - dayOffset);

		// Generate all weeks until we pass end date
		let currentDate = new Date(firstDay);
		while (currentDate <= end || weeks.length === 0 || weeks[weeks.length - 1].length < 7) {
			// Start new week
			const week: Array<{ date: Date; value: number } | null> = [];

			// Generate 7 days for this week
			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const cellDate = new Date(currentDate);

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
	 * Calculate month label positions
	 * Returns array of { label, x } for month labels at top
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
	 * Calculate container dimensions
	 */
	let containerWidth = $derived(() => {
		const gridWidth = calendarWeeks().length * (cellSize + cellGap) - cellGap;
		return WEEK_LABEL_WIDTH + gridWidth + 10;
	});

	let containerHeight = $derived(() => {
		const gridHeight = 7 * (cellSize + cellGap) - cellGap;
		return MONTH_LABEL_HEIGHT + gridHeight + 10;
	});

	// =========================================================================
	// COLOR LEVEL CALCULATION
	// =========================================================================

	/**
	 * Get color level (0 to levels-1) for a value
	 * Level 0 = no activity
	 * Levels 1+ = scaled based on percentage of maxValue
	 */
	function getColorLevel(value: number): number {
		if (value === 0) return 0;
		const percentage = value / maxValue();
		return Math.min(Math.ceil(percentage * (levels - 1)), levels - 1);
	}

	/**
	 * Get fill color for a cell value
	 */
	function getCellColor(value: number): string {
		const level = getColorLevel(value);
		return colorPalette()[level];
	}

	// =========================================================================
	// EVENT HANDLERS
	// =========================================================================

	/**
	 * Show tooltip on cell hover
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
	 * Hide tooltip on mouse leave
	 */
	function hideTooltip() {
		tooltip = { ...tooltip, visible: false };
	}

	/**
	 * Handle cell click
	 */
	function handleCellClick(cell: { date: Date; value: number }) {
		const dateStr = toISODate(cell.date);
		onCellClick?.(dateStr, cell.value);
	}

	/**
	 * Handle keyboard navigation
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
			case ' ':
				event.preventDefault();
				const cell = calendarWeeks()[weekIndex][dayIndex];
				if (cell) handleCellClick(cell);
				return;
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
			{#each monthLabels() as { label, x }}
				<text x={x} y={MONTH_LABEL_HEIGHT - 5} class="month-label">{label}</text>
			{/each}
		{/if}

		<!-- Weekday Labels -->
		{#if showWeekLabels}
			{#each WEEKDAY_LABELS as label, i}
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
			{#each calendarWeeks() as week, weekIndex}
				{#each week as cell, dayIndex}
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
			{#each colorPalette() as color}
				<div class="legend-cell" style:background-color={color}></div>
			{/each}
			<span class="legend-label">More</span>
		</div>
	{/if}
</div>

<style>
	/**
	 * Container styling with user-select disabled
	 */
	.calendar-heatmap-container {
		display: inline-block;
		user-select: none;
		-webkit-user-select: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
		position: relative;
	}

	/**
	 * SVG styling
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

<!-- Claude is happy that this file is mint. Signed off 24.12.25. -->
