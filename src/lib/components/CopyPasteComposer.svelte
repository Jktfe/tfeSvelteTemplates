<script lang="ts" module>
	import { SvelteSet } from 'svelte/reactivity';

	export interface CopyPasteCatalogEntry {
		name: string;
		href: string;
		category: string;
		description: string;
		source: string;
		docs: string;
		demo: string;
		dependencies: string[];
		relatedFiles: string[];
		usage: string;
	}

	export interface CopyPasteOptions {
		includeDocs?: boolean;
		includeDemo?: boolean;
		includeTests?: boolean;
		includeRelatedFiles?: boolean;
		packageManager?: string;
		targetRoot?: string;
	}

	export type CopyPasteFileKind = 'source' | 'docs' | 'demo' | 'test' | 'related';

	export interface CopyPasteSelectedFile {
		path: string;
		kind: CopyPasteFileKind;
		required: boolean;
	}

	export const defaultCopyPasteOptions: Required<CopyPasteOptions> = {
		includeDocs: true,
		includeDemo: true,
		includeTests: true,
		includeRelatedFiles: false,
		packageManager: 'bun',
		targetRoot: '.'
	};

	export function normalisePath(path: string): string {
		return path.replace(/^\/+/, '');
	}

	function isTestPath(path: string): boolean {
		return /\.(test|spec)\.(ts|tsx|js|jsx|svelte)$/.test(path);
	}

	function isSveltePath(path: string): boolean {
		return path.endsWith('.svelte');
	}

	function dirname(path: string): string {
		const slash = path.lastIndexOf('/');
		return slash === -1 ? '.' : path.slice(0, slash);
	}

	function targetPath(path: string, targetRoot = '.'): string {
		const root = targetRoot.trim().replace(/\/+$/, '') || '.';
		const normalized = normalisePath(path);
		return root === '.' ? `./${normalized}` : `${root}/${normalized}`;
	}

	function addUniqueFile(
		files: CopyPasteSelectedFile[],
		seen: Set<string>,
		path: string,
		kind: CopyPasteFileKind,
		required: boolean
	) {
		const normalized = normalisePath(path);
		if (!normalized || seen.has(normalized)) return;
		seen.add(normalized);
		files.push({ path: normalized, kind, required });
	}

	export function testCandidatesFor(entry: Pick<CopyPasteCatalogEntry, 'source' | 'relatedFiles'>): string[] {
		const candidates = new SvelteSet<string>();
		const paths = [entry.source, ...entry.relatedFiles].map(normalisePath);

		for (const path of paths) {
			if (isTestPath(path)) {
				candidates.add(path);
				continue;
			}

			if (!isSveltePath(path)) continue;
			const withoutExt = path.slice(0, -'.svelte'.length);
			const slash = withoutExt.lastIndexOf('/');
			const dir = slash >= 0 ? withoutExt.slice(0, slash) : '';
			const base = slash >= 0 ? withoutExt.slice(slash + 1) : withoutExt;

			candidates.add(`${withoutExt}.test.ts`);
			candidates.add(`${withoutExt}.test.svelte`);
			candidates.add(`${dir}/${base}TestHarness.test.svelte`);
		}

		return [...candidates];
	}

	export function deriveSelectedFiles(
		entry: CopyPasteCatalogEntry,
		options: CopyPasteOptions = {}
	): CopyPasteSelectedFile[] {
		const resolved = { ...defaultCopyPasteOptions, ...options };
		const files: CopyPasteSelectedFile[] = [];
		const seen = new Set<string>();

		addUniqueFile(files, seen, entry.source, 'source', true);
		if (resolved.includeDocs) addUniqueFile(files, seen, entry.docs, 'docs', false);
		if (resolved.includeDemo) addUniqueFile(files, seen, entry.demo, 'demo', false);
		if (resolved.includeTests) {
			for (const file of entry.relatedFiles) {
				if (isTestPath(file)) addUniqueFile(files, seen, file, 'test', false);
			}
		}
		if (resolved.includeRelatedFiles) {
			for (const file of entry.relatedFiles) {
				if (!isTestPath(file)) addUniqueFile(files, seen, file, 'related', false);
			}
		}

		return files;
	}

	export function dependencyInstallCommand(dependencies: string[], packageManager = 'bun'): string {
		if (!dependencies.length) return '';
		const manager = packageManager.trim().toLowerCase() || 'bun';
		const deps = dependencies.join(' ');
		if (manager === 'npm') return `npm install ${deps}`;
		if (manager === 'yarn') return `yarn add ${deps}`;
		if (manager === 'pnpm') return `pnpm add ${deps}`;
		return `${manager} add ${deps}`;
	}

	export function deriveInstallCommands(
		entry: CopyPasteCatalogEntry,
		options: CopyPasteOptions = {}
	): string[] {
		const resolved = { ...defaultCopyPasteOptions, ...options };
		const files = deriveSelectedFiles(entry, resolved);
		const commands: string[] = [];
		const dependencyCommand = dependencyInstallCommand(entry.dependencies, resolved.packageManager);

		if (dependencyCommand) commands.push(dependencyCommand);

		const dirs = new Set(files.map((file) => dirname(targetPath(file.path, resolved.targetRoot))));
		for (const dir of dirs) {
			commands.push(`mkdir -p ${dir}`);
		}
		for (const file of files) {
			commands.push(`cp ${file.path} ${targetPath(file.path, resolved.targetRoot)}`);
		}

		return commands;
	}

	export function checklistFor(entry: CopyPasteCatalogEntry, options: CopyPasteOptions = {}): string[] {
		const resolved = { ...defaultCopyPasteOptions, ...options };
		const files = deriveSelectedFiles(entry, resolved);
		const checklist = [
			entry.dependencies.length
				? `Install ${entry.dependencies.join(', ')} before mounting ${entry.name}.`
				: 'Confirm the target app is already on Svelte 5.',
			`Copy ${files.length} selected file${files.length === 1 ? '' : 's'} into matching project paths.`,
			'Paste the usage snippet into the target route.'
		];

		if (resolved.includeDocs) checklist.push('Review the docs for props, accessibility notes, and edge cases.');
		if (resolved.includeDemo) checklist.push('Open the demo route and remove sample-only data before shipping.');
		if (resolved.includeTests) checklist.push('Run or port the selected tests after adapting imports.');

		return checklist;
	}
