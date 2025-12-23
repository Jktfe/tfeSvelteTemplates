import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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
