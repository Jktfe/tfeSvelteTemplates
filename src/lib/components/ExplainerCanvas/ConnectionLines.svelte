<script lang="ts">
	/**
	 * Connection Lines Component
	 *
	 * SVG layer rendering lines between linked cards.
	 * Lines are faint by default, prominent when source or target is active.
	 *
	 * @component
	 */

	import type { ExplainerCard, ExplainerPosition, ConnectionLineStyle } from '$lib/types';
	import { getConnectionPath, DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT } from './utils/geometry';

	interface Props {
		cards: ExplainerCard[];
		lineStyle?: ConnectionLineStyle;
		activeCardId?: string | null;
		hoveredCardId?: string | null;
	}

	let {
		cards,
		lineStyle = 'bezier',
		activeCardId = null,
		hoveredCardId = null
	}: Props = $props();

	/**
	 * Build a map of card IDs to positions for quick lookup
	 */
	function buildPositionMap(cardList: ExplainerCard[]): Map<string, ExplainerPosition> {
		const map = new Map<string, ExplainerPosition>();
		for (const card of cardList) {
			map.set(card.id, card.position);
		}
		return map;
	}

	/**
	 * Generate connection line data from cards
	 */
	interface ConnectionLine {
		id: string;
		path: string;
		fromId: string;
		toId: string;
		isActive: boolean;
	}

	function generateConnections(
		cardList: ExplainerCard[],
		style: ConnectionLineStyle,
		active: string | null,
		hovered: string | null
	): ConnectionLine[] {
		const positionMap = buildPositionMap(cardList);
		const connections: ConnectionLine[] = [];
		const seen = new Set<string>();

		for (const card of cardList) {
			if (!card.links) continue;

			for (const linkId of card.links) {
				// Skip if we've already drawn this connection (for bidirectional links)
				const connectionKey = [card.id, linkId].sort().join('-');
				if (seen.has(connectionKey)) continue;
				seen.add(connectionKey);

				const fromPos = positionMap.get(card.id);
				const toPos = positionMap.get(linkId);

				if (!fromPos || !toPos) continue;

				const path = getConnectionPath(
					fromPos,
					toPos,
					style,
					{ width: DEFAULT_CARD_WIDTH, height: DEFAULT_CARD_HEIGHT }
				);

				// Connection is active if either endpoint is active or hovered
				const isActive =
					card.id === active ||
					linkId === active ||
					card.id === hovered ||
					linkId === hovered;

				connections.push({
					id: connectionKey,
					path,
					fromId: card.id,
					toId: linkId,
					isActive
				});
			}
		}

		return connections;
	}

	// Reactive connection lines
	let connections = $derived(generateConnections(cards, lineStyle, activeCardId, hoveredCardId));
</script>

<svg class="connection-lines" aria-hidden="true">
	<defs>
		<!-- Arrow marker for line ends - refX=5 puts arrow tip exactly at line endpoint -->
		<marker
			id="arrow"
			viewBox="0 0 10 10"
			refX="5"
			refY="5"
			markerWidth="8"
			markerHeight="8"
			orient="auto"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ec-line-color, #999)" />
		</marker>
		<marker
			id="arrow-active"
			viewBox="0 0 10 10"
			refX="5"
			refY="5"
			markerWidth="8"
			markerHeight="8"
			orient="auto"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ec-primary, #3b82f6)" />
		</marker>
	</defs>

	{#each connections as conn (conn.id)}
		<path
			d={conn.path}
			class="connection-line"
			class:active={conn.isActive}
			marker-end={conn.isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
		/>
	{/each}
</svg>

<style>
	.connection-lines {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}

	.connection-line {
		fill: none;
		stroke: var(--ec-line-color, #999);
		stroke-width: 2;
		opacity: var(--ec-line-opacity, 0.15);
		transition:
			opacity 0.2s ease,
			stroke 0.2s ease;
	}

	.connection-line.active {
		stroke: var(--ec-primary, #3b82f6);
		opacity: var(--ec-line-opacity-active, 1);
		stroke-width: 2.5;
	}

	/* Reduced motion: instant transitions */
	@media (prefers-reduced-motion: reduce) {
		.connection-line {
			transition: none;
		}
	}
</style>
