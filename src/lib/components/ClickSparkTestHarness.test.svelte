<!--
  Internal test harness — exists only so ClickSpark.test.ts can render
  a ClickSpark with realistic snippet children (a button) and assert
  click→burst→cleanup behaviour. Not exported, not used by the real
  app. The .test.svelte suffix keeps it co-located with the test
  file but prevents it from shipping.
-->
<script lang="ts">
	import ClickSpark, { type SparkShape } from './ClickSpark.svelte';

	interface Props {
		sparkColor?: string;
		sparkCount?: number;
		sparkSize?: number;
		spreadRadius?: number;
		duration?: number;
		shape?: SparkShape;
	}

	let {
		sparkColor = '#ffffff',
		sparkCount = 8,
		sparkSize = 10,
		spreadRadius = 60,
		duration = 500,
		shape = 'dot'
	}: Props = $props();
</script>

<ClickSpark {sparkColor} {sparkCount} {sparkSize} {spreadRadius} {duration} {shape}>
	<button data-testid="trigger">Click target</button>
</ClickSpark>
