import type { PageServerLoad } from './$types';
import { loadCalendarDataFromDatabase, getCalendarStats } from '$lib/server/calendarData';

/**
 * Server-side data loading for CalendarHeatmap demo page
 * Loads activity data from database with graceful fallback to constants
 */
export const load: PageServerLoad = async () => {
	// Load main calendar data (general category)
	const calendarData = await loadCalendarDataFromDatabase('general');

	// Get statistics if database is available
	const stats = await getCalendarStats('general');

	// Check if using database
	const usingDatabase = !!process.env.DATABASE_URL;

	return {
		calendarData,
		stats,
		usingDatabase
	};
};
