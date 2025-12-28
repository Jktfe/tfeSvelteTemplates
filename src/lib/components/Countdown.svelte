<!--
	============================================================
	Countdown - Animated Countdown Timer Component
	============================================================

	[CR] WHAT IT DOES
	Displays a countdown timer to a target date/time, showing the remaining
	time in days, hours, minutes, and/or seconds with smooth digit transitions.

	[NTL] THE SIMPLE VERSION
	Imagine a digital alarm clock counting backwards! You set a target date
	(like New Year's Eve), and this component shows how much time is left,
	updating every second with nice animations as the numbers change.

	============================================================

	FEATURES:
	- Multiple display formats: cards, labels, or compact
	- Configurable time units (days, hours, minutes, seconds)
	- Smooth CSS animations for digit changes
	- Customisable completion message
	- Callback when countdown finishes
	- Accessible with ARIA live regions
	- Zero external dependencies - pure CSS animations
	- Respects prefers-reduced-motion

	DEPENDENCIES:
	Zero external dependencies

	ACCESSIBILITY:
	- Keyboard: No interaction needed (display only)
	- Screen readers: Uses aria-live for updates, aria-label for units
	- Motion: Respects prefers-reduced-motion

	USAGE:
	<Countdown
		targetDate="2025-12-31T23:59:59"
		units={['days', 'hours', 'minutes', 'seconds']}
		format="cards"
		showLabels={true}
	/>

	PROPS:
	| Prop             | Type                    | Default                              | Description                          |
	|------------------|-------------------------|--------------------------------------|--------------------------------------|
	| targetDate       | Date/number/string      | required                             | Target date/time to count down to    |
	| units            | CountdownUnit[]         | ['days','hours','minutes','seconds'] | Which units to display               |
	| format           | 'compact'/'cards'/'labels' | 'cards'                           | Display format style                 |
	| showLabels       | boolean                 | true                                 | Show unit labels                     |
	| separator        | string                  | ':'                                  | Separator for compact format         |
	| padZeros         | boolean                 | true                                 | Pad single digits with zeros         |
	| completedMessage | string                  | "Time's up!"                         | Message when countdown finishes      |
	| onComplete       | () => void              | undefined                            | Callback when countdown reaches zero |
	| hideOnComplete   | boolean                 | false                                | Hide countdown when complete         |

	WARNINGS:
	None expected - component is self-contained

	============================================================
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { CountdownProps, CountdownUnit, CountdownSegment } from '$lib/types';

	// [CR] Extend base props with Svelte 5 patterns
	interface Props extends CountdownProps {}

	// [CR] Destructure props with sensible defaults using Svelte 5 $props() rune
	// [NTL] These are all the settings you can tweak to customise your countdown!
	let {
		targetDate, // [NTL] The date/time you're counting down to - required!
		units = ['days', 'hours', 'minutes', 'seconds'], // [NTL] Which time units to show
		format = 'cards', // [NTL] How to display: 'cards', 'labels', or 'compact'
		showLabels = true, // [NTL] Show "Days", "Hours" etc. under the numbers
		separator = ':', // [NTL] What goes between numbers in compact mode
		padZeros = true, // [NTL] Turn "5" into "05" for consistent width
		completedMessage = "Time's up!", // [NTL] What to show when countdown finishes
		onComplete, // [NTL] Your function to call when countdown reaches zero
		hideOnComplete = false // [NTL] Hide the whole thing when done?
	}: Props = $props();

	// ==========================================================================
	// STATE MANAGEMENT
	// ==========================================================================

	// [CR] Reactive state for the countdown values
	let segments = $state<CountdownSegment[]>([]);
	let isComplete = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// [CR] Track previous values for animation triggers
	let previousValues = $state<Record<CountdownUnit, number>>({
		days: -1,
		hours: -1,
		minutes: -1,
		seconds: -1
	});

	// ==========================================================================
	// HELPER FUNCTIONS
	// ==========================================================================

	/**
	 * [CR] Parse the target date from various input formats
	 * [NTL] This clever function accepts dates in multiple formats so you can
	 * pass a Date object, a timestamp number, or an ISO string - your choice!
	 */
	function parseTargetDate(target: Date | number | string): Date {
		if (target instanceof Date) {
			return target;
		}
		if (typeof target === 'number') {
			return new Date(target);
		}
		return new Date(target);
	}

	/**
	 * [CR] Get the label for a time unit
	 * [NTL] Converts 'hours' into 'Hours' (capitalised) for display
	 */
	function getUnitLabel(unit: CountdownUnit, value: number): string {
		const labels: Record<CountdownUnit, { singular: string; plural: string }> = {
			days: { singular: 'Day', plural: 'Days' },
			hours: { singular: 'Hour', plural: 'Hours' },
			minutes: { singular: 'Minute', plural: 'Minutes' },
			seconds: { singular: 'Second', plural: 'Seconds' }
		};
		return value === 1 ? labels[unit].singular : labels[unit].plural;
	}

	/**
	 * [CR] Format a number with optional zero padding
	 * [NTL] Makes sure 5 becomes "05" so all your numbers line up nicely
	 */
	function formatValue(value: number, pad: boolean): string {
		if (!pad) return String(value);
		return String(value).padStart(2, '0');
	}

	/**
	 * [CR] Calculate time remaining and update segments
	 * [NTL] This is the heart of the countdown - it figures out how many days,
	 * hours, minutes, and seconds are left until the target date
	 */
	function calculateTimeRemaining(): void {
		const target = parseTargetDate(targetDate);

		// [CR] Validate the parsed date - handle invalid input gracefully
		// [NTL] If someone passes garbage like "not-a-date", we show zeros instead of NaN
		if (isNaN(target.getTime())) {
			segments = units.map((unit) => ({
				value: 0,
				label: getUnitLabel(unit, 0),
				unit
			}));
			// [CR] Stop the interval if running - no point ticking with invalid date
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
			return;
		}

		const now = new Date();
		const difference = target.getTime() - now.getTime();

		// [CR] Check if countdown has completed
		if (difference <= 0) {
			if (!isComplete) {
				isComplete = true;
				segments = units.map((unit) => ({
					value: 0,
					label: getUnitLabel(unit, 0),
					unit
				}));

				// [NTL] Call the completion callback if provided
				if (onComplete) {
					onComplete();
				}
			}
			return;
		}

		// [CR] Calculate each time unit
		// [NTL] Here's the maths! We divide milliseconds into days, hours, etc.
		const totalSeconds = Math.floor(difference / 1000);
		const totalMinutes = Math.floor(totalSeconds / 60);
		const totalHours = Math.floor(totalMinutes / 60);
		const totalDays = Math.floor(totalHours / 24);

		const calculatedValues: Record<CountdownUnit, number> = {
			days: totalDays,
			hours: totalHours % 24,
			minutes: totalMinutes % 60,
			seconds: totalSeconds % 60
		};

		// [CR] Build segments array based on requested units
		const newSegments: CountdownSegment[] = units.map((unit) => {
			const value = calculatedValues[unit];
			return {
				value,
				label: getUnitLabel(unit, value),
				unit
			};
		});

		// [CR] Update previous values for animation triggers
		for (const unit of units) {
			previousValues[unit] = segments.find((s) => s.unit === unit)?.value ?? -1;
		}

		segments = newSegments;
	}

	/**
	 * [CR] Check if a segment's value just changed (for animation)
	 * [NTL] This lets us add a little "flip" animation when a number changes
	 */
	function hasValueChanged(unit: CountdownUnit, currentValue: number): boolean {
		return previousValues[unit] !== currentValue && previousValues[unit] !== -1;
	}

	// ==========================================================================
	// LIFECYCLE
	// ==========================================================================

	onMount(() => {
		// [CR] Initial calculation
		calculateTimeRemaining();

		// [CR] Update every second
		// [NTL] This makes the countdown "tick" like a clock
		intervalId = setInterval(() => {
			calculateTimeRemaining();
		}, 1000);
	});

	onDestroy(() => {
		// [CR] Clean up interval on component destruction
		// [NTL] Important! We stop the timer when the component is removed
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<!-- [CR] Main countdown container with format-specific styling -->
{#if !hideOnComplete || !isComplete}
	<div
		class="countdown countdown--{format}"
		role="timer"
		aria-label="Countdown timer"
		aria-live="polite"
	>
		{#if isComplete}
			<!-- [CR] Completion message displayed when countdown reaches zero -->
			<div class="countdown__complete">
				{completedMessage}
			</div>
		{:else}
			<!-- [CR] Countdown segments display -->
			<div class="countdown__segments">
				{#each segments as segment, index (segment.unit)}
					<!-- [CR] Add separator between segments in compact mode -->
					{#if format === 'compact' && index > 0}
						<span class="countdown__separator" aria-hidden="true">{separator}</span>
					{/if}

					<div
						class="countdown__segment"
						class:countdown__segment--changed={hasValueChanged(segment.unit, segment.value)}
						aria-label="{segment.value} {segment.label}"
					>
						<!-- [CR] The number display -->
						<span class="countdown__value">
							{formatValue(segment.value, padZeros)}
						</span>

						<!-- [CR] The unit label (if enabled) -->
						{#if showLabels && format !== 'compact'}
							<span class="countdown__label">
								{segment.label}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* ==========================================================================
	 * BASE STYLES
	 * [CR] Core styles that apply to all format variants
	 * ========================================================================== */

	.countdown {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.countdown__segments {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.countdown__segment {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.countdown__value {
		font-variant-numeric: tabular-nums; /* [NTL] Makes all digits the same width */
		font-weight: 700;
		line-height: 1;
	}

	.countdown__label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		margin-top: 0.25rem;
	}

	.countdown__separator {
		font-weight: 700;
		opacity: 0.5;
	}

	.countdown__complete {
		font-size: 1.5rem;
		font-weight: 700;
		color: #10b981;
		animation: complete-bounce 0.5s ease-out;
	}

	/* ==========================================================================
	 * CARDS FORMAT
	 * [CR] Each time unit displayed in a separate card
	 * [NTL] This is the most visually impactful style - like a flip clock!
	 * ========================================================================== */

	.countdown--cards .countdown__segments {
		gap: 1rem;
	}

	.countdown--cards .countdown__segment {
		background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
		border-radius: 0.5rem;
		padding: 1rem 1.25rem;
		min-width: 4.5rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -2px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.countdown--cards .countdown__value {
		font-size: 2.5rem;
		color: #ffffff;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.countdown--cards .countdown__label {
		color: #94a3b8;
		margin-top: 0.5rem;
	}

	/* [CR] Animation for value changes */
	.countdown--cards .countdown__segment--changed {
		animation: card-flip 0.3s ease-out;
	}

	/* ==========================================================================
	 * LABELS FORMAT
	 * [CR] Numbers with labels in a cleaner, minimal style
	 * [NTL] Good for when you want something less dramatic but still readable
	 * ========================================================================== */

	.countdown--labels .countdown__segments {
		gap: 2rem;
	}

	.countdown--labels .countdown__value {
		font-size: 3rem;
		color: #1e293b;
	}

	.countdown--labels .countdown__label {
		font-size: 0.875rem;
		color: #64748b;
	}

	.countdown--labels .countdown__segment--changed .countdown__value {
		animation: value-change 0.3s ease-out;
	}

	/* ==========================================================================
	 * COMPACT FORMAT
	 * [CR] Single line with colons (like a digital clock)
	 * [NTL] Takes up the least space - great for headers or tight spots
	 * ========================================================================== */

	.countdown--compact .countdown__segments {
		gap: 0;
	}

	.countdown--compact .countdown__value {
		font-size: 2rem;
		color: #1e293b;
		padding: 0 0.125rem;
	}

	.countdown--compact .countdown__separator {
		font-size: 2rem;
		color: #1e293b;
		padding: 0 0.25rem;
	}

	.countdown--compact .countdown__segment--changed .countdown__value {
		animation: value-blink 0.2s ease-out;
	}

	/* ==========================================================================
	 * ANIMATIONS
	 * [CR] Subtle animations for number changes
	 * [NTL] These little touches make the countdown feel alive!
	 * ========================================================================== */

	@keyframes card-flip {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes value-change {
		0% {
			transform: translateY(-4px);
			opacity: 0.5;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes value-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	@keyframes complete-bounce {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* ==========================================================================
	 * ACCESSIBILITY
	 * [CR] Respect user's motion preferences
	 * [NTL] Some people find animations distracting or nauseating - we respect that
	 * ========================================================================== */

	@media (prefers-reduced-motion: reduce) {
		.countdown__segment--changed,
		.countdown__complete {
			animation: none !important;
		}
	}

	/* ==========================================================================
	 * RESPONSIVE
	 * [CR] Adjust sizes for smaller screens
	 * ========================================================================== */

	@media (max-width: 640px) {
		.countdown--cards .countdown__segments {
			gap: 0.5rem;
		}

		.countdown--cards .countdown__segment {
			padding: 0.75rem 1rem;
			min-width: 3.5rem;
		}

		.countdown--cards .countdown__value {
			font-size: 1.75rem;
		}

		.countdown--labels .countdown__segments {
			gap: 1rem;
		}

		.countdown--labels .countdown__value {
			font-size: 2rem;
		}

		.countdown--compact .countdown__value,
		.countdown--compact .countdown__separator {
			font-size: 1.5rem;
		}
	}
</style>
