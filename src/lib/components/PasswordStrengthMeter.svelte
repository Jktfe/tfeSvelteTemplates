<!--
  ============================================================
  PASSWORD STRENGTH METER
  ============================================================

  WHAT
  A read-only meter that scores a password string against a set of
  rules and shows a segmented strength bar, a Weak/Fair/Good/Strong
  label, and an optional pass/fail checklist. It does NOT contain the
  password <input> — consumers own their input and pass its value in.

  WHY
  Reach for this when you want live "how strong is my password" feedback
  next to a sign-up or change-password field, without coupling the meter
  to a particular form library. Because it is a pure function of `value`,
  you can drive it from any input, a bindable store, or a derived value.

  FEATURES
  - Rule-based scoring (default: min length 8, lower, upper, digit, symbol)
  - Override the rule set entirely via the `rules` prop
  - Four-bucket strength mapping → segmented bar + text label
  - Optional checklist with inline tick / cross SVG per rule
  - Theme tokens with sensible red / amber / lime / green fallbacks

  ACCESSIBILITY
  - The strength label sits in a concise aria-live="polite" status line so
    screen readers hear "Password strength: Strong" when it changes —
    the password itself is never announced.
  - Only the status line is live; the checklist is not, to avoid chatter.
  - Checklist state is conveyed in text ("met" / "not met"), not by colour
    or icon alone; the tick / cross SVGs are aria-hidden.
  - The bar-fill transition is gated on prefers-reduced-motion.

  DEPENDENCIES
  Zero external dependencies. Inline SVG icons + scoped CSS only.

  PERFORMANCE
  Scoring is a handful of regex tests recomputed via $derived only when
  `value` (or `rules`) changes — negligible cost even on every keystroke.

  USAGE
  <script lang="ts">
    let password = $state('');
  </script>
  <input type="password" bind:value={password} />
  <PasswordStrengthMeter value={password} />

  PROPS
  | Prop          | Type              | Default | Description |
  |---------------|-------------------|---------|-------------|
  | value         | string            | ''      | The password to score (read-only) |
  | rules         | PasswordRule[]    | 5 rules | Override the rule set |
  | showChecklist | boolean           | true    | Show the per-rule pass/fail list |
  | showLabel     | boolean           | true    | Show the Weak/Fair/Good/Strong label |
  | class         | string            | ''      | Extra classes on the wrapper |
  ============================================================
-->

