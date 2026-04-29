<!--
  Internal test harness — exists only so Drawer.test.ts can render
  a Drawer with realistic snippet children (buttons + inputs) for
  focus-trap / focus-restore assertions. Not exported, not used by
  the real app. Suffixed `.test.svelte` so it never ships with the
  library; the .test naming keeps it co-located with Drawer.test.ts.
-->
<script lang="ts">
	import Drawer from './Drawer.svelte';
	import type { DrawerPosition } from './Drawer.svelte';

	interface Props {
		open?: boolean;
		position?: DrawerPosition;
		size?: number | string;
		persistent?: boolean;
		ariaLabel?: string;
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		position = 'right',
		size,
		persistent = false,
		ariaLabel = 'Drawer',
		onClose
	}: Props = $props();
</script>

<button data-testid="trigger" onclick={() => (open = true)}>Open</button>

<Drawer bind:open {position} {size} {persistent} {ariaLabel} {onClose}>
	<h2 data-testid="drawer-heading">Drawer content</h2>
	<input data-testid="first-input" type="text" placeholder="First field" />
	<input data-testid="second-input" type="text" placeholder="Second field" />
	<button data-testid="close-btn" onclick={() => (open = false)}>Close</button>
</Drawer>
