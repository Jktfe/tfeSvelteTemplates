/**
 * Shared markdown → sanitised HTML rendering.
 *
 * Used by ExplainerCanvas (tooltips, card bodies) and by ComponentPageShell
 * (sibling .md docs surfaced as the "Logic explainer" section).
 *
 * Pipeline: marked (GFM) → highlight.js (code blocks) → sanitize-html (XSS).
 *
 * NOTE: We use `sanitize-html` rather than `isomorphic-dompurify` because
 * the latter pulls in `jsdom`, whose `html.js` does `require('parse5')`.
 * parse5 v8 is pure ESM, and Vercel's Node 22 runtime (Rust launcher)
 * still throws ERR_REQUIRE_ESM on it. sanitize-html is pure JS with its
 * own HTML parser — no jsdom, no parse5, runs cleanly on every Node
 * version we target.
 */

import { marked, type Renderer, type Tokens } from 'marked';
import hljs from 'highlight.js';
import sanitizeHtml from 'sanitize-html';
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

// sanitize-html allow-list — same surface as the previous DOMPurify config.
// Tags + attrs cover GFM markdown output, code-block highlighting, and
// the `data-definition` hook used by ExplainerCanvas tooltip triggers.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
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
	allowedAttributes: {
		'*': ['class', 'id', 'data-definition', 'title'],
		a: ['href', 'target', 'rel'],
		img: ['src', 'alt', 'width', 'height'],
		td: ['colspan', 'rowspan', 'align'],
		th: ['colspan', 'rowspan', 'align', 'scope']
	},
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	allowedSchemesByTag: {
		img: ['http', 'https', 'data']
	},
	allowProtocolRelative: false,
	transformTags: {
		// Force every external link to open safely in a new tab. Match the
		// previous DOMPurify ADD_ATTR behaviour.
		a: (tagName, attribs) => {
			const next: Record<string, string> = { ...attribs };
			if (next.href && /^https?:/i.test(next.href)) {
				next.target = '_blank';
				next.rel = 'noopener noreferrer';
			}
			return { tagName, attribs: next };
		}
	}
};

function sanitiseHtml(html: string): string {
	try {
		return sanitizeHtml(html, SANITIZE_OPTIONS);
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
