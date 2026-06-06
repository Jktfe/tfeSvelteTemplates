import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import InteractionLab, {
	clampDuration,
	modeCount,
	motionReadiness,
	type InteractionScenario
} from './InteractionLab.svelte';

const scenarios: InteractionScenario[] = [
	{ id: 'hover', label: 'Hover lift', mode: 'hover', durationMs: 180, easing: 'ease-out', risk: 'low' },
	{ id: 'drag', label: 'Drag card', mode: 'drag', durationMs: 360, easing: 'cubic-bezier(.2,.8,.2,1)', risk: 'high' }
];

describe('InteractionLab helpers', () => {
	it('clamps motion duration to a useful range', () => {
		expect(clampDuration(10)).toBe(80);
		expect(clampDuration(1400)).toBe(1200);
	});

	it('reports motion readiness', () => {
		expect(motionReadiness(scenarios[0])).toBe('Ready');
		expect(motionReadiness(scenarios[0], true)).toBe('Needs reduced-motion fallback');
		expect(motionReadiness(scenarios[1])).toBe('Needs pointer edge-case tests');
	});

	it('counts interaction modes', () => {
		expect(modeCount(scenarios)).toMatchObject({ hover: 1, drag: 1, press: 0, keyboard: 0 });
	});
});

describe('InteractionLab component', () => {
	it('renders scenarios and active readiness', () => {
		render(InteractionLab, { scenarios, title: 'Motion QA' });

		expect(screen.getByRole('heading', { name: 'Motion QA' })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Hover lift/ })).toBeTruthy();
		expect(screen.getByText('Ready')).toBeTruthy();
	});
});
