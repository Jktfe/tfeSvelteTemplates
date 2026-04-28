<script lang="ts">
	import ToastNotification from '$lib/components/ToastNotification.svelte';
	import { addToast } from '$lib/toast.svelte';
	import type { ToastSeverity } from '$lib/types';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	function triggerToast(severity: ToastSeverity) {
		const messages = {
			success: 'Successfully updated profile!',
			error: 'Failed to connect to the server.',
			warning: 'Storage is almost full (92%).',
			info: 'A new version of the app is available.'
		};

		addToast({
			message: messages[severity],
			severity,
			duration: 5000
		});
	}

	function triggerActionToast() {
		addToast({
			message: 'Message deleted.',
			severity: 'info',
			duration: 10000,
			action: {
				label: 'Undo',
				onclick: () => alert('Undo action triggered!')
			}
		});
	}

	function triggerPersistentToast() {
		addToast({
			message: 'This notification will stay until dismissed.',
			severity: 'warning',
			duration: 0
		});
	}
</script>

<svelte:head>
	<title>Toast Notification | Svelte Templates</title>
	<meta name="description" content="Accessible, zero-dependency toast notification system for Svelte 5" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-12">
		<h1 class="text-4xl font-bold tracking-tight mb-4">Toast Notification</h1>
		<p class="text-xl text-slate-600 dark:text-slate-400 mb-6">
			A robust, accessible notification system for non-blocking global alerts.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</div>

	<!-- Demo Controls -->
	<section class="grid md:grid-cols-2 gap-8 mb-20">
		<div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
			<h2 class="text-2xl font-semibold mb-6">Interactive Demo</h2>
			<div class="grid grid-cols-2 gap-4">
				<button 
					onclick={() => triggerToast('success')}
					class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
				>
					Success Toast
				</button>
				<button 
					onclick={() => triggerToast('error')}
					class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
				>
					Error Toast
				</button>
				<button 
					onclick={() => triggerToast('warning')}
					class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
				>
					Warning Toast
				</button>
				<button 
					onclick={() => triggerToast('info')}
					class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
				>
					Info Toast
				</button>
				<button 
					onclick={triggerActionToast}
					class="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
				>
					With Action
				</button>
				<button 
					onclick={triggerPersistentToast}
					class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
				>
					Persistent
				</button>
			</div>
		</div>

		<div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
			<h2 class="text-2xl font-semibold mb-4">Key Implementation Details</h2>
			<ul class="space-y-4">
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>Rune Singleton:</strong> Uses Svelte 5 module script runes for simple global state management.</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>Stackable:</strong> Handles multiple notifications simultaneously with smooth transitions.</span>
				</li>
				<li class="flex items-start gap-3">
					<span class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 mt-1">
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
					</span>
					<span><strong>A11y Compliant:</strong> Proper ARIA roles and keyboard support out of the box.</span>
				</li>
			</ul>
		</div>
	</section>

	<!-- Code Example -->
	<section class="bg-slate-900 text-slate-100 rounded-2xl p-8 overflow-hidden shadow-xl">
		<h2 class="text-2xl font-semibold mb-6">Quick Start</h2>
		<div class="space-y-6">
				<div>
					<p class="text-slate-400 mb-2">1. Add the container to your root layout:</p>
					<pre class="bg-black/50 p-4 rounded-lg text-sm border border-white/10"><code>&lt;ToastNotification position="top-right" /&gt;</code></pre>
				</div>
			<div>
				<p class="text-slate-400 mb-2">2. Trigger a toast from anywhere:</p>
				<pre class="bg-black/50 p-4 rounded-lg text-sm border border-white/10"><code>{`import { addToast } from '$lib/toast.svelte';

addToast({
  message: "Successfully saved!",
  severity: "success"
});`}</code></pre>
			</div>
		</div>
	</section>

	<!-- The Component Instance — offsetY clears the sticky navbar -->
	<ToastNotification position="top-right" offsetY="5rem" />
</div>

<style>
	.container {
		max-width: 1000px;
	}
</style>
