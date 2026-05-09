import type { PageServerLoad } from './$types';
import { loadGanttFromDatabase } from '$lib/server/ganttData';

export const load: PageServerLoad = async () => {
	const result = await loadGanttFromDatabase();
	return { gantt: result };
};
