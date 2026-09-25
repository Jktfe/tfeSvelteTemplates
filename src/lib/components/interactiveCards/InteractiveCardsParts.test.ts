/**
 * ============================================================
 * InteractiveCards sub-component Tests
 * ============================================================
 *
 * The four presentational children are driven entirely by props
 * from InteractiveCards.svelte, so each can be tested alone:
 *   - InteractiveCardItem: label, callbacks, badge + frame opacity
 *   - InteractiveCardsDetail: null project, open state, callbacks,
 *     quantity floor of 1, click isolation
 *   - InteractiveCardsRoomPreview: visible class, index wrapping
 *   - InteractiveCardsAwards: active slide, letter split, labels
 * ============================================================
 */

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import InteractiveCardItem from './InteractiveCardItem.svelte';
import InteractiveCardsDetail from './InteractiveCardsDetail.svelte';
import InteractiveCardsRoomPreview from './InteractiveCardsRoomPreview.svelte';
import InteractiveCardsAwards from './InteractiveCardsAwards.svelte';
import {
	FALLBACK_INTERACTIVE_PROJECTS,
	FALLBACK_INTERACTIVE_TESTIMONIALS
} from '$lib/constants';

const project = FALLBACK_INTERACTIVE_PROJECTS[0];

describe('InteractiveCardItem', () => {
	it('renders a labelled button with the painting image', () => {
		render(InteractiveCardItem, { props: { project, index: 0, frameImage: '/frame.png' } });
		const button = screen.getByRole('button', {
			name: `View ${project.title} by ${project.artist}`
		});
		expect(button).toHaveAttribute('data-card');
		expect(screen.getByAltText(`${project.title} by ${project.artist}`)).toHaveAttribute(
			'src',
			project.image
		);
		expect(button).toHaveTextContent(project.badgeLabel);
	});

	it('reports select, hover and unhover with its index', async () => {
		const onSelect = vi.fn();
		const onHover = vi.fn();
		const onUnhover = vi.fn();
		render(InteractiveCardItem, {
			props: { project, index: 3, frameImage: '/frame.png', onSelect, onHover, onUnhover }
		});
		const button = screen.getByRole('button');

		await fireEvent.mouseEnter(button);
		expect(onHover).toHaveBeenCalledWith(3);
		await fireEvent.mouseLeave(button);
		expect(onUnhover).toHaveBeenCalledWith(3);
		await fireEvent.focus(button);
		expect(onHover).toHaveBeenCalledTimes(2);
		await fireEvent.click(button);
		expect(onSelect).toHaveBeenCalledWith(3);
	});

	it('drives badge and frame opacity from props', () => {
		const { container } = render(InteractiveCardItem, {
			props: { project, index: 0, frameImage: '/frame.png', badgeVisible: false, frameOpacity: 0.5 }
		});
		expect((container.querySelector('.badge') as HTMLElement).style.opacity).toBe('0');
		expect((container.querySelector('.frame') as HTMLElement).style.opacity).toBe('0.5');
	});
});

