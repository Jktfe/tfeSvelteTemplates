import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';
import type { LatLng } from './types';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use this for inserting user data into HTML content or attributes
 *
 * @param str - Raw string to escape
 * @returns String with HTML entities escaped
 */
export function escapeHtml(str: string): string {
	const htmlEscapes: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};
	return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

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
 * Calculate map bounds to fit all markers
 * Shared utility for map components - can be used client-side or server-side
 *
 * @param positions - Array of lat/lng positions
 * @param defaultCenter - Default center when no positions provided (default: Central London)
 * @returns Object with center coordinates and recommended zoom level
 */
export function calculateMapBounds(
	positions: LatLng[],
	defaultCenter: LatLng = { lat: 51.5074, lng: -0.1278 }
): { center: LatLng; zoom: number } {
	if (positions.length === 0) {
		return { center: defaultCenter, zoom: 13 };
	}

	if (positions.length === 1) {
		return { center: positions[0], zoom: 15 };
	}

	const lats = positions.map((p) => p.lat);
	const lngs = positions.map((p) => p.lng);

	const center: LatLng = {
		lat: (Math.min(...lats) + Math.max(...lats)) / 2,
		lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
	};

	// Calculate appropriate zoom based on spread
	const latSpread = Math.max(...lats) - Math.min(...lats);
	const lngSpread = Math.max(...lngs) - Math.min(...lngs);
	const maxSpread = Math.max(latSpread, lngSpread);

	let zoom: number;
	if (maxSpread > 5) zoom = 6;
	else if (maxSpread > 2) zoom = 8;
	else if (maxSpread > 0.5) zoom = 10;
	else if (maxSpread > 0.1) zoom = 12;
	else if (maxSpread > 0.01) zoom = 14;
	else zoom = 15;

	return { center, zoom };
}

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