<script lang="ts">
	/**
	 * A single scoring rule. `test` returns true when the password
	 * satisfies the rule; `label` is the human-readable requirement.
	 */
	export interface PasswordRule {
		id: string;
		label: string;
		test: (value: string) => boolean;
	}

	interface Props {
		value?: string;
		rules?: PasswordRule[];
		showChecklist?: boolean;
		showLabel?: boolean;
		class?: string;
	}

	// The default rule set — the common "at least 8 chars + mixed case +
	// digit + symbol" policy. Override wholesale via the `rules` prop.
	const DEFAULT_RULES: PasswordRule[] = [
		{ id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
		{ id: 'lowercase', label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
		{ id: 'uppercase', label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
		{ id: 'digit', label: 'A number', test: (v) => /\d/.test(v) },
		{ id: 'symbol', label: 'A symbol', test: (v) => /[^A-Za-z0-9]/.test(v) }
	];

	let {
		value = '',
		rules = DEFAULT_RULES,
		showChecklist = true,
		showLabel = true,
		class: extraClass = ''
	}: Props = $props();

	// The four buckets, lowest → highest. Index maps directly to the label
	// and to the CSS class that picks a colour token.
	const LEVELS = ['Weak', 'Fair', 'Good', 'Strong'] as const;
	const SEGMENTS = 4;
	const SEGMENT_INDICES = [0, 1, 2, 3];

	// Evaluate every rule against the current value. Recomputes only when
	// `value` or `rules` change.
	let results = $derived(rules.map((rule) => ({ rule, pass: rule.test(value) })));

	let passedCount = $derived(results.filter((r) => r.pass).length);

	// Map the satisfied-rule fraction onto 0..4 filled segments. An empty or
	// all-failing password fills nothing; anything with at least one rule met
	// shows at least one segment so the bar never looks dead while typing.
	let filledSegments = $derived.by(() => {
		if (rules.length === 0 || passedCount === 0) return 0;
		const fraction = passedCount / rules.length;
		return Math.min(SEGMENTS, Math.max(1, Math.ceil(fraction * SEGMENTS)));
	});

	// Level index drives both the label and the active colour. 0 filled still
	// reads as "Weak" (index 0) so an empty field has a sensible label.
	let levelIndex = $derived(Math.max(0, filledSegments - 1));
	let levelLabel = $derived(LEVELS[levelIndex]);
</script>

<div
	class="psm psm--level-{levelIndex} {extraClass}"
	class:psm--empty={filledSegments === 0}
>
	<!-- Segmented bar: SEGMENTS blocks; the first `filledSegments` are lit.
	     aria-hidden because the label status line below carries the meaning. -->
	<div class="psm-bar" aria-hidden="true">
		{#each SEGMENT_INDICES as i (i)}
			<span class="psm-seg" class:is-filled={i < filledSegments}></span>
		{/each}
	</div>

	{#if showLabel}
		<!-- The ONLY live region: a concise status line. The password is never
		     placed here, so assistive tech hears strength changes, not the secret. -->
		<p class="psm-label" aria-live="polite">
			Password strength: <strong class="psm-label-value">{levelLabel}</strong>
		</p>
	{/if}

	{#if showChecklist}
		<ul class="psm-checklist">
			{#each results as { rule, pass } (rule.id)}
				<li class="psm-rule" class:is-pass={pass} class:is-fail={!pass}>
					{#if pass}
						<svg class="psm-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
							<path
								d="M13.5 4.5 6.5 11.5 3 8"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{:else}
						<svg class="psm-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
							<path
								d="M4 4 12 12 M12 4 4 12"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					{/if}
					<span class="psm-rule-label">{rule.label}</span>
					<!-- Text carries the state for screen readers (not colour/icon alone). -->
					<span class="psm-visually-hidden">{pass ? '— met' : '— not met'}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.psm {
		/* Strength colours — sensible fallbacks; retheme by overriding these
		   tokens on .psm with ≥2-class specificity (see docs/THEMING.md). */
		--psm-weak: #ef4444; /* red */
		--psm-fair: #f59e0b; /* amber */
		--psm-good: #a3e635; /* lime */
		--psm-strong: #22c55e; /* green */
		--psm-track: var(--surface-2, #e5e7eb);
		--psm-fg: var(--fg-1, #1a1a1a);
		--psm-fg-muted: var(--fg-3, #6b7280);

		display: grid;
		gap: 8px;
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	/* The active colour follows the level; each level class re-points it. */
	.psm--level-0 {
		--psm-active: var(--psm-weak);
	}
	.psm--level-1 {
		--psm-active: var(--psm-fair);
	}
	.psm--level-2 {
		--psm-active: var(--psm-good);
	}
	.psm--level-3 {
		--psm-active: var(--psm-strong);
	}

	.psm-bar {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 4px;
	}

	.psm-seg {
		height: 6px;
		border-radius: 999px;
		background: var(--psm-track);
		transition: background-color 0.25s ease;
	}

	.psm-seg.is-filled {
		background: var(--psm-active);
	}

	.psm-label {
		margin: 0;
		font-size: 13px;
		color: var(--psm-fg-muted);
	}

	.psm-label-value {
		color: var(--psm-active);
		font-weight: 600;
	}

	/* Empty state: keep the label neutral rather than shouting "Weak" in red. */
	.psm--empty .psm-label-value {
		color: var(--psm-fg-muted);
	}

	.psm-checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 4px;
	}

	.psm-rule {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--psm-fg-muted);
	}

	.psm-rule.is-pass {
		color: var(--psm-fg);
	}

	.psm-icon {
		flex: none;
		color: var(--psm-fg-muted);
	}

	.psm-rule.is-pass .psm-icon {
		color: var(--psm-strong);
	}

	.psm-rule.is-fail .psm-icon {
		color: var(--psm-weak);
	}

	.psm-visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
		white-space: nowrap;
	}

	/* Respect reduced-motion: no colour crossfade on the bar. */
	@media (prefers-reduced-motion: reduce) {
		.psm-seg {
			transition: none;
		}
	}

	/* Dark mode: only the neutral track flips; the strength hues read fine on
	   both schemes and stay constant so users learn the colour language. */
	@media (prefers-color-scheme: dark) {
		.psm {
			--psm-track: var(--surface-2, #2a2d31);
		}
	}
</style>
