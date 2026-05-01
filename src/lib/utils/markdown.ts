/**
 * Shared markdown → sanitised HTML rendering.
 *
 * Used by ExplainerCanvas (tooltips, card bodies) and by ComponentPageShell
 * (sibling .md docs surfaced as the "Logic explainer" section).
 *
 * Pipeline: marked (GFM) → highlight.js (code blocks) → DOMPurify (XSS).
 */

import { marked, type Renderer, type Tokens } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';
import { escapeHtml } from '$lib/htmlUtils';

const renderer: Partial<Renderer> = {
	code({ text, lang }: Tokens.Code): string {
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

marked.use({
	gfm: true,
	breaks: true,
	renderer
});

const DOMPURIFY_CONFIG: Config = {
	ALLOWED_TAGS: [
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
		'p', 'br', 'hr',
		'ul', 'ol', 'li',
		'blockquote', 'pre', 'code',
		'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
		'table', 'thead', 'tbody', 'tr', 'th', 'td',
		'img', 'figure', 'figcaption',
		'span', 'div',
		'sup', 'sub', 'mark', 'abbr', 'kbd'
	],
	ALLOWED_ATTR: [
		'href', 'target', 'rel', 'title', 'alt', 'src',
		'class', 'id', 'data-definition', 'data-*',
		'width', 'height', 'colspan', 'rowspan'
	],
	ALLOW_DATA_ATTR: true,
	ADD_ATTR: ['target', 'rel'],
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
};

function sanitiseHtml(html: string): string {
	try {
		return DOMPurify.sanitize(html, DOMPURIFY_CONFIG) as string;
	} catch {
		return escapeHtml(html);
	}
}

export interface RenderMarkdownOptions {
	/** Strip the leading `# ...` H1 heading. Use when the host page already renders an H1 title. */
	stripFirstH1?: boolean;
}

/**
 * Render markdown to sanitised HTML with code-block syntax highlighting.
 */
export function renderMarkdown(markdown: string, options?: RenderMarkdownOptions): string {
	if (!markdown) return '';
	let source = markdown;
	if (options?.stripFirstH1) {
		source = source.replace(/^#\s+[^\n]*\n+/, '');
	}
	try {
		const html = marked.parse(source) as string;
		return sanitiseHtml(html);
	} catch (error) {
		console.error('[markdown] Render error:', error);
		return escapeHtml(source);
	}
}

/**
 * Re-export so callers don't have to reach into htmlUtils directly.
 */
export { escapeHtml };

/**
 * Process HTML to wrap defined terms in tooltip-trigger spans.
 *
 * Used by ExplainerCanvas card bodies. Term matching uses a word-boundary regex
 * that avoids matching inside HTML tags or within longer words.
 */
export function addTooltipTriggers(
	html: string,
	tooltips: Array<{ term: string; definition: string }>
): string {
	if (!tooltips || tooltips.length === 0) return html;

	let processedHtml = html;
	for (const tooltip of tooltips) {
		const escapedTerm = tooltip.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(?<![<\\w])${escapedTerm}(?![\\w>])`, 'gi');
		const dataDefinition = escapeHtml(tooltip.definition);
		processedHtml = processedHtml.replace(
			regex,
			`<span class="ec-tooltip-trigger" data-definition="${dataDefinition}">$&</span>`
		);
	}
	return processedHtml;
}

/**
 * Strip markdown to plain text (for search indexing).
 */
export function markdownToPlainText(markdown: string): string {
	if (!markdown) return '';
	const html = marked.parse(markdown) as string;
	const text = html.replace(/<[^>]*>/g, ' ');
	const decoded = text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ');
	return decoded.replace(/\s+/g, ' ').trim();
}
