<script lang="ts">
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import type { CodeBlockVariant, CodeBlockSize } from '$lib/components/CodeBlock.svelte';

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
}

console.log(greet(ada));`,
		js: `// Greet a name with a template string
const greet = (name) => \`Hello, \${name}!\`;

const names = ['world', 'friend', 'reader'];
names.forEach((n) => console.log(greet(n)));

// A small async helper
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
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^5.0.0"
  }
}`,
		bash: `#!/bin/bash
# Daily backup script — run from cron
set -euo pipefail

BACKUP_DIR="/var/backups/site"
DATE=$(date +%Y-%m-%d)

if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
fi

for f in *.txt; do
  echo "Archiving $f"
  gzip -k "$f" > "\${BACKUP_DIR}/\${f}.\${DATE}.gz"
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

	const plainSnippet = 'No syntax highlighting here.\nJust monospaced display with a copy button.';

	const usageSnippet = [
		'<' + 'script lang="ts">',
		"  import CodeBlock from '$lib/components/CodeBlock.svelte';",
		'',
		'  const code = `interface User { name: string }',
		"  const ada: User = { name: 'Ada' };`;",
		'<' + '/script>',
		'',
		'<!-- Default: plain variant, dark theme, language auto-detected -->',
		'<CodeBlock {code} />',
		'',
		'<!-- Lined variant with light theme and highlighted lines -->',
		'<CodeBlock {code} variant="lined" theme="light" highlight="1,3" />',
		'',
		'<!-- Titled variant with file name and copy button -->',
		'<CodeBlock {code} variant="titled" fileName="user.ts" />',
		'',
		'<!-- Terminal variant for shell snippets -->',
		'<CodeBlock code={shellSnippet} variant="terminal" />'
	].join('\n');
</script>

