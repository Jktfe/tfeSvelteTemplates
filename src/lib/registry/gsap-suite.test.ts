/**
 * Drift guard for GSAP suite metadata.
 *
 * The registry's `propsSignature` / `usageExample` and the catalogue `usage`
 * snippets are hand-written, so they quietly go stale when a component's
 * `$props()` changes (e.g. the catalogue once mounted GsapSplitTextHero with
 * `title="..."` when the prop is `headline`). These tests read each
 * component's source and check that every prop we advertise really exists.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { gsapSuiteRegistry } from './gsap-suite';
import { getCatalogEntryByHref } from '$lib/componentCatalog';

const repoRoot = resolve(__dirname, '../../..');

/** Prop names from the `let { ... }: X = $props()` destructure of a component. */
function declaredProps(componentPath: string): Set<string> {
	const source = readFileSync(resolve(repoRoot, componentPath), 'utf8');
	const match = source.match(/let\s*\{([\s\S]*?)\}\s*:\s*\w+\s*=\s*\$props\(\)/);
	if (!match) throw new Error(`No $props() destructure found in ${componentPath}`);
	const names = new Set<string>();
	// Comments inside the destructure can contain commas, so drop them first.
	const body = match[1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
	for (const part of body.split(',')) {
		const name = part.trim().match(/^([A-Za-z_$][\w$]*)/)?.[1];
		if (name) names.add(name);
	}
	return names;
}

/** Prop names listed in a registry `propsSignature` block (one `name?: type` per line). */
function signatureProps(signature: string): string[] {
	return [...signature.matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:/gm)].map((m) => m[1]);
}

/** Attribute names used on the first `<ComponentName ...>` mount in a snippet. */
function mountedAttributes(snippet: string, componentName: string): string[] {
	const tag = snippet.match(new RegExp(`<${componentName}(\\s[^>]*?)?/?>`));
	expect(tag, `expected a <${componentName}> mount in:\n${snippet}`).toBeTruthy();
	const attrs = tag?.[1] ?? '';
	const names: string[] = [];
	// `name=`, `name={...}`, bare boolean `name`, or shorthand `{name}`.
	for (const m of attrs.matchAll(/\{([A-Za-z_$][\w$]*)\}|([A-Za-z_$][\w$-]*)(?==|\s|$)/g)) {
		const name = m[1] ?? m[2];
		if (name) names.push(name);
	}
	return names;
}

/**
 * Drop attribute values (`={...}` expressions and quoted strings) so attribute
 * scanning only sees names. Shorthand `{name}` props are kept intact.
 */
function stripValues(snippet: string): string {
	let out = '';
	let depth = 0;
	let skipping = false;
	for (const char of snippet) {
		if (char === '{') {
			depth += 1;
			if (depth === 1) skipping = out.trimEnd().endsWith('=');
			if (!skipping) out += char;
			continue;
		}
		if (char === '}') {
			depth -= 1;
			if (!skipping) out += char;
			if (depth === 0) skipping = false;
			continue;
		}
		if (!skipping) out += char;
	}
	return out.replace(/"[^"]*"/g, '');
}

function assertMountMatchesProps(snippet: string, componentName: string, componentPath: string) {
	const props = declaredProps(componentPath);
	for (const attr of mountedAttributes(stripValues(snippet), componentName)) {
		expect(props, `${componentName} has no "${attr}" prop`).toContain(attr);
	}
}

describe('gsapSuiteRegistry prop drift', () => {
	const documented = gsapSuiteRegistry.filter((entry) => entry.propsSignature);

	it.each(documented.map((entry) => [entry.componentName, entry] as const))(
		'%s propsSignature only lists real props',
		(_name, entry) => {
			const props = declaredProps(entry.componentImportPath);
			for (const prop of signatureProps(entry.propsSignature!)) {
				expect(props, `${entry.componentName} has no "${prop}" prop`).toContain(prop);
			}
		}
	);

	it.each(
		gsapSuiteRegistry
			.filter((entry) => entry.usageExample)
			.map((entry) => [entry.componentName, entry] as const)
	)('%s usageExample mounts with real props', (_name, entry) => {
		assertMountMatchesProps(entry.usageExample!, entry.componentName, entry.componentImportPath);
	});

	it('documents the KineticCanvasField defaults and palettes the component actually ships', () => {
		const entry = gsapSuiteRegistry.find((e) => e.componentName === 'KineticCanvasField');
		expect(entry?.propsSignature).toContain('default 72');
		expect(entry?.propsSignature).toContain("'ember'");
		expect(entry?.propsSignature).not.toContain("'amber'");
		expect(entry?.agentNotes).toContain('260');
	});
});

describe('GSAP catalogue usage snippets', () => {
	it('mounts GsapSplitTextHero with headline, never the non-existent title prop', () => {
		const usage = getCatalogEntryByHref('/gsap-suite')?.item.usage ?? '';
		expect(usage).toContain('headline=');
		expect(usage).not.toMatch(/<GsapSplitTextHero[^>]*\btitle=/);
		assertMountMatchesProps(usage, 'GsapSplitTextHero', 'src/lib/components/GsapSplitTextHero.svelte');
	});

	it('gives TopologyColorGrid a real copy-paste usage with valid props', () => {
		const usage = getCatalogEntryByHref('/topologycolorgrid')?.item.usage ?? '';
		expect(usage).toContain("import TopologyColorGrid");
		assertMountMatchesProps(usage, 'TopologyColorGrid', 'src/lib/components/TopologyColorGrid.svelte');
	});
});
