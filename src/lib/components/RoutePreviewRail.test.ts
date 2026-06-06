import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RoutePreviewRail, {
	filterRoutePreviews,
	routePreviewStatusLabel,
	summarizeRoutePreviews,
	type RoutePreviewItem
} from './RoutePreviewRail.svelte';

const previews: RoutePreviewItem[] = [
	{
		name: 'ComponentHealthMatrix',
		href: '/componenthealthmatrix',
		screenshot: '/ComponentScreenshots/ComponentHealthMatrixShot.png',
		description: 'Catalogue QA dashboard.',
		category: 'Library Operations',
		status: 'ready'
	},
	{
		name: 'RoutePreviewRail',
		href: '/routepreviewrail',
		screenshot: '/ComponentScreenshots/RoutePreviewRailShot.png',
		description: 'Visual route index.',
		category: 'Library Operations',
		status: 'review'
	},
	{
		name: 'MissingDemo',
		href: '/missingdemo',
		screenshot: '/ComponentScreenshots/MissingDemoShot.png',
		description: 'Needs proof.',
		status: 'missing'
	}
];

describe('RoutePreviewRail helpers', () => {
	it('labels route preview statuses', () => {
		expect(routePreviewStatusLabel('ready')).toBe('Ready');
		expect(routePreviewStatusLabel('missing')).toBe('Missing');
	});

	it('summarises route proof status', () => {
		expect(summarizeRoutePreviews(previews)).toEqual({ ready: 1, review: 1, missing: 1 });
	});

	it('filters by query and status', () => {
		expect(filterRoutePreviews(previews, 'health')).toHaveLength(1);
		expect(filterRoutePreviews(previews, '', 'review').map((item) => item.name)).toEqual([
			'RoutePreviewRail'
		]);
	});
});

describe('RoutePreviewRail component', () => {
	it('renders preview links and summary counts', () => {
		render(RoutePreviewRail, { items: previews, title: 'Live pitches' });

		expect(screen.getByRole('heading', { name: 'Live pitches' })).toBeTruthy();
		expect(screen.getByRole('link', { name: /ComponentHealthMatrix/ })).toBeTruthy();
		expect(screen.getByText('Visual route index.')).toBeTruthy();
		expect(screen.getAllByText('Ready')).toHaveLength(3);
	});
});
