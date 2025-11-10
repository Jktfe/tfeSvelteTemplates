/**
 * DataGrid Column Formatters and Styling Utilities
 *
 * This module provides pre-built formatters and styling functions for common DataGrid use cases.
 * Import and use these functions in your DataGridColumn definitions for consistent formatting.
 *
 * @example
 * ```typescript
 * import { formatCurrency, formatCurrencyCompact, createGradientStyle } from '$lib/dataGridFormatters';
 *
 * const columns: DataGridColumn[] = [
 *   {
 *     id: 'salary',
 *     header: 'Salary',
 *     type: 'number',
 *     formatter: formatCurrency,
 *     cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
 *   }
 * ];
 * ```
 */

// ==================================================
// CURRENCY FORMATTERS
// ==================================================

/**
 * Format number as UK currency (£) with thousands separators
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "£75,000")
 *
 * @example
 * formatCurrency(75000) // "£75,000"
 * formatCurrency(1234.56) // "£1,234.56"
 */
export function formatCurrency(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';
	return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format number as UK currency with 2 decimal places
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string with decimals (e.g., "£75,000.00")
 */
export function formatCurrencyDecimals(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';
	return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format large numbers with K/M abbreviations for UK currency
 *
 * @param value - Numeric value to format
 * @returns Compact currency string (e.g., "£75K", "£1.5M")
 *
 * @example
 * formatCurrencyCompact(75000) // "£75K"
 * formatCurrencyCompact(1500000) // "£1.5M"
 * formatCurrencyCompact(850) // "£850"
 */
export function formatCurrencyCompact(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';

	if (num >= 1000000) {
		return `£${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
	} else if (num >= 1000) {
		return `£${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
	}
	return `£${num.toLocaleString('en-GB')}`;
}

// ==================================================
// PERCENTAGE FORMATTERS
// ==================================================

/**
 * Format number as percentage with optional decimal places
 *
 * @param value - Numeric value (0-100 range)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "75%", "87.5%")
 *
 * @example
 * formatPercentage(75) // "75%"
 * formatPercentage(87.5, 1) // "87.5%"
 */
export function formatPercentage(value: any, decimals: number = 0): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';
	return `${num.toFixed(decimals)}%`;
}

/**
 * Format decimal (0-1) as percentage
 *
 * @param value - Decimal value (0-1 range)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentageFromDecimal(0.75) // "75%"
 * formatPercentageFromDecimal(0.875, 1) // "87.5%"
 */
export function formatPercentageFromDecimal(value: any, decimals: number = 0): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';
	return `${(num * 100).toFixed(decimals)}%`;
}

// ==================================================
// DATE FORMATTERS
// ==================================================

/**
 * Format date as DD/MM/YYYY (UK format)
 *
 * @param value - Date object or ISO date string
 * @returns Formatted date string (e.g., "15/03/2020")
 */
export function formatDateUK(value: any): string {
	if (!value) return '—';
	const date = typeof value === 'string' ? new Date(value) : value;
	if (!(date instanceof Date) || isNaN(date.getTime())) return '—';
	return date.toLocaleDateString('en-GB');
}

/**
 * Format date as relative time (e.g., "2 years ago", "3 months ago")
 *
 * @param value - Date object or ISO date string
 * @returns Relative time string
 *
 * @example
 * formatDateRelative('2020-03-15') // "4 years ago"
 */
export function formatDateRelative(value: any): string {
	if (!value) return '—';
	const date = typeof value === 'string' ? new Date(value) : value;
	if (!(date instanceof Date) || isNaN(date.getTime())) return '—';

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
	return `${Math.floor(diffDays / 365)} years ago`;
}

// ==================================================
// NUMBER FORMATTERS
// ==================================================

/**
 * Format number with thousands separators (UK locale)
 *
 * @param value - Numeric value to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';
	return num.toLocaleString('en-GB');
}

/**
 * Format number with compact notation (K/M/B)
 *
 * @param value - Numeric value to format
 * @returns Compact number string (e.g., "1.5M", "750K")
 */
export function formatNumberCompact(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';

	if (num >= 1000000000) {
		return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
	} else if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
	} else if (num >= 1000) {
		return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
	}
	return num.toLocaleString('en-GB');
}

