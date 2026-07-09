<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import MediaLightboxPro from '$lib/components/MediaLightboxPro.svelte';
	import type { MediaLightboxItem } from '$lib/components/MediaLightboxPro.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/medialightboxpro')!;

	const items: MediaLightboxItem[] = [
		{
			id: 'health',
			title: 'Health matrix proof',
			src: '/ComponentScreenshots/ComponentHealthMatrixShot.png',
			alt: 'ComponentHealthMatrix screenshot',
			caption: 'Catalogue health matrix route proof.'
		},
		{
			id: 'evidence',
			title: 'Evidence card proof',
			src: '/ComponentScreenshots/EvidenceCardShot.png',
			alt: 'EvidenceCard screenshot',
			caption: 'Delivery proof card route proof.'
		},
		{
			id: 'theme',
			title: 'Theme inspector proof',
			src: '/ComponentScreenshots/ThemeTokenInspectorShot.png',
			alt: 'ThemeTokenInspector screenshot',
			caption: 'Theme-token inspector route proof.'
		}
	];

const usageSnippet = `<script lang="ts">
  import MediaLightboxPro from '$lib/components/MediaLightboxPro.svelte';
</${'script'}>

<MediaLightboxPro {items} />`;
</script>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	tags={['Svelte 5', 'Media', 'Gallery', 'QA']}
	codeExplanation="MediaLightboxPro is a dependency-free proof gallery. It wraps thumbnails into a dialog with next/previous navigation and reusable index helpers for predictable media browsing."
>
	{#snippet demo()}
		<MediaLightboxPro {items} />
	{/snippet}

	{#snippet api()}
		<table>
			<thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
			<tbody>
				<tr><td><code>items</code></td><td><code>MediaLightboxItem[]</code></td><td>Media rows with src, alt, title, and optional caption.</td></tr>
				<tr><td><code>title</code></td><td><code>string</code></td><td>Gallery heading.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>
