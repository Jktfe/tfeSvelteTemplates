import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MediaLightboxPro, {
	mediaCounter,
	nextMediaIndex,
	previousMediaIndex,
	type MediaLightboxItem
} from './MediaLightboxPro.svelte';

const items: MediaLightboxItem[] = [
	{
		id: 'health',
		title: 'Health matrix',
		src: '/ComponentScreenshots/ComponentHealthMatrixShot.png',
		alt: 'Health matrix screenshot'
	},
	{
		id: 'tokens',
		title: 'Theme tokens',
		src: '/ComponentScreenshots/ThemeTokenInspectorShot.png',
		alt: 'Theme token screenshot'
	}
];

describe('MediaLightboxPro helpers', () => {
	it('wraps media navigation indexes', () => {
		expect(nextMediaIndex(1, 2)).toBe(0);
		expect(previousMediaIndex(0, 2)).toBe(1);
		expect(mediaCounter(1, 2)).toBe('2 / 2');
	});
});

describe('MediaLightboxPro component', () => {
	it('renders media thumbnails', () => {
		render(MediaLightboxPro, { items, title: 'Visual proof' });

		expect(screen.getByRole('heading', { name: 'Visual proof' })).toBeTruthy();
		expect(screen.getByRole('button', { name: /Health matrix/ })).toBeTruthy();
		expect(screen.getByAltText('Theme token screenshot')).toBeTruthy();
	});
});
