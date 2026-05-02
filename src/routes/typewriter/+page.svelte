<script lang="ts">
	import { onMount } from 'svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Typewriter from '$lib/components/Typewriter.svelte';

	const shell = catalogShellPropsForSlug('/typewriter')!;

	const heroLines = [
		'Build beautiful interfaces.',
		'Ship with confidence.',
		'Zero dependencies.',
		'Pure Svelte 5 runes.'
	];

	const greetings = ['Hello, World!', 'Bonjour, le monde!', 'Hola, Mundo!', 'こんにちは世界！'];

	const codeSnippets = ['const app = new SvelteKit()', 'bun run dev', 'git push origin main'];

	const speedSamples = ['Type me at this speed.'];

	// Live state — sample the hero cycle once a second so we can show which
	// phrase is currently visible without piping reactivity through Typewriter.
	// onMount keeps the timer client-side and gives us a tidy cleanup hook so
	// navigating away doesn't leave the interval running.
	let clock = $state(0);
	onMount(() => {
		const id = setInterval(() => (clock = (clock + 1) % 1_000_000), 1000);
		return () => clearInterval(id);
	});

	// Hero typewriter cycle: each phrase gets pauseDuration + (typeSpeed * len)
	// so we can guess which phrase is showing without reading internal state.
	const heroPhraseDurations = heroLines.map((p) => 70 * p.length + 2500 + 50 * p.length + 200);
	const heroTotal = heroPhraseDurations.reduce((a, b) => a + b, 0);
	const heroIndex = $derived.by(() => {
		let elapsedMs = (clock * 1000) % heroTotal;
		for (let i = 0; i < heroPhraseDurations.length; i++) {
			if (elapsedMs < heroPhraseDurations[i]) return i;
			elapsedMs -= heroPhraseDurations[i];
		}
		return 0;
	});
</script>

<svelte:head>
	<title>Typewriter — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated text that types and deletes characters one-by-one with a blinking cursor, cycling through phrases. Zero dependencies."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Text', 'A11y', 'Zero deps']}
	codeExplanation="Typewriter runs a four-phase state machine — typing, pausing, deleting, waiting — driven by Svelte 5 $effect timers. The blinking cursor is pure CSS and the full target phrase is published via aria-label so screen readers announce the destination once instead of every keystroke."
