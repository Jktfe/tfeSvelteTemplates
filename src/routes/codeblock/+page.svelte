<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import type { CodeBlockVariant, CodeBlockSize } from '$lib/components/CodeBlock.svelte';

	const shell = catalogShellPropsForSlug('/codeblock')!;

	let activeVariant = $state<CodeBlockVariant>('lined');
	let activeSize = $state<CodeBlockSize>('md');
	let activeTheme = $state<'light' | 'dark'>('dark');
	let activeLang = $state<'ts' | 'js' | 'svelte' | 'json' | 'bash'>('ts');
	let activeWrap = $state(false);
	let activeHighlight = $state('');

	const variantOptions: Array<{ id: CodeBlockVariant; label: string; hint: string }> = [
		{ id: 'plain', label: 'Plain', hint: 'No chrome' },
		{ id: 'lined', label: 'Lined', hint: 'Number gutter' },
		{ id: 'titled', label: 'Titled', hint: 'Header bar' },
		{ id: 'diff', label: 'Diff', hint: '+/- markers' },
		{ id: 'terminal', label: 'Terminal', hint: 'Shell window' }
	];

	const sizeOptions: Array<{ id: CodeBlockSize; label: string }> = [
		{ id: 'sm', label: 'Small' },
		{ id: 'md', label: 'Medium' },
		{ id: 'lg', label: 'Large' }
	];

	const themeOptions: Array<{ id: 'light' | 'dark'; label: string }> = [
		{ id: 'dark', label: 'Dark' },
		{ id: 'light', label: 'Light' }
	];

	const langSnippets: Record<typeof activeLang, string> = {
		ts: `interface User {
  name: string;
  age: number;
  active: boolean;
}

const ada: User = {
  name: 'Ada Lovelace',
  age: 36,
  active: true
};

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}`,
		js: `const greet = (name) => \`Hello, \${name}!\`;

const names = ['world', 'friend', 'reader'];
names.forEach((n) => console.log(greet(n)));

async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}`,
		svelte: `<` + `script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
<` + `/script>

<button on:click={() => count++}>
  Clicked {count} times (doubled: {doubled})
</button>

{#if count > 5}
  <p>That's a lot of clicks!</p>
{/if}`,
		json: `{
  "name": "tfe-svelte-templates",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}`,
		bash: `#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/site"
DATE=$(date +%Y-%m-%d)

if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
fi

for f in *.txt; do
  echo "Archiving $f"
done`
	};

	const diffSnippet = ` function greet(name) {
-  console.log('hi ' + name);
+  console.log(\`hi \${name}\`);
   return name;
 }

 const names = ['world'];
-names.forEach(n => greet(n));
+for (const n of names) {
+  greet(n);
+}`;
</script>

<svelte:head>
	<title>CodeBlock — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Token-coloured source-code display with five variants, three sizes, six languages, and a copy button — built on a tiny in-house tokenizer."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Code', 'Theme-aware', 'Zero deps']}
	codeExplanation="CodeBlock pairs a small in-house tokenizer (~5 KB) with five visual variants and three sizes. Plain renders a bare pre, lined adds a gutter, titled renders a chrome header, diff highlights +/- lines, terminal renders a window with a shell prompt. The CodeBlock above this paragraph (in the Implementation panel) is rendered automatically by the page shell — the live demo below shows variants, languages, and sizes."
