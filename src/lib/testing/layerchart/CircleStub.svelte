<!-- Test double for layerchart's <Circle>: a bare SVG <circle>. -->
<script lang="ts">
	interface Props {
		cx?: number;
		cy?: number;
		r?: number;
		fill?: string;
		stroke?: string;
		strokeWidth?: number;
		class?: string;
	}

	let { cx = 0, cy = 0, r = 0, fill, stroke, strokeWidth, class: className = '' }: Props = $props();
</script>

<circle class={className} {cx} {cy} {r} {fill} {stroke} stroke-width={strokeWidth}></circle>