// ==================================================
// GRADIENT STYLING FUNCTIONS
// ==================================================

/**
 * Create a function that generates gradient background styles based on value ranges
 *
 * @param min - Minimum value for gradient range
 * @param max - Maximum value for gradient range
 * @param colorLow - CSS color for low values (default: red)
 * @param colorHigh - CSS color for high values (default: green)
 * @returns Function that generates inline CSS style strings
 *
 * @example
 * // For salary column with gradient from red (low) to green (high)
 * cellStyle: createGradientStyle(30000, 150000, '#ef4444', '#22c55e')
 *
 * @example
 * // For performance scores (0-100) with blue to purple gradient
 * cellStyle: createGradientStyle(0, 100, '#3b82f6', '#a855f7')
 */
export function createGradientStyle(
	min: number,
	max: number,
	colorLow: string = '#ef4444',
	colorHigh: string = '#22c55e'
) {
	return (value: any): string => {
		if (value === null || value === undefined) return '';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '';

		// Normalize value to 0-1 range
		const normalized = Math.max(0, Math.min(1, (num - min) / (max - min)));

		// Interpolate between colors
		const color = interpolateColor(colorLow, colorHigh, normalized);

		return `background-color: ${color}; color: #fff; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem;`;
	};
}

/**
 * Create a function that generates text color based on value ranges
 *
 * @param min - Minimum value for color range
 * @param max - Maximum value for color range
 * @param colorLow - CSS color for low values
 * @param colorHigh - CSS color for high values
 * @returns Function that generates inline CSS style strings
 *
 * @example
 * // For highlighting low vs high values with text color only
 * cellStyle: createTextColorGradient(0, 100, '#dc2626', '#16a34a')
 */
export function createTextColorGradient(
	min: number,
	max: number,
	colorLow: string = '#dc2626',
	colorHigh: string = '#16a34a'
) {
	return (value: any): string => {
		if (value === null || value === undefined) return '';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '';

		const normalized = Math.max(0, Math.min(1, (num - min) / (max - min)));
		const color = interpolateColor(colorLow, colorHigh, normalized);

		return `color: ${color}; font-weight: 600;`;
	};
}

/**
 * Helper function to interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);

	if (!c1 || !c2) return color1;

	const r = Math.round(c1.r + factor * (c2.r - c1.r));
	const g = Math.round(c1.g + factor * (c2.g - c1.g));
	const b = Math.round(c1.b + factor * (c2.b - c1.b));

	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: null;
}

// ==================================================
// ICON/BADGE RENDERERS
// ==================================================

/**
 * Create a function that renders status badges with colors
 *
 * @param statusConfig - Map of status values to badge configurations
 * @returns Function that generates HTML for status badges
 *
 * @example
 * cellRenderer: createStatusBadge({
 *   'active': { color: '#22c55e', label: 'Active' },
 *   'on-leave': { color: '#f59e0b', label: 'On Leave' },
 *   'inactive': { color: '#ef4444', label: 'Inactive' }
 * })
 */
export function createStatusBadge(statusConfig: Record<string, { color: string; label?: string }>) {
	return (value: any): string => {
		if (!value) return '—';
		const config = statusConfig[value.toString()];
		if (!config) return value.toString();

		const label = config.label || value.toString();
		return `<span style="background-color: ${config.color}; color: #fff; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${label}</span>`;
	};
}

/**
 * Create a function that renders icons based on value ranges
 *
 * @param ranges - Array of range configurations with icons
 * @returns Function that generates HTML with icons
 *
 * @example
 * cellRenderer: createIconRenderer([
 *   { max: 50000, icon: '📉', color: '#ef4444' },
 *   { max: 100000, icon: '➡️', color: '#f59e0b' },
 *   { max: Infinity, icon: '📈', color: '#22c55e' }
 * ])
 */
