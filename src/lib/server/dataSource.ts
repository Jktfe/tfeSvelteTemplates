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
