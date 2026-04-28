<!--
	============================================================
	UploadDropzone - Accessible File Upload Surface
	============================================================

	[CR] WHAT IT DOES
	A typed upload dropzone with drag/drop, click-to-browse, paste support,
	validation, previews, progress states, and row actions. It owns local file
	state by default and emits callback hooks for persistence/upload workflows.

	[NTL] THE SIMPLE VERSION
	Drop files onto the panel, paste from the clipboard, or browse normally.
	The component checks whether each file is allowed, shows clear feedback,
	and gives users obvious remove/retry controls.

	============================================================
-->

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { cn } from '$lib/utils';
	import type {
		UploadDropzoneItem,
		UploadDropzoneProps,
		UploadDropzoneRejection
	} from '$lib/types';

	let {
		files: controlledFiles,
		accept = '',
		multiple = true,
		maxFiles = 8,
		maxSize = 10 * 1024 * 1024,
		disabled = false,
		title = 'Drop files here',
		description = 'Drag files onto this area, paste from clipboard, or browse from your device.',
		browseLabel = 'Browse files',
		emptyLabel = 'No files selected',
		class: className = '',
		fileItem,
		onChange,
		onFilesAdded,
		onFilesRejected,
		onRemove,
		onRetry
	}: UploadDropzoneProps = $props();

	let inputEl = $state<HTMLInputElement | undefined>();
	let isDragging = $state(false);
	let dragDepth = $state(0);
	let liveMessage = $state('');
	let internalItems = $state<UploadDropzoneItem[]>([]);

	const createdPreviewUrls = new SvelteSet<string>();

	let items = $derived(controlledFiles ?? internalItems);
	let acceptedHint = $derived(accept ? accept : 'Any file type');
	let maxSizeHint = $derived(formatBytes(maxSize));
	let isAtLimit = $derived(items.length >= maxFiles);
	let remainingSlots = $derived(Math.max(0, maxFiles - items.length));
	let helperText = $derived(
		`${acceptedHint}. Up to ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}, ${maxSizeHint} each.`
	);

	onDestroy(() => {
		for (const url of createdPreviewUrls) {
			URL.revokeObjectURL(url);
		}
		createdPreviewUrls.clear();
	});

	function openFileDialog() {
		if (disabled || isAtLimit) return;
		inputEl?.click();
	}

	function handleInputChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		addFiles(input.files);
		input.value = '';
	}

	function handleDragEnter(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragDepth += 1;
		isDragging = true;
	}

	function handleDragOver(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = isAtLimit ? 'none' : 'copy';
		}
	}

	function handleDragLeave(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragDepth = Math.max(0, dragDepth - 1);
		isDragging = dragDepth > 0;
	}

	function handleDrop(event: DragEvent) {
		if (disabled) return;
		event.preventDefault();
		dragDepth = 0;
		isDragging = false;
		addFiles(event.dataTransfer?.files);
	}

	function handlePaste(event: ClipboardEvent) {
		if (disabled || !event.clipboardData?.files.length) return;
		event.preventDefault();
		addFiles(event.clipboardData.files);
	}

	function addFiles(fileList?: FileList | File[] | null) {
		if (!fileList || disabled) return;

		const incoming = Array.from(fileList);
		if (!incoming.length) return;

		const acceptedItems: UploadDropzoneItem[] = [];
		const rejections: UploadDropzoneRejection[] = [];
		let slots = multiple ? remainingSlots : Math.min(remainingSlots, 1);

		for (const file of incoming) {
			if (slots <= 0) {
				rejections.push({
					file,
					reason: 'count',
					message: `Only ${maxFiles} ${maxFiles === 1 ? 'file is' : 'files are'} allowed.`
				});
				continue;
			}

			const typeMessage = validateFileType(file);
			if (typeMessage) {
				rejections.push({ file, reason: 'type', message: typeMessage });
				continue;
			}

			if (file.size > maxSize) {
				rejections.push({
					file,
					reason: 'size',
					message: `${file.name} is larger than ${formatBytes(maxSize)}.`
				});
				continue;
			}

			acceptedItems.push(createUploadItem(file));
			slots -= 1;
		}

		if (acceptedItems.length) {
			commit([...items, ...acceptedItems]);
			onFilesAdded?.(acceptedItems);
			liveMessage = `${acceptedItems.length} ${acceptedItems.length === 1 ? 'file' : 'files'} added.`;
		}

		if (rejections.length) {
			onFilesRejected?.(rejections);
			liveMessage = `${rejections.length} ${rejections.length === 1 ? 'file was' : 'files were'} rejected.`;
		}
	}

	function createUploadItem(file: File): UploadDropzoneItem {
		let previewUrl: string | undefined;

		if (file.type.startsWith('image/') && typeof URL !== 'undefined' && URL.createObjectURL) {
			previewUrl = URL.createObjectURL(file);
			createdPreviewUrls.add(previewUrl);
		}

		return {
			id: createId(),
			name: file.name,
			size: file.size,
			type: file.type || 'application/octet-stream',
			file,
			status: 'ready',
			progress: 0,
			previewUrl
		};
	}

	function removeItem(item: UploadDropzoneItem) {
		if (disabled) return;
		revokePreview(item);
		commit(items.filter((current) => current.id !== item.id));
		onRemove?.(item);
		liveMessage = `${item.name} removed.`;
	}

	function retryItem(item: UploadDropzoneItem) {
		if (disabled) return;
		onRetry?.(item);
		liveMessage = `Retry requested for ${item.name}.`;
	}

	function commit(nextItems: UploadDropzoneItem[]) {
		if (controlledFiles === undefined) {
			internalItems = nextItems;
		}
		onChange?.(nextItems);
	}

	function revokePreview(item: UploadDropzoneItem) {
		if (item.previewUrl && createdPreviewUrls.has(item.previewUrl)) {
			URL.revokeObjectURL(item.previewUrl);
			createdPreviewUrls.delete(item.previewUrl);
		}
	}

	function validateFileType(file: File): string | null {
		if (!accept.trim()) return null;

		const rules = accept
			.split(',')
			.map((rule) => rule.trim().toLowerCase())
			.filter(Boolean);

		const fileType = file.type.toLowerCase();
		const fileName = file.name.toLowerCase();

		const matches = rules.some((rule) => {
			if (rule.startsWith('.')) return fileName.endsWith(rule);
			if (rule.endsWith('/*')) return fileType.startsWith(rule.slice(0, -1));
			return fileType === rule;
		});

		return matches ? null : `${file.name} does not match ${accept}.`;
	}

	function createId() {
		if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
			return crypto.randomUUID();
		}

		return `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	}

	function formatBytes(bytes: number) {
		if (bytes === 0) return '0 B';

		const units = ['B', 'KB', 'MB', 'GB'];
		const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
		const value = bytes / 1024 ** exponent;

		return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
	}

	function statusLabel(item: UploadDropzoneItem) {
		if (item.status === 'uploading') return `Uploading ${Math.round(item.progress ?? 0)}%`;
		if (item.status === 'success') return 'Uploaded';
		if (item.status === 'error') return item.error ?? 'Upload failed';
		return 'Ready';
	}

	function itemInitial(item: UploadDropzoneItem) {
		const extension = item.name.split('.').pop();
		return extension ? extension.slice(0, 4).toUpperCase() : 'FILE';
	}
</script>

<section
	class={cn('upload-dropzone', className)}
	class:is-disabled={disabled}
	aria-label="File upload"
>
	<input
		bind:this={inputEl}
		class="upload-input"
		type="file"
		{accept}
		{multiple}
		{disabled}
		onchange={handleInputChange}
		aria-label="Choose files to upload"
		tabindex="-1"
	/>

	<button
		type="button"
		class="upload-surface"
		class:is-dragging={isDragging}
		class:is-at-limit={isAtLimit}
		{disabled}
		onclick={openFileDialog}
		ondragenter={handleDragEnter}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onpaste={handlePaste}
		aria-describedby="upload-dropzone-help upload-dropzone-count"
	>
		<span class="surface-icon" aria-hidden="true">
			<svg
				width="30"
				height="30"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 16V4"></path>
				<path d="m7 9 5-5 5 5"></path>
				<path d="M20 16.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5"></path>
			</svg>
		</span>
		<span class="surface-copy">
			<span class="surface-title">{isAtLimit ? 'Upload limit reached' : title}</span>
			<span id="upload-dropzone-help" class="surface-description">{description}</span>
			<span class="surface-meta">{helperText}</span>
		</span>
		<span class="surface-action">{isAtLimit ? 'Limit reached' : browseLabel}</span>
	</button>

	<div id="upload-dropzone-count" class="upload-count">
		<span>{items.length} / {maxFiles} selected</span>
		{#if remainingSlots > 0}
			<span>{remainingSlots} {remainingSlots === 1 ? 'slot' : 'slots'} available</span>
		{/if}
	</div>

	<div class="upload-list" aria-live="polite">
		{#if items.length === 0}
			<div class="empty-state">{emptyLabel}</div>
		{:else}
			{#each items as item (item.id)}
				{#if fileItem}
					{@render fileItem(item)}
				{:else}
					<article class="file-row" class:is-error={item.status === 'error'}>
						<div class="file-preview" aria-hidden="true">
							{#if item.previewUrl}
								<img src={item.previewUrl} alt="" />
							{:else if item.type === 'application/pdf'}
								<svg
									width="22"
									height="22"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
									<path d="M14 2v6h6"></path>
									<path d="M8 15h8"></path>
									<path d="M8 18h5"></path>
								</svg>
							{:else}
								<span>{itemInitial(item)}</span>
							{/if}
						</div>

						<div class="file-body">
							<div class="file-heading">
								<span class="file-name">{item.name}</span>
								<span class="file-size">{formatBytes(item.size)}</span>
							</div>
							<div class="file-status">
								<span class="status-pill" class:success={item.status === 'success'} class:error={item.status === 'error'}>
									{statusLabel(item)}
								</span>
								<span class="file-type">{item.type || 'Unknown type'}</span>
							</div>
							{#if item.status === 'uploading'}
								<div
									class="progress-track"
									role="progressbar"
									aria-valuemin="0"
									aria-valuemax="100"
									aria-valuenow={Math.round(item.progress ?? 0)}
									aria-label="Upload progress for {item.name}"
								>
									<span style="width: {Math.min(100, Math.max(0, item.progress ?? 0))}%"></span>
								</div>
							{/if}
						</div>

						<div class="file-actions">
							{#if item.status === 'error'}
								<button type="button" class="icon-button" onclick={() => retryItem(item)} disabled={disabled}>
									<span class="sr-only">Retry {item.name}</span>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
										<path d="M3 21v-5h5"></path>
										<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
										<path d="M16 8h5V3"></path>
									</svg>
								</button>
							{/if}
							<button type="button" class="icon-button danger" onclick={() => removeItem(item)} disabled={disabled}>
								<span class="sr-only">Remove {item.name}</span>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M18 6 6 18"></path>
									<path d="m6 6 12 12"></path>
								</svg>
							</button>
						</div>
					</article>
				{/if}
			{/each}
		{/if}
	</div>

	<div class="sr-only" aria-live="polite">{liveMessage}</div>
</section>

<style>
	.upload-dropzone {
		--upload-accent: #2563eb;
		--upload-success: #059669;
		--upload-danger: #dc2626;
		width: 100%;
		color: #172033;
	}

	.upload-dropzone.is-disabled {
		opacity: 0.62;
	}

	.upload-input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		clip-path: inset(50%);
	}

	.upload-surface {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		width: 100%;
		min-height: 8.5rem;
		padding: 1.25rem;
		border: 1.5px dashed rgba(37, 99, 235, 0.35);
		border-radius: 8px;
		background:
			linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(5, 150, 105, 0.06)),
			#fbfdff;
		box-shadow: 0 18px 45px rgba(23, 32, 51, 0.08);
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 180ms ease,
			box-shadow 180ms ease,
			transform 180ms ease,
			background 180ms ease;
	}

	.upload-surface:hover:not(:disabled),
	.upload-surface:focus-visible {
		border-color: rgba(37, 99, 235, 0.72);
		box-shadow:
			0 22px 55px rgba(37, 99, 235, 0.14),
			0 0 0 4px rgba(37, 99, 235, 0.1);
		outline: none;
		transform: translateY(-1px);
	}

	.upload-surface.is-dragging {
		border-color: rgba(5, 150, 105, 0.9);
		background:
			linear-gradient(135deg, rgba(5, 150, 105, 0.13), rgba(37, 99, 235, 0.09)),
			#f7fffb;
		box-shadow: 0 24px 60px rgba(5, 150, 105, 0.18);
	}

	.upload-surface.is-at-limit {
		border-color: rgba(100, 116, 139, 0.32);
		background: #f8fafc;
	}

	.upload-surface:disabled {
		cursor: not-allowed;
		transform: none;
	}

	.surface-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		border-radius: 8px;
		background: #ffffff;
		color: var(--upload-accent);
		box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.16);
	}

	.surface-copy {
		display: grid;
		gap: 0.28rem;
		min-width: 0;
	}

	.surface-title {
		font-size: clamp(1.05rem, 1rem + 0.3vw, 1.32rem);
		font-weight: 800;
		letter-spacing: 0;
		color: #0f172a;
	}

	.surface-description,
	.surface-meta,
	.upload-count,
	.file-size,
	.file-type {
		font-size: 0.88rem;
		line-height: 1.45;
		color: #64748b;
	}

	.surface-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.5rem;
		padding: 0 1rem;
		border-radius: 999px;
		background: #0f172a;
		color: #ffffff;
		font-size: 0.9rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.upload-count {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.85rem;
		padding: 0 0.15rem;
	}

	.upload-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 4rem;
		border: 1px solid rgba(148, 163, 184, 0.22);
		border-radius: 8px;
		background: #ffffff;
		color: #64748b;
		font-weight: 650;
	}

	.file-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.85rem;
		padding: 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.24);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.94);
		box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
	}

	.file-row.is-error {
		border-color: rgba(220, 38, 38, 0.25);
		background: #fffafa;
	}

	.file-preview {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		overflow: hidden;
		border-radius: 8px;
		background: #eef2ff;
		color: #334155;
		font-size: 0.72rem;
		font-weight: 800;
	}

	.file-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.file-body {
		display: grid;
		gap: 0.45rem;
		min-width: 0;
	}

	.file-heading,
	.file-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		min-width: 0;
	}

	.file-name {
		overflow: hidden;
		color: #0f172a;
		font-weight: 760;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		min-height: 1.45rem;
		padding: 0 0.55rem;
		border-radius: 999px;
		background: #e0f2fe;
		color: #075985;
		font-size: 0.76rem;
		font-weight: 760;
	}

	.status-pill.success {
		background: #dcfce7;
		color: #166534;
	}

	.status-pill.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.progress-track {
		height: 0.42rem;
		overflow: hidden;
		border-radius: 999px;
		background: #e2e8f0;
	}

	.progress-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--upload-accent), var(--upload-success));
		transition: width 180ms ease;
	}

	.file-actions {
		display: inline-flex;
		gap: 0.4rem;
	}

	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 0;
		border-radius: 8px;
		background: #f1f5f9;
		color: #334155;
		cursor: pointer;
		transition:
			background 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.icon-button:hover:not(:disabled),
	.icon-button:focus-visible {
		background: #dbeafe;
		color: var(--upload-accent);
		outline: none;
		transform: translateY(-1px);
	}

	.icon-button.danger:hover:not(:disabled),
	.icon-button.danger:focus-visible {
		background: #fee2e2;
		color: var(--upload-danger);
	}

	.icon-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 640px) {
		.upload-surface,
		.file-row {
			grid-template-columns: 1fr;
		}

		.surface-icon,
		.surface-action,
		.file-actions {
			justify-self: start;
		}

		.upload-count,
		.file-heading,
		.file-status {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.35rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.upload-surface,
		.icon-button,
		.progress-track span {
			transition: none;
		}

		.upload-surface:hover:not(:disabled),
		.upload-surface:focus-visible,
		.icon-button:hover:not(:disabled),
		.icon-button:focus-visible {
			transform: none;
		}
	}
</style>
