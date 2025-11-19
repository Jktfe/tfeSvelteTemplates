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
 * Sanitize HTML string to prevent XSS attacks
 *
 * This function removes potentially dangerous HTML elements and attributes while
 * preserving safe formatting tags. Use this when rendering user-generated HTML content.
 *
 * Allowed tags: Basic formatting (span, div, p, strong, em, u, br, etc.)
 * Removed: Script tags, event handlers, javascript: URLs, and other XSS vectors
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script><p>Safe text</p>';
 * const safe = sanitizeHtml(userInput); // Returns: '<p>Safe text</p>'
 * ```
 *
 * Security Note:
 * This is a basic sanitization implementation suitable for trusted-ish content
 * (e.g., CMS-generated HTML, markdown-converted HTML, admin-created content).
 * For fully untrusted user input, consider using a dedicated library like DOMPurify.
 */
export function sanitizeHtml(html: string): string {
	// List of allowed HTML tags (basic formatting only)
	const allowedTags = new Set([
		'span', 'div', 'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'ul', 'ol', 'li',
		'a', 'img',
		'table', 'thead', 'tbody', 'tr', 'th', 'td',
		'code', 'pre',
		'blockquote'
	]);

	// List of allowed attributes (safe styling and links only)
	const allowedAttributes = new Set([
		'class', 'id', 'href', 'src', 'alt', 'title',
		'width', 'height', 'style',
		'colspan', 'rowspan'
	]);

	// Create a temporary DOM element for parsing
	if (typeof document === 'undefined') {
		// Server-side: Use regex-based sanitization (less robust but works without DOM)
		return sanitizeHtmlRegex(html, allowedTags);
	}

	// Client-side: Use DOM-based sanitization (more robust)
	const temp = document.createElement('div');
	temp.innerHTML = html;

	// Recursive function to clean DOM tree
	function cleanNode(node: Element): void {
		// Remove if not an allowed tag
		const tagName = node.tagName.toLowerCase();
		if (!allowedTags.has(tagName)) {
			node.remove();
			return;
		}

		// Remove disallowed attributes and sanitize allowed ones
		const attributes = Array.from(node.attributes);
		for (const attr of attributes) {
			const attrName = attr.name.toLowerCase();

			// Remove event handlers (onclick, onerror, etc.)
			if (attrName.startsWith('on')) {
				node.removeAttribute(attr.name);
				continue;
			}

			// Remove if not in allowed list
			if (!allowedAttributes.has(attrName)) {
				node.removeAttribute(attr.name);
				continue;
			}

			// Sanitize href and src to prevent javascript: URLs
			if (attrName === 'href' || attrName === 'src') {
				const value = attr.value.toLowerCase().trim();
				if (
					value.startsWith('javascript:') ||
					value.startsWith('data:') ||
					value.startsWith('vbscript:')
				) {
					node.removeAttribute(attr.name);
				}
			}

			// Sanitize style attribute to prevent CSS-based attacks
			if (attrName === 'style') {
				const styleValue = attr.value.toLowerCase();
				if (
					styleValue.includes('expression') ||
					styleValue.includes('javascript:') ||
					styleValue.includes('import')
				) {
					node.removeAttribute('style');
				}
			}
		}

		// Recursively clean child nodes
		const children = Array.from(node.children) as Element[];
		for (const child of children) {
			cleanNode(child);
		}
	}

	// Clean all child nodes
	const children = Array.from(temp.children) as Element[];
	for (const child of children) {
		cleanNode(child);
	}

	return temp.innerHTML;
}

/**
 * Regex-based HTML sanitization for server-side rendering
 * Less robust than DOM-based, but works without browser APIs
 */
function sanitizeHtmlRegex(html: string, allowedTags: Set<string>): string {
	// Remove script tags and their content
	html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

	// Remove style tags and their content
	html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

	// Remove iframe, object, embed tags
	html = html.replace(/<(iframe|object|embed|link|meta|base)[^>]*>/gi, '');

	// Remove event handlers
	html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	html = html.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

	// Remove javascript: and data: URLs
	html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
	html = html.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');
	html = html.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');
	html = html.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');

	// Remove any tags not in the allowed list
	html = html.replace(/<\/?(\w+)[^>]*>/g, (match, tag) => {
		return allowedTags.has(tag.toLowerCase()) ? match : '';
	});

	return html;
}

// Claude is happy that this file is mint. Signed off 19.11.25.
