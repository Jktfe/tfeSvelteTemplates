import type { PageServerLoad } from './$types';
import type { Card } from '$lib/types';
import { loadCardsWithSource } from '$lib/server/cards';
import type { DataSourceStatus } from '$lib/server/dataSource';

export const load: PageServerLoad = async (): Promise<{
	cards: Card[];
	usingDatabase: boolean;
	dataSource: DataSourceStatus;
	dataSourceMessage?: string;
}> => {
	const cardsResult = await loadCardsWithSource();

	return {
		cards: cardsResult.data,
		usingDatabase: cardsResult.usingDatabase,
		dataSource: cardsResult.source,
		dataSourceMessage: cardsResult.message
	};
};
