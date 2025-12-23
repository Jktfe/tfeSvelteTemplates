/**
 * HTML utility functions that don't require DOMPurify
 * Separated to avoid pulling in isomorphic-dompurify on server-side
 */

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
