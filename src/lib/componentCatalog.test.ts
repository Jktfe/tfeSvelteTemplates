import { describe, expect, it } from 'vitest';
import {
	componentCatalogEntries,
	componentCount,
	getCatalogEntryByHref,
	isCatalogComponentPath,
	themeSupportLabel
} from './componentCatalog';

describe('componentCatalog agent metadata', () => {
	it('keeps the flattened registry in sync with the visible component count', () => {
		expect(componentCatalogEntries).toHaveLength(componentCount);
		expect(new Set(componentCatalogEntries.map(({ item }) => item.href)).size).toBe(componentCount);
	});

	it('finds component entries by route path without query strings or trailing slashes', () => {
		const entry = getCatalogEntryByHref('/topologycolorgrid/?preview=true');

		expect(entry?.item.name).toBe('TopologyColorGrid');
		expect(entry?.item.dependencies).toEqual(['three', 'gsap']);
		expect(entry?.item.themeSupport).toBe('dual');
		expect(isCatalogComponentPath('/topologycolorgrid')).toBe(true);
		expect(isCatalogComponentPath('/not-a-template')).toBe(false);
	});

	it('records non-standard source and docs paths for component families', () => {
		const forms = getCatalogEntryByHref('/forms');
		const maps = getCatalogEntryByHref('/maps');

		expect(forms?.item.source).toBe('src/lib/components/forms/FormField.svelte');
		expect(forms?.item.docs).toBe('src/lib/components/forms/Forms.md');
		expect(forms?.item.relatedFiles).toContain('src/lib/components/forms/TextField.svelte');
		expect(maps?.item.dependencies).toEqual(['leaflet', '@types/leaflet']);
		expect(maps?.item.usage).toContain('MapLive');
	});

	it('keeps audit-priority rows explicit enough for agent copy prompts', () => {
		const priorityRows = [
			{ href: '/readingtoc', usage: 'ReadingTOC', hint: /anchor links/i },
			{ href: '/holdtoconfirm', usage: 'HoldToConfirm', hint: /keyboard parity/i },
			{ href: '/codeblock', usage: 'CodeBlock', hint: /tokenizer/i },
			{ href: '/confettiburst', usage: 'ConfettiBurst', hint: /decorative canvas/i },
			{ href: '/cardstack', usage: 'CardStack', hint: /loadCardsWithSource/i },
			{ href: '/expandingcard', usage: 'ExpandingCard', hint: /reduced motion/i },
			{ href: '/magiccard', usage: 'MagicCard', hint: /pointer spotlight/i },
			{ href: '/marquee', usage: 'Marquee', hint: /loadTestimonialsWithSource/i },
			{ href: '/sankey', usage: 'ExpandableSankey', hint: /keyboard node expansion/i }
		];

		for (const row of priorityRows) {
			const entry = getCatalogEntryByHref(row.href);

			expect(entry?.item.usage).toContain(row.usage);
			expect(entry?.item.agentHint).toMatch(row.hint);
			expect(entry?.item.relatedFiles.length).toBeGreaterThan(0);
		}
	});

	it('exposes CardStackMotionFlip as its own discovery surface', () => {
		const entry = getCatalogEntryByHref('/cardstackmotionflip');

		expect(entry?.item.name).toBe('CardStackMotionFlip');
		expect(entry?.item.source).toBe('src/lib/components/CardStackMotionFlip.svelte');
		expect(entry?.item.demo).toBe('src/routes/cardstackmotionflip/+page.svelte');
		expect(entry?.item.themeSupport).toBe('dual');
		expect(entry?.item.agentHint).toMatch(/scoped/i);
	});

	it('records the Sankey library dependency and honest accessibility limitation', () => {
		const entry = getCatalogEntryByHref('/sankey');

		expect(entry?.item.source).toBe('src/lib/components/ExpandableSankey.svelte');
		expect(entry?.item.docs).toBe('src/lib/components/Sankey.md');
		expect(entry?.item.dependencies).toEqual(['@unovis/svelte', '@unovis/ts']);
		expect(entry?.item.themeSupport).toBe('dual');
		expect(entry?.item.agentHint).toMatch(/not implemented yet/i);
	});

	it('promotes data-backed card and editor rows to source-aware metadata', () => {
		const expandingCard = getCatalogEntryByHref('/expandingcard');
		const editor = getCatalogEntryByHref('/editor');

		expect(expandingCard?.item.relatedFiles).toContain('src/lib/server/expandingCards.ts');
		expect(expandingCard?.item.themeSupport).toBe('dual');
		expect(expandingCard?.item.agentHint).toMatch(/bgColor values/i);
		expect(editor?.item.source).toBe('src/lib/components/Editor.svelte');
		expect(editor?.item.relatedFiles).toContain('src/lib/server/editorData.ts');
		expect(editor?.item.usage).toContain("mode={editingItem ? 'edit' : 'create'}");
	});

	it('provides the metadata needed by the shared AgentPromptCopy block', () => {
		const entry = getCatalogEntryByHref('/gsap-suite');

		expect(entry).toBeDefined();
		expect(entry?.item.source).toBe('src/lib/components/GsapSplitTextHero.svelte');
		expect(entry?.item.demo).toBe('src/routes/gsap-suite/+page.svelte');
		expect(entry?.item.dependencies).toEqual(['gsap']);
		expect(entry?.item.usage).toContain('<GsapSplitTextHero');
		expect(entry?.item.relatedFiles).toContain('src/lib/components/GsapRevealSequence.svelte');
	});

	it('labels light-only and dual theme support for the visual audit trail', () => {
		expect(themeSupportLabel('light')).toBe('Light mode');
		expect(themeSupportLabel('dual')).toBe('Light and dark mode');
	});
});
