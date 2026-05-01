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
					<h3>Activity</h3>
					<ul class="activity-list">
						{#each activityLog as item, i (i)}
							<li>{item}</li>
						{/each}
					</ul>
				</section>

				{#if rejectedFiles.length}
					<section class="rejections">
						<h3>Rejected</h3>
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

	.demo-side h3 {
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
</style>
