<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import type {
		UploadDropzoneItem,
		UploadDropzoneRejection
	} from '$lib/types';

	let liveFiles = $state<UploadDropzoneItem[]>([]);
	let rejectedFiles = $state<UploadDropzoneRejection[]>([]);
	let activityLog = $state<string[]>(['Ready for files']);
	const timers = new SvelteMap<string, ReturnType<typeof setInterval>>();

	const showcaseFiles: UploadDropzoneItem[] = [
		{
			id: 'brand-guidelines',
			name: 'brand-guidelines.pdf',
			size: 2_420_000,
			type: 'application/pdf',
			status: 'success',
			progress: 100
		},
		{
			id: 'hero-image',
			name: 'campaign-hero.png',
			size: 4_870_000,
			type: 'image/png',
			status: 'uploading',
			progress: 68
		},
		{
			id: 'source-video',
			name: 'source-video.mov',
			size: 15_800_000,
			type: 'video/quicktime',
			status: 'error',
			progress: 0,
			error: 'Transcode failed'
		}
	];

	function handleFilesAdded(items: UploadDropzoneItem[]) {
		rejectedFiles = [];
		const uploading = items.map((item) => ({ ...item, status: 'uploading' as const, progress: 8 }));
		liveFiles = [...liveFiles, ...uploading];
		addLog(`${items.length} ${items.length === 1 ? 'file' : 'files'} accepted`);

		for (const item of uploading) {
			startProgress(item.id);
		}
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
			current.id === item.id ? { ...current, status: 'uploading', progress: 12, error: undefined } : current
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
		for (const timer of timers.values()) {
			clearInterval(timer);
		}
		timers.clear();
	});
</script>

<svelte:head>
	<title>UploadDropzone Component | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Accessible drag-and-drop file upload surface with validation, previews, progress states, and retry/remove actions."
	/>
</svelte:head>

