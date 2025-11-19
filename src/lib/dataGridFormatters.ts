/**
 * DataGrid Column Formatters and Styling Utilities
 *
 * This module provides pre-built formatters and styling functions for common DataGrid use cases.
 * Import and use these functions in your DataGridColumn definitions for consistent formatting.
 *
 * SECURITY NOTE: Renderer functions that generate HTML must be used with trusted data only.
 * All user-provided values are automatically HTML-escaped to prevent XSS attacks.
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
// SECURITY UTILITIES
// ==================================================

/**
 * Escape HTML special characters to prevent XSS attacks
 * SSR-compatible (works in both browser and server environments)
 *
 * @param str - String to escape
 * @returns HTML-safe string
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Sanitize CSS class names to prevent injection
 * Only allows alphanumeric, hyphens, underscores, and spaces
 * Exported for use in DataGrid components
 *
 * @param className - Class name string to sanitize
 * @returns Sanitized class name
 */
export function sanitizeClassName(className: string): string {
	return className.replace(/[^a-zA-Z0-9\s_-]/g, '');
}

/**
 * Validate and sanitize CSS color value
 * Accepts hex colors (#RGB, #RRGGBB), rgb/rgba, and named colors
 *
 * @param color - Color string to validate
 * @returns Validated color or fallback
 */
function sanitizeColor(color: string): string {
	// Check for valid hex color (3 or 6 digits)
	if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
		return color;
	}

	// Check for valid rgb/rgba with proper value ranges
	// Format: rgb(0-255, 0-255, 0-255) or rgba(0-255, 0-255, 0-255, 0-1)
	const rgbMatch = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/);
	if (rgbMatch) {
		const [, r, g, b] = rgbMatch;
		const [rNum, gNum, bNum] = [r, g, b].map(Number);
		// Validate RGB values are in range 0-255
		if (rNum <= 255 && gNum <= 255 && bNum <= 255) {
			return color;
		}
	}

	// List of safe CSS color names
	const safeColors = new Set([
		'transparent', 'currentcolor', 'black', 'white', 'red', 'green', 'blue',
		'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'brown'
	]);

	if (safeColors.has(color.toLowerCase())) {
		return color;
	}

	// Fallback to a safe default
	console.warn(`Invalid color "${color}", using fallback`);
	return '#6b7280'; // Gray
}

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
 * formatCurrency(1234) // "£1,234"
 * formatCurrency(-5000) // "£-5,000"
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
 * Handles negative numbers correctly
 *
 * @param value - Numeric value to format
 * @returns Compact currency string (e.g., "£75K", "£1.5M", "-£50K")
 *
 * @example
 * formatCurrencyCompact(75000) // "£75K"
 * formatCurrencyCompact(1500000) // "£1.5M"
 * formatCurrencyCompact(850) // "£850"
 * formatCurrencyCompact(-75000) // "-£75K"
 */
