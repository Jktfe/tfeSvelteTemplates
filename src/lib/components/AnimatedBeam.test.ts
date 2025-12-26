/**
 * ============================================================
 * AnimatedBeam Tests
 * ============================================================
 *
 * These tests verify that AnimatedBeam renders and behaves correctly.
 *
 * What we're checking:
 *   - It renders without crashing
 *   - SVG structure is correct
 *   - Nodes and beams are rendered
 *   - Props are applied correctly
 *   - Accessibility features work
 *
 * Note: CSS animations are not testable in jsdom.
 * Visual animation testing is done manually.
 *
 * Run these tests:
 *   bun run test                      - Run once
 *   bun run test:watch                - Watch mode
 *   bun run test -- AnimatedBeam      - Just this file
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import AnimatedBeam from './AnimatedBeam.svelte';

describe('AnimatedBeam', () => {
	// First things first - does it render at all?
	it('renders without crashing', () => {
		const { container } = render(AnimatedBeam);
		expect(container).toBeTruthy();
	});

	// Should render an SVG element
	it('renders an SVG element', () => {
		const { container } = render(AnimatedBeam);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	// SVG should have viewBox attribute
	it('SVG has viewBox attribute', () => {
		const { container } = render(AnimatedBeam);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox');
	});

	// Default viewBox should be 600x400
	it('has default viewBox of 600x400', () => {
		const { container } = render(AnimatedBeam);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox', '0 0 600 400');
	});

	// Custom dimensions should update viewBox
	it('updates viewBox with custom dimensions', () => {
		const { container } = render(AnimatedBeam, {
			props: { width: 800, height: 600 }
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('viewBox', '0 0 800 600');
	});

	// Should render nodes as circles
	it('renders nodes as circles', () => {
		const { container } = render(AnimatedBeam);
		const circles = container.querySelectorAll('circle');
		expect(circles.length).toBeGreaterThan(0);
	});

	// Should render beams as lines
	it('renders beams as lines', () => {
		const { container } = render(AnimatedBeam);
		const lines = container.querySelectorAll('line');
		expect(lines.length).toBeGreaterThan(0);
	});

	// Lines should have beam class
	it('beams have beam class', () => {
		const { container } = render(AnimatedBeam);
		const beams = container.querySelectorAll('.beam');
		expect(beams.length).toBeGreaterThan(0);
	});

	// Lines should have aria-hidden for accessibility
	it('beams have aria-hidden attribute', () => {
		const { container } = render(AnimatedBeam);
		const beam = container.querySelector('.beam');
		expect(beam).toHaveAttribute('aria-hidden', 'true');
	});

	// Nodes should have node class
	it('nodes have node class', () => {
		const { container } = render(AnimatedBeam);
		const nodes = container.querySelectorAll('.node');
		expect(nodes.length).toBeGreaterThan(0);
	});

	// Custom node colour should be applied
	it('applies custom node colour', () => {
		const { container } = render(AnimatedBeam, {
			props: { nodeColor: '#ff0000' }
		});
		const node = container.querySelector('.node');
		expect(node).toHaveAttribute('fill', '#ff0000');
	});

	// Custom beam colour should be applied
	it('applies custom beam colour', () => {
		const { container } = render(AnimatedBeam, {
			props: { beamColor: '#00ff00' }
		});
		const beam = container.querySelector('.beam');
		expect(beam).toHaveAttribute('stroke', '#00ff00');
	});

	// Custom beam width should be applied
	it('applies custom beam width', () => {
		const { container } = render(AnimatedBeam, {
			props: { beamWidth: 5 }
		});
		const beam = container.querySelector('.beam');
		expect(beam).toHaveAttribute('stroke-width', '5');
	});

	// Container should have correct structure
	it('has container with animated-beam-container class', () => {
		const { container } = render(AnimatedBeam);
		const outer = container.querySelector('.animated-beam-container');
		expect(outer).toBeInTheDocument();
	});

	// SVG should preserve aspect ratio
	it('SVG has preserveAspectRatio attribute', () => {
		const { container } = render(AnimatedBeam);
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
	});

	// Beams group should exist
	it('has beams group', () => {
		const { container } = render(AnimatedBeam);
		const beamsGroup = container.querySelector('.beams');
		expect(beamsGroup).toBeInTheDocument();
	});

	// Nodes group should exist
	it('has nodes group', () => {
		const { container } = render(AnimatedBeam);
		const nodesGroup = container.querySelector('.nodes');
		expect(nodesGroup).toBeInTheDocument();
	});

	// Custom nodes should render
	it('renders custom nodes', () => {
		const { container } = render(AnimatedBeam, {
			props: {
				nodes: [
					{ id: 'a', x: 100, y: 100 },
					{ id: 'b', x: 200, y: 200 },
					{ id: 'c', x: 300, y: 100 }
				],
				connections: [
					{ from: 'a', to: 'b' },
					{ from: 'b', to: 'c' }
				]
			}
		});
		const circles = container.querySelectorAll('circle');
		expect(circles.length).toBe(3);
	});

	// Custom connections should render
	it('renders custom connections', () => {
		const { container } = render(AnimatedBeam, {
			props: {
				nodes: [
					{ id: 'a', x: 100, y: 100 },
					{ id: 'b', x: 200, y: 200 },
					{ id: 'c', x: 300, y: 100 }
				],
				connections: [
					{ from: 'a', to: 'b' },
					{ from: 'b', to: 'c' }
				]
			}
		});
		const lines = container.querySelectorAll('line');
		expect(lines.length).toBe(2);
	});

	// Node labels should render when provided
	it('renders node labels when provided', () => {
		const { container } = render(AnimatedBeam, {
			props: {
				nodes: [
					{ id: 'a', x: 100, y: 100, label: 'Node A' },
					{ id: 'b', x: 200, y: 200, label: 'Node B' }
				],
				connections: [{ from: 'a', to: 'b' }]
			}
		});
		const labels = container.querySelectorAll('.node-label');
		expect(labels.length).toBe(2);
	});
});
