<!--
  ============================================================
  ReadingTOCTestHarness
  ============================================================

  Minimal Svelte file that imports the ReadingTOC component.
  Its only purpose is to confirm the component compiles in
  the Svelte / TypeScript pipeline (svelte-check covers it).

  Behavioural rendering tests live in ReadingTOC.test.ts
  via the pure-helper exports — no DOM coupling required.

  Pre-supplied headings bypass the IntersectionObserver path
  so the harness compiles cleanly in any environment.
  ============================================================
-->
<script lang="ts">
	import ReadingTOC, { type Heading } from './ReadingTOC.svelte';

	const sampleHeadings: Heading[] = [
		{ id: 'intro', text: 'Introduction', level: 2 },
		{ id: 'setup', text: 'Setup', level: 2 },
		{ id: 'api', text: 'API', level: 2 },
		{ id: 'props', text: 'Props', level: 3 },
		{ id: 'events', text: 'Events', level: 3 },
		{ id: 'recipes', text: 'Recipes', level: 2 }
	];
</script>

<ReadingTOC />

<ReadingTOC headings={sampleHeadings} variant="rail" position="left" size="md" />

<ReadingTOC
	headings={sampleHeadings}
	variant="rail"
	position="right"
	size="lg"
	title="Contents"
/>

<ReadingTOC headings={sampleHeadings} variant="top" size="sm" />

<ReadingTOC
	headings={sampleHeadings}
	variant="drawer"
	aria-label="Article navigation"
	class="custom-toc"
/>

<ReadingTOC target="#article-body" levels={[2, 3]} variant="rail" />
