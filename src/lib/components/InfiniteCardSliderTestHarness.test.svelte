<!--
	Test wrapper for InfiniteCardSlider's children snippet.
	Snippets can't be passed from a plain Vitest render call, so this harness
	supplies one that renders a recognisable custom card.
-->
<script lang="ts">
	import InfiniteCardSlider, { type SliderItem } from './InfiniteCardSlider.svelte';

	interface Props {
		items: SliderItem[];
	}

	let { items }: Props = $props();
</script>

<InfiniteCardSlider {items} ariaLabel="Custom shelf">
	{#snippet children(item, index)}
		<div class="custom-card" data-testid="custom-card">{index}:{item.title}</div>
	{/snippet}
</InfiniteCardSlider>
