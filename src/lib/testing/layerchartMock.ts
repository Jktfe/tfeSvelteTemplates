/**
 * ============================================================
 * layerchart test double
 * ============================================================
 *
 * The GeoViz family (GeoChoropleth / GeoBubbleMap / GeoSpikeMap) only
 * needs five layerchart primitives. The real ones measure the DOM and
 * pull in d3 layout code that happy-dom can't size, so tests swap them
 * for the tiny stubs in ./layerchart/:
 *
 *   vi.mock('layerchart', async () => (await import('$lib/testing/layerchartMock')).layerchartModule);
 *
 * The components import layerchart statically, so the concurrent
 * dynamic-import caveat noted in leafletMock.ts doesn't apply here.
 * ============================================================
 */

import Chart from './layerchart/ChartStub.svelte';
import Svg from './layerchart/SvgStub.svelte';
import GeoContext from './layerchart/GeoContextStub.svelte';
import GeoPath from './layerchart/GeoPathStub.svelte';
import Circle from './layerchart/CircleStub.svelte';

export const layerchartModule = { Chart, Svg, GeoContext, GeoPath, Circle };

/** Mirrors the stub projection in GeoContextStub.svelte */
export function stubProjection(lng: number, lat: number): [number, number] {
	return [lng * 10, -lat * 10];
}
