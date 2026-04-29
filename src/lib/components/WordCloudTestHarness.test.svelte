<!--
  ============================================================
  WordCloudTestHarness
  ============================================================

  Minimal Svelte file that imports the WordCloud component.
  Its only purpose is to confirm the component compiles in
  the Svelte / TypeScript pipeline (svelte-check covers it).

  Behavioural rendering tests live in WordCloud.test.ts via
  the pure-helper exports — no DOM coupling required.
  ============================================================
-->
<script lang="ts">
	import WordCloud from './WordCloud.svelte';
	import type { WordCloudWord } from './WordCloud.svelte';

	const words: WordCloudWord[] = [
		{ text: 'svelte', weight: 42 },
		{ text: 'rune', weight: 28 },
		{ text: 'reactivity', weight: 22 },
		{ text: 'store', weight: 18, href: '/docs/store' },
		{ text: 'snippet', weight: 14 },
		{ text: 'effect', weight: 11 }
	];

	function handleClick(word: WordCloudWord) {
		// Harness — no-op
		void word;
	}
</script>

<WordCloud {words} variant="organic" />
<WordCloud {words} variant="grid" rotation="alternating" />
<WordCloud {words} variant="radial" rotation="random" seed={42} onWordClick={handleClick} />
