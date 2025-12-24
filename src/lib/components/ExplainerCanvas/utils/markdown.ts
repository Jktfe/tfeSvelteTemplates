/**
 * Markdown rendering utilities for ExplainerCanvas
 *
 * Uses marked for markdown parsing and highlight.js for code syntax highlighting.
 * Includes sanitisation for security.
 *
 * @module ExplainerCanvas/utils/markdown
 */

import { marked, type Renderer, type Tokens } from 'marked';
import hljs from 'highlight.js';

/**
 * Custom renderer for code blocks with syntax highlighting
 */
const renderer: Partial<Renderer> = {
	code({ text, lang }: Tokens.Code): string {
		// Highlight the code
		let highlighted: string;
		if (lang && hljs.getLanguage(lang)) {
			try {
				highlighted = hljs.highlight(text, { language: lang }).value;
			} catch {
				highlighted = escapeHtml(text);
			}
		} else {
			try {
				highlighted = hljs.highlightAuto(text).value;
			} catch {
				highlighted = escapeHtml(text);
			}
		}

		const langClass = lang ? ` class="language-${lang}"` : '';
		return `<pre><code${langClass}>${highlighted}</code></pre>`;
	}
};

/**
 * Configure marked with custom renderer
 */
marked.use({
	gfm: true,
	breaks: true,
	renderer
});

/**
 * Simple HTML sanitisation for security
 * Removes potentially dangerous elements and attributes
 *
 * @param html - Raw HTML string
 * @returns Sanitised HTML string
 */
function sanitiseHtml(html: string): string {
	// Remove script tags and their content
	let sanitised = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

	// Remove on* event attributes
	sanitised = sanitised.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	sanitised = sanitised.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

	// Remove javascript: URLs
	sanitised = sanitised.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');

	// Remove style tags (can be used for attacks)
	sanitised = sanitised.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

	// Remove iframe tags
	sanitised = sanitised.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

	// Remove object and embed tags
	sanitised = sanitised.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
	sanitised = sanitised.replace(/<embed\b[^>]*\/?>/gi, '');

	return sanitised;
}

/**
 * Render markdown to HTML with syntax highlighting
 *
 * @param markdown - Markdown string to render
 * @returns Sanitised HTML string
 */
export function renderMarkdown(markdown: string): string {
	if (!markdown) {
		return '';
	}

	try {
		const html = marked.parse(markdown) as string;
		return sanitiseHtml(html);
	} catch (error) {
		console.error('[ExplainerCanvas] Markdown rendering error:', error);
		// Return escaped plain text as fallback
		return escapeHtml(markdown);
	}
}

/**
 * Escape HTML special characters
 *
 * @param text - Plain text to escape
 * @returns Escaped text safe for HTML
 */
export function escapeHtml(text: string): string {
	const escapeMap: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};

	return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Process text to add tooltip triggers for defined terms
 *
 * @param html - HTML content to process
 * @param tooltips - Array of { term, definition } objects
 * @returns HTML with tooltip trigger elements added
 */
export function addTooltipTriggers(
	html: string,
	tooltips: Array<{ term: string; definition: string }>
): string {
	if (!tooltips || tooltips.length === 0) {
		return html;
	}

	let processedHtml = html;

	for (const tooltip of tooltips) {
		// Escape special regex characters in the term
		const escapedTerm = tooltip.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		// Create a regex that matches the term but not inside HTML tags
		// This is a simplified approach - a full solution would use DOM parsing
		const regex = new RegExp(`(?<![<\\w])${escapedTerm}(?![\\w>])`, 'gi');

		// Replace with tooltip trigger element
		const dataDefinition = escapeHtml(tooltip.definition);
		processedHtml = processedHtml.replace(
			regex,
			`<span class="ec-tooltip-trigger" data-definition="${dataDefinition}">$&</span>`
		);
	}

	return processedHtml;
}

/**
 * Extract plain text from markdown (for search indexing)
 *
 * @param markdown - Markdown string
 * @returns Plain text without formatting
 */
export function markdownToPlainText(markdown: string): string {
	if (!markdown) {
		return '';
	}

	// Convert to HTML first
	const html = marked.parse(markdown) as string;

	// Strip HTML tags
	const text = html.replace(/<[^>]*>/g, ' ');

	// Decode common HTML entities
	const decoded = text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ');

	// Normalise whitespace
	return decoded.replace(/\s+/g, ' ').trim();
}
