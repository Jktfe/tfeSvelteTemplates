import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import Avatar from './Avatar.svelte';

describe('Avatar', () => {
	beforeEach(() => cleanup());

	it('renders <img> when src is provided', () => {
		const { container } = render(Avatar, {
			props: { src: 'https://example.com/a.png', name: 'Ada Lovelace' }
		});
		const img = container.querySelector('img');
		expect(img).not.toBeNull();
		expect(img?.getAttribute('src')).toBe('https://example.com/a.png');
	});

	it('renders initials when no src is provided', () => {
		const { container } = render(Avatar, { props: { name: 'Ada Lovelace' } });
		expect(container.querySelector('img')).toBeNull();
		const initials = container.querySelector('.initials');
		expect(initials?.textContent).toBe('AL');
	});

	it('falls back to initials on image error', async () => {
		const { container } = render(Avatar, {
			props: { src: 'https://broken.example/x.png', name: 'Grace Hopper' }
		});
		const img = container.querySelector('img');
		expect(img).not.toBeNull();
		await fireEvent.error(img!);
		expect(container.querySelector('img')).toBeNull();
		expect(container.querySelector('.initials')?.textContent).toBe('GH');
	});

	it('applies size class', () => {
		const { container } = render(Avatar, { props: { name: 'Ada', size: 'lg' } });
		const wrapper = container.querySelector('.avatar');
		expect(wrapper?.classList.contains('avatar-lg')).toBe(true);
	});

	it('applies shape class', () => {
		const { container } = render(Avatar, { props: { name: 'Ada', shape: 'rounded' } });
		const wrapper = container.querySelector('.avatar');
		expect(wrapper?.classList.contains('avatar-rounded')).toBe(true);
	});

	it('renders status dot when status prop set', () => {
		const { container } = render(Avatar, { props: { name: 'Ada', status: 'online' } });
		const dot = container.querySelector('.status');
		expect(dot).not.toBeNull();
		expect(dot?.classList.contains('status-online')).toBe(true);
	});

	it('omits status dot when status not set', () => {
		const { container } = render(Avatar, { props: { name: 'Ada' } });
		expect(container.querySelector('.status')).toBeNull();
	});

	it('uses role=img with name as aria-label', () => {
		const { container } = render(Avatar, { props: { name: 'Ada Lovelace' } });
		const wrapper = container.querySelector('[role="img"]');
		expect(wrapper?.getAttribute('aria-label')).toBe('Ada Lovelace');
	});

	it('alt prop overrides default aria-label', () => {
		const { container } = render(Avatar, { props: { name: 'Ada', alt: 'Founder portrait' } });
		const wrapper = container.querySelector('[role="img"]');
		expect(wrapper?.getAttribute('aria-label')).toBe('Founder portrait');
	});

	it('falls back to "User" aria-label when no name or alt', () => {
		const { container } = render(Avatar, { props: {} });
		const wrapper = container.querySelector('[role="img"]');
		expect(wrapper?.getAttribute('aria-label')).toBe('User');
	});

	it('shows ? for missing name', () => {
		const { container } = render(Avatar, { props: {} });
		expect(container.querySelector('.initials')?.textContent).toBe('?');
	});

	it('produces deterministic colour for the same name', () => {
		const { container: a } = render(Avatar, { props: { name: 'Ada Lovelace' } });
		const styleA = a.querySelector('.avatar')?.getAttribute('style') ?? '';
		cleanup();
		const { container: b } = render(Avatar, { props: { name: 'Ada Lovelace' } });
		const styleB = b.querySelector('.avatar')?.getAttribute('style') ?? '';
		expect(styleA).toMatch(/background-color/);
		expect(styleA).toBe(styleB);
	});

	it('merges custom class on the wrapper', () => {
		const { container } = render(Avatar, { props: { name: 'Ada', class: 'extra-class' } });
		const wrapper = container.querySelector('.avatar');
		expect(wrapper?.classList.contains('extra-class')).toBe(true);
	});
});
