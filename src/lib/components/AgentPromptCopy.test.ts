import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import AgentPromptCopy, { buildAgentPrompt } from './AgentPromptCopy.svelte';

describe('AgentPromptCopy', () => {
	it('builds the install prompt with dependencies, paths, props, usage, notes, and provenance', () => {
		const prompt = buildAgentPrompt({
			name: 'TopologyColorGrid',
			summary: 'Three.js and GSAP colour topology scene.',
			componentPath: 'src/lib/components/TopologyColorGrid.svelte',
			demoPath: 'src/routes/topologycolorgrid/+page.svelte',
			deps: ['three', 'gsap'],
			propsSignature: 'interface Props { extruded?: boolean; }',
			usage: '<TopologyColorGrid extruded />',
			notes: 'Client-only WebGL scene.',
			inspiredBy: 'Aura component 95909'
		});

		expect(prompt).toContain('# Install TopologyColorGrid into my Svelte 5 project');
		expect(prompt).toContain('bun add three gsap');
		expect(prompt).toContain('src/lib/components/TopologyColorGrid.svelte');
		expect(prompt).toContain('src/routes/topologycolorgrid/+page.svelte');
		expect(prompt).toContain('interface Props');
		expect(prompt).toContain('<TopologyColorGrid extruded />');
		expect(prompt).toContain('Client-only WebGL scene.');
		expect(prompt).toContain('Inspired by Aura component 95909');
	});

	it('renders a selectable prompt and copies it with one click', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText }
		});

		render(AgentPromptCopy, {
			name: 'ShineBorder',
			summary: 'Animated border wrapper.',
			componentPath: 'src/lib/components/ShineBorder.svelte',
			demoPath: 'src/routes/shineborder/+page.svelte',
			deps: [],
			propsSignature: 'interface Props { duration?: number; }',
			usage: '<ShineBorder duration={3}>Content</ShineBorder>'
		});

		expect(screen.getByRole('region', { name: 'Agent install prompt' }).textContent).toContain(
			'# No external dependencies'
		);

		await fireEvent.click(screen.getByRole('button', { name: /copy prompt/i }));

		expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Install ShineBorder'));
		expect(screen.getByRole('button', { name: /copied/i })).toBeTruthy();
	});
});
