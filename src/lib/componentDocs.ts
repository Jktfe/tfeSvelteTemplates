/**
 * Component documentation pipeline.
 *
 * Eager-globs every sibling .md doc next to a component, then exposes a
 * lookup function that takes the path stored on a `ComponentCatalogItem`
 * and returns rendered, sanitised HTML ready for ComponentPageShell.
 *
 * The host page already renders its own `<h1>`, so the leading H1 in each
 * .md file is stripped before render.
 */

import { renderMarkdown } from '$lib/utils/markdown';

// Recurses into subfolders so `forms/Forms.md`, `ExplainerCanvas/ExplainerCanvas.md`
// and similar nested docs are picked up alongside flat ones.
const docsRaw = import.meta.glob('/src/lib/components/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/**
 * Look up a sibling component .md doc by its repo-relative path
 * (e.g. `'src/lib/components/SpeedDial.md'`) and return the rendered HTML.
 * Returns `undefined` when no .md is registered at that path.
 */
export function getDocsHtmlForPath(path: string): string | undefined {
	if (!path) return undefined;
	const lookupKey = path.startsWith('/') ? path : `/${path}`;
	const raw = docsRaw[lookupKey];
	if (!raw) return undefined;
	return renderMarkdown(raw, { stripFirstH1: true });
}

/**
 * Raw markdown source by path, exported for tests that want to assert on
 * structure (required H2 sections, no YAML front-matter, etc.) before any
 * rendering happens.
 */
export function getDocsRawForPath(path: string): string | undefined {
	if (!path) return undefined;
	const lookupKey = path.startsWith('/') ? path : `/${path}`;
	return docsRaw[lookupKey];
}

/**
 * All registered doc paths (repo-relative without the leading slash) — useful
 * for tests and tooling that want to enumerate the corpus.
 */
export const docsPaths: string[] = Object.keys(docsRaw).map((k) => k.replace(/^\//, ''));
