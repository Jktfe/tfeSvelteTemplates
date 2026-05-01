/**
 * Component documentation structural tests.
 *
 * Each component listed in `GOLD_STANDARD_DOCS` must:
 *   - load via the eager `import.meta.glob` in `componentDocs.ts`
 *   - start with `# ` (an H1) — never YAML front-matter (`---`)
 *   - contain every required H2 string in `REQUIRED_H2_SECTIONS` verbatim
 *
 * Section names are pinned by exact string. Renaming "Props Reference" to
 * "Props" intentionally breaks the test — the standard is the standard.
 *
 * The list is scoped to the Navigation & Shell shelf for batch 1.
 * Future batches add their components here as they're brought to standard.
 */

import { describe, it, expect } from 'vitest';
import { docsPaths, getDocsRawForPath } from './componentDocs';

const REQUIRED_H2_SECTIONS = [
	'## What Does It Do? (Plain English)',
	'## How It Works (Pseudo-Code)',
	'## State Flow Diagram',
	'## Props Reference',
	'## Edge Cases',
	'## Dependencies',
	'## File Structure'
] as const;

const GOLD_STANDARD_DOCS = [
	'src/lib/components/Navbar.md',
	'src/lib/components/SpeedDial.md',
	'src/lib/components/FloatingDock.md',
	'src/lib/components/LiquidTabBar.md',
	'src/lib/components/Drawer.md',
	'src/lib/components/Breadcrumbs.md',
	'src/lib/components/Pagination.md',
	'src/lib/components/ReadingTOC.md',
	'src/lib/components/ScrollProgressBar.md'
] as const;

// UTF-8 BOM (U+FEFF) — constructed via String.fromCharCode so the literal
// doesn't appear in source (ESLint's no-irregular-whitespace would flag it).
const BOM = String.fromCharCode(0xfeff);

describe('componentDocs glob loader', () => {
	it('registers .md files under src/lib/components', () => {
		expect(docsPaths.length).toBeGreaterThan(0);
		for (const path of docsPaths) {
			expect(path.startsWith('src/lib/components/')).toBe(true);
			expect(path.endsWith('.md')).toBe(true);
		}
	});

	it('returns undefined for unknown paths', () => {
		expect(getDocsRawForPath('src/lib/components/__nope__.md')).toBeUndefined();
		expect(getDocsRawForPath('')).toBeUndefined();
	});
});

describe('Navigation & Shell — gold-standard docs', () => {
	for (const path of GOLD_STANDARD_DOCS) {
		describe(path.replace('src/lib/components/', ''), () => {
			const raw = getDocsRawForPath(path);

			it('loads via import.meta.glob', () => {
				expect(raw).toBeDefined();
			});

			it('starts with an H1 (no YAML front-matter)', () => {
				if (!raw) return;
				const trimmed = raw.startsWith(BOM) ? raw.slice(BOM.length) : raw;
				const head = trimmed.trimStart();
				expect(head.startsWith('# ')).toBe(true);
				expect(head.startsWith('---')).toBe(false);
			});

			for (const section of REQUIRED_H2_SECTIONS) {
				it(`contains required section: ${section}`, () => {
					if (!raw) return;
					expect(raw).toContain(section);
				});
			}
		});
	}
});
