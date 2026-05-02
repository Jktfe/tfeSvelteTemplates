<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Countdown from '$lib/components/Countdown.svelte';

	const shell = catalogShellPropsForSlug('/countdown')!;

	const now = new Date();
	const eventDate = new Date('2026-12-31T23:59:59'); // event countdown to year end
	const farFuture = new Date('2099-01-01T00:00:00'); // unrealistic large numbers
	const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
	const pomodoroEnd = new Date(now.getTime() + 25 * 60 * 1000); // 25 min pomodoro
	const pastDate = new Date('2020-01-01T00:00:00');

	// Toast state for the onComplete demo. We seed a target a few seconds out
	// and let the callback flip the toast text when the timer actually fires.
	let completionToast = $state('');
	let resetTrigger = $state(0);
	let demoTarget = $state(new Date(Date.now() + 10 * 1000));

	function handleComplete() {
		completionToast = `🎉 Timer hit zero at ${new Date().toLocaleTimeString()}.`;
	}

	function restartDemoTimer() {
		demoTarget = new Date(Date.now() + 10 * 1000);
		completionToast = '';
		resetTrigger++;
	}
</script>

<svelte:head>
	<title>Countdown — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated countdown timer with cards, labels, and compact formats. Configurable units, completion callback, accessible."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Time', 'A11y', 'Zero deps']}
	codeExplanation="Countdown ticks once a second, recomputing the time remaining and slicing it into the requested unit list. Three formats — cards, labels, compact — share the same numeric core. ARIA live regions announce the changing values politely, and prefers-reduced-motion suppresses the digit-flip animation."
