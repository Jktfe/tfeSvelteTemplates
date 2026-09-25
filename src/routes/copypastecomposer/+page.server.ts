import type { PageServerLoad } from './$types';
import { getDocsHtmlForPath } from '$lib/server/componentDocs';

// CopyPasteComposer is a site tool rather than a catalog entry, so the root
// layout can't resolve its doc from the catalog. Render it here instead; page
// data overrides the layout's `componentDocs: null` for this route.
const DOCS_PATH = 'src/lib/components/CopyPasteComposer.md';

export const load: PageServerLoad = () => {
	const html = getDocsHtmlForPath(DOCS_PATH);
	return { componentDocs: html ? { path: DOCS_PATH, html } : null };
};
