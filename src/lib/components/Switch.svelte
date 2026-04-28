<script lang="ts">
	/*
	 * Switch
	 *
	 * iOS-style boolean toggle. The single source of truth is the `checked`
	 * prop, which is `$bindable` so consumers can two-way bind:
	 *
	 *   <Switch bind:checked={notifications} label="Email notifications" />
	 *
	 * Uses a native <button role="switch"> so screen readers announce
	 * "switch, on" / "switch, off" without any custom keyboard shim — the
	 * browser already maps Space + Enter to click on a button. Clicking the
	 * label text also flips the switch (the label is wrapped in a real
	 * <label for>).
	 *
	 * Animation is a CSS transform on the thumb. prefers-reduced-motion
	 * disables it (instant snap).
	 */

	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'success' | 'danger';

	type Props = {
		checked?: boolean;
		label?: string;
		labelPosition?: 'left' | 'right';
		size?: Size;
		variant?: Variant;
		disabled?: boolean;
		id?: string;
		ariaLabel?: string;
		onChange?: (checked: boolean) => void;
		class?: string;
	};

	let {
		checked = $bindable(false),
		label = '',
		labelPosition = 'right',
		size = 'md',
		variant = 'default',
		disabled = false,
		id,
		ariaLabel,
		onChange,
		class: className = ''
	}: Props = $props();

	const inputId = $derived(id ?? `switch-${Math.random().toString(36).slice(2, 9)}`);

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onChange?.(checked);
	}
</script>

<div class="switch-wrapper switch-{size} {className}" class:switch-disabled={disabled}>
	{#if label && labelPosition === 'left'}
		<label class="switch-label switch-label-left" for={inputId}>{label}</label>
	{/if}

	<button
		type="button"
		id={inputId}
		role="switch"
		aria-checked={checked}
		aria-label={ariaLabel ?? (label ? undefined : 'Toggle')}
		{disabled}
		class="switch-track switch-{variant}"
		class:switch-on={checked}
		onclick={toggle}
	>
		<span class="switch-thumb" aria-hidden="true"></span>
	</button>

	{#if label && labelPosition === 'right'}
		<label class="switch-label switch-label-right" for={inputId}>{label}</label>
	{/if}
</div>

<style>
	.switch-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.switch-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.switch-label {
		font-size: 0.9rem;
		color: #1a202c;
		user-select: none;
		cursor: pointer;
	}

	.switch-disabled .switch-label {
		cursor: not-allowed;
	}

	.switch-track {
		position: relative;
		flex: none;
		display: inline-block;
		border: 0;
		padding: 0;
		background-color: #cbd5e1;
		border-radius: 9999px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.switch-track:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.switch-track:disabled {
		cursor: not-allowed;
	}

	/* Sizes — track width/height */
	.switch-sm .switch-track {
		width: 32px;
		height: 18px;
	}
	.switch-md .switch-track {
		width: 44px;
		height: 24px;
	}
	.switch-lg .switch-track {
		width: 56px;
		height: 32px;
	}

	.switch-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		background-color: #ffffff;
		border-radius: 9999px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.switch-sm .switch-thumb {
		width: 14px;
		height: 14px;
	}
	.switch-md .switch-thumb {
		width: 20px;
		height: 20px;
	}
	.switch-lg .switch-thumb {
		width: 28px;
		height: 28px;
	}

	/* "On" state thumb position — track width minus thumb width minus 4px (2px each side) */
	.switch-sm.switch-wrapper .switch-on .switch-thumb {
		transform: translateX(14px);
	}
	.switch-md.switch-wrapper .switch-on .switch-thumb {
		transform: translateX(20px);
	}
	.switch-lg.switch-wrapper .switch-on .switch-thumb {
		transform: translateX(24px);
	}

	/* Variant colours when on */
	.switch-on.switch-default {
		background-color: #146ef5;
	}
	.switch-on.switch-success {
		background-color: #16a34a;
	}
	.switch-on.switch-danger {
		background-color: #dc2626;
	}

	@media (prefers-reduced-motion: reduce) {
		.switch-track,
		.switch-thumb {
			transition: none;
		}
	}
</style>
