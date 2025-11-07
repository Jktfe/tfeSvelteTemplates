/**
 * Marquee Page - Server Load Function
 *
 * Loads testimonial data from the Neon database with graceful fallback to static data.
 * Separates testimonials by category for the different marquee component demos.
 */

import { loadTestimonialsFromDatabase } from '$lib/server/testimonials';
import type { Testimonial } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Server-side load function for the Marquee demo page
 *
 * Loads testimonials from database and separates them by category:
 * - staticTestimonials: For the basic Marquee component demo
 * - interactiveTestimonials: For the MarqueeDraggable component demo
 *
 * Falls back to static data if DATABASE_URL is not configured.
 */
export const load: PageServerLoad = async (): Promise<{
	staticTestimonials: Testimonial[];
	interactiveTestimonials: Testimonial[];
	usingDatabase: boolean;
}> => {
	// Load testimonials from database (or fallback data)
	const staticTestimonials = await loadTestimonialsFromDatabase('static');
	const interactiveTestimonials = await loadTestimonialsFromDatabase('interactive');

	// Determine if we're using the database or fallback data
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		staticTestimonials,
		interactiveTestimonials,
		usingDatabase
	};
};
