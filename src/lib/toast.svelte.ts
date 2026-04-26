import type { ToastData } from './types';

// Internal state for the toast stack
const toastStack = $state<Required<ToastData>[]>([]);

/**
 * Public API to trigger a toast from anywhere
 */
export function addToast(toast: ToastData) {
	const id = toast.id || Math.random().toString(36).substring(2, 9);
	const newToast: Required<ToastData> = {
		id,
		message: toast.message,
		severity: toast.severity || 'info',
		duration: toast.duration ?? 5000,
		dismissible: toast.dismissible ?? true,
		action: toast.action || { label: '', onclick: () => {} }
	};

	toastStack.push(newToast);

	// Handle auto-dismiss
	if (newToast.duration > 0) {
		setTimeout(() => {
			dismissToast(id);
		}, newToast.duration);
	}

	return id;
}

/**
 * Public API to dismiss a specific toast
 */
export function dismissToast(id: string) {
	const index = toastStack.findIndex((t) => t.id === id);
	if (index !== -1) {
		toastStack.splice(index, 1);
	}
}

/**
 * Get the current toast stack
 */
export function getToasts() {
	return toastStack;
}
