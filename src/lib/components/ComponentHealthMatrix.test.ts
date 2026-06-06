import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ComponentHealthMatrix, {
	combineHealthStatus,
	countByStatus,
	createHealthRows,
	normalisePath,
	statusFromPresence,
	testCandidatesFor,
	type ComponentHealthEntry,
	type ComponentHealthFiles
} from './ComponentHealthMatrix.svelte';

const entry: ComponentHealthEntry = {
	name: 'BadgePill',
	href: '/badgepill',
	category: 'Feedback & Identity',
	source: 'src/lib/components/BadgePill.svelte',
	docs: 'src/lib/components/BadgePill.md',
	demo: 'src/routes/badgepill/+page.svelte',
	screenshot: '/ComponentScreenshots/BadgePillShot.png',
	themeSupport: 'dual',
	dependencies: [],
	relatedFiles: []
};

const fullFiles: ComponentHealthFiles = {
	source: new Set(['src/lib/components/BadgePill.svelte']),
	docs: new Set(['src/lib/components/BadgePill.md']),
	demo: new Set(['src/routes/badgepill/+page.svelte']),
	screenshot: new Set(['static/ComponentScreenshots/BadgePillShot.png']),
	test: new Set(['src/lib/components/BadgePill.test.ts'])
};

describe('ComponentHealthMatrix helpers', () => {
	it('normalises leading slashes before comparing Vite glob paths', () => {
		expect(normalisePath('/src/lib/components/BadgePill.svelte')).toBe(
			'src/lib/components/BadgePill.svelte'
		);
	});

	it('maps booleans to ready/missing statuses', () => {
		expect(statusFromPresence(true)).toBe('ready');
		expect(statusFromPresence(false)).toBe('missing');
	});

	it('combines field statuses into an overall status', () => {
		expect(combineHealthStatus(['ready', 'ready'])).toBe('ready');
		expect(combineHealthStatus(['ready', 'missing'])).toBe('partial');
		expect(combineHealthStatus(['missing', 'missing'])).toBe('missing');
	});

	it('derives colocated test candidates from source and related Svelte files', () => {
		expect(testCandidatesFor(entry)).toContain('src/lib/components/BadgePill.test.ts');
	});

	it('creates health rows from catalogue metadata and available file sets', () => {
		const [row] = createHealthRows([entry], fullFiles);

		expect(row.overallStatus).toBe('ready');
		expect(row.docsStatus).toBe('ready');
		expect(row.screenshotStatus).toBe('ready');
		expect(row.testStatus).toBe('ready');
		expect(row.dependencyLabel).toBe('None');
	});

	it('counts a chosen status field across rows', () => {
		const rows = createHealthRows(
			[
				entry,
				{
					...entry,
					name: 'NoShot',
					href: '/noshot',
					screenshot: '/ComponentScreenshots/NoShot.png'
				}
			],
			fullFiles
		);

		expect(countByStatus(rows, 'screenshotStatus')).toEqual({
			ready: 1,
			partial: 0,
			missing: 1
		});
	});
});

describe('ComponentHealthMatrix component', () => {
	it('renders summary totals and health rows', () => {
		const rows = createHealthRows([entry], fullFiles);
		render(ComponentHealthMatrix, { rows });

		expect(screen.getByRole('heading', { name: 'Component health matrix' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'BadgePill' })).toBeTruthy();
		expect(screen.getByText('Feedback & Identity')).toBeTruthy();
		expect(screen.getByLabelText('1 ready, 0 partial, 0 missing')).toBeTruthy();
	});
});
