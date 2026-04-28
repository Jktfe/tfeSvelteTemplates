import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import GlobePresence from './GlobePresence.svelte';

describe('GlobePresence', () => {
	it('renders without crashing', () => {
		const { container } = render(GlobePresence);
		expect(container).toBeTruthy();
	});

	it('renders a canvas element', () => {
		const { container } = render(GlobePresence);
		const canvas = container.querySelector('canvas');
		expect(canvas).toBeTruthy();
	});

	it('renders the accessible fallback list with markers', () => {
		const testMarkers = [
			{ id: '1', name: 'Test City', lat: 0, long: 0, label: 'HQ' }
		];
		const { getByText } = render(GlobePresence, { markers: testMarkers });
		
		// Checking for the screen-reader heading
		expect(getByText('Global Presence Locations')).toBeTruthy();
		// Checking for the marker text
		expect(getByText(/Test City: 0, 0 \(HQ\)/)).toBeTruthy();
	});

	it('applies custom classes to the container', () => {
		const { container } = render(GlobePresence, { class: 'custom-globe-class' });
		const wrapper = container.querySelector('.custom-globe-class');
		expect(wrapper).toBeTruthy();
	});
});
