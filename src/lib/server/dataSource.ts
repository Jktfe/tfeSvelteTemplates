import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type DataSourceStatus = 'database' | 'fallback' | 'error' | 'static';

/** The neon tagged-template query function, as returned by `neon(url)`. */
export type Sql = NeonQueryFunction<false, false>;

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

/**
 * Build an error result WITHOUT leaking driver internals to the client.
 *
 * Raw Postgres/neon error strings can carry the host, SQLSTATE codes and
 * column/relation names — none of which belong in a page rendered to the
 * browser (via DatabaseStatus). We log the full error server-side and hand
 * the client a generic, safe message instead.
 */
export const fromDatabaseError = <T>(data: T, error: unknown): DataSourceResult<T> => {
	console.error('[dataSource] Database error:', error);
	return {
		data,
		source: 'error',
		usingDatabase: false,
		databaseConfigured: true,
		message: 'A database error occurred. Falling back to sample data — see server logs for details.'
	};
};

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

/**
 * Run a database query behind the standard graceful-degrade shell.
 *
 * This centralises the six steps every `loadXFromDatabase` used to repeat by
 * hand: resolve the configured URL, fall back cleanly when unconfigured,
 * construct the neon client, run the query, and translate a missing-table or
 * generic driver error into the right `DataSourceResult`. Callers supply only
 * the fallback data and the query itself.
 *
 * @param fallback - Data to serve when the DB is unconfigured or errors
 * @param run - Receives the neon `sql` tag and returns the transformed data
 * @param opts.schemaFile - If set, a "relation does not exist" error becomes a
 *   friendly "run database/<schemaFile>" hint instead of an error badge
 * @param opts.fallbackMessage - Overrides the default "not configured" message
 *
 * @example
 * ```typescript
 * export const loadCardsFromDatabase = () =>
 *   withDatabase(FALLBACK_CARDS, async (sql) => {
 *     const rows = await sql`SELECT * FROM cards WHERE is_active = TRUE`;
 *     return rows.map(rowToCard);
 *   }, { schemaFile: 'schema.sql' });
 * ```
 */
export async function withDatabase<T>(
	fallback: T,
	run: (sql: Sql) => Promise<T>,
	opts?: { schemaFile?: string; fallbackMessage?: string }
): Promise<DataSourceResult<T>> {
	const databaseUrl = getConfiguredDatabaseUrl();
	if (!databaseUrl) return fromFallback(fallback, opts?.fallbackMessage);

	try {
		const sql = neon(databaseUrl);
		const data = await run(sql);
		return fromDatabase(data);
	} catch (error) {
		if (opts?.schemaFile && isMissingTableError(error)) {
			return fromMissingTable(fallback, opts.schemaFile);
		}
		return fromDatabaseError(fallback, error);
	}
}

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