>
	{#snippet demo()}
		<div class="cd-demo">
			<p class="cd-demo__lede">
				Each section below mounts a Countdown with different <code>format</code> and
				<code>units</code> combinations. The interactive demo at the bottom triggers a real
				<code>onComplete</code> callback when its 10-second timer hits zero.
			</p>

			<section class="cd-section">
				<h4>Event countdown · cards format · all four units · 31 Dec 2026</h4>
				<p class="cd-section__hint">
					The default — each unit in a dark gradient card with a flip animation on every change.
					Best used for marquee event hero sections.
				</p>
				<div class="cd-stage cd-stage--dark">
					<Countdown targetDate={eventDate} format="cards" />
				</div>
			</section>

			<section class="cd-section">
				<h4>Digital format · compact · minutes &amp; seconds only · pomodoro timer</h4>
				<p class="cd-section__hint">
					<code>format="compact"</code> with just two units gives a clean digital-clock look —
					ideal for short timers like Pomodoro intervals or lap counters.
				</p>
				<div class="cd-stage">
					<Countdown
						targetDate={pomodoroEnd}
						format="compact"
						units={['minutes', 'seconds']}
						separator=":"
					/>
				</div>
			</section>

			<section class="cd-section">
				<h4>Labels format · large numbers · quieter than cards</h4>
				<p class="cd-section__hint">
					Numbers without the card chrome — works in marketing pages where the countdown should
					not dominate visually.
				</p>
				<div class="cd-stage">
					<Countdown targetDate={eventDate} format="labels" />
				</div>
			</section>

			<section class="cd-section">
				<h4>Far-future · cards format · big numbers · year 2099</h4>
				<p class="cd-section__hint">
					Pointing at a date decades away exercises the layout — five-digit days fit cleanly thanks
					to <code>tabular-nums</code>.
				</p>
				<div class="cd-stage cd-stage--dark">
					<Countdown targetDate={farFuture} format="cards" />
				</div>
			</section>

			<section class="cd-section">
				<h4>Custom units · pick which segments appear</h4>
				<p class="cd-section__hint">
					Pass any subset and order of <code>['days', 'hours', 'minutes', 'seconds']</code> via
					the <code>units</code> prop. The remaining time still calculates correctly — only the
					display narrows.
				</p>
				<div class="cd-grid">
					<div class="cd-stage">
						<h5>Days only</h5>
						<Countdown targetDate={eventDate} format="cards" units={['days']} />
					</div>
					<div class="cd-stage">
						<h5>Hours &amp; minutes</h5>
						<Countdown targetDate={threeDaysFromNow} format="cards" units={['hours', 'minutes']} />
					</div>
					<div class="cd-stage">
						<h5>Just seconds</h5>
						<Countdown targetDate={threeDaysFromNow} format="cards" units={['seconds']} />
					</div>
				</div>
			</section>

			<section class="cd-section">
				<h4>onComplete callback · 10s timer with toast</h4>
				<p class="cd-section__hint">
					This countdown lasts ten seconds. When it hits zero, the
					<code>onComplete</code> callback fires once and updates the toast. Press the button to
					reset and watch it fire again.
				</p>
				<div class="cd-stage cd-stage--interactive">
					{#key resetTrigger}
						<Countdown
							targetDate={demoTarget}
							format="cards"
							units={['minutes', 'seconds']}
							onComplete={handleComplete}
							completedMessage="Done!"
						/>
					{/key}
					<button type="button" class="cd-restart" onclick={restartDemoTimer}>Restart 10s timer</button>
					{#if completionToast}
						<div class="cd-toast" role="status" aria-live="polite">{completionToast}</div>
					{/if}
				</div>
			</section>

			<section class="cd-section">
				<h4>Completion message · past date renders the message</h4>
				<p class="cd-section__hint">
					When the target is already in the past, the component skips the digits entirely and
					renders <code>completedMessage</code> with a bounce animation.
				</p>
				<div class="cd-stage">
					<Countdown
						targetDate={pastDate}
						format="labels"
						completedMessage="🎉 This event has already happened!"
					/>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>targetDate</code></td><td><code>Date | number | string</code></td><td>required</td><td>When to count down to.</td></tr>
				<tr><td><code>units</code></td><td><code>CountdownUnit[]</code></td><td>days/hours/min/sec</td><td>Which units appear.</td></tr>
				<tr><td><code>format</code></td><td><code>"cards" | "labels" | "compact"</code></td><td><code>"cards"</code></td><td>Display preset.</td></tr>
				<tr><td><code>showLabels</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show unit labels.</td></tr>
				<tr><td><code>separator</code></td><td><code>string</code></td><td><code>":"</code></td><td>Separator for compact format.</td></tr>
				<tr><td><code>padZeros</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Pad single digits with zeros.</td></tr>
				<tr><td><code>completedMessage</code></td><td><code>string</code></td><td><code>"Time's up!"</code></td><td>Message at completion.</td></tr>
				<tr><td><code>onComplete</code></td><td><code>() => void</code></td><td><code>undefined</code></td><td>Callback fired once when reaching zero.</td></tr>
				<tr><td><code>hideOnComplete</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Hide entirely when complete.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cd-demo {
		display: grid;
		gap: 1.5rem;
	}
	.cd-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.cd-demo__lede code,
	.cd-section__hint code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.cd-section {
		display: grid;
		gap: 0.625rem;
	}
	.cd-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.cd-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.cd-stage {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		padding: 2.5rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		color: var(--fg-1);
	}
	.cd-stage h5 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.cd-stage--dark {
		background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
		border-color: #1e293b;
		color: #f1f5f9;
	}
	.cd-stage--interactive {
		gap: 1rem;
	}
	.cd-restart {
		padding: 0.625rem 1.25rem;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: var(--r-1);
		font-weight: 600;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.cd-restart:hover {
		filter: brightness(1.1);
	}
	.cd-toast {
		padding: 0.625rem 1rem;
		background: color-mix(in srgb, #10b981 15%, var(--surface));
		border: 1px solid #10b981;
		border-radius: var(--r-2);
		color: var(--fg-1);
		font-size: 0.875rem;
		font-weight: 500;
	}
	.cd-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}
</style>
