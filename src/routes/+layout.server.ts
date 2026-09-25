import type { LayoutServerLoad } from './$types';
import { isBetterAuthConfigured, toAuthUser } from '$lib/server/betterAuth';
import { getComponentDocsForRoute } from '$lib/server/componentDocs';

export const load: LayoutServerLoad = ({ locals, route }) => {
	return {
		isAuthConfigured: isBetterAuthConfigured(),
		authUser: toAuthUser(locals.user),
		// The current demo route's sibling .md, rendered on the server so the
		// browser never downloads the doc corpus or the markdown pipeline.
		// Reading `route.id` (not `url`) means this only re-runs when the
		// route changes, not on query-string or hash changes.
		componentDocs: getComponentDocsForRoute(route.id)
	};
};
