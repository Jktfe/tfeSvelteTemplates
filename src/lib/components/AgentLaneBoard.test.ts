import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AgentLaneBoard, {
	completionPercent,
	countLanesByState,
	laneStateLabel,
	laneStateTone,
	nextActionLane,
	type AgentLane
} from './AgentLaneBoard.svelte';

const lanes: AgentLane[] = [
	{
		id: 'health',
		title: 'Health matrix',
		owner: '@tfecodex',
		status: 'done',
		gate: 'route, docs, tests, screenshot',
		files: ['src/lib/components/ComponentHealthMatrix.svelte'],
		evidence: ['1017 focused tests passed']
	},
	{
		id: 'qa',
		title: 'Claude QA',
		owner: '@claude',
		status: 'review',
		gate: 'audit routes and screenshots',
		eta: 'morning'
	},
	{
		id: 'blocked',
		title: 'Mobile capture',
		owner: '@browser',
		status: 'blocked',
		gate: 'attach small viewport screenshot'
	}
];

describe('AgentLaneBoard helpers', () => {
	it('labels and tones lane states', () => {
		expect(laneStateLabel('active')).toBe('Active');
		expect(laneStateTone('blocked')).toBe('bad');
		expect(laneStateTone('done')).toBe('good');
	});

	it('counts lane states and completion', () => {
		expect(countLanesByState(lanes)).toMatchObject({ active: 0, review: 1, blocked: 1, done: 1 });
		expect(completionPercent(lanes)).toBe(33);
	});

	it('prioritises blockers before review and active work', () => {
		expect(nextActionLane(lanes)?.id).toBe('blocked');
	});
});

describe('AgentLaneBoard component', () => {
	it('renders lane titles, owners, gates, and evidence', () => {
		render(AgentLaneBoard, { lanes, title: 'Room delivery' });

		expect(screen.getByRole('heading', { name: 'Room delivery' })).toBeTruthy();
		expect(screen.getByText('Health matrix')).toBeTruthy();
		expect(screen.getByText('@tfecodex')).toBeTruthy();
		expect(screen.getByText('route, docs, tests, screenshot')).toBeTruthy();
		expect(screen.getByText('1017 focused tests passed')).toBeTruthy();
	});
});
