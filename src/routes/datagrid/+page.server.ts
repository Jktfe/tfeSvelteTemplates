/**
 * Server-side data loading for the DataGrid demo page
 *
 * - Loads employees from Neon, or the FALLBACK_EMPLOYEES constants
 * - Tells the page whether writes can actually persist (a real DATABASE_URL)
 * - Tells the page whether the viewer is the read-only public demo user, so
 *   the editing demo can explain why saves are refused
 */

import { loadEmployeesFromDatabase, getEmployeeStatistics } from '$lib/server/dataGrid';
import { isDatabaseConfigured } from '$lib/server/dataSource';
import { isDemoUser } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const [employees, stats] = await Promise.all([
		loadEmployeesFromDatabase(),
		getEmployeeStatistics()
	]);

	return {
		employees,
		// The placeholder URL from .env.example counts as "not configured".
		usingDatabase: isDatabaseConfigured(),
		isDemoUser: isDemoUser(event),
		stats
	};
};
