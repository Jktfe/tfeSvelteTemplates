/**
 * Server-side data loading for DataGrid demo page
 *
 * This module handles:
 * - Loading employee data from database or fallback constants
 * - Providing database connection status to the client
 * - Pre-computing statistics for display
 */

import { loadEmployeesFromDatabase, getEmployeeStatistics } from '$lib/server/dataGrid';
import type { PageServerLoad } from './$types';

/**
 * Load employee data and statistics on the server
 *
 * This data is loaded once on the server and sent to the client.
 * Benefits of server-side loading:
 * - Data is available immediately on page load (no loading state needed)
 * - SEO-friendly (data rendered in initial HTML)
 * - Single source of truth for database connection status
 *
 * @returns Object containing:
 * - employees: Array of employee records
 * - usingDatabase: Boolean indicating if connected to database
 * - stats: Employee statistics (count, averages, etc.)
 */
export const load: PageServerLoad = async () => {
	// Load employee data (with automatic fallback)
	const employees = await loadEmployeesFromDatabase();

	// Check if DATABASE_URL is configured
	const usingDatabase = !!process.env.DATABASE_URL;

	// Load statistics for display
	const stats = await getEmployeeStatistics();

	return {
		employees,
		usingDatabase,
		stats
	};
};
