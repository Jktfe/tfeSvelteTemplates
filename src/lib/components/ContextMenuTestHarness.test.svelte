<script lang="ts">
	import ContextMenu, { type ContextMenuItem } from './ContextMenu.svelte';

	type Props = {
		items?: ContextMenuItem[];
		onSelect?: (id: string) => void;
		ariaLabel?: string;
		disabled?: boolean;
		class?: string;
	};

	let {
		items = [
			{ id: 'edit', label: 'Edit' },
			{ id: 'copy', label: 'Copy', shortcut: '⌘C' },
			{ type: 'divider' as const },
			{ id: 'delete', label: 'Delete', danger: true }
		],
		onSelect = () => {},
		ariaLabel = 'Context menu',
		disabled = false,
		class: extraClass = ''
	}: Props = $props();
</script>

<div data-testid="surface">
	<ContextMenu {items} {onSelect} {ariaLabel} {disabled} class={extraClass}>
		<span data-testid="trigger-content">Right-click target</span>
	</ContextMenu>
</div>
