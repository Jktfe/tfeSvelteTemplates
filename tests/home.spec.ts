import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

type CatalogItem = {
	name: string;
	href: string;
	description: string;
};

type CatalogCategory = {
	name: string;
	summary: string;
	components: CatalogItem[];
};

type RepresentativeLink = {
	category: CatalogCategory;
	item: CatalogItem;
};

const catalog = readComponentCatalog();
const componentTotal = catalog.reduce((total, category) => total + category.components.length, 0);
const representativeLinks = catalog
	.map((category) => ({ category, item: category.components[0] }))
	.filter((entry): entry is RepresentativeLink => Boolean(entry.item));
const wordCloudEntry = catalog
	.flatMap((category) => category.components.map((item) => ({ category, item })))
	.find(({ item }) => item.name.toLowerCase() === 'wordcloud');

test.describe('homepage catalogue smoke', () => {
	test('loads and shows the v2 TFE / Svelte library hero', async ({ page }) => {
		const pageErrors = collectPageErrors(page);

		await page.goto('/');

		await expect(page).toHaveTitle(/TFE.*Svelte Templates/i);
		await expect(page.getByText(/TFE.*Svelte 5 Templates/i).first()).toBeVisible();
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: /A Working\s+Library\s+of\s+Svelte\s+Parts\.?/i
			})
		).toBeVisible();
		await expect(page.getByText(/I.m @Jktfe/i)).toBeVisible();
		await expect(page.getByText(currentCountsPattern()).first()).toBeVisible();
		await expect(
			page.getByRole('link', {
				name: new RegExp(`Browse\\s+${componentTotal}\\s+components`, 'i')
			})
		).toBeVisible();
		expectNoPageErrors(pageErrors);
	});

	test('filters the catalogue from the wordcloud query string', async ({ page }) => {
		expect(wordCloudEntry, 'WordCloud must exist in componentCatalog.ts').toBeDefined();
		if (!wordCloudEntry) return;

		await page.goto('/?q=wordcloud');

		await expect(page.getByRole('searchbox', { name: /search components/i })).toHaveValue(
			/wordcloud/i
		);
		await expect(
			page.getByRole('heading', { level: 3, name: wordCloudEntry.category.name })
		).toBeVisible();

		for (const category of catalog.filter((entry) => entry.name !== wordCloudEntry.category.name)) {
			await expect(page.getByRole('heading', { level: 3, name: category.name })).toHaveCount(0);
		}

		const matchingShelf = page.getByRole('region', {
			name: new RegExp(`^${escapeRegExp(wordCloudEntry.category.name)} shelf$`, 'i')
		});
		const matchingLink = matchingShelf.locator(cssHrefSelector(wordCloudEntry.item.href));
		await expect(matchingLink).toHaveCount(1);
		await expect(matchingLink.first()).toContainText(wordCloudEntry.item.name);
	});

	test('exposes a representative route link from each catalogue shelf', async ({ page }) => {
		await page.goto('/');

		for (const { category, item } of representativeLinks) {
			const shelf = page.getByRole('region', {
				name: new RegExp(`^${escapeRegExp(category.name)} shelf$`, 'i')
			});
			await expect(shelf, `${category.name} shelf`).toBeVisible();

			const routeLink = shelf.locator(cssHrefSelector(item.href));
			await expect(routeLink, `${category.name} representative link`).toHaveCount(1);
			await expect(routeLink.first(), `${category.name} representative label`).toContainText(item.name);

			const response = await page.request.get(item.href);
			expect(response.status(), `${category.name}: ${item.href}`).toBeLessThan(500);
		}
	});

	test('renders the homepage in a small mobile viewport without obvious page errors', async ({
		page
	}) => {
		const pageErrors = collectPageErrors(page);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');

		await expect(
			page.getByRole('heading', {
				level: 1,
				name: /A Working\s+Library\s+of\s+Svelte\s+Parts\.?/i
			})
		).toBeVisible();
		await expect(page.getByRole('searchbox', { name: /search components/i })).toBeVisible();
		await expect(page.getByText(currentCountsPattern()).first()).toBeVisible();
		expectNoPageErrors(pageErrors);
	});
});

function collectPageErrors(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (error) => {
		errors.push(`pageerror: ${error.message}`);
	});
	page.on('console', (message) => {
		if (message.type() === 'error') {
			errors.push(`console.error: ${message.text()}`);
		}
	});
	return errors;
}

function expectNoPageErrors(errors: string[]) {
	expect(errors, errors.join('\n')).toEqual([]);
}

function currentCountsPattern() {
	return new RegExp(`${componentTotal}\\s+components\\s+.*${catalog.length}\\s+categories`, 'i');
}

function readComponentCatalog(): CatalogCategory[] {
	const catalogPath = path.resolve(process.cwd(), 'src/lib/componentCatalog.ts');
	const sourceText = readFileSync(catalogPath, 'utf8');
	const sourceFile = ts.createSourceFile(
		catalogPath,
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const initializer = findVariableInitializer(sourceFile, 'componentCategories');

	if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
		throw new Error('Unable to find componentCategories array in src/lib/componentCatalog.ts');
	}

	return initializer.elements.map(readCategory).filter((category): category is CatalogCategory =>
		Boolean(category)
	);
}

function findVariableInitializer(sourceFile: ts.SourceFile, name: string) {
	let initializer: ts.Expression | undefined;

	const visit = (node: ts.Node) => {
		if (initializer) return;
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
			initializer = node.initializer;
			return;
		}
		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return initializer;
}

function readCategory(expression: ts.Expression): CatalogCategory | undefined {
	if (!ts.isObjectLiteralExpression(expression)) return undefined;

	const category: CatalogCategory = {
		name: '',
		summary: '',
		components: []
	};

	for (const property of expression.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		const propertyName = getPropertyName(property.name);

		if (propertyName === 'name') {
			category.name = getString(property.initializer) ?? '';
		}
		if (propertyName === 'summary') {
			category.summary = getString(property.initializer) ?? '';
		}
		if (propertyName === 'components' && ts.isArrayLiteralExpression(property.initializer)) {
			category.components = property.initializer.elements
				.map(readComponentCall)
				.filter((item): item is CatalogItem => Boolean(item));
		}
	}

	return category.name ? category : undefined;
}

function readComponentCall(expression: ts.Expression): CatalogItem | undefined {
	if (!ts.isCallExpression(expression)) return undefined;
	if (!ts.isIdentifier(expression.expression) || expression.expression.text !== 'component') return undefined;

	const [nameArg, hrefArg, , descriptionArg] = expression.arguments;
	const name = nameArg ? getString(nameArg) : undefined;
	const href = hrefArg ? getString(hrefArg) : undefined;
	const description = descriptionArg ? getString(descriptionArg) : '';

	if (!name || !href) return undefined;
	return { name, href, description: description ?? '' };
}

function getPropertyName(name: ts.PropertyName) {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
	return undefined;
}

function getString(expression: ts.Expression) {
	if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
		return expression.text;
	}
	return undefined;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cssHrefSelector(href: string) {
	return `a[href="${href.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}
