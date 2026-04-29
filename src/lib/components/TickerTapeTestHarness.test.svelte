<!--
  Internal test harness — exists only so TickerTape.test.ts can render
  a TickerTape and assert track + item structure. Not exported, not
  used by the real app. The .test.svelte suffix keeps it co-located
  with the test file but prevents shipping.
-->
<script lang="ts">
	import TickerTape, {
		type TickerItem,
		type TickerVariant,
		type TickerDirection
	} from './TickerTape.svelte';

	interface Props {
		items?: TickerItem[];
		variant?: TickerVariant;
		direction?: TickerDirection;
		pauseOnHover?: boolean;
		separator?: string;
		speed?: number;
	}

	let {
		items = [
			{ label: 'AAPL', value: '$187.42', delta: 1.2 },
			{ label: 'MSFT', value: '$418.05', delta: -0.4 },
			{ label: 'TSLA', value: '$178.30', delta: 3.1 }
		],
		variant = 'default',
		direction = 'left',
		pauseOnHover = true,
		separator = '•',
		speed = 60
	}: Props = $props();
</script>

<TickerTape {items} {variant} {direction} {pauseOnHover} {separator} {speed} />
