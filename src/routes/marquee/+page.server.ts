/**
 * Marquee Page - Server Load Function
 *
 * Loads testimonial data from the Neon database with graceful fallback to static data.
 * Separates testimonials by category for the different marquee component demos.
 */

import { loadTestimonialsWithSource } from '$lib/server/testimonials';
import { combineDataSources, type DataSourceStatus } from '$lib/server/dataSource';
import type { Testimonial } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the Marquee demo page
 *
 * Loads testimonials from database and separates them by category:
 * - staticTestimonials: For the basic Marquee component demo
 * - interactiveTestimonials: For the MarqueeDraggable component demo
 *
 * Falls back to static data if DATABASE_URL is not configured. The two
 * results are combined so one failing query is enough to flag the page.
 */
export const load: PageServerLoad = async (): Promise<{
	staticTestimonials: Testimonial[];
	interactiveTestimonials: Testimonial[];
	usingDatabase: boolean;
	dataSource: DataSourceStatus;
	dataSourceMessage?: string;
}> => {
	const [staticResult, interactiveResult] = await Promise.all([
		loadTestimonialsWithSource('static'),
		loadTestimonialsWithSource('interactive')
	]);
	const status = combineDataSources(staticResult, interactiveResult);

	return {
		staticTestimonials: staticResult.data,
		interactiveTestimonials: interactiveResult.data,
		usingDatabase: status.usingDatabase,
		dataSource: status.source,
		dataSourceMessage: status.message
	};
};
