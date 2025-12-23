import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

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
 * Uses DOMPurify library for robust security
 * Used by FolderFiles component when rendering document content
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering with {@html}
 */
export function sanitizeHTML(html: string): string {
	return DOMPurify.sanitize(html, {
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
 * @param svg - Raw SVG string to sanitize
 * @returns Sanitized SVG string safe for rendering with {@html}
 */
export function sanitizeSVG(svg: string): string {
	return DOMPurify.sanitize(svg, {
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