<svelte:head>
	<title>CodeBlock — TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="hero">
		<h1>CodeBlock</h1>
		<p class="lead">
			Token-coloured source-code display with five visual variants, three sizes, six languages,
			and a copy button — all from a tiny in-house tokenizer (~5&nbsp;KB) instead of a 200&nbsp;KB
			highlighter library.
		</p>
	</header>

	<section class="controls">
		<h2>Live preview</h2>
		<p class="hint">Mix and match variants, sizes, themes, and languages to see how they compose.</p>

		<div class="control-group">
			<span class="control-label">Variant</span>
			<div class="button-row">
				{#each variantOptions as opt (opt.id)}
					<button
						class:active={activeVariant === opt.id}
						onclick={() => (activeVariant = opt.id)}
					>
						<span class="opt-label">{opt.label}</span>
						<span class="opt-hint">{opt.hint}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<span class="control-label">Size</span>
			<div class="button-row">
				{#each sizeOptions as opt (opt.id)}
					<button class:active={activeSize === opt.id} onclick={() => (activeSize = opt.id)}>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<span class="control-label">Theme</span>
			<div class="button-row">
				{#each themeOptions as opt (opt.id)}
					<button class:active={activeTheme === opt.id} onclick={() => (activeTheme = opt.id)}>
						{opt.label}
					</button>
				{/each}
			</div>
			<span class="control-hint">Terminal variant ignores theme — its palette is fixed.</span>
		</div>

		<div class="control-group">
			<span class="control-label">Language</span>
			<div class="button-row">
				{#each Object.keys(langSnippets) as l (l)}
					<button class:active={activeLang === l} onclick={() => (activeLang = l as never)}>
						{l}
					</button>
				{/each}
			</div>
		</div>

		<div class="control-group">
			<span class="control-label">Extras</span>
			<label class="toggle">
				<input type="checkbox" bind:checked={activeWrap} />
				Soft-wrap long lines
			</label>
			<label class="toggle highlight-input">
				Highlight lines
				<input
					type="text"
					placeholder="e.g. 1,3-5"
					bind:value={activeHighlight}
					aria-label="Highlight line ranges"
				/>
			</label>
		</div>
	</section>

	<section class="preview">
		<CodeBlock
			code={activeVariant === 'diff' ? diffSnippet : langSnippets[activeLang]}
			language={activeVariant === 'diff' ? activeLang : activeLang}
			variant={activeVariant}
			size={activeSize}
			theme={activeTheme}
			wrap={activeWrap}
			highlight={activeHighlight}
			title={activeVariant === 'titled' ? 'Live preview' : undefined}
			fileName={activeVariant === 'titled' ? `example.${activeLang === 'svelte' ? 'svelte' : activeLang}` : undefined}
		/>
	</section>

	<section class="gallery">
		<h2>Variant gallery</h2>
		<p class="hint">All five variants at a glance, rendered with the same TypeScript snippet.</p>

		<div class="gallery-grid">
			<div>
				<h3>Plain</h3>
				<CodeBlock code={langSnippets.ts} variant="plain" />
			</div>
			<div>
				<h3>Lined</h3>
				<CodeBlock code={langSnippets.ts} variant="lined" highlight="1-4" />
			</div>
			<div>
				<h3>Titled</h3>
				<CodeBlock code={langSnippets.ts} variant="titled" fileName="user.ts" />
			</div>
			<div>
				<h3>Diff</h3>
				<CodeBlock code={diffSnippet} variant="diff" />
			</div>
			<div>
				<h3>Terminal</h3>
				<CodeBlock code={langSnippets.bash} variant="terminal" />
			</div>
		</div>
	</section>

	<section class="languages">
		<h2>Language showcase</h2>
		<p class="hint">
			The detector picks the right tokenizer automatically; pass <code>language="…"</code> to
			override.
		</p>

		<div class="lang-grid">
			<div>
				<h3>TypeScript</h3>
				<CodeBlock code={langSnippets.ts} variant="lined" language="ts" />
			</div>
			<div>
				<h3>JavaScript</h3>
				<CodeBlock code={langSnippets.js} variant="lined" language="js" theme="light" />
			</div>
			<div>
				<h3>Svelte</h3>
				<CodeBlock
					code={langSnippets.svelte}
					variant="titled"
					language="svelte"
					fileName="Counter.svelte"
				/>
			</div>
			<div>
				<h3>JSON</h3>
				<CodeBlock code={langSnippets.json} variant="lined" language="json" theme="light" />
			</div>
			<div>
				<h3>Bash</h3>
				<CodeBlock code={langSnippets.bash} variant="terminal" language="bash" />
			</div>
			<div>
				<h3>Plain text</h3>
				<CodeBlock
					code={plainSnippet}
					variant="lined"
					language="plain"
					theme="light"
				/>
			</div>
		</div>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<CodeBlock
			code={usageSnippet}
			language="svelte"
			variant="titled"
			fileName="example.svelte"
		/>
	</section>

	<section class="props">
		<h2>Props</h2>
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>code</code></td>
					<td><code>string</code></td>
					<td>required</td>
					<td>Source text to render</td>
				</tr>
				<tr>
					<td><code>language</code></td>
					<td><code>'ts' | 'js' | 'svelte' | 'json' | 'bash' | 'plain'</code></td>
					<td>auto</td>
					<td>Override the heuristic detector</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'plain' | 'lined' | 'titled' | 'diff' | 'terminal'</code></td>
					<td><code>'plain'</code></td>
					<td>Visual layout</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Type scale and padding</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Header label; forces header on plain variant</td>
				</tr>
				<tr>
					<td><code>fileName</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Header label, monospaced; forces header</td>
				</tr>
				<tr>
					<td><code>lineNumbers</code></td>
					<td><code>boolean</code></td>
					<td>auto</td>
					<td>Override gutter visibility for the variant</td>
				</tr>
				<tr>
					<td><code>highlight</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Comma-separated 1-based line ranges (e.g. <code>"1,3-5"</code>)</td>
				</tr>
				<tr>
					<td><code>wrap</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Soft-wrap long lines instead of scrolling</td>
				</tr>
				<tr>
					<td><code>copyable</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the copy button when the API is available</td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>'light' | 'dark'</code></td>
					<td><code>'dark'</code></td>
					<td>Colour palette (terminal ignores)</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Code'</code></td>
					<td>Region label for screen readers</td>
				</tr>
			</tbody>
		</table>
	</section>
</div>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
	}

	.hero h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		margin: 0 0 0.5em;
	}
	.hero .lead {
		font-size: 1.15rem;
		color: var(--muted, #555);
		max-width: 60ch;
		margin: 0 0 2em;
	}

	section {
		margin-top: 3rem;
	}
	section h2 {
		font-size: 1.5rem;
		margin: 0 0 0.4em;
	}
	section h3 {
		font-size: 1rem;
		margin: 0 0 0.5em;
		color: #444;
	}
	.hint {
		color: #666;
		margin: 0 0 1.5em;
		max-width: 70ch;
	}

	.controls {
		padding: 1.25rem 1.5rem;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		background: #fafafa;
	}

	.control-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em 1em;
		margin: 0.6em 0;
	}
	.control-label {
		font-weight: 600;
		min-width: 6em;
	}
	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
	}
	.button-row button {
		appearance: none;
		border: 1px solid #d1d1d1;
		background: white;
		padding: 0.45em 0.8em;
		border-radius: 8px;
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1em;
		transition: border-color 120ms ease, background 120ms ease;
	}
	.button-row button:hover {
		border-color: #999;
	}
	.button-row button.active {
		border-color: #6366f1;
		background: #eef2ff;
	}
	.opt-label {
		font-weight: 500;
	}
	.opt-hint {
		font-size: 0.75rem;
		color: #777;
	}

	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-size: 0.9rem;
	}
	.highlight-input input[type='text'] {
		width: 8em;
		padding: 0.3em 0.5em;
		border: 1px solid #d1d1d1;
		border-radius: 6px;
		font: inherit;
		font-size: 0.85rem;
	}
	.control-hint {
		font-size: 0.8rem;
		color: #777;
	}

	.preview {
		margin-top: 1.5rem;
	}

	.gallery-grid,
	.lang-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
	@media (min-width: 720px) {
		.gallery-grid,
		.lang-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.props table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.92rem;
	}
	.props th,
	.props td {
		text-align: left;
		padding: 0.5em 0.7em;
		border-bottom: 1px solid #eee;
		vertical-align: top;
	}
	.props th {
		background: #f5f5f5;
		font-weight: 600;
	}
	.props code {
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.85em;
		background: #f0f0f0;
		padding: 0.1em 0.35em;
		border-radius: 4px;
	}
</style>