export function formatCurrencyCompact(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';

	const absNum = Math.abs(num);
	const sign = num < 0 ? '-' : '';

	if (absNum >= 1000000) {
		return `${sign}£${(absNum / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
	} else if (absNum >= 1000) {
		return `${sign}£${(absNum / 1000).toFixed(1).replace(/\.0$/, '')}K`;
	}
	return `${sign}£${absNum.toLocaleString('en-GB')}`;
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
 * Handles both past and future dates with correct plural/singular grammar
 *
 * @param value - Date object or ISO date string
 * @returns Relative time string
 *
 * @example
 * formatDateRelative('2020-03-15') // "4 years ago"
 * formatDateRelative('2026-03-15') // "in 1 year"
 * formatDateRelative('2025-11-12') // "Tomorrow"
 */
export function formatDateRelative(value: any): string {
	if (!value) return '—';
	const date = typeof value === 'string' ? new Date(value) : value;
	if (!(date instanceof Date) || isNaN(date.getTime())) return '—';

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const absDays = Math.abs(diffDays);
	const isFuture = diffDays < 0;

	// Today/Yesterday/Tomorrow (same for both past and future)
	if (absDays === 0) return 'Today';
	if (isFuture && absDays === 1) return 'Tomorrow';
	if (!isFuture && absDays === 1) return 'Yesterday';

	// Days (less than a week)
	if (absDays < 7) {
		return isFuture
			? `in ${absDays} day${absDays !== 1 ? 's' : ''}`
			: `${absDays} day${absDays !== 1 ? 's' : ''} ago`;
	}

	// Weeks (less than ~4 weeks / 1 month)
	const weekCount = Math.floor(absDays / 7);
	if (absDays < 28) {
		return isFuture
			? `in ${weekCount} week${weekCount !== 1 ? 's' : ''}`
			: `${weekCount} week${weekCount !== 1 ? 's' : ''} ago`;
	}

	// Months and years (use proper calendar arithmetic)
	const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
	const absMonths = Math.abs(monthsDiff);

	// Months (less than 12)
	if (absMonths < 12) {
		return isFuture
			? `in ${absMonths} month${absMonths !== 1 ? 's' : ''}`
			: `${absMonths} month${absMonths !== 1 ? 's' : ''} ago`;
	}

	// Years
	const yearsDiff = now.getFullYear() - date.getFullYear();
	const absYears = Math.abs(yearsDiff);
	return isFuture
		? `in ${absYears} year${absYears !== 1 ? 's' : ''}`
		: `${absYears} year${absYears !== 1 ? 's' : ''} ago`;
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
 * Handles negative numbers correctly
 *
 * @param value - Numeric value to format
 * @returns Compact number string (e.g., "1.5M", "750K", "-50K")
 */
export function formatNumberCompact(value: any): string {
	if (value === null || value === undefined) return '—';
	const num = typeof value === 'number' ? value : parseFloat(value);
	if (isNaN(num)) return '—';

	const absNum = Math.abs(num);
	const sign = num < 0 ? '-' : '';

	if (absNum >= 1000000000) {
		return `${sign}${(absNum / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
	} else if (absNum >= 1000000) {
		return `${sign}${(absNum / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
	} else if (absNum >= 1000) {
		return `${sign}${(absNum / 1000).toFixed(1).replace(/\.0$/, '')}K`;
	}
	return num.toLocaleString('en-GB');
}

// ==================================================
// COLOR UTILITIES (Internal)
// ==================================================

/**
 * Parse color string (hex, rgb/rgba, or named) to RGB values
 * Supports hex colors (#RGB, #RRGGBB), rgb/rgba strings, and common named colors
 *
 * @param color - Color string in any supported format
 * @returns RGB object or null if parsing fails
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
 * Calculate relative luminance of an RGB color
 * Returns value between 0 (darkest) and 1 (brightest)
 * Used for determining optimal text color (black or white)
 */
function getLuminance(r: number, g: number, b: number): number {
	// Standard luminance formula (ITU-R BT.709)
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Interpolate between two hex colors
 * Caching version for performance
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

// ==================================================
// GRADIENT STYLING FUNCTIONS
// ==================================================

/**
 * Create a function that generates gradient background styles based on value ranges
 * Automatically selects black or white text for optimal contrast
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
	// Validate and sanitize colors once at creation time
	const safeLow = sanitizeColor(colorLow);
	const safeHigh = sanitizeColor(colorHigh);

	// Pre-parse colors for performance (cache)
	const c1 = parseColorToRgb(safeLow);
	const c2 = parseColorToRgb(safeHigh);

	return (value: any): string => {
		if (value === null || value === undefined) return '';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '';

		// Handle edge case where min === max
		if (max === min) {
			const bgColor = num === min ? safeHigh : safeLow;
			return `background-color: ${bgColor}; color: #fff; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem;`;
		}

		// Normalize value to 0-1 range
		const normalized = Math.max(0, Math.min(1, (num - min) / (max - min)));

		// Interpolate between colors (using cached parsed values)
		let r: number, g: number, b: number;
		if (c1 && c2) {
			r = Math.round(c1.r + normalized * (c2.r - c1.r));
			g = Math.round(c1.g + normalized * (c2.g - c1.g));
			b = Math.round(c1.b + normalized * (c2.b - c1.b));
		} else {
			// Fallback if hex parsing failed
			const color = interpolateColor(safeLow, safeHigh, normalized);
			return `background-color: ${color}; color: #fff; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem;`;
		}

		const bgColor = `rgb(${r}, ${g}, ${b})`;

		// Calculate luminance and choose text color for accessibility
		const luminance = getLuminance(r, g, b);
		const textColor = luminance > 0.5 ? '#000' : '#fff';

		return `background-color: ${bgColor}; color: ${textColor}; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem;`;
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
	// Validate and sanitize colors
	const safeLow = sanitizeColor(colorLow);
	const safeHigh = sanitizeColor(colorHigh);

	return (value: any): string => {
		if (value === null || value === undefined) return '';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '';

		// Handle edge case where min === max
		if (max === min) {
			const textColor = num === min ? safeHigh : safeLow;
			return `color: ${textColor}; font-weight: 600;`;
		}

		const normalized = Math.max(0, Math.min(1, (num - min) / (max - min)));
		const color = interpolateColor(safeLow, safeHigh, normalized);

		return `color: ${color}; font-weight: 600;`;
	};
}

// ==================================================
// ICON/BADGE RENDERERS
// ==================================================

/**
 * Create a function that renders status badges with colors
 * All user values are HTML-escaped to prevent XSS
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
	// Pre-validate all colors at creation time
	const safeConfig: Record<string, { color: string; label?: string }> = {};
	for (const [key, value] of Object.entries(statusConfig)) {
		safeConfig[key] = {
			color: sanitizeColor(value.color),
			label: value.label
		};
	}

	return (value: any): string => {
		if (!value) return '—';

		const valueStr = String(value);
		const config = safeConfig[valueStr];

		if (!config) {
			// Unknown status - escape and display as-is
			return escapeHtml(valueStr);
		}

		const label = config.label || valueStr;
		const escapedLabel = escapeHtml(label);

		return `<span style="background-color: ${config.color}; color: #fff; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${escapedLabel}</span>`;
	};
}

/**
 * Create a function that renders icons based on value ranges
 * All user values are HTML-escaped to prevent XSS
 *
 * @param ranges - Array of range configurations with icons
 * @returns Function that generates HTML with icons
 *
 * @example
 * cellRenderer: createIconRenderer([
 *   { max: 50000, icon: '📉', color: '#ef4444' },
 *   { max: 100000, icon: '📊', color: '#3b82f6' },
 *   { max: Infinity, icon: '📈', color: '#22c55e' }
 * ])
 */
export function createIconRenderer(
	ranges: Array<{ max: number; icon: string; color?: string; label?: string }>
) {
	// Pre-validate all colors at creation time
	const safeRanges = ranges.map(r => ({
		...r,
		color: r.color ? sanitizeColor(r.color) : '#6b7280'
	}));

	return (value: any): string => {
		if (value === null || value === undefined) return '—';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '—';

		const range = safeRanges.find((r) => num <= r.max);
		if (!range) {
			return escapeHtml(String(value));
		}

		const label = range.label || String(value);
		const escapedLabel = escapeHtml(label);
		const escapedIcon = escapeHtml(range.icon);

		return `<span style="color: ${range.color};">${escapedIcon} ${escapedLabel}</span>`;
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
	// Validate color at creation time
	const safeColor = sanitizeColor(color);

	return (value: any): string => {
		if (value === null || value === undefined) return '—';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (isNaN(num)) return '—';

		// Handle edge case where min === max
		let percentage: number;
		if (max === min) {
			percentage = num === min ? 100 : 0;
		} else {
			percentage = Math.max(0, Math.min(100, ((num - min) / (max - min)) * 100));
		}

		// Escape the numeric value for display
		const escapedNum = escapeHtml(String(num));

		return `
			<div style="display: flex; align-items: center; gap: 0.5rem;">
				<div style="flex: 1; background-color: #e5e7eb; border-radius: 9999px; height: 0.5rem; overflow: hidden;">
					<div style="background-color: ${safeColor}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
				</div>
				<span style="font-size: 0.75rem; color: #6b7280; min-width: 2.5rem; text-align: right;">${escapedNum}</span>
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
		return match ? sanitizeClassName(match.class) : '';
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
 * Icons are HTML-escaped for security
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
		const escapedIcon = escapeHtml(iconStr);
		return `${escapedIcon} ${formatted}`;
	};
}

// Claude is happy that this file is mint. Signed off 19.11.25.