export function createIconRenderer(
	ranges: Array<{ max: number; icon: string; color?: string; label?: string }>
) {
	return (value: any): string => {
		if (value === null || value === undefined) return '—';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '—';

		const range = ranges.find((r) => num <= r.max);
		if (!range) return value.toString();

		const color = range.color || '#6b7280';
		const label = range.label || value.toString();
		return `<span style="color: ${color};">${range.icon} ${label}</span>`;
	};
}

/**
 * Create a function that renders progress bars for numeric values
 *
 * @param min - Minimum value (0%)
 * @param max - Maximum value (100%)
 * @param color - Bar color (default: blue)
 * @returns Function that generates HTML for progress bars
 *
 * @example
 * cellRenderer: createProgressBar(0, 100, '#3b82f6')
 */
export function createProgressBar(min: number, max: number, color: string = '#3b82f6') {
	return (value: any): string => {
		if (value === null || value === undefined) return '—';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '—';

		const percentage = Math.max(0, Math.min(100, ((num - min) / (max - min)) * 100));

		return `
			<div style="display: flex; align-items: center; gap: 0.5rem;">
				<div style="flex: 1; background-color: #e5e7eb; border-radius: 9999px; height: 0.5rem; overflow: hidden;">
					<div style="background-color: ${color}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
				</div>
				<span style="font-size: 0.75rem; color: #6b7280; min-width: 2.5rem; text-align: right;">${num}</span>
			</div>
		`;
	};
}

// ==================================================
// CONDITIONAL STYLING FUNCTIONS
// ==================================================

/**
 * Create a function that applies different classes based on value conditions
 *
 * @param conditions - Array of condition configurations
 * @returns Function that returns CSS class names
 *
 * @example
 * cellClass: createConditionalClass([
 *   { condition: (v) => v < 50000, class: 'text-red-600 font-bold' },
 *   { condition: (v) => v >= 50000 && v < 100000, class: 'text-yellow-600' },
 *   { condition: (v) => v >= 100000, class: 'text-green-600 font-bold' }
 * ])
 */
export function createConditionalClass(
	conditions: Array<{ condition: (value: any, row?: any) => boolean; class: string }>
) {
	return (value: any, row?: any): string => {
		const match = conditions.find((c) => c.condition(value, row));
		return match ? match.class : '';
	};
}

/**
 * Create a function that applies different styles based on value conditions
 *
 * @param conditions - Array of condition configurations
 * @returns Function that returns inline CSS styles
 *
 * @example
 * cellStyle: createConditionalStyle([
 *   { condition: (v) => v < 50000, style: 'color: #dc2626; font-weight: bold;' },
 *   { condition: (v) => v >= 100000, style: 'color: #16a34a; font-weight: bold;' }
 * ])
 */
export function createConditionalStyle(
	conditions: Array<{ condition: (value: any, row?: any) => boolean; style: string }>
) {
	return (value: any, row?: any): string => {
		const match = conditions.find((c) => c.condition(value, row));
		return match ? match.style : '';
	};
}

// ==================================================
// COMBINED FORMATTERS
// ==================================================

/**
 * Create a function that combines formatting and icon rendering
 *
 * @param formatter - Formatter function for the value
 * @param icon - Icon string or function to generate icon
 * @returns Function that generates formatted text with icon
 *
 * @example
 * formatter: createFormatterWithIcon(formatCurrencyCompact, '💰')
 */
export function createFormatterWithIcon(
	formatter: (value: any) => string,
	icon: string | ((value: any) => string)
) {
	return (value: any): string => {
		const formatted = formatter(value);
		const iconStr = typeof icon === 'function' ? icon(value) : icon;
		return `${iconStr} ${formatted}`;
	};
}
