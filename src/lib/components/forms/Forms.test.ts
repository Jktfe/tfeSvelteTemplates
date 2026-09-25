/**
 * ============================================================
 * Form Components Test Suite
 * ============================================================
 *
 * Comprehensive tests for all 13 form field components:
 *   - FormField (base wrapper)
 *   - TextField, TextareaField, NumberField
 *   - SelectField, RadioGroup
 *   - CheckboxField, CheckboxGroup
 *   - RangeField, DateField, TimeField
 *   - SwitchField, ColorField
 *
 * What we're checking:
 *   ✓ Components render without crashing
 *   ✓ Props apply correctly (labels, values, states)
 *   ✓ Validation error display works
 *   ✓ Accessibility features (ARIA, roles, labels)
 *   ✓ Disabled/readonly states behave correctly
 *
 * ============================================================
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import type { Snippet } from 'svelte';

// Helper to create a mock snippet for testing
const mockSnippet = (() => {}) as unknown as Snippet;

// Import all form components
import FormField from './FormField.svelte';
import TextField from './TextField.svelte';
import TextareaField from './TextareaField.svelte';
import NumberField from './NumberField.svelte';
import SelectField from './SelectField.svelte';
import RadioGroup from './RadioGroup.svelte';
import CheckboxField from './CheckboxField.svelte';
import CheckboxGroup from './CheckboxGroup.svelte';
import RangeField from './RangeField.svelte';
import DateField from './DateField.svelte';
import TimeField from './TimeField.svelte';
import SwitchField from './SwitchField.svelte';
import ColorField from './ColorField.svelte';

// ============================================================
// FormField (Base Wrapper) Tests
// ============================================================
describe('FormField', () => {
	it('renders label correctly', () => {
		render(FormField, {
			props: {
				id: 'test',
				label: 'Test Label',
				children: mockSnippet
			}
		});
		expect(screen.getByText('Test Label')).toBeInTheDocument();
	});

	it('shows required indicator when required', () => {
		render(FormField, {
			props: {
				id: 'test',
				label: 'Test Label',
				required: true,
				children: mockSnippet
			}
		});
		expect(screen.getByText('*')).toBeInTheDocument();
	});

	it('shows help text when provided', () => {
		render(FormField, {
			props: {
				id: 'test',
				label: 'Test Label',
				helpText: 'This is help text',
				children: mockSnippet
			}
		});
		expect(screen.getByText('This is help text')).toBeInTheDocument();
	});

	it('shows error when touched and has error', () => {
		render(FormField, {
			props: {
				id: 'test',
				label: 'Test Label',
				error: 'This field is required',
				touched: true,
				children: mockSnippet
			}
		});
		expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
	});

	it('does not show error when not touched', () => {
		render(FormField, {
			props: {
				id: 'test',
				label: 'Test Label',
				error: 'This field is required',
				touched: false,
				children: mockSnippet
			}
		});
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('derives help and error ids from the id it is given', () => {
		render(FormField, {
			props: {
				id: 'custom',
				label: 'Test Label',
				helpText: 'Help',
				error: 'Oops',
				touched: true,
				children: mockSnippet
			}
		});
		expect(screen.getByText('Test Label').closest('label')).toHaveAttribute('for', 'custom');
		expect(screen.getByText('Help')).toHaveAttribute('id', 'custom-help');
		expect(screen.getByRole('alert')).toHaveAttribute('id', 'custom-error');
	});

	it('generates a per-instance id when none is given', () => {
		render(FormField, { props: { label: 'One', children: mockSnippet } });
		render(FormField, { props: { label: 'Two', children: mockSnippet } });
		const first = screen.getByText('One').closest('label')!.getAttribute('for');
		const second = screen.getByText('Two').closest('label')!.getAttribute('for');
		expect(first).toBeTruthy();
		expect(second).toBeTruthy();
		expect(first).not.toBe(second);
	});
});

// ============================================================
// TextField Tests
// ============================================================
describe('TextField', () => {
	it('renders with label', () => {
		render(TextField, {
			props: {
				name: 'username',
				label: 'Username'
			}
		});
		expect(screen.getByText('Username')).toBeInTheDocument();
	});

	it('renders input with correct type', () => {
		render(TextField, {
			props: {
				name: 'email',
				label: 'Email',
				type: 'email'
			}
		});
		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('type', 'email');
	});

	it('shows placeholder text', () => {
		render(TextField, {
			props: {
				name: 'search',
				label: 'Search',
				placeholder: 'Enter search term'
			}
		});
		expect(screen.getByPlaceholderText('Enter search term')).toBeInTheDocument();
	});

	it('applies disabled state', () => {
		render(TextField, {
			props: {
				name: 'disabled',
				label: 'Disabled Field',
				disabled: true
			}
		});
		expect(screen.getByRole('textbox')).toBeDisabled();
	});

	it('applies readonly state', () => {
		render(TextField, {
			props: {
				name: 'readonly',
				label: 'Readonly Field',
				readonly: true
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
	});

	it('shows error styling when touched with error', () => {
		render(TextField, {
			props: {
				name: 'error',
				label: 'Error Field',
				error: 'Invalid input',
				touched: true
			}
		});
		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('aria-invalid', 'true');
	});

	it('has correct aria-required when required', () => {
		render(TextField, {
			props: {
				name: 'required',
				label: 'Required Field',
				required: true
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
	});
});

// ============================================================
// TextareaField Tests
// ============================================================
describe('TextareaField', () => {
	it('renders with label', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Biography'
			}
		});
		expect(screen.getByText('Biography')).toBeInTheDocument();
	});

	it('renders textarea element', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Biography'
			}
		});
		expect(screen.getByRole('textbox')).toBeInTheDocument();
	});

	it('applies rows attribute', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Biography',
				rows: 5
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
	});

	it('applies maxlength attribute', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Biography',
				maxlength: 500
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '500');
	});

	it('applies disabled state', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Biography',
				disabled: true
			}
		});
		expect(screen.getByRole('textbox')).toBeDisabled();
	});
});

// ============================================================
// NumberField Tests
// ============================================================
describe('NumberField', () => {
	it('renders with label', () => {
		render(NumberField, {
			props: {
				name: 'age',
				label: 'Age'
			}
		});
		expect(screen.getByText('Age')).toBeInTheDocument();
	});

	it('renders number input', () => {
		render(NumberField, {
			props: {
				name: 'age',
				label: 'Age'
			}
		});
		expect(screen.getByRole('spinbutton')).toBeInTheDocument();
	});

	it('applies min and max constraints', () => {
		render(NumberField, {
			props: {
				name: 'age',
				label: 'Age',
				min: 18,
				max: 100
			}
		});
		const input = screen.getByRole('spinbutton');
		expect(input).toHaveAttribute('min', '18');
		expect(input).toHaveAttribute('max', '100');
	});

	it('applies step attribute', () => {
		render(NumberField, {
			props: {
				name: 'price',
				label: 'Price',
				step: 0.01
			}
		});
		expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');
	});

	it('renders increment and decrement buttons', () => {
		render(NumberField, {
			props: {
				name: 'quantity',
				label: 'Quantity'
			}
		});
		expect(screen.getByLabelText('Increment Quantity')).toBeInTheDocument();
		expect(screen.getByLabelText('Decrement Quantity')).toBeInTheDocument();
	});

	it('hides buttons when readonly', () => {
		render(NumberField, {
			props: {
				name: 'quantity',
				label: 'Quantity',
				readonly: true
			}
		});
		expect(screen.queryByLabelText('Increment Quantity')).not.toBeInTheDocument();
	});
});

// ============================================================
// SelectField Tests
// ============================================================
describe('SelectField', () => {
	const options = [
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'us', label: 'United States' },
		{ value: 'ca', label: 'Canada' }
	];

	it('renders with label', () => {
		render(SelectField, {
			props: {
				name: 'country',
				label: 'Country',
				options
			}
		});
		expect(screen.getByText('Country')).toBeInTheDocument();
	});

	it('renders select element', () => {
		render(SelectField, {
			props: {
				name: 'country',
				label: 'Country',
				options
			}
		});
		expect(screen.getByRole('combobox')).toBeInTheDocument();
	});

	it('renders all options', () => {
		render(SelectField, {
			props: {
				name: 'country',
				label: 'Country',
				options
			}
		});
		expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
	});

	it('shows placeholder option when provided', () => {
		render(SelectField, {
			props: {
				name: 'country',
				label: 'Country',
				options,
				placeholder: 'Select a country'
			}
		});
		expect(screen.getByRole('option', { name: 'Select a country' })).toBeInTheDocument();
	});

	it('applies disabled state', () => {
		render(SelectField, {
			props: {
				name: 'country',
				label: 'Country',
				options,
				disabled: true
			}
		});
		expect(screen.getByRole('combobox')).toBeDisabled();
	});
});

// ============================================================
// RadioGroup Tests
// ============================================================
describe('RadioGroup', () => {
	const options = [
		{ value: 'card', label: 'Credit Card' },
		{ value: 'paypal', label: 'PayPal' },
		{ value: 'bank', label: 'Bank Transfer' }
	];

	it('renders with label', () => {
		render(RadioGroup, {
			props: {
				name: 'payment',
				label: 'Payment Method',
				options
			}
		});
		expect(screen.getByText('Payment Method')).toBeInTheDocument();
	});

	it('renders all radio options', () => {
		render(RadioGroup, {
			props: {
				name: 'payment',
				label: 'Payment Method',
				options
			}
		});
		const radios = screen.getAllByRole('radio');
		expect(radios).toHaveLength(3);
	});

	it('renders radio labels', () => {
		render(RadioGroup, {
			props: {
				name: 'payment',
				label: 'Payment Method',
				options
			}
		});
		expect(screen.getByText('Credit Card')).toBeInTheDocument();
		expect(screen.getByText('PayPal')).toBeInTheDocument();
		expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
	});

	it('has radiogroup role on container', () => {
		render(RadioGroup, {
			props: {
				name: 'payment',
				label: 'Payment Method',
				options
			}
		});
		expect(screen.getByRole('radiogroup')).toBeInTheDocument();
	});
});

// ============================================================
// CheckboxField Tests
// ============================================================
describe('CheckboxField', () => {
	it('renders with label', () => {
		render(CheckboxField, {
			props: {
				name: 'terms',
				label: 'I accept the terms'
			}
		});
		// Label appears in both FormField wrapper and checkbox label
		const labels = screen.getAllByText('I accept the terms');
		expect(labels.length).toBeGreaterThanOrEqual(1);
	});

	it('renders checkbox input', () => {
		render(CheckboxField, {
			props: {
				name: 'terms',
				label: 'I accept the terms'
			}
		});
		expect(screen.getByRole('checkbox')).toBeInTheDocument();
	});

	it('applies disabled state', () => {
		render(CheckboxField, {
			props: {
				name: 'terms',
				label: 'I accept the terms',
				disabled: true
			}
		});
		expect(screen.getByRole('checkbox')).toBeDisabled();
	});

	it('has correct aria-required when required', () => {
		render(CheckboxField, {
			props: {
				name: 'terms',
				label: 'I accept the terms',
				required: true
			}
		});
		expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true');
	});
});

// ============================================================
// CheckboxGroup Tests
// ============================================================
describe('CheckboxGroup', () => {
	const options = [
		{ value: 'sports', label: 'Sports' },
		{ value: 'music', label: 'Music' },
		{ value: 'tech', label: 'Technology' }
	];

	it('renders with label', () => {
		render(CheckboxGroup, {
			props: {
				name: 'interests',
				label: 'Interests',
				options
			}
		});
		expect(screen.getByText('Interests')).toBeInTheDocument();
	});

	it('renders all checkbox options', () => {
		render(CheckboxGroup, {
			props: {
				name: 'interests',
				label: 'Interests',
				options
			}
		});
		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(3);
	});

	it('renders checkbox labels', () => {
		render(CheckboxGroup, {
			props: {
				name: 'interests',
				label: 'Interests',
				options
			}
		});
		expect(screen.getByText('Sports')).toBeInTheDocument();
		expect(screen.getByText('Music')).toBeInTheDocument();
		expect(screen.getByText('Technology')).toBeInTheDocument();
	});

	it('has group role on container', () => {
		render(CheckboxGroup, {
			props: {
				name: 'interests',
				label: 'Interests',
				options
			}
		});
		expect(screen.getByRole('group')).toBeInTheDocument();
	});
});

// ============================================================
// RangeField Tests
// ============================================================
describe('RangeField', () => {
	it('renders with label', () => {
		render(RangeField, {
			props: {
				name: 'volume',
				label: 'Volume',
				min: 0,
				max: 100
			}
		});
		expect(screen.getByText('Volume')).toBeInTheDocument();
	});

	it('renders slider input', () => {
		render(RangeField, {
			props: {
				name: 'volume',
				label: 'Volume',
				min: 0,
				max: 100
			}
		});
		expect(screen.getByRole('slider')).toBeInTheDocument();
	});

	it('applies min and max', () => {
		render(RangeField, {
			props: {
				name: 'volume',
				label: 'Volume',
				min: 0,
				max: 100
			}
		});
		const slider = screen.getByRole('slider');
		expect(slider).toHaveAttribute('min', '0');
		expect(slider).toHaveAttribute('max', '100');
	});

	it('applies step', () => {
		render(RangeField, {
			props: {
				name: 'volume',
				label: 'Volume',
				min: 0,
				max: 100,
				step: 5
			}
		});
		expect(screen.getByRole('slider')).toHaveAttribute('step', '5');
	});

	it('applies disabled state', () => {
		render(RangeField, {
			props: {
				name: 'volume',
				label: 'Volume',
				min: 0,
				max: 100,
				disabled: true
			}
		});
		expect(screen.getByRole('slider')).toBeDisabled();
	});
});

// ============================================================
// DateField Tests
// ============================================================
describe('DateField', () => {
	it('renders with label', () => {
		render(DateField, {
			props: {
				name: 'birthdate',
				label: 'Date of Birth'
			}
		});
		expect(screen.getByText('Date of Birth')).toBeInTheDocument();
	});

	it('renders date input', () => {
		render(DateField, {
			props: {
				name: 'birthdate',
				label: 'Date of Birth'
			}
		});
		// Date inputs don't have a specific role, check by type
		const input = document.querySelector('input[type="date"]');
		expect(input).toBeInTheDocument();
	});

	it('applies min date', () => {
		render(DateField, {
			props: {
				name: 'birthdate',
				label: 'Date of Birth',
				min: '1900-01-01'
			}
		});
		const input = document.querySelector('input[type="date"]');
		expect(input).toHaveAttribute('min', '1900-01-01');
	});

	it('applies max date', () => {
		render(DateField, {
			props: {
				name: 'birthdate',
				label: 'Date of Birth',
				max: '2024-12-31'
			}
		});
		const input = document.querySelector('input[type="date"]');
		expect(input).toHaveAttribute('max', '2024-12-31');
	});

	it('applies disabled state', () => {
		render(DateField, {
			props: {
				name: 'birthdate',
				label: 'Date of Birth',
				disabled: true
			}
		});
		const input = document.querySelector('input[type="date"]');
		expect(input).toBeDisabled();
	});
});

// ============================================================
// TimeField Tests
// ============================================================
describe('TimeField', () => {
	it('renders with label', () => {
		render(TimeField, {
			props: {
				name: 'appointment',
				label: 'Appointment Time'
			}
		});
		expect(screen.getByText('Appointment Time')).toBeInTheDocument();
	});

	it('renders time input', () => {
		render(TimeField, {
			props: {
				name: 'appointment',
				label: 'Appointment Time'
			}
		});
		const input = document.querySelector('input[type="time"]');
		expect(input).toBeInTheDocument();
	});

	it('applies min time', () => {
		render(TimeField, {
			props: {
				name: 'appointment',
				label: 'Appointment Time',
				min: '09:00'
			}
		});
		const input = document.querySelector('input[type="time"]');
		expect(input).toHaveAttribute('min', '09:00');
	});

	it('applies max time', () => {
		render(TimeField, {
			props: {
				name: 'appointment',
				label: 'Appointment Time',
				max: '17:00'
			}
		});
		const input = document.querySelector('input[type="time"]');
		expect(input).toHaveAttribute('max', '17:00');
	});

	it('applies disabled state', () => {
		render(TimeField, {
			props: {
				name: 'appointment',
				label: 'Appointment Time',
				disabled: true
			}
		});
		const input = document.querySelector('input[type="time"]');
		expect(input).toBeDisabled();
	});
});

// ============================================================
// SwitchField Tests
// ============================================================
describe('SwitchField', () => {
	it('renders with label', () => {
		render(SwitchField, {
			props: {
				name: 'notifications',
				label: 'Enable Notifications'
			}
		});
		// Label appears in both FormField wrapper and switch label
		const labels = screen.getAllByText('Enable Notifications');
		expect(labels.length).toBeGreaterThanOrEqual(1);
	});

	it('renders switch with role="switch"', () => {
		render(SwitchField, {
			props: {
				name: 'notifications',
				label: 'Enable Notifications'
			}
		});
		expect(screen.getByRole('switch')).toBeInTheDocument();
	});

	it('has aria-checked attribute', () => {
		render(SwitchField, {
			props: {
				name: 'notifications',
				label: 'Enable Notifications',
				checked: true
			}
		});
		expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
	});

	it('applies disabled state', () => {
		render(SwitchField, {
			props: {
				name: 'notifications',
				label: 'Enable Notifications',
				disabled: true
			}
		});
		expect(screen.getByRole('switch')).toBeDisabled();
	});

	it('supports label position left', () => {
		render(SwitchField, {
			props: {
				name: 'notifications',
				label: 'Enable Notifications',
				labelPosition: 'left'
			}
		});
		// Component should render without errors - label appears in multiple places
		const labels = screen.getAllByText('Enable Notifications');
		expect(labels.length).toBeGreaterThanOrEqual(1);
	});
});

// ============================================================
// ColorField Tests
// ============================================================
describe('ColorField', () => {
	it('renders with label', () => {
		render(ColorField, {
			props: {
				name: 'brand',
				label: 'Brand Colour'
			}
		});
		expect(screen.getByText('Brand Colour')).toBeInTheDocument();
	});

	it('renders colour preview', () => {
		const { container } = render(ColorField, {
			props: {
				name: 'brand',
				label: 'Brand Colour',
				value: '#ff0000'
			}
		});
		const preview = container.querySelector('.color-preview');
		expect(preview).toBeInTheDocument();
		expect(preview).toHaveStyle('background-color: #ff0000');
	});

	it('renders hex value display', () => {
		const { container } = render(ColorField, {
			props: {
				name: 'brand',
				label: 'Brand Colour',
				value: '#146ef5'
			}
		});
		// The hex value is displayed in a readonly text input
		const hexInput = container.querySelector('.color-hex');
		expect(hexInput).toBeInTheDocument();
		expect(hexInput).toHaveValue('#146ef5');
	});

	it('renders preset colours when provided', () => {
		const presets = ['#ff0000', '#00ff00', '#0000ff'];
		render(ColorField, {
			props: {
				name: 'brand',
				label: 'Brand Colour',
				presetColors: presets,
				showPresets: true
			}
		});
		// Should have 3 preset buttons
		const presetButtons = screen.getAllByRole('button');
		expect(presetButtons).toHaveLength(3);
	});

	it('applies disabled state to presets', () => {
		const presets = ['#ff0000', '#00ff00'];
		render(ColorField, {
			props: {
				name: 'brand',
				label: 'Brand Colour',
				presetColors: presets,
				showPresets: true,
				disabled: true
			}
		});
		const presetButtons = screen.getAllByRole('button');
		presetButtons.forEach((btn) => {
			expect(btn).toBeDisabled();
		});
	});
});

// ============================================================
// Cross-Component Accessibility Tests
// ============================================================
describe('Form Components Accessibility', () => {
	it('all text-based fields have associated labels', () => {
		render(TextField, { props: { name: 'test', label: 'Test' } });
		// Pairing, not a fixed id: the label's `for` must land on this input.
		const input = screen.getByRole('textbox');
		const label = screen.getByText('Test').closest('label')!;
		expect(input.id).toBeTruthy();
		expect(label).toHaveAttribute('for', input.id);
		expect(screen.getByLabelText('Test')).toBe(input);
	});

	it('keeps `name` as the submission key but not as the id', () => {
		render(TextField, { props: { name: 'email', label: 'Email' } });
		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('name', 'email');
		expect(input.id).not.toBe('field-email');
	});

	it('honours an explicit id override for label, help and error wiring', () => {
		render(TextField, {
			props: {
				id: 'signup-email',
				name: 'email',
				label: 'Email',
				helpText: 'We never share it.',
				error: 'Required',
				touched: true
			}
		});
		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('id', 'signup-email');
		expect(screen.getByLabelText('Email')).toBe(input);
		expect(input).toHaveAttribute('aria-describedby', 'signup-email-help');
		expect(input).toHaveAttribute('aria-errormessage', 'signup-email-error');
		expect(document.getElementById('signup-email-help')).toHaveTextContent('We never share it.');
		expect(document.getElementById('signup-email-error')).toHaveTextContent('Required');
	});

	it('help text and error ids resolve to the field\'s own elements', () => {
		render(TextareaField, {
			props: {
				name: 'bio',
				label: 'Bio',
				helpText: 'A short intro.',
				error: 'Too short',
				touched: true,
				maxlength: 100,
				showCharCount: true
			}
		});
		const textarea = screen.getByRole('textbox');
		const describedBy = textarea.getAttribute('aria-describedby')!.split(' ');
		expect(describedBy).toHaveLength(2);
		for (const id of describedBy) expect(document.getElementById(id)).toBeTruthy();
		expect(document.getElementById(describedBy[0])).toHaveTextContent('A short intro.');
		const errorId = textarea.getAttribute('aria-errormessage')!;
		expect(document.getElementById(errorId)).toHaveTextContent('Too short');
	});

	it('radio and checkbox groups are labelled by their visible label', () => {
		const options = [
			{ value: 'a', label: 'Alpha' },
			{ value: 'b', label: 'Beta' }
		];
		render(RadioGroup, { props: { name: 'pick', label: 'Pick one', options, helpText: 'Choose.' } });
		render(CheckboxGroup, { props: { name: 'many', label: 'Pick many', options } });
		expect(screen.getByRole('radiogroup', { name: 'Pick one' })).toBeInTheDocument();
		expect(screen.getByRole('group', { name: 'Pick many' })).toBeInTheDocument();
		const radioGroup = screen.getByRole('radiogroup');
		expect(document.getElementById(radioGroup.getAttribute('aria-describedby')!)).toHaveTextContent('Choose.');
	});

	it('error messages have alert role', () => {
		render(TextField, {
			props: {
				name: 'test',
				label: 'Test',
				error: 'Error message',
				touched: true
			}
		});
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it('required fields have aria-required', () => {
		render(TextField, {
			props: {
				name: 'test',
				label: 'Test',
				required: true
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
	});

	it('invalid fields have aria-invalid', () => {
		render(TextField, {
			props: {
				name: 'test',
				label: 'Test',
				error: 'Error',
				touched: true
			}
		});
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
	});
});
