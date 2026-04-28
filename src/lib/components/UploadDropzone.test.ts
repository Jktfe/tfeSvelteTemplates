import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import UploadDropzone from './UploadDropzone.svelte';
import type { UploadDropzoneItem } from '$lib/types';

function makeFile(name = 'brief.txt', type = 'text/plain', sizeContent = 'hello') {
	return new File([sizeContent], name, { type });
}

describe('UploadDropzone', () => {
	it('renders the default upload surface', () => {
		render(UploadDropzone);

		expect(screen.getByRole('button', { name: /drop files here/i })).toBeInTheDocument();
		expect(screen.getByText('No files selected')).toBeInTheDocument();
		expect(screen.getByText('0 / 8 selected')).toBeInTheDocument();
	});

	it('accepts files from the native file input', async () => {
		const onFilesAdded = vi.fn();
		const onChange = vi.fn();
		render(UploadDropzone, {
			props: {
				accept: 'text/plain',
				onFilesAdded,
				onChange
			}
		});

		const file = makeFile();
		const input = screen.getByLabelText('Choose files to upload') as HTMLInputElement;
		await fireEvent.change(input, { target: { files: [file] } });

		expect(onFilesAdded).toHaveBeenCalledTimes(1);
		expect(onFilesAdded.mock.calls[0][0][0].name).toBe('brief.txt');
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(screen.getByText('brief.txt')).toBeInTheDocument();
		expect(screen.getByText('Ready')).toBeInTheDocument();
	});

	it('rejects files that do not match accept rules', async () => {
		const onFilesRejected = vi.fn();
		render(UploadDropzone, {
			props: {
				accept: 'image/*',
				onFilesRejected
			}
		});

		const input = screen.getByLabelText('Choose files to upload') as HTMLInputElement;
		await fireEvent.change(input, { target: { files: [makeFile()] } });

		expect(onFilesRejected).toHaveBeenCalledTimes(1);
		expect(onFilesRejected.mock.calls[0][0][0].reason).toBe('type');
		expect(screen.getByText('No files selected')).toBeInTheDocument();
	});

	it('rejects files larger than maxSize', async () => {
		const onFilesRejected = vi.fn();
		render(UploadDropzone, {
			props: {
				maxSize: 2,
				onFilesRejected
			}
		});

		const input = screen.getByLabelText('Choose files to upload') as HTMLInputElement;
		await fireEvent.change(input, { target: { files: [makeFile('large.txt', 'text/plain', 'large')] } });

		expect(onFilesRejected).toHaveBeenCalledTimes(1);
		expect(onFilesRejected.mock.calls[0][0][0].reason).toBe('size');
	});

	it('renders supplied progress and status states', () => {
		const files: UploadDropzoneItem[] = [
			{
				id: 'uploading',
				name: 'deck.pdf',
				size: 1200,
				type: 'application/pdf',
				status: 'uploading',
				progress: 42
			},
			{
				id: 'done',
				name: 'image.png',
				size: 2048,
				type: 'image/png',
				status: 'success',
				progress: 100
			}
		];

		render(UploadDropzone, { props: { files } });

		expect(screen.getByText('deck.pdf')).toBeInTheDocument();
		expect(screen.getByText('Uploading 42%')).toBeInTheDocument();
		expect(screen.getByRole('progressbar', { name: /deck.pdf/i })).toHaveAttribute(
			'aria-valuenow',
			'42'
		);
		expect(screen.getByText('Uploaded')).toBeInTheDocument();
	});

	it('calls remove handler when removing a row', async () => {
		const onRemove = vi.fn();
		const files: UploadDropzoneItem[] = [
			{
				id: 'remove-me',
				name: 'remove-me.pdf',
				size: 1024,
				type: 'application/pdf',
				status: 'ready'
			}
		];

		render(UploadDropzone, { props: { files, onRemove } });

		await fireEvent.click(screen.getByRole('button', { name: /remove remove-me.pdf/i }));
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onRemove.mock.calls[0][0].name).toBe('remove-me.pdf');
	});

	it('calls retry handler for failed rows', async () => {
		const onRetry = vi.fn();
		const files: UploadDropzoneItem[] = [
			{
				id: 'failed',
				name: 'failed.mov',
				size: 4096,
				type: 'video/quicktime',
				status: 'error',
				error: 'Network failed'
			}
		];

		render(UploadDropzone, { props: { files, onRetry } });

		await fireEvent.click(screen.getByRole('button', { name: /retry failed.mov/i }));
		expect(onRetry).toHaveBeenCalledTimes(1);
		expect(onRetry.mock.calls[0][0].name).toBe('failed.mov');
	});
});
