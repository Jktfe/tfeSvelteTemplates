/**
 * Calendar activity data utilities
 * Server-side functions for loading calendar heatmap data from database
 * Follows project pattern: Neon PostgreSQL with graceful fallback to constants
 */

import { neon } from '@neondatabase/serverless';
import type { CalendarDataPoint } from '$lib/types';
import { FALLBACK_CALENDAR_DATA } from '$lib/constants';
import { getConfiguredDatabaseUrl, loadWithFallback, type DataSourceResult } from './dataSource';

/**
 * Load calendar activity data plus where it came from (database / fallback / error).
 * Falls back to FALLBACK_CALENDAR_DATA if the database is not configured or the query fails.
 *
 * @param category - Optional category filter (e.g., 'general', 'coding', 'exercise')
 * @param userId - Optional user ID filter (default: 1)
 * @param days - Number of days to fetch (default: 365)
 */
export async function loadCalendarDataWithSource(
	category: string = 'general',
	userId: number = 1,
	days: number = 365
): Promise<DataSourceResult<CalendarDataPoint[]>> {
	return loadWithFallback(
		FALLBACK_CALENDAR_DATA,
		async (databaseUrl) => {
			const sql = neon(databaseUrl);

			const rows = await sql`
				SELECT
					activity_date,
					activity_count
				FROM calendar_activity
				WHERE
					user_id = ${userId}
					AND category = ${category}
					AND activity_date >= CURRENT_DATE - (${days} || ' days')::INTERVAL
					AND is_active = TRUE
				ORDER BY activity_date ASC
			`;

			// Neon may return Date objects or ISO strings - handle both cases
			return rows.map((row) => {
				const dateVal = row.activity_date;
				const dateStr =
					dateVal instanceof Date
						? dateVal.toISOString().split('T')[0]
						: String(dateVal).split('T')[0];
				return {
					date: dateStr,
					value: Number(row.activity_count)
				};
			});
		},
		{ label: 'CalendarData', schemaFile: 'schema_calendar.sql' }
	);
}

/**
 * Load calendar activity data from Neon database (rows only).
 *
 * @example
 * ```typescript
 * // In +page.server.ts
 * export const load: PageServerLoad = async () => {
 *   const activityData = await loadCalendarDataFromDatabase('general');
 *   return { activityData };
 * };
 * ```
 */
export async function loadCalendarDataFromDatabase(
	category: string = 'general',
	userId: number = 1,
	days: number = 365
): Promise<CalendarDataPoint[]> {
	return (await loadCalendarDataWithSource(category, userId, days)).data;
}

/**
 * Get list of available categories for a user
 * Useful for demo pages with category switchers
 *
 * @param userId - User ID to query (default: 1)
 * @returns Array of category names
 */
export async function getCalendarCategories(userId: number = 1): Promise<string[]> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		return ['general'];
	}

	try {
		const sql = neon(databaseUrl);

		const rows = await sql`
			SELECT DISTINCT category
			FROM calendar_activity
			WHERE user_id = ${userId} AND is_active = TRUE
			ORDER BY category ASC
		`;

		return rows.map((row) => row.category);
	} catch (error) {
		console.error('[CalendarData] Error loading categories:', error);
		return ['general'];
	}
}

/**
 * Get activity statistics for a category
 * Returns total days with activity, average, and max values
 *
 * @param category - Category to analyze
 * @param userId - User ID (default: 1)
 * @returns Statistics object or null if error
 */
export async function getCalendarStats(
	category: string = 'general',
	userId: number = 1
): Promise<{
	totalDays: number;
	avgActivity: number;
	maxActivity: number;
	totalActivity: number;
} | null> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		return null;
	}

	try {
		const sql = neon(databaseUrl);

		const rows = await sql`
			SELECT
				COUNT(*) as total_days,
				ROUND(AVG(activity_count), 2) as avg_activity,
				MAX(activity_count) as max_activity,
				SUM(activity_count) as total_activity
			FROM calendar_activity
			WHERE
				user_id = ${userId}
				AND category = ${category}
				AND activity_date >= CURRENT_DATE - INTERVAL '365 days'
				AND is_active = TRUE
		`;

		if (rows.length === 0) return null;

		const row = rows[0];
		return {
			totalDays: Number(row.total_days),
			avgActivity: Number(row.avg_activity),
			maxActivity: Number(row.max_activity),
			totalActivity: Number(row.total_activity)
		};
	} catch (error) {
		console.error('[CalendarData] Error loading stats:', error);
		return null;
	}
}
