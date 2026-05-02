<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import type { UploadDropzoneItem, UploadDropzoneRejection } from '$lib/types';

	const shell = catalogShellPropsForSlug('/uploaddropzone')!;

	let liveFiles = $state<UploadDropzoneItem[]>([]);
	let rejectedFiles = $state<UploadDropzoneRejection[]>([]);
	let activityLog = $state<string[]>(['Ready for files']);
	const timers = new SvelteMap<string, ReturnType<typeof setInterval>>();

	// Custom-row variant: parent owns a smaller list and renders each item with a
	// minimal "icon · name · size" row via the fileItem snippet.
	let customFiles = $state<UploadDropzoneItem[]>([]);

	// Size-validation variant: maxSize is set absurdly low (100 bytes) so any
	// real file is rejected. We surface every rejection reason live below.
	let strictRejections = $state<UploadDropzoneRejection[]>([]);

	function handleCustomAdded(items: UploadDropzoneItem[]) {
		customFiles = [
			...customFiles,
			...items.map((item) => ({ ...item, status: 'success' as const, progress: 100 }))
		];
	}

	function handleCustomRemove(item: UploadDropzoneItem) {
		customFiles = customFiles.filter((current) => current.id !== item.id);
	}

	function handleStrictRejected(rejections: UploadDropzoneRejection[]) {
		strictRejections = [...rejections, ...strictRejections].slice(0, 8);
	}

	function clearStrictRejections() {
		strictRejections = [];
	}

	function fileEmoji(type: string) {
		if (type.startsWith('image/')) return '🖼️';
		if (type.startsWith('video/')) return '🎬';
		if (type.startsWith('audio/')) return '🎧';
		if (type.includes('pdf')) return '📄';
		if (type.includes('zip') || type.includes('compressed')) return '🗜️';
		return '📎';
	}

	function formatSize(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function handleFilesAdded(items: UploadDropzoneItem[]) {
		rejectedFiles = [];
		const uploading = items.map((item) => ({ ...item, status: 'uploading' as const, progress: 8 }));
		liveFiles = [...liveFiles, ...uploading];
		addLog(`${items.length} ${items.length === 1 ? 'file' : 'files'} accepted`);
		for (const item of uploading) startProgress(item.id);
	}

	function handleRejected(rejections: UploadDropzoneRejection[]) {
		rejectedFiles = rejections;
		addLog(`${rejections.length} ${rejections.length === 1 ? 'file' : 'files'} rejected`);
	}

	function handleRemove(item: UploadDropzoneItem) {
		stopProgress(item.id);
		liveFiles = liveFiles.filter((current) => current.id !== item.id);
		addLog(`${item.name} removed`);
	}

	function handleRetry(item: UploadDropzoneItem) {
		liveFiles = liveFiles.map((current) =>
			current.id === item.id
				? { ...current, status: 'uploading', progress: 12, error: undefined }
				: current
		);
		startProgress(item.id);
		addLog(`Retry started for ${item.name}`);
	}

	function startProgress(id: string) {
		stopProgress(id);
		const timer = setInterval(() => {
			liveFiles = liveFiles.map((item) => {
				if (item.id !== id || item.status !== 'uploading') return item;
				const nextProgress = Math.min(100, (item.progress ?? 0) + 14);
				return {
					...item,
					progress: nextProgress,
					status: nextProgress >= 100 ? 'success' : 'uploading'
				};
			});

			const completed = liveFiles.find((item) => item.id === id && item.status === 'success');
			if (completed) {
				stopProgress(id);
				addLog(`${completed.name} uploaded`);
			}
		}, 700);

		timers.set(id, timer);
	}

	function stopProgress(id: string) {
		const timer = timers.get(id);
		if (timer) {
			clearInterval(timer);
			timers.delete(id);
		}
	}

	function addLog(message: string) {
		activityLog = [message, ...activityLog].slice(0, 5);
	}

	onDestroy(() => {
		for (const timer of timers.values()) clearInterval(timer);
		timers.clear();
	});

	const codeExplanation =
		'UploadDropzone keeps file state outside the network: it accepts drag/drop, paste, and browse, validates type/size/count, and emits typed callbacks (onFilesAdded, onFilesRejected, onRemove, onRetry) so your code owns the actual upload. The component renders preview rows with progress, success, and error states which the parent drives by feeding back UploadDropzoneItem updates.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Drag & drop', 'Paste', 'A11y', 'Validation']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="upload-demo-stack">
			<section>
				<h4>Default · drag, drop, paste</h4>
				<div class="upload-demo">
					<div class="demo-main">
						<UploadDropzone
							files={liveFiles}
							accept="image/*,.pdf"
							maxFiles={5}
							maxSize={5 * 1024 * 1024}
							title="Upload campaign assets"
							description="Drop, paste, or browse. Images and PDFs only."
							onFilesAdded={handleFilesAdded}
							onFilesRejected={handleRejected}
							onRemove={handleRemove}
							onRetry={handleRetry}
						/>
					</div>

					<aside class="demo-side">
						<section>
							<h4>Activity</h4>
							<ul class="activity-list">
								{#each activityLog as item, i (i)}
									<li>{item}</li>
								{/each}
							</ul>
						</section>

						{#if rejectedFiles.length}
							<section class="rejections">
								<h4>Rejected</h4>
								<ul>
									{#each rejectedFiles as rejection, i (i)}
										<li>
											<strong>{rejection.file.name}</strong>
											<span>{rejection.message}</span>
										</li>
									{/each}
								</ul>
							</section>
						{/if}
					</aside>
				</div>
			</section>

			<section>
				<h4>Custom row snippet · icon + name + size</h4>
				<p class="hint">
					Pass a <code>fileItem</code> snippet to swap out the default progress row. Here we render a slim icon-name-size strip — handy for finished uploads or read-only listings.
				</p>
				<UploadDropzone
					files={customFiles}
					accept="*/*"
					maxFiles={6}
					title="Custom file rows"
					description="Drop anything. Each row is rendered by your snippet."
					onFilesAdded={handleCustomAdded}
					onRemove={handleCustomRemove}
				>
					{#snippet fileItem(item)}
						<div class="custom-row">
							<span class="custom-icon" aria-hidden="true">{fileEmoji(item.type)}</span>
							<span class="custom-name">{item.name}</span>
							<span class="custom-size">{formatSize(item.size)}</span>
							<button
								type="button"
								class="custom-remove"
								onclick={() => handleCustomRemove(item)}
								aria-label="Remove {item.name}"
							>
								×
							</button>
						</div>
					{/snippet}
				</UploadDropzone>
			</section>

			<section>
				<h4>Validation rejection · <code>maxSize=100</code> bytes</h4>
				<p class="hint">
					maxSize is deliberately set to 100 bytes, so any real file fails the size check. The component never adds them to the list — it routes the failure through <code>onFilesRejected</code> with a typed reason, which we render below.
				</p>
				<UploadDropzone
					accept="*/*"
					maxFiles={5}
					maxSize={100}
					title="Strict size limit"
					description="Drop any file. It will be rejected with a typed reason."
					onFilesRejected={handleStrictRejected}
				/>

				<div class="strict-feedback">
					<div class="strict-header">
						<span>Live rejection log</span>
						{#if strictRejections.length > 0}
							<button class="strict-clear" onclick={clearStrictRejections} type="button">
								Clear
							</button>
						{/if}
					</div>
					{#if strictRejections.length === 0}
						<p class="strict-empty">No rejections yet — drop a file above to trigger one.</p>
					{:else}
						<ul class="strict-list">
							{#each strictRejections as rejection, i (i)}
								<li>
									<strong>{rejection.file.name}</strong>
									<span class="strict-reason">{rejection.reason}</span>
									<span class="strict-msg">{rejection.message}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
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
					<td><code>files</code></td>
					<td><code>UploadDropzoneItem[]</code></td>
					<td>—</td>
					<td>Optional controlled list. Omit to let the dropzone manage its own state.</td>
				</tr>
				<tr>
					<td><code>accept</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>MIME types and extensions the input will allow (e.g. <code>image/*,.pdf</code>).</td>
				</tr>
				<tr>
					<td><code>multiple</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Allow selecting more than one file at a time.</td>
				</tr>
				<tr>
					<td><code>maxFiles</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Cap the total number of files in the list.</td>
				</tr>
				<tr>
					<td><code>maxSize</code></td>
					<td><code>number</code></td>
					<td><code>10 * 1024 * 1024</code></td>
					<td>Per-file size limit in bytes.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Block all input paths.</td>
				</tr>
				<tr>
					<td><code>title</code> / <code>description</code></td>
					<td><code>string</code></td>
					<td>Sensible defaults</td>
					<td>Headline and helper copy shown in the dropzone.</td>
				</tr>
				<tr>
					<td><code>browseLabel</code> / <code>emptyLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Browse files'</code> / <code>'No files selected'</code></td>
					<td>Button label and empty-state text.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(items) =&gt; void</code></td>
					<td>—</td>
					<td>Fires whenever the file list changes (added, removed, or retried).</td>
				</tr>
				<tr>
					<td><code>onFilesAdded</code></td>
					<td><code>(items) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when valid files are added.</td>
				</tr>
				<tr>
					<td><code>onFilesRejected</code></td>
					<td><code>(rejections) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when files fail validation, with reasons.</td>
				</tr>
				<tr>
					<td><code>onRemove</code> / <code>onRetry</code></td>
					<td><code>(item) =&gt; void</code></td>
					<td>—</td>
					<td>Row actions surfaced for each file.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.upload-demo {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.4fr);
		gap: 1rem;
		align-items: start;
	}

	.demo-main {
		min-width: 0;
	}

	.demo-side {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	.demo-side h4 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		color: var(--fg-1);
	}

	.activity-list,
	.rejections ul {
		display: grid;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.activity-list li,
	.rejections li {
		padding: 0.55rem 0.7rem;
		border-radius: 8px;
		background: var(--surface-2, var(--surface));
		color: var(--fg-2);
		font-size: 0.88rem;
	}

	.rejections li {
		display: grid;
		gap: 0.2rem;
		background: #fff1f2;
		color: #9f1239;
	}

	.rejections span {
		font-size: 0.8rem;
	}

	@media (max-width: 760px) {
		.upload-demo {
			grid-template-columns: 1fr;
		}
	}

	.upload-demo-stack {
		display: grid;
		gap: 2rem;
	}

	.upload-demo-stack > section > h4 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		color: var(--fg-1);
	}

	.upload-demo-stack > section > h4 code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.85em;
	}

	.hint {
		margin: 0 0 0.75rem;
		font-size: 0.88rem;
		color: var(--fg-2);
		line-height: 1.55;
	}

	.hint code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.custom-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 0.75rem;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 0.88rem;
		color: var(--fg-1);
	}

	.custom-icon {
		font-size: 1.15rem;
	}

	.custom-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.custom-size {
		color: var(--fg-2);
		font-size: 0.82rem;
	}

	.custom-remove {
		width: 1.5rem;
		height: 1.5rem;
		font-size: 1.05rem;
		line-height: 1;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 50%;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.custom-remove:hover {
		color: #b91c1c;
		border-color: #fca5a5;
		background: #fef2f2;
	}

	.strict-feedback {
		margin-top: 0.85rem;
		padding: 0.85rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	.strict-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.85rem;
		color: var(--fg-2);
		margin-bottom: 0.6rem;
	}

	.strict-clear {
		padding: 0.2rem 0.55rem;
		font-size: 0.78rem;
		color: var(--fg-2);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 4px;
		cursor: pointer;
	}

	.strict-empty {
		margin: 0;
		font-size: 0.85rem;
		color: var(--fg-2);
		font-style: italic;
	}

	.strict-list {
		display: grid;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.strict-list li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.25rem 0.75rem;
		padding: 0.55rem 0.7rem;
		background: #fff1f2;
		color: #9f1239;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.strict-list li strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.strict-reason {
		justify-self: end;
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		padding: 0.1rem 0.4rem;
		background: rgba(159, 18, 57, 0.15);
		border-radius: 999px;
	}

	.strict-msg {
		grid-column: 1 / -1;
		color: rgba(159, 18, 57, 0.85);
		font-size: 0.78rem;
	}
</style>