describe('InteractiveCardsDetail', () => {
	const baseProps = {
		project,
		open: true,
		selectedSize: project.sizes[0],
		selectedMaterial: project.materials[0],
		quantity: 1
	};

	it('renders nothing without a project', () => {
		const { container } = render(InteractiveCardsDetail, {
			props: { ...baseProps, project: null }
		});
		expect(container.querySelector('[data-panel]')).toBeNull();
	});

	it('renders the painting details as a labelled dialog', () => {
		render(InteractiveCardsDetail, { props: baseProps });
		const dialog = screen.getByRole('dialog', { name: 'Print details' });
		expect(dialog).toHaveClass('open');
		expect(dialog).toHaveTextContent(project.price);
		expect(dialog).toHaveTextContent(project.testimonial);
	});

	it('hides itself from assistive tech while closed', () => {
		const { container } = render(InteractiveCardsDetail, { props: { ...baseProps, open: false } });
		const panel = container.querySelector('[data-panel]');
		expect(panel).not.toHaveClass('open');
		expect(panel).toHaveAttribute('aria-hidden', 'true');
	});

	it('marks the selected pills as checked radios', () => {
		render(InteractiveCardsDetail, {
			props: { ...baseProps, selectedSize: project.sizes[2] }
		});
		expect(screen.getByRole('radio', { name: project.sizes[2] })).toHaveAttribute(
			'aria-checked',
			'true'
		);
		expect(screen.getByRole('radio', { name: project.sizes[0] })).toHaveAttribute(
			'aria-checked',
			'false'
		);
	});

	it('fires the selection, cart and close callbacks', async () => {
		const onSelectSize = vi.fn();
		const onSelectMaterial = vi.fn();
		const onAddToCart = vi.fn();
		const onClose = vi.fn();
		render(InteractiveCardsDetail, {
			props: { ...baseProps, onSelectSize, onSelectMaterial, onAddToCart, onClose }
		});

		await fireEvent.click(screen.getByRole('radio', { name: project.sizes[1] }));
		expect(onSelectSize).toHaveBeenCalledWith(project.sizes[1]);
		await fireEvent.click(screen.getByRole('radio', { name: project.materials[1] }));
		expect(onSelectMaterial).toHaveBeenCalledWith(project.materials[1]);
		await fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
		expect(onAddToCart).toHaveBeenCalledTimes(1);
		await fireEvent.click(screen.getByRole('button', { name: 'Back to collection' }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('never asks for a quantity below 1', async () => {
		const onQuantityChange = vi.fn();
		render(InteractiveCardsDetail, { props: { ...baseProps, quantity: 1, onQuantityChange } });

		await fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
		expect(onQuantityChange).toHaveBeenLastCalledWith(1);
		await fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
		expect(onQuantityChange).toHaveBeenLastCalledWith(2);
	});
});

describe('InteractiveCardsRoomPreview', () => {
	const projects = FALLBACK_INTERACTIVE_PROJECTS.slice(0, 3);

	it('is decorative and toggles the visible class', async () => {
		const { container, rerender } = render(InteractiveCardsRoomPreview, {
			props: { projects, imageIdx: 0, visible: false, roomImage: '/room.png' }
		});
		const overlay = container.querySelector('.room-overlay');
		expect(overlay).toHaveAttribute('aria-hidden', 'true');
		expect(overlay).not.toHaveClass('visible');

		await rerender({ projects, imageIdx: 0, visible: true, roomImage: '/room.png' });
		expect(overlay).toHaveClass('visible');
	});

	it('wraps out-of-range and negative indices onto the project list', async () => {
		const { container, rerender } = render(InteractiveCardsRoomPreview, {
			props: { projects, imageIdx: 4, visible: true, roomImage: '/room.png' }
		});
		const slotImage = () => container.querySelector('.painting-slot img');
		expect(slotImage()).toHaveAttribute('src', projects[1].image);

		await rerender({ projects, imageIdx: -1, visible: true, roomImage: '/room.png' });
		expect(slotImage()).toHaveAttribute('src', projects[2].image);
	});

	it('renders an empty slot when there are no projects', () => {
		const { container } = render(InteractiveCardsRoomPreview, {
			props: { projects: [], imageIdx: 0, visible: true, roomImage: '/room.png' }
		});
		expect(container.querySelector('.painting-slot img')).toBeNull();
		expect(container.querySelector('.room-png')).toHaveAttribute('src', '/room.png');
	});
});

describe('InteractiveCardsAwards', () => {
	const testimonials = FALLBACK_INTERACTIVE_TESTIMONIALS;

	it('activates only the slide matching slideIdx', () => {
		const { container } = render(InteractiveCardsAwards, {
			props: { testimonials, slideIdx: 2, visible: true }
		});
		const slides = container.querySelectorAll('.slide');
		expect(slides).toHaveLength(testimonials.length + 1);
		const active = Array.from(slides).filter((s) => s.classList.contains('active'));
		expect(active).toHaveLength(1);
		expect(active[0]).toBe(slides[2]);
	});

	it('hides every slide when slideIdx is -1', () => {
		const { container } = render(InteractiveCardsAwards, {
			props: { testimonials, slideIdx: -1, visible: false }
		});
		expect(container.querySelectorAll('.slide.active')).toHaveLength(0);
		expect(container.querySelector('.awards')).toHaveAttribute('aria-hidden', 'true');
	});

	it('splits quotes into letters but keeps the full quote as the label', () => {
		const quote = { author: 'A', title: 'B', photo: '/p.jpg', quote: 'Hi there' };
		const { container } = render(InteractiveCardsAwards, {
			props: { testimonials: [quote], slideIdx: 1, visible: true }
		});
		const blockquote = container.querySelector('blockquote');
		expect(blockquote).toHaveAttribute('aria-label', 'Hi there');
		expect(container.querySelectorAll('[data-quote-letter]')).toHaveLength(7);
		expect(container.querySelectorAll('.word')).toHaveLength(2);
	});
});
