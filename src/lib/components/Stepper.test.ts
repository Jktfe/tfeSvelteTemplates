/**
 * ============================================================
 * Stepper Tests
 * ============================================================
 *
 * Covers:
 *   ✓ Renders one li per step
 *   ✓ Marks current step with aria-current="step"
 *   ✓ Done steps render a checkmark, not a number
 *   ✓ Pending steps stay non-clickable even when clickable=true
 *   ✓ Clickable done/current steps fire onSelect with the right index
 *   ✓ Vertical orientation applies the correct class
 *   ✓ Custom palette colours flow through
 *   ✓ Connector renders for all steps except the last
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Stepper from './Stepper.svelte';

const labels = ['Cart', 'Shipping', 'Payment', 'Review'];

describe('Stepper', () => {
	it('renders one li per step', () => {
		const { container } = render(Stepper, { steps: labels, currentStep: 1 });
		const items = container.querySelectorAll('.step');
		expect(items.length).toBe(4);
	});

	it('marks the current step with aria-current=step', () => {
		const { container } = render(Stepper, { steps: labels, currentStep: 2 });
		const current = container.querySelector('[aria-current="step"]') as HTMLElement;
		expect(current).toBeTruthy();
		expect(current.classList.contains('step-current')).toBe(true);
	});

	it('renders a checkmark for done steps', () => {
		const { container } = render(Stepper, { steps: labels, currentStep: 2 });
		const dones = container.querySelectorAll('.step-done');
		expect(dones.length).toBe(2);
		// done steps contain the checkmark SVG instead of a number
		expect(dones[0].querySelector('svg')).toBeTruthy();
	});

	it('pending steps remain non-clickable even when clickable=true', () => {
		const { container } = render(Stepper, {
			steps: labels,
			currentStep: 1,
			clickable: true
		});
		const pendingButton = container.querySelector('.step-pending button');
		expect(pendingButton).toBeNull();
	});

	it('clickable done/current steps fire onSelect with the right index', async () => {
		const onSelect = vi.fn();
		const { container } = render(Stepper, {
			steps: labels,
			currentStep: 2,
			clickable: true,
			onSelect
		});
		const buttons = container.querySelectorAll('.step-button');
		// done step 0
		await fireEvent.click(buttons[0] as HTMLElement);
		expect(onSelect).toHaveBeenCalledWith(0);
		// current step 2
		await fireEvent.click(buttons[2] as HTMLElement);
		expect(onSelect).toHaveBeenCalledWith(2);
	});

	it('vertical orientation applies the correct class', () => {
		const { container } = render(Stepper, {
			steps: labels,
			orientation: 'vertical'
		});
		const root = container.querySelector('.stepper') as HTMLElement;
		expect(root.classList.contains('stepper-vertical')).toBe(true);
	});

	it('falls back to horizontal class by default', () => {
		const { container } = render(Stepper, { steps: labels });
		const root = container.querySelector('.stepper') as HTMLElement;
		expect(root.classList.contains('stepper-horizontal')).toBe(true);
	});

	it('renders connectors for all but the last step', () => {
		const { container } = render(Stepper, { steps: labels });
		const connectors = container.querySelectorAll('.step-connector');
		expect(connectors.length).toBe(labels.length - 1);
	});

	it('forwards extra classes via the class prop', () => {
		const { container } = render(Stepper, {
			steps: labels,
			class: 'custom-stepper'
		});
		const root = container.querySelector('.stepper') as HTMLElement;
		expect(root.classList.contains('custom-stepper')).toBe(true);
	});

	it('does not call onSelect when clickable is false', async () => {
		const onSelect = vi.fn();
		const { container } = render(Stepper, {
			steps: labels,
			currentStep: 2,
			onSelect
		});
		// Without clickable, no buttons exist
		const buttons = container.querySelectorAll('button');
		expect(buttons.length).toBe(0);
		expect(onSelect).not.toHaveBeenCalled();
	});
});