>
	{#snippet demo()}
		<div class="tw-demo">
			<p class="tw-demo__lede">
				A four-phase state machine — type, pause, delete, wait — wrapped in a single span. Every
				section below mounts a different prop combination, all running at once.
			</p>

			<section class="tw-section">
				<h4>Hero · multi-phrase loop · typeSpeed 70 · pauseDuration 2500</h4>
				<p class="tw-section__hint">
					Four phrases cycle on a long pause. The status row shows which phrase the loop is
					currently revealing, so you can see the cycle without inspecting the DOM.
				</p>
				<div class="tw-card tw-card--hero">
					<span class="tw-hero">
						<Typewriter phrases={heroLines} typeSpeed={70} pauseDuration={2500} />
					</span>
				</div>
				<div class="tw-status" role="status" aria-live="polite">
					<span class="tw-status__label">Current phrase</span>
					<span class="tw-status__index">#{heroIndex + 1} of {heroLines.length}</span>
					<span class="tw-status__phrase">"{heroLines[heroIndex]}"</span>
				</div>
			</section>

			<section class="tw-section">
				<h4>Greetings · multilingual loop · typeSpeed 100 · deleteSpeed 60</h4>
				<p class="tw-section__hint">
					Mixed-script phrases — the per-character timing handles emoji and CJK glyphs identically
					because the loop indexes by code point.
				</p>
				<div class="tw-card">
					<span class="tw-greeting">
						<Typewriter
							phrases={greetings}
							typeSpeed={100}
							deleteSpeed={60}
							pauseDuration={1500}
						/>
					</span>
				</div>
			</section>

			<section class="tw-section">
				<h4>Single phrase · loop=false · types once and stops</h4>
				<p class="tw-section__hint">
					Disable looping for hero copy you want to land and rest. The cursor keeps blinking after
					the typing completes.
				</p>
				<div class="tw-card">
					<span class="tw-single">
						<Typewriter
							phrases={['This types once and stops.']}
							typeSpeed={60}
							loop={false}
							startDelay={500}
						/>
					</span>
				</div>
			</section>

			<section class="tw-section">
				<h4>Speed comparison · 60 vs 120 vs 250 ms per char</h4>
				<p class="tw-section__hint">
					Three identical phrases, three different typeSpeed values. Watch the rightmost row crawl
					— useful for when you want the typing motion itself to convey weight.
				</p>
				<div class="tw-grid">
					<div class="tw-card tw-card--small">
						<span class="tw-speed-tag">60ms</span>
						<span class="tw-speed-text">
							<Typewriter phrases={speedSamples} typeSpeed={60} pauseDuration={1500} />
						</span>
					</div>
					<div class="tw-card tw-card--small">
						<span class="tw-speed-tag">120ms</span>
						<span class="tw-speed-text">
							<Typewriter phrases={speedSamples} typeSpeed={120} pauseDuration={1500} />
						</span>
					</div>
					<div class="tw-card tw-card--small">
						<span class="tw-speed-tag">250ms</span>
						<span class="tw-speed-text">
							<Typewriter phrases={speedSamples} typeSpeed={250} pauseDuration={1500} />
						</span>
					</div>
				</div>
			</section>

			<section class="tw-section">
				<h4>Cursor variants · pipe · underscore · block · none</h4>
				<p class="tw-section__hint">
					cursorChar accepts any glyph; showCursor=false hides it entirely once the phrase finishes.
				</p>
				<div class="tw-grid">
					<div class="tw-card tw-card--small">
						<span class="tw-cursor-tag">'|' (default)</span>
						<span class="tw-cursor-text">
							<Typewriter phrases={['Pipe cursor']} typeSpeed={80} loop={true} pauseDuration={2000} />
						</span>
					</div>
					<div class="tw-card tw-card--small">
						<span class="tw-cursor-tag">'_' underscore</span>
						<span class="tw-cursor-text">
							<Typewriter phrases={['Underscore']} typeSpeed={80} loop={true} pauseDuration={2000} cursorChar="_" />
						</span>
					</div>
					<div class="tw-card tw-card--small">
						<span class="tw-cursor-tag">'▌' block</span>
						<span class="tw-cursor-text">
							<Typewriter phrases={['Block cursor']} typeSpeed={80} loop={true} pauseDuration={2000} cursorChar="▌" />
						</span>
					</div>
					<div class="tw-card tw-card--small">
						<span class="tw-cursor-tag">no cursor</span>
						<span class="tw-cursor-text">
							<Typewriter phrases={['No cursor at all']} typeSpeed={80} loop={true} pauseDuration={2000} showCursor={false} />
						</span>
					</div>
				</div>
			</section>

			<section class="tw-section">
				<h4>Terminal · cycling commands · cursorChar="_"</h4>
				<p class="tw-section__hint">
					A monospace surface with a green prompt. The blinking underscore mimics a real terminal
					caret.
				</p>
				<div class="tw-card tw-card--terminal">
					<span class="tw-terminal-prompt">$&nbsp;</span>
					<span class="tw-terminal">
						<Typewriter
							phrases={codeSnippets}
							typeSpeed={60}
							deleteSpeed={30}
							pauseDuration={3000}
							cursorChar="_"
						/>
					</span>
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
				<tr><td><code>phrases</code></td><td><code>string[]</code></td><td>required</td><td>Strings to cycle through.</td></tr>
				<tr><td><code>typeSpeed</code></td><td><code>number</code></td><td><code>80</code></td><td>Milliseconds per typed character.</td></tr>
				<tr><td><code>deleteSpeed</code></td><td><code>number</code></td><td><code>50</code></td><td>Milliseconds per deleted character.</td></tr>
				<tr><td><code>pauseDuration</code></td><td><code>number</code></td><td><code>2000</code></td><td>Hold time after a phrase completes.</td></tr>
				<tr><td><code>loop</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Loop the phrase list or run once.</td></tr>
				<tr><td><code>showCursor</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the blinking cursor.</td></tr>
				<tr><td><code>cursorChar</code></td><td><code>string</code></td><td><code>"|"</code></td><td>Cursor character — pipe, underscore, block.</td></tr>
				<tr><td><code>startDelay</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay before starting the first phrase.</td></tr>
				<tr><td><code>class</code></td><td><code>string</code></td><td><code>""</code></td><td>Extra class for the wrapper span.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tw-demo {
		display: grid;
		gap: 24px;
	}
	.tw-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.tw-section {
		display: grid;
		gap: 0.625rem;
	}
	.tw-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.tw-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.tw-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}
	.tw-card {
		padding: 2rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		text-align: center;
		color: var(--fg-1);
	}
	.tw-card--small {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
		min-height: 110px;
		justify-content: center;
	}
	.tw-card--hero {
		padding: 3rem 2rem;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--accent) 14%, var(--surface)) 0%,
			var(--surface) 100%
		);
	}
	.tw-hero {
		font-size: 1.75rem;
		font-weight: 700;
	}
	.tw-greeting {
		font-size: 1.5rem;
		font-weight: 600;
	}
	.tw-card--terminal {
		background: #0f172a;
		color: #e2e8f0;
		text-align: left;
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		border-color: #1e293b;
	}
	.tw-terminal-prompt {
		color: #10b981;
	}
	.tw-terminal {
		color: #e2e8f0;
	}
	.tw-single {
		font-size: 1.25rem;
		color: var(--fg-2);
	}
	.tw-status {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		background: color-mix(in srgb, var(--accent) 8%, var(--surface));
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 0.875rem;
		flex-wrap: wrap;
	}
	.tw-status__label {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.75rem;
		color: var(--fg-2);
	}
	.tw-status__index {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		color: var(--accent);
		font-weight: 600;
	}
	.tw-status__phrase {
		color: var(--fg-1);
		font-style: italic;
	}
	.tw-speed-tag,
	.tw-cursor-tag {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}
	.tw-speed-text,
	.tw-cursor-text {
		font-size: 1.05rem;
		font-weight: 500;
	}
</style>