</script>

<script lang="ts">
	interface Props {
		entries: CopyPasteCatalogEntry[];
		title?: string;
		initialHref?: string;
	}

	let { entries, title = 'Copy-paste composer', initialHref }: Props = $props();

	let selectedHref = $state('');
	let includeDocs = $state(defaultCopyPasteOptions.includeDocs);
	let includeDemo = $state(defaultCopyPasteOptions.includeDemo);
	let includeTests = $state(defaultCopyPasteOptions.includeTests);
	let includeRelatedFiles = $state(defaultCopyPasteOptions.includeRelatedFiles);
	let packageManager = $state(defaultCopyPasteOptions.packageManager);
	let targetRoot = $state(defaultCopyPasteOptions.targetRoot);

	const selectedEntry = $derived(
		entries.find((entry) => entry.href === selectedHref) ?? entries[0]
	);
	const selectedOptions = $derived({
		includeDocs,
		includeDemo,
		includeTests,
		includeRelatedFiles,
		packageManager,
		targetRoot
	});
	const selectedFiles = $derived(
		selectedEntry ? deriveSelectedFiles(selectedEntry, selectedOptions) : []
	);
	const commands = $derived(
		selectedEntry ? deriveInstallCommands(selectedEntry, selectedOptions) : []
	);
	const checklist = $derived(selectedEntry ? checklistFor(selectedEntry, selectedOptions) : []);
	const commandText = $derived(commands.length ? commands.join('\n') : '# No install commands available');

	$effect(() => {
		const hasSelectedEntry = entries.some((entry) => entry.href === selectedHref);
		if (hasSelectedEntry) return;
		selectedHref = initialHref && entries.some((entry) => entry.href === initialHref)
			? initialHref
			: entries[0]?.href ?? '';
	});
