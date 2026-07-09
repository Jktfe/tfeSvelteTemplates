<!--
  Root error boundary — renders for any 404/500 that isn't handled by a more
  specific +error.svelte. Uses the project theme tokens so it reads correctly
  in both light and dark, and always offers a route back home.
-->
<script lang="ts">
	import { page } from '$app/stores';

	const status = $derived($page.status);
	const message = $derived($page.error?.message ?? 'Something went wrong.');
	const heading = $derived(status === 404 ? 'Page not found' : 'Something went wrong');
</script>

<svelte:head>
	<title>{status} — TFE / Svelte Templates</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="err">
	<p class="err__status">{status}</p>
	<h1 class="err__heading">{heading}</h1>
	<p class="err__message">{message}</p>
	<a class="err__home" href="/">← Back to the component library</a>
</main>

<style>
	.err {
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 4rem 1.5rem;
		text-align: center;
		color: var(--fg, #111);
	}

	.err__status {
		font-family: 'Anton', system-ui, sans-serif;
		font-size: clamp(3rem, 12vw, 6rem);
		line-height: 1;
		margin: 0;
		color: var(--accent, #2563eb);
	}

	.err__heading {
		font-size: 1.5rem;
		margin: 0;
	}

	.err__message {
		margin: 0;
		max-width: 42ch;
		color: var(--fg-3, #777e85);
	}

	.err__home {
		margin-top: 1rem;
		font-weight: 600;
		color: var(--accent, #2563eb);
		text-decoration: none;
	}

	.err__home:hover {
		text-decoration: underline;
	}
</style>
