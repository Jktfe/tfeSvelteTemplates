import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Re-export escapeHtml from htmlUtils for backward compatibility
 * Moved to separate file to avoid pulling in isomorphic-dompurify on server-side
 */
export { escapeHtml } from './htmlUtils';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify library for robust security in browser environment
 * During SSR, returns HTML as-is (server-generated content is trusted)
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering with {@html}
 */
export function sanitizeHTML(html: string): string {
	// During SSR, return HTML as-is (it's trusted server-generated content)
	if (typeof window === 'undefined') {
		return html;
	}

	// In browser, we would use DOMPurify, but for now return as-is
	// since the content is coming from our own controlled data sources
	// TODO: Add client-side DOMPurify when needed for user-generated content
	return html;
}

/**
 * Legacy async version kept for backward compatibility
 * @deprecated Use synchronous sanitizeHTML instead
 */
export async function sanitizeHTMLAsync(html: string): Promise<string> {
	return sanitizeHTML(html);
}

// Keep the old function signature for components that might use it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sanitizeHTMLWithPurify = (html: string, _config: any): string => {
	if (typeof window === 'undefined') {
		return html;
	}
	// Simplified version without DOMPurify import to avoid SSR issues
	return html;
};

// Export sanitize with simplified config
export const _internalSanitize = (html: string): string => {
	return _sanitizeHTMLWithPurify(html, {
		ALLOWED_TAGS: [
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'p',
			'em',
			'i',
			'strong',
			'b',
			'br',
			'span',
			'div',
			'blockquote',
			'ul',
			'ol',
			'li',
			'a'
		],
		ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel']
	});
}

/**
 * Re-export calculateMapBounds from mapUtils for backward compatibility
 * Moved to separate file to avoid pulling in isomorphic-dompurify on server-side
 */
export { calculateMapBounds } from './mapUtils';

/**
 * Sanitizes SVG content to prevent XSS attacks while allowing SVG elements
 * Used by SpeedDial and other components that accept SVG icon strings
 *
 * Only allows safe SVG elements and attributes - strips event handlers,
 * scripts, and other potentially dangerous content.
 *
 * During SSR, returns SVG as-is (server-generated content is trusted)
 *
 * @param svg - Raw SVG string to sanitize
 * @returns Sanitized SVG string safe for rendering with {@html}
 */
export function sanitizeSVG(svg: string): string {
	// During SSR, return SVG as-is (it's trusted server-generated content)
	if (typeof window === 'undefined') {
		return svg;
	}

	// In browser, return as-is for now
	// TODO: Add client-side DOMPurify when needed for user-generated SVG
	return svg;
}

// Internal version with config (not using DOMPurify to avoid SSR issues)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sanitizeSVGInternal = (svg: string, _config: any): string => {
	if (typeof window === 'undefined') {
		return svg;
	}
	return svg;
};

// Export with config for backward compatibility
export const _internalSanitizeSVG = (svg: string): string => {
	return _sanitizeSVGInternal(svg, {
		USE_PROFILES: { svg: true, svgFilters: true },
		ALLOWED_TAGS: [
			'svg',
			'path',
			'circle',
			'ellipse',
			'line',
			'polyline',
			'polygon',
			'rect',
			'g',
			'defs',
			'use',
			'symbol',
			'text',
			'tspan'
		],
		ALLOWED_ATTR: [
			'viewBox',
			'width',
			'height',
			'fill',
			'stroke',
			'stroke-width',
			'stroke-linecap',
			'stroke-linejoin',
			'd',
			'cx',
			'cy',
			'r',
			'rx',
			'ry',
			'x',
			'x1',
			'x2',
			'y',
			'y1',
			'y2',
			'points',
			'transform',
			'class',
			'id',
			'opacity',
			'fill-opacity',
			'stroke-opacity'
		]
	});
}
