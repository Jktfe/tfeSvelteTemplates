import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CopyPasteComposer, {
	deriveInstallCommands,
	deriveSelectedFiles,
	testCandidatesFor,
	type CopyPasteCatalogEntry
} from './CopyPasteComposer.svelte';

const entry: CopyPasteCatalogEntry = {
	name: 'ShineBorder',
	href: '/shineborder',
	category: 'Effects',
	description: 'Animated border wrapper.',
	source: 'src/lib/components/ShineBorder.svelte',
	docs: 'src/lib/components/ShineBorder.md',
	demo: 'src/routes/shineborder/+page.svelte',
	dependencies: ['gsap'],
	relatedFiles: ['src/lib/utils.ts', 'src/lib/components/ShineBorder.test.ts'],
	usage: '<ShineBorder duration={3}>Content</ShineBorder>'
};

describe('CopyPasteComposer helpers', () => {
	it('derives selected files from catalogue metadata and checkbox options', () => {
		const files = deriveSelectedFiles(entry, {
			includeDocs: true,
			includeDemo: true,
			includeTests: true,
			includeRelatedFiles: false
		});

		expect(files.map((file) => file.path)).toEqual([
			'src/lib/components/ShineBorder.svelte',
			'src/lib/components/ShineBorder.md',
			'src/routes/shineborder/+page.svelte',
			'src/lib/components/ShineBorder.test.ts'
		]);
	});

	it('keeps related files separate from test candidates and removes duplicates', () => {
		const files = deriveSelectedFiles(entry, {
			includeDocs: false,
			includeDemo: false,
			includeTests: true,
			includeRelatedFiles: true
		});

		expect(files.map((file) => file.path)).toEqual([
			'src/lib/components/ShineBorder.svelte',
			'src/lib/components/ShineBorder.test.ts',
			'src/lib/utils.ts'
		]);
	});

	it('derives colocated test candidates for Svelte sources', () => {
		expect(testCandidatesFor(entry)).toContain('src/lib/components/ShineBorder.test.ts');
		expect(testCandidatesFor(entry)).toContain(
			'src/lib/components/ShineBorderTestHarness.test.svelte'
		);
	});

	it('builds dependency, directory, and copy commands for selected files', () => {
		const commands = deriveInstallCommands(entry, {
			includeDocs: true,
			includeDemo: false,
			includeTests: false,
			includeRelatedFiles: false,
			packageManager: 'pnpm',
			targetRoot: './app'
		});

		expect(commands).toEqual([
			'pnpm add gsap',
			'mkdir -p ./app/src/lib/components',
			'cp src/lib/components/ShineBorder.svelte ./app/src/lib/components/ShineBorder.svelte',
			'cp src/lib/components/ShineBorder.md ./app/src/lib/components/ShineBorder.md'
		]);
	});
});

describe('CopyPasteComposer component', () => {
	it('renders a component selector, command block, selected files, and checklist', () => {
		render(CopyPasteComposer, { entries: [entry] });

		expect(screen.getByRole('heading', { name: 'Copy-paste composer' })).toBeTruthy();
		expect(screen.getByLabelText('Component')).toBeTruthy();
		expect(screen.getByRole('checkbox', { name: 'Docs' })).toBeTruthy();
		expect(screen.getByRole('region', { name: 'Install commands' }).textContent).toContain(
			'bun add gsap'
		);
		expect(screen.getByText('src/lib/components/ShineBorder.svelte')).toBeTruthy();
		expect(screen.getByText('Paste the usage snippet into the target route.')).toBeTruthy();
	});
});
