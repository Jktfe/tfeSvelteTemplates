/**
 * Backwards-compatible re-export.
 *
 * The implementation moved to `$lib/utils/markdown` so that ComponentPageShell
 * and ExplainerCanvas can share one renderer. ExplainerCanvas import sites
 * keep working unchanged.
 */
export {
	renderMarkdown,
	escapeHtml,
	addTooltipTriggers,
	markdownToPlainText,
	type RenderMarkdownOptions
} from '$lib/utils/markdown';
