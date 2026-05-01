import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import TopologyColorGrid, {
	defaultTopologySwatches,
	formatRgbTriplet,
	hexToRgbTriplet,
	normalizeHex,
	readableTextColor,
	topologyCardLayout
} from './TopologyColorGrid.svelte';

describe('TopologyColorGrid', () => {
	it('normalises hex colours and formats RGB triplets', () => {
		expect(normalizeHex('c2410c')).toBe('#C2410C');
		expect(normalizeHex('#abc')).toBe('#AABBCC');
		expect(normalizeHex('not-a-colour')).toBe('#000000');
		expect(hexToRgbTriplet('#C2410C')).toEqual([194, 65, 12]);
		expect(formatRgbTriplet('#064E3B')).toBe('006 . 078 . 059');
	});

	it('chooses readable text colours from luminance', () => {
		expect(readableTextColor('#FAFAF9')).toBe('#111827');
		expect(readableTextColor('#1f2937')).toBe('#ffffff');
	});

	it('reduces card depth when extrusion is disabled', () => {
		expect(topologyCardLayout(3, true).depth).toBeGreaterThan(topologyCardLayout(3, false).depth);
		expect(topologyCardLayout(-1, true).x).toBe(topologyCardLayout(defaultTopologySwatches.length - 1, true).x);
	});

	it('renders the topology canvas and default swatches', () => {
		const { container } = render(TopologyColorGrid);
		expect(container.querySelector('.topology-color-grid')?.classList.contains('is-light')).toBe(true);
		expect(container.querySelector('canvas.wireframe-canvas')).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Chromatic Substrate Topology' })).toBeTruthy();
		for (const swatch of defaultTopologySwatches) {
			expect(screen.getByText(swatch.name.split(' ')[0])).toBeTruthy();
		}
	});

	it('toggles extrusion mode', async () => {
		const { container } = render(TopologyColorGrid);
		const root = container.querySelector('.topology-color-grid');
		const toggle = screen.getByRole('button', { name: 'Flatten Plane' });

		expect(root?.classList.contains('is-flat')).toBe(false);
		await fireEvent.click(toggle);
		expect(root?.classList.contains('is-flat')).toBe(true);
		expect(screen.getByRole('button', { name: 'Activate Extrusion' })).toBeTruthy();
	});

	it('supports explicit light and dark themes', async () => {
		const { container } = render(TopologyColorGrid, { theme: 'dark' });
		const root = container.querySelector('.topology-color-grid');
		const themeToggle = screen.getByRole('button', { name: 'Light Mode' });

		expect(root?.classList.contains('is-dark')).toBe(true);
		await fireEvent.click(themeToggle);
		expect(root?.classList.contains('is-light')).toBe(true);
		expect(screen.getByRole('button', { name: 'Dark Mode' })).toBeTruthy();
	});
});
