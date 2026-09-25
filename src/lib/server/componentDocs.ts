/**
 * Component documentation pipeline (server-only).
 *
 * Eager-globs every sibling .md doc next to a component, then exposes a
 * lookup function that takes the path stored on a `ComponentCatalogItem`
 * and returns rendered, sanitised HTML ready for ComponentPageShell.
 *
 * Why this lives under `$lib/server`: the corpus is ~140 docs (hundreds of
 * KB of markdown) and rendering pulls in marked + highlight.js +
 * sanitize-html. Keeping it server-side means the browser receives only the
 * finished HTML for the one doc the current page needs, delivered through
 * page data by `src/routes/+layout.server.ts`. SvelteKit refuses to bundle
 * `$lib/server` modules into client code, so an accidental client import
 * fails the build instead of silently re-growing the shared chunk.
 *
 * The host page already renders its own `<h1>`, so the leading H1 in each
 * .md file is stripped before render.
 */

import { getCatalogEntryByHref } from '$lib/componentCatalog';
import type { ComponentDocsData } from '$lib/types';
import { renderMarkdown } from '$lib/utils/markdown';

// Recurses into subfolders so `forms/Forms.md`, `ExplainerCanvas/ExplainerCanvas.md`
// and similar nested docs are picked up alongside flat ones.
const docsRaw = import.meta.glob('/src/lib/components/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// Docs are static for the life of the server process, so render each one
// at most once. Saves re-running marked + highlight.js on every navigation.
const renderedCache = new Map<string, string>();

function toLookupKey(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Look up a sibling component .md doc by its repo-relative path
 * (e.g. `'src/lib/components/SpeedDial.md'`) and return the rendered HTML.
 * Returns `undefined` when no .md is registered at that path.
 */
export function getDocsHtmlForPath(path: string): string | undefined {
	if (!path) return undefined;
	const lookupKey = toLookupKey(path);
	const cached = renderedCache.get(lookupKey);
	if (cached !== undefined) return cached;
	const raw = docsRaw[lookupKey];
	if (!raw) return undefined;
	const html = renderMarkdown(raw, { stripFirstH1: true });
	renderedCache.set(lookupKey, html);
	return html;
}

/**
 * Raw markdown source by path, exported for tests that want to assert on
 * structure (required H2 sections, no YAML front-matter, etc.) before any
 * rendering happens.
 */
export function getDocsRawForPath(path: string): string | undefined {
	if (!path) return undefined;
	return docsRaw[toLookupKey(path)];
}

/**
 * All registered doc paths (repo-relative without the leading slash) — useful
 * for tests and tooling that want to enumerate the corpus.
 */
export const docsPaths: string[] = Object.keys(docsRaw).map((k) => k.replace(/^\//, ''));

/**
 * Resolve the rendered doc for a demo route id (e.g. `'/speeddial'`) via the
 * catalog. Non-component routes (home, auth, sandboxes) return `null`.
 * Used by the root `+layout.server.ts` to hand ComponentPageShell its doc.
 */
export function getComponentDocsForRoute(routeId: string | null): ComponentDocsData | null {
	if (!routeId) return null;
	const entry = getCatalogEntryByHref(routeId);
	if (!entry) return null;
	const html = getDocsHtmlForPath(entry.item.docs);
	return html ? { path: entry.item.docs, html } : null;
}
