/**
 * HTML utility functions with no sanitiser dependency.
 * Lives separately from `$lib/utils` so server-only code can pull these in
 * without dragging in any HTML-parsing libraries.
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
