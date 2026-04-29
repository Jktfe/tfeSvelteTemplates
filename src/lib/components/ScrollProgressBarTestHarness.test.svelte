<!--
  ============================================================
  ScrollProgressBarTestHarness
  ============================================================

  Minimal Svelte file that imports the ScrollProgressBar
  component. Its only purpose is to confirm the component
  compiles in the Svelte / TypeScript pipeline (svelte-check
  covers it).

  Behavioural rendering tests live in ScrollProgressBar.test.ts
  via the pure-helper exports — no DOM coupling required.
  ============================================================
-->
<script lang="ts">
	import ScrollProgressBar from './ScrollProgressBar.svelte';
</script>

<ScrollProgressBar />
<ScrollProgressBar variant="bold" position="bottom" color="#10b981" />
<ScrollProgressBar variant="gradient" height={4} />
<ScrollProgressBar variant="pulse" color="#ec4899" aria-label="Article progress" />
