<script lang="ts">
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

	const greetings = [
		'Hello, World!',
		'Bonjour, le monde!',
		'Hola, Mundo!',
		'こんにちは世界！'
	];

	const codeSnippets = [
		'const app = new SvelteKit()',
		'bun run dev',
		'git push origin main'
	];
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
			<div class="tw-card tw-card--hero">
				<span class="tw-hero">
					<Typewriter phrases={heroLines} typeSpeed={70} pauseDuration={2500} />
				</span>
			</div>

			<div class="tw-card">
				<span class="tw-greeting">
					<Typewriter phrases={greetings} typeSpeed={100} deleteSpeed={60} pauseDuration={1500} />
				</span>
			</div>

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
		gap: 16px;
	}
	.tw-card {
		padding: 2rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		text-align: center;
		color: var(--fg-1);
	}
	.tw-card--hero {
		padding: 3rem 2rem;
		background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--surface)) 0%, var(--surface) 100%);
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
</style>
