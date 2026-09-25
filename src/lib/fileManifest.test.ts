import { describe, expect, it } from 'vitest';
import { buildFileManifest } from '../../scripts/viteFileManifest';

// The file manifest replaces `import.meta.glob(..., { query: '?url' })` on the
// health matrix and route preview pages. These checks make sure it still sees
// the same files the old globs did.
describe('buildFileManifest', () => {
	const manifest = buildFileManifest(process.cwd());

	it('lists screenshots with glob-style leading-slash paths', () => {
		expect(manifest.screenshotFiles.length).toBeGreaterThan(0);
		for (const path of manifest.screenshotFiles) {
			expect(path.startsWith('/static/ComponentScreenshots/')).toBe(true);
		}
	});

	it('ships screenshots as lightweight WebP or SVG thumbnails', () => {
		for (const path of manifest.screenshotFiles) {
			expect(path).toMatch(/\.(webp|svg)$/);
		}
	});

	it('finds component sources, docs and demo pages', () => {
		expect(manifest.componentSourceFiles).toContain('/src/lib/components/Gantt.svelte');
		expect(manifest.componentDocFiles).toContain('/src/lib/components/Gantt.md');
		expect(manifest.demoPageFiles).toContain('/src/routes/gantt/+page.svelte');
		expect(manifest.demoPageFiles.every((p) => p.endsWith('/+page.svelte'))).toBe(true);
	});
});