<div class="page-shell">
	<section class="intro">
		<div>
			<p class="eyebrow">Forms & CRUD</p>
			<h1>UploadDropzone</h1>
			<p>
				A production-ready upload surface with drag-and-drop, paste support, validation,
				previews, and clear file-state rows. It stays backend-agnostic and emits typed hooks
				for your upload workflow.
			</p>
		</div>
		<div class="intro-stats" aria-label="Component capabilities">
			<div>
				<strong>0</strong>
				<span>runtime deps</span>
			</div>
			<div>
				<strong>3</strong>
				<span>input paths</span>
			</div>
			<div>
				<strong>4</strong>
				<span>row states</span>
			</div>
		</div>
	</section>

	<section class="workspace">
		<div class="main-panel">
			<h2>Live Upload Surface</h2>
			<p>
				Drop images or PDFs, paste from the clipboard while focused, or browse manually.
				This demo simulates upload progress in the parent component.
			</p>
			<UploadDropzone
				files={liveFiles}
				accept="image/*,.pdf"
				maxFiles={5}
				maxSize={5 * 1024 * 1024}
				title="Upload campaign assets"
				description="Accepts images and PDF documents. Paste screenshots directly from your clipboard."
				onFilesAdded={handleFilesAdded}
				onFilesRejected={handleRejected}
				onRemove={handleRemove}
				onRetry={handleRetry}
			/>
		</div>

		<aside class="side-panel">
			<section>
				<h2>Activity</h2>
				<ul class="activity-list">
					{#each activityLog as item, i (i)}
						<li>{item}</li>
					{/each}
				</ul>
			</section>

			{#if rejectedFiles.length}
				<section class="rejections">
					<h2>Rejected Files</h2>
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
	</section>

	<section class="example-grid">
		<div class="example-panel">
			<h2>Preloaded States</h2>
			<p>Rows can be initialised from parent data to show success, progress, and retry states.</p>
			<UploadDropzone
				files={showcaseFiles}
				accept="image/*,.pdf,video/*"
				maxFiles={6}
				maxSize={20 * 1024 * 1024}
				title="Project files"
				description="A controlled list can mirror server-backed upload status."
			/>
		</div>

		<div class="example-panel">
			<h2>Validation Profile</h2>
			<div class="rules">
				<div>
					<span>Types</span>
					<strong>image/*, .pdf</strong>
				</div>
				<div>
					<span>Max size</span>
					<strong>5 MB</strong>
				</div>
				<div>
					<span>Max files</span>
					<strong>5</strong>
				</div>
				<div>
					<span>Inputs</span>
					<strong>Drop, paste, browse</strong>
				</div>
			</div>
		</div>
	</section>

	<section class="code-panel">
		<h2>Usage</h2>
		<pre><code>{`<UploadDropzone
  accept="image/*,.pdf"
  maxFiles={5}
  maxSize={5 * 1024 * 1024}
  onFilesAdded={(items) => startUpload(items)}
  onFilesRejected={(rejections) => showErrors(rejections)}
/>`}</code></pre>
	</section>
</div>

<style>
	.page-shell {
		width: min(1180px, calc(100vw - 2rem));
		margin: 0 auto;
		padding: 3rem 0 4rem;
		color: #172033;
	}

	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 2rem;
		align-items: end;
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		color: #2563eb;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	p {
		margin: 0;
	}

	h1 {
		font-size: clamp(2.2rem, 1.8rem + 2vw, 4rem);
		line-height: 0.98;
		letter-spacing: 0;
		color: #0f172a;
	}

	.intro p {
		max-width: 48rem;
		margin-top: 1rem;
		color: #546179;
		font-size: 1.04rem;
		line-height: 1.65;
	}

	.intro-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(6rem, 1fr));
		gap: 0.6rem;
	}

	.intro-stats div,
	.side-panel,
	.example-panel,
	.code-panel {
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.86);
		box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
	}

	.intro-stats div {
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem;
	}

	.intro-stats strong {
		color: #0f172a;
		font-size: 1.45rem;
		line-height: 1;
	}

	.intro-stats span {
		color: #64748b;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.34fr);
		gap: 1rem;
		align-items: start;
	}

	.main-panel {
		min-width: 0;
	}

	.main-panel h2,
	.side-panel h2,
	.example-panel h2,
	.code-panel h2 {
		margin-bottom: 0.55rem;
		color: #0f172a;
		font-size: 1.05rem;
		letter-spacing: 0;
	}

	.main-panel > p,
	.example-panel > p {
		margin-bottom: 1rem;
		color: #64748b;
		line-height: 1.55;
	}

	.side-panel {
		display: grid;
		gap: 1rem;
		padding: 1rem;
	}

	.activity-list,
	.rejections ul {
		display: grid;
		gap: 0.55rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.activity-list li,
	.rejections li {
		padding: 0.62rem 0.7rem;
		border-radius: 8px;
		background: #f8fafc;
		color: #475569;
		font-size: 0.9rem;
	}

	.rejections li {
		display: grid;
		gap: 0.2rem;
		background: #fff1f2;
		color: #9f1239;
	}

	.rejections span {
		font-size: 0.82rem;
	}

	.example-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.42fr);
		gap: 1rem;
		margin-top: 2rem;
	}

	.example-panel,
	.code-panel {
		padding: 1.1rem;
	}

	.rules {
		display: grid;
		gap: 0.7rem;
	}

	.rules div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(148, 163, 184, 0.18);
	}

	.rules div:last-child {
		border-bottom: 0;
	}

	.rules span {
		color: #64748b;
	}

	.rules strong {
		color: #0f172a;
		font-size: 0.92rem;
		text-align: right;
	}

	.code-panel {
		margin-top: 1rem;
	}

	pre {
		overflow-x: auto;
		margin: 0;
		padding: 1rem;
		border-radius: 8px;
		background: #111827;
		color: #e5e7eb;
		font-size: 0.92rem;
		line-height: 1.6;
	}

	@media (max-width: 900px) {
		.intro,
		.workspace,
		.example-grid {
			grid-template-columns: 1fr;
		}

		.intro-stats {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 560px) {
		.page-shell {
			width: min(100vw - 1rem, 1180px);
			padding-top: 1.25rem;
		}

		.intro-stats {
			grid-template-columns: 1fr;
		}

		.rules div {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.2rem;
		}

		.rules strong {
			text-align: left;
		}
	}
</style>