>
	{#snippet demo()}
		<div class="cb-demo">
			<section class="cb-controls">
				<h3>Live preview</h3>
				<p class="cb-hint">Mix and match variants, sizes, themes, and languages.</p>

				<div class="cb-control-group">
					<span class="cb-control-label">Variant</span>
					<div class="cb-button-row">
						{#each variantOptions as opt (opt.id)}
							<button
								type="button"
								class:active={activeVariant === opt.id}
								onclick={() => (activeVariant = opt.id)}
							>
								<span class="cb-opt-label">{opt.label}</span>
								<span class="cb-opt-hint">{opt.hint}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="cb-control-group">
					<span class="cb-control-label">Size</span>
					<div class="cb-button-row">
						{#each sizeOptions as opt (opt.id)}
							<button type="button" class:active={activeSize === opt.id} onclick={() => (activeSize = opt.id)}>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="cb-control-group">
					<span class="cb-control-label">Theme</span>
					<div class="cb-button-row">
						{#each themeOptions as opt (opt.id)}
							<button type="button" class:active={activeTheme === opt.id} onclick={() => (activeTheme = opt.id)}>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="cb-control-group">
					<span class="cb-control-label">Language</span>
					<div class="cb-button-row">
						{#each Object.keys(langSnippets) as l (l)}
							<button type="button" class:active={activeLang === l} onclick={() => (activeLang = l as never)}>
								{l}
							</button>
						{/each}
					</div>
				</div>

				<div class="cb-control-group">
					<span class="cb-control-label">Extras</span>
					<label class="cb-toggle">
						<input type="checkbox" bind:checked={activeWrap} />
						Soft-wrap
					</label>
					<label class="cb-toggle cb-highlight-input">
						Highlight
						<input
							type="text"
							placeholder="e.g. 1,3-5"
							bind:value={activeHighlight}
							aria-label="Highlight line ranges"
						/>
					</label>
				</div>
			</section>

			<section class="cb-preview">
				<CodeBlock
					code={activeVariant === 'diff' ? diffSnippet : langSnippets[activeLang]}
					language={activeLang}
					variant={activeVariant}
					size={activeSize}
					theme={activeTheme}
					wrap={activeWrap}
					highlight={activeHighlight}
					title={activeVariant === 'titled' ? 'Live preview' : undefined}
					fileName={activeVariant === 'titled'
						? `example.${activeLang === 'svelte' ? 'svelte' : activeLang}`
						: undefined}
				/>
			</section>

			<section class="cb-gallery">
				<h3>Variant gallery</h3>
				<div class="cb-grid">
					<div>
						<h4>Plain</h4>
						<CodeBlock code={langSnippets.ts} variant="plain" />
					</div>
					<div>
						<h4>Lined · highlight</h4>
						<CodeBlock code={langSnippets.ts} variant="lined" highlight="1-4" />
					</div>
					<div>
						<h4>Titled</h4>
						<CodeBlock code={langSnippets.ts} variant="titled" fileName="user.ts" />
					</div>
					<div>
						<h4>Diff</h4>
						<CodeBlock code={diffSnippet} variant="diff" />
					</div>
					<div>
						<h4>Terminal</h4>
						<CodeBlock code={langSnippets.bash} variant="terminal" />
					</div>
					<div>
						<h4>Light theme</h4>
						<CodeBlock code={langSnippets.json} variant="lined" language="json" theme="light" />
					</div>
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
				<tr><td><code>code</code></td><td><code>string</code></td><td>required</td><td>Source text to render.</td></tr>
				<tr><td><code>language</code></td><td><code>"ts" | "js" | "svelte" | "json" | "bash" | "plain"</code></td><td>auto</td><td>Override the heuristic detector.</td></tr>
				<tr><td><code>variant</code></td><td><code>"plain" | "lined" | "titled" | "diff" | "terminal"</code></td><td><code>"plain"</code></td><td>Visual layout.</td></tr>
				<tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>Type scale and padding.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td><code>undefined</code></td><td>Header label; forces header on plain variant.</td></tr>
				<tr><td><code>fileName</code></td><td><code>string</code></td><td><code>undefined</code></td><td>Header filename, monospaced.</td></tr>
				<tr><td><code>lineNumbers</code></td><td><code>boolean</code></td><td>auto</td><td>Override gutter visibility.</td></tr>
				<tr><td><code>highlight</code></td><td><code>string</code></td><td><code>undefined</code></td><td>1-based line ranges, e.g. "1,3-5".</td></tr>
				<tr><td><code>wrap</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Soft-wrap long lines.</td></tr>
				<tr><td><code>copyable</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the copy button.</td></tr>
				<tr><td><code>theme</code></td><td><code>"light" | "dark"</code></td><td><code>"dark"</code></td><td>Colour palette (terminal ignores).</td></tr>
				<tr><td><code>aria-label</code></td><td><code>string</code></td><td><code>"Code"</code></td><td>Region label for screen readers.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cb-demo {
		display: grid;
		gap: 1.5rem;
	}
	.cb-controls {
		padding: 1.25rem 1.5rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		color: var(--fg-1);
	}
	.cb-controls h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}
	.cb-hint {
		margin: 0 0 0.75rem;
		color: var(--fg-2);
		font-size: 0.875rem;
	}
	.cb-control-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em 1em;
		margin: 0.6em 0;
	}
	.cb-control-label {
		font-weight: 600;
		min-width: 6em;
		font-size: 0.85rem;
	}
	.cb-button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
	}
	.cb-button-row button {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--bg-1);
		padding: 0.4em 0.75em;
		border-radius: 8px;
		font: inherit;
		font-size: 0.85rem;
		color: var(--fg-1);
		cursor: pointer;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1em;
	}
	.cb-button-row button.active {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}
	.cb-opt-label {
		font-weight: 500;
	}
	.cb-opt-hint {
		font-size: 0.7rem;
		color: var(--fg-2);
	}
	.cb-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.85rem;
		color: var(--fg-1);
	}
	.cb-highlight-input input[type='text'] {
		width: 8em;
		padding: 0.3em 0.5em;
		border: 1px solid var(--border);
		border-radius: 6px;
		font: inherit;
		font-size: 0.8rem;
		background: var(--bg-1);
		color: var(--fg-1);
	}

	.cb-gallery h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		color: var(--fg-1);
	}
	.cb-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
	@media (min-width: 720px) {
		.cb-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	.cb-grid h4 {
		margin: 0 0 0.5em;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
</style>