</script>

<section class="copy-paste-composer" aria-labelledby="cpc-title">
	<header class="cpc-head">
		<div>
			<p class="cpc-kicker">Catalogue handoff</p>
			<h2 id="cpc-title">{title}</h2>
			<p>Choose a component and build the exact source, docs, demo, dependency, and usage bundle to hand to another repo.</p>
		</div>
		{#if selectedEntry}
			<a class="cpc-route" href={selectedEntry.href}>{selectedEntry.name} demo</a>
		{/if}
	</header>

	{#if selectedEntry}
		<div class="cpc-controls" aria-label="Composer controls">
			<label class="cpc-field">
				<span>Component</span>
				<select bind:value={selectedHref}>
					{#each entries as entry (entry.href)}
						<option value={entry.href}>{entry.name} - {entry.category}</option>
					{/each}
				</select>
			</label>
			<label class="cpc-field">
				<span>Package manager</span>
				<select bind:value={packageManager}>
					<option value="bun">bun</option>
					<option value="pnpm">pnpm</option>
					<option value="npm">npm</option>
					<option value="yarn">yarn</option>
				</select>
			</label>
			<label class="cpc-field">
				<span>Target root</span>
				<input bind:value={targetRoot} type="text" spellcheck="false" />
			</label>
		</div>

		<fieldset class="cpc-options">
			<legend>Include</legend>
			<label><input bind:checked={includeDocs} type="checkbox" /> <span>Docs</span></label>
			<label><input bind:checked={includeDemo} type="checkbox" /> <span>Demo</span></label>
			<label><input bind:checked={includeTests} type="checkbox" /> <span>Tests</span></label>
			<label><input bind:checked={includeRelatedFiles} type="checkbox" /> <span>Related files</span></label>
		</fieldset>

		<div class="cpc-grid">
			<section class="cpc-panel" aria-labelledby="cpc-files-title">
				<header>
					<h3 id="cpc-files-title">Selected files</h3>
					<span>{selectedFiles.length}</span>
				</header>
				<ul class="cpc-file-list">
					{#each selectedFiles as file (file.path)}
						<li>
							<b>{file.kind}</b>
							<code>{file.path}</code>
							{#if file.required}<span>required</span>{/if}
						</li>
					{/each}
				</ul>
			</section>

			<section class="cpc-panel" aria-labelledby="cpc-commands-title">
				<header>
					<h3 id="cpc-commands-title">Command block</h3>
					<span>{commands.length}</span>
				</header>
				<pre class="cpc-command" role="region" aria-label="Install commands"><code>{commandText}</code></pre>
			</section>
		</div>

		<div class="cpc-grid">
			<section class="cpc-panel" aria-labelledby="cpc-checklist-title">
				<header>
					<h3 id="cpc-checklist-title">Checklist</h3>
				</header>
				<ol class="cpc-checklist">
					{#each checklist as item (item)}
						<li>{item}</li>
					{/each}
				</ol>
			</section>

			<section class="cpc-panel" aria-labelledby="cpc-usage-title">
				<header>
					<h3 id="cpc-usage-title">Usage</h3>
				</header>
				<pre class="cpc-usage"><code>{selectedEntry.usage}</code></pre>
			</section>
		</div>
	{:else}
		<p class="cpc-empty">No catalogue entries are available.</p>
	{/if}
</section>

<style>
	.copy-paste-composer {
		display: grid;
		gap: 18px;
		color: var(--fg-1, #111827);
	}

	.cpc-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 18px;
		align-items: start;
	}

	.cpc-kicker {
		margin: 0 0 6px;
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--accent, #315f9f);
	}

	.cpc-head h2 {
		margin: 0;
		font-size: clamp(1.55rem, 2vw, 2.25rem);
		letter-spacing: 0;
	}

	.cpc-head p {
		margin: 8px 0 0;
		max-width: 68ch;
		color: var(--fg-2, #4b5563);
		line-height: 1.6;
	}

	.cpc-route {
		border: 1px solid var(--border, #d1d5db);
		border-radius: 8px;
		color: inherit;
		font-weight: 700;
		padding: 10px 12px;
		text-decoration: none;
		white-space: nowrap;
	}

	.cpc-controls {
		display: grid;
		grid-template-columns: minmax(240px, 1fr) minmax(160px, 0.35fr) minmax(160px, 0.35fr);
		gap: 12px;
	}

	.cpc-field {
		display: grid;
		gap: 6px;
	}

	.cpc-field span,
	.cpc-options legend {
		color: var(--fg-2, #4b5563);
		font: 700 12px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.cpc-field select,
	.cpc-field input {
		width: 100%;
		border: 1px solid var(--border, #d1d5db);
		border-radius: 8px;
		background: var(--bg, #ffffff);
		color: inherit;
		font: inherit;
		min-height: 42px;
		padding: 0 12px;
	}

	.cpc-options {
		border: 1px solid var(--border, #d1d5db);
		border-radius: 8px;
		display: flex;
		flex-wrap: wrap;
		gap: 12px 18px;
		margin: 0;
		padding: 14px 16px 16px;
	}

	.cpc-options label {
		align-items: center;
		display: inline-flex;
		gap: 8px;
		font-weight: 700;
	}

	.cpc-options input {
		accent-color: var(--accent, #315f9f);
		height: 16px;
		width: 16px;
	}

	.cpc-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 18px;
	}

	.cpc-panel {
		border: 1px solid var(--border, #d1d5db);
		border-radius: 8px;
		display: grid;
		gap: 14px;
		padding: 16px;
		min-width: 0;
	}

	.cpc-panel header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.cpc-panel h3 {
		margin: 0;
		font-size: 1rem;
		letter-spacing: 0;
	}

	.cpc-panel header span {
		border: 1px solid var(--border, #d1d5db);
		border-radius: 999px;
		color: var(--fg-2, #4b5563);
		font: 700 12px/1 var(--font-mono, ui-monospace, monospace);
		padding: 5px 8px;
	}

	.cpc-file-list,
	.cpc-checklist {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
	}

	.cpc-file-list li {
		align-items: center;
		display: grid;
		grid-template-columns: 72px minmax(0, 1fr) auto;
		gap: 10px;
		list-style: none;
	}

	.cpc-file-list b {
		color: var(--accent, #315f9f);
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.cpc-file-list code,
	.cpc-checklist li {
		color: var(--fg-2, #4b5563);
		line-height: 1.5;
	}

	.cpc-file-list code {
		overflow-wrap: anywhere;
	}

	.cpc-file-list li > span {
		border-radius: 999px;
		background: #e0f2fe;
		color: #075985;
		font: 700 11px/1 var(--font-mono, ui-monospace, monospace);
		padding: 5px 8px;
		text-transform: uppercase;
	}

	.cpc-checklist {
		list-style-position: inside;
	}

	.cpc-command,
	.cpc-usage {
		background: #0f172a;
		border-radius: 8px;
		color: #e5e7eb;
		margin: 0;
		overflow-x: auto;
		padding: 14px;
		white-space: pre;
	}

	.cpc-command code,
	.cpc-usage code {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.86rem;
		line-height: 1.6;
	}

	.cpc-empty {
		border: 1px dashed var(--border, #d1d5db);
		border-radius: 8px;
		color: var(--fg-2, #4b5563);
		margin: 0;
		padding: 18px;
	}

	@media (max-width: 860px) {
		.cpc-head,
		.cpc-controls,
		.cpc-grid {
			grid-template-columns: 1fr;
		}

		.cpc-route {
			justify-self: start;
		}
	}

	@media (max-width: 560px) {
		.cpc-file-list li {
			align-items: start;
			grid-template-columns: 1fr;
		}
	}
</style>
