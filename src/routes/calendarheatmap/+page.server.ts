import type { PageServerLoad } from './$types';
import { loadCalendarDataWithSource, getCalendarStats } from '$lib/server/calendarData';

/**
 * Server-side data loading for CalendarHeatmap demo page
 * Loads activity data from database with graceful fallback to constants
 */
export const load: PageServerLoad = async () => {
	const [result, stats] = await Promise.all([
		// Main calendar data (general category)
		loadCalendarDataWithSource('general'),
		// Statistics are null whenever the database is not available
		getCalendarStats('general')
	]);

	return {
		calendarData: result.data,
		stats,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message
	};
};
