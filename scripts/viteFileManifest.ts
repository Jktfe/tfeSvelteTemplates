/**
 * ============================================================
 * Vite plugin: repository file manifest
 * ============================================================
 *
 * A couple of showcase pages (/componenthealthmatrix and /routepreviewrail)
 * only need to know *whether* a file exists — a screenshot, a sibling .md
 * doc, a demo route. The obvious tool, `import.meta.glob(..., { query: '?url' })`,
 * answers that question but also turns every matched file into a build
 * asset, so each screenshot (and every .svelte / .md file) was copied into
 * `_app/immutable` for both the client and server bundles.
 *
 * This plugin exposes the same information as plain string arrays through
 * the `virtual:file-manifest` module. The paths are gathered with `fs` at
 * build/dev time, so nothing is emitted except a small JSON-ish module.
 *
 * Paths keep the leading slash that `import.meta.glob` keys used, e.g.
 * `/static/ComponentScreenshots/AccordionShot.webp`.
 * ============================================================
 */

import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:file-manifest';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** Walk a directory and collect files that satisfy `accept`. */
function walk(root: string, dir: string, accept: (rel: string) => boolean, out: string[]): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		// A missing folder simply means "no files" — never a build failure.
		return;
	}

	for (const name of entries) {
		const full = join(dir, name);
		const isDirectory = statSync(full).isDirectory();
		if (isDirectory) {
			walk(root, full, accept, out);
			continue;
		}
		const rel = `/${relative(root, full).split(sep).join('/')}`;
		if (accept(rel)) out.push(rel);
	}
}

function collect(root: string, dir: string, accept: (rel: string) => boolean): string[] {
	const out: string[] = [];
	walk(root, join(root, dir), accept, out);
	return out.sort();
}

/** Build the module source for the current state of the file system. */
export function buildFileManifest(root: string) {
	return {
		screenshotFiles: collect(root, 'static/ComponentScreenshots', () => true),
		componentSourceFiles: collect(root, 'src/lib/components', (p) => p.endsWith('.svelte')),
		componentDocFiles: collect(root, 'src/lib/components', (p) => p.endsWith('.md')),
		demoPageFiles: collect(root, 'src/routes', (p) => p.endsWith('/+page.svelte'))
	};
}

export function fileManifest(): Plugin {
	let root = process.cwd();

	return {
		name: 'tfe-file-manifest',
		configResolved(config) {
			root = config.root;
		},
		resolveId(id) {
			return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
		},
		load(id) {
			if (id !== RESOLVED_ID) return undefined;
			const manifest = buildFileManifest(root);
			return Object.entries(manifest)
				.map(([key, value]) => `export const ${key} = ${JSON.stringify(value)};`)
				.join('\n');
		},
		configureServer(server) {
			// In dev, adding or removing a file should refresh the manifest so the
			// health matrix does not show stale "missing" rows until a restart.
			const refresh = () => {
				const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
				if (mod) server.moduleGraph.invalidateModule(mod);
			};
			server.watcher.on('add', refresh);
			server.watcher.on('unlink', refresh);
		}
	};
}
