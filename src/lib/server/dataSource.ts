export type DataSourceStatus = 'database' | 'fallback' | 'error' | 'static';

export interface DataSourceResult<T> {
	data: T;
	source: DataSourceStatus;
	usingDatabase: boolean;
	databaseConfigured: boolean;
	message?: string;
}

export const isPlaceholderDatabaseUrl = (url: string | undefined): boolean =>
	!url ||
	url.includes('username:password@host.neon.tech') ||
	url.includes('your_connection_string_here');

export const getConfiguredDatabaseUrl = (): string | undefined => {
	const databaseUrl = process.env.DATABASE_URL;
	return isPlaceholderDatabaseUrl(databaseUrl) ? undefined : databaseUrl;
};

export const isDatabaseConfigured = (): boolean => !!getConfiguredDatabaseUrl();

export const fromDatabase = <T>(data: T): DataSourceResult<T> => ({
	data,
	source: 'database',
	usingDatabase: true,
	databaseConfigured: true
});

export const fromFallback = <T>(data: T, message = 'DATABASE_URL is not configured'): DataSourceResult<T> => ({
	data,
	source: 'fallback',
	usingDatabase: false,
	databaseConfigured: false,
	message
});

export const fromDatabaseError = <T>(data: T, error: unknown): DataSourceResult<T> => ({
	data,
	source: 'error',
	usingDatabase: false,
	databaseConfigured: true,
	message: error instanceof Error ? error.message : String(error)
});

/**
 * Postgres throws "relation X does not exist" (SQLSTATE 42P01) when the
 * database is configured but the component's schema hasn't been provisioned
 * yet. That's a setup state, not a bug — surface it as a friendly fallback
 * with a hint about which schema to run, instead of a scary error badge.
 */
export const isMissingTableError = (error: unknown): boolean => {
	if (!error) return false;
	const message = error instanceof Error ? error.message : String(error);
	return /relation .+ does not exist/i.test(message);
};

export const fromMissingTable = <T>(data: T, schemaFile: string): DataSourceResult<T> => ({
	data,
	source: 'fallback',
	usingDatabase: false,
	databaseConfigured: true,
	message: `Schema not provisioned — run database/${schemaFile} on your Neon database to enable live data.`
});

export const fromStatic = <T>(data: T): DataSourceResult<T> => ({
	data,
	source: 'static',
	usingDatabase: false,
	databaseConfigured: false
});

export const combineDataSources = (
	...results: Array<Pick<DataSourceResult<unknown>, 'source' | 'usingDatabase' | 'databaseConfigured' | 'message'>>
): Pick<DataSourceResult<unknown>, 'source' | 'usingDatabase' | 'databaseConfigured' | 'message'> => {
	const errorResult = results.find((result) => result.source === 'error');
	if (errorResult) {
		return {
			source: 'error',
			usingDatabase: false,
			databaseConfigured: true,
			message: errorResult.message
		};
	}

	const fallbackResult = results.find((result) => result.source === 'fallback');
	if (fallbackResult) {
		return {
			source: 'fallback',
			usingDatabase: false,
			databaseConfigured: fallbackResult.databaseConfigured,
			message: fallbackResult.message
		};
	}

	const allDatabase = results.length > 0 && results.every((result) => result.source === 'database');
	if (allDatabase) {
		return {
			source: 'database',
			usingDatabase: true,
			databaseConfigured: true
		};
	}

	return {
		source: 'static',
		usingDatabase: false,
		databaseConfigured: false
	};
};

export interface LoadWithFallbackOptions {
	/** Short tag used in log lines, e.g. `'DataGrid'`. */
	label: string;
	/**
	 * Schema file under `database/` that creates the table(s) this loader reads.
	 * When set, a "relation does not exist" error becomes a friendly fallback
	 * pointing at that file rather than a red error badge.
	 */
	schemaFile?: string;
}

/**
 * The standard "try the database, otherwise use the fixture" read path, kept in
 * one place so every server utility reports its status the same way.
 *
 * The query receives the connection string rather than a ready-made client so
 * each module keeps its own `neon()` import — that keeps modules copy-paste
 * portable and lets tests mock `@neondatabase/serverless` per file.
 */
export async function loadWithFallback<T>(
	fallback: T,
	query: (databaseUrl: string) => Promise<T>,
	{ label, schemaFile }: LoadWithFallbackOptions
): Promise<DataSourceResult<T>> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn(`[${label}] DATABASE_URL not configured, using fallback data`);
		return fromFallback(fallback);
	}

	try {
		return fromDatabase(await query(databaseUrl));
	} catch (err) {
		if (schemaFile && isMissingTableError(err)) {
			return fromMissingTable(fallback, schemaFile);
		}
		console.error(`[${label}] Error loading from database:`, err);
		return fromDatabaseError(fallback, err);
	}
}

/**
 * Write paths have nothing sensible to fall back to, so they insist on a real
 * connection string. The message deliberately contains `DATABASE_URL` — API
 * routes match on it to answer 503 instead of a generic 500.
 */
export function requireDatabaseUrl(action: string): string {
	const databaseUrl = getConfiguredDatabaseUrl();
	if (!databaseUrl) {
		throw new Error(`Cannot ${action}: DATABASE_URL not configured`);
	}
	return databaseUrl;
}
