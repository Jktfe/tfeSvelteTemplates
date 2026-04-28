<script lang="ts">
	import AlertBanner from '$lib/components/AlertBanner.svelte';

	let errorVisible = $state(true);
	let warningVisible = $state(true);
</script>

<svelte:head>
	<title>AlertBanner | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">AlertBanner</h1>
			<p class="text-xl text-muted-foreground">
				Inline status banner for info, success, warning, and error states. Lives in the page flow —
				not a toast.
			</p>
		</header>

		<!-- Four variants -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Four variants</h2>
			<p class="text-sm text-neutral-500">
				Each variant has its own palette, icon, and ARIA role. <code>warning</code> and
				<code>error</code> use <code>role="alert"</code> (assertive), <code>info</code> and
				<code>success</code> use <code>role="status"</code> (polite).
			</p>
			<div class="space-y-3">
				<AlertBanner variant="info" title="Heads up" message="A scheduled maintenance window starts at 02:00 GMT." />
				<AlertBanner variant="success" title="Saved!" message="Your changes are live." />
				<AlertBanner variant="warning" title="Trial ending" message="Your trial ends in 3 days. Upgrade to keep your data." />
				<AlertBanner variant="error" title="Save failed" message="We couldn't reach the server. Please try again." />
			</div>
		</section>

		<!-- Dismissable -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Dismissable</h2>
			<p class="text-sm text-neutral-500">
				Pass <code>dismissable</code> and <code>onDismiss</code> to render an × button.
			</p>
			<div class="space-y-3">
				{#if errorVisible}
					<AlertBanner
						variant="error"
						title="Connection lost"
						message="We've stopped syncing your changes."
						dismissable
						onDismiss={() => (errorVisible = false)}
					/>
				{:else}
					<button
						type="button"
						class="text-sm text-blue-600 underline"
						onclick={() => (errorVisible = true)}
					>
						Bring the error banner back
					</button>
				{/if}

				{#if warningVisible}
					<AlertBanner
						variant="warning"
						message="You're about to delete 3 items. This cannot be undone."
						dismissable
						onDismiss={() => (warningVisible = false)}
					/>
				{:else}
					<button
						type="button"
						class="text-sm text-blue-600 underline"
						onclick={() => (warningVisible = true)}
					>
						Bring the warning banner back
					</button>
				{/if}
			</div>
		</section>

		<!-- With actions -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">With inline actions</h2>
			<p class="text-sm text-neutral-500">
				Pass a <code>children</code> snippet to add links or buttons inside the banner.
			</p>
			<div class="space-y-3">
				<AlertBanner variant="info" title="A new version is available">
					<a class="underline font-semibold" href="#refresh">Refresh now</a>
					<a class="underline" href="#changelog">See what's new</a>
				</AlertBanner>

				<AlertBanner variant="warning" title="Action required" message="Please verify your email address.">
					<button type="button" class="underline font-semibold">Resend email</button>
				</AlertBanner>
			</div>
		</section>

		<!-- Message-only -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Message only</h2>
			<p class="text-sm text-neutral-500">Title is optional — pass just a message.</p>
			<div class="space-y-3">
				<AlertBanner variant="success" message="Profile updated." />
				<AlertBanner variant="info" message="Tip: press ⌘K to open the command palette." />
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Four variants: info, success, warning, error</li>
					<li>Optional bold title + message body</li>
					<li>Dismissable with an × button (optional)</li>
					<li>Inline action slot via <code>children</code> snippet</li>
					<li>ARIA: assertive for warning/error, polite for info/success</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Inline SVG icons — no icon library</li>
					<li>Zero external dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import AlertBanner from '$lib/components/AlertBanner.svelte';
  let shown = $state(true);
</${''}script>

<AlertBanner
  variant="success"
  title="Saved!"
  message="Your changes are live."
/>

{#if shown}
  <AlertBanner
    variant="error"
    message="Save failed."
    dismissable
    onDismiss={() => shown = false}
  />
{/if}`}</code></pre>
			</div>
		</section>
	</div>
</div>
