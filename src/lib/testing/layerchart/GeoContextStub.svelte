<!--
  Test double for layerchart's <GeoContext>.

  Legacy (non-runes) on purpose: GeoBubbleMap and GeoSpikeMap read the
  projection through `let:projection`, which needs a real <slot> with slot
  props. The projection is a simple linear stand-in (x = lng × 10,
  y = −lat × 10) so tests can predict where a point lands.
-->
<script lang="ts">
	const projection = ([lng, lat]: [number, number]): [number, number] => [lng * 10, -lat * 10];
</script>

<g class="lc-geo-context"><slot {projection} /></g>
