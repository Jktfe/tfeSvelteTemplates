<script lang="ts">
	import ConfettiBurst, { type ConfettiOrigin } from './ConfettiBurst.svelte';

	interface Props {
		count?: number;
		spread?: number;
		velocity?: number;
		gravity?: number;
		duration?: number;
		palette?: readonly string[];
		origin?: ConfettiOrigin;
		onComplete?: () => void;
		ariaLabel?: string;
		class?: string;
	}

	let { onComplete = () => {}, ...rest }: Props = $props();

	let burst = $state<ConfettiBurst | null>(null);

	function triggerFire() {
		burst?.fire();
	}

	function triggerFireWithOrigin() {
		burst?.fire({ origin: { x: 100, y: 200 } });
	}
</script>

<button type="button" data-testid="fire-button" onclick={triggerFire}>Fire</button>
<button type="button" data-testid="fire-with-origin" onclick={triggerFireWithOrigin}>
	Fire at custom origin
</button>

<ConfettiBurst bind:this={burst} {onComplete} {...rest} />
