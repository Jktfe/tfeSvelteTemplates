import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DataVizInspector, {
	dataVizChecks,
	dataVizScore,
	dataVizVerdict,
	type DataVizSpec
} from './DataVizInspector.svelte';

const specs: DataVizSpec[] = [
	{
		title: 'Revenue trend',
		chartType: 'line',
		rowCount: 52,
		hasSource: true,
		hasAltText: true,
		hasUnits: true,
		hasColorLegend: true
	},
	{
		title: 'Unlabelled chart',
		chartType: 'bar',
		rowCount: 0,
		hasSource: false,
		hasAltText: false,
		hasUnits: false,
		hasColorLegend: false
	}
];

describe('DataVizInspector helpers', () => {
	it('scores chart specs', () => {
		expect(dataVizChecks(specs[0]).every((check) => check.pass)).toBe(true);
		expect(dataVizScore(specs[0])).toBe(100);
		expect(dataVizVerdict(100)).toBe('ready');
		expect(dataVizVerdict(50)).toBe('blocked');
	});
});

describe('DataVizInspector component', () => {
	it('renders chart titles and score', () => {
		render(DataVizInspector, { specs, title: 'Chart review' });

		expect(screen.getByRole('heading', { name: 'Chart review' })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Revenue trend/ })).toBeTruthy();
		expect(screen.getByText('100')).toBeTruthy();
	});
});
