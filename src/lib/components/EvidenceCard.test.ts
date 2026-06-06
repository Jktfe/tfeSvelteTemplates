import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import EvidenceCard, {
	overallEvidenceStatus,
	statusLabel,
	statusTone,
	truncateOutput
} from './EvidenceCard.svelte';

describe('EvidenceCard helpers', () => {
	it('labels statuses for compact display', () => {
		expect(statusLabel('pass')).toBe('Pass');
		expect(statusLabel('blocked')).toBe('Blocked');
	});

	it('maps statuses to visual tones', () => {
		expect(statusTone('pass')).toBe('good');
		expect(statusTone('fail')).toBe('bad');
		expect(statusTone('blocked')).toBe('warn');
		expect(statusTone('running')).toBe('neutral');
	});

	it('derives an overall status from command evidence', () => {
		expect(overallEvidenceStatus([{ command: 'bun run check', status: 'pass' }])).toBe('pass');
		expect(overallEvidenceStatus([{ command: 'bun run test', status: 'fail' }])).toBe('fail');
		expect(overallEvidenceStatus([])).toBe('info');
	});

	it('truncates long output excerpts', () => {
		expect(truncateOutput('abcdef', 4)).toBe('abc…');
	});
});

describe('EvidenceCard component', () => {
	it('renders title, owner, command, and status', () => {
		render(EvidenceCard, {
			title: 'Gate check',
			owner: '@tfecodex',
			commands: [{ command: 'bun run check', status: 'pass', output: '0 errors' }]
		});

		expect(screen.getByRole('article', { name: 'Gate check evidence' })).toBeTruthy();
		expect(screen.getByText('Gate check')).toBeTruthy();
		expect(screen.getByText('@tfecodex')).toBeTruthy();
		expect(screen.getByText('bun run check')).toBeTruthy();
		expect(screen.getAllByText('Pass')).toHaveLength(2);
	});

	it('renders linked evidence items', () => {
		render(EvidenceCard, {
			title: 'Visual proof',
			items: [{ label: 'Route', value: '/componenthealthmatrix', href: '/componenthealthmatrix' }]
		});

		expect(screen.getByRole('link', { name: '/componenthealthmatrix' })).toBeTruthy();
	});
});
