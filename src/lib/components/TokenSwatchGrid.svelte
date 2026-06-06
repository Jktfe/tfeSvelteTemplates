<script lang="ts" module>
	export interface TokenSwatch {
		name: string;
		value: string;
		group: 'chrome' | 'brand' | 'semantic';
		usage: string;
		foreground?: string;
	}

	export function readableTokenName(name: string): string {
		return name.replace(/^--/, '').replaceAll('-', ' ');
	}

	function hexToRgb(hex: string): [number, number, number] | undefined {
		const normal = hex.trim().replace('#', '');
		if (!/^[0-9a-fA-F]{6}$/.test(normal)) return undefined;
		return [
			Number.parseInt(normal.slice(0, 2), 16),
			Number.parseInt(normal.slice(2, 4), 16),
			Number.parseInt(normal.slice(4, 6), 16)
		];
	}

	function luminance([r, g, b]: [number, number, number]): number {
		const channels = [r, g, b].map((channel) => {
			const normal = channel / 255;
			return normal <= 0.03928 ? normal / 12.92 : ((normal + 0.055) / 1.055) ** 2.4;
		});
		return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
	}

	export function contrastRatio(background: string, foreground = '#111827'): number | undefined {
		const bg = hexToRgb(background);
		const fg = hexToRgb(foreground);
		if (!bg || !fg) return undefined;
		const light = Math.max(luminance(bg), luminance(fg));
		const dark = Math.min(luminance(bg), luminance(fg));
		return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
	}

	export function tokenContrastLabel(ratio: number | undefined): 'AA' | 'Review' | 'Unknown' {
		if (ratio === undefined) return 'Unknown';
		return ratio >= 4.5 ? 'AA' : 'Review';
	}

	export function groupTokenSwatches(tokens: TokenSwatch[]): Record<TokenSwatch['group'], TokenSwatch[]> {
		const groups: Record<TokenSwatch['group'], TokenSwatch[]> = {
			chrome: [],
			brand: [],
			semantic: []
		};
		for (const token of tokens) groups[token.group].push(token);
		return groups;
	}
</script>

<script lang="ts">
	interface Props {
		tokens: TokenSwatch[];
		title?: string;
		class?: string;
	}

	let { tokens, title = 'Token swatch grid', class: extraClass = '' }: Props = $props();

	const groups = $derived(groupTokenSwatches(tokens));
</script>

<section class="token-grid {extraClass}" aria-labelledby="token-grid-title">
	<header>
		<p>Theme tokens</p>
		<h2 id="token-grid-title">{title}</h2>
	</header>

	<div class="tg-groups">
		{#each (['chrome', 'brand', 'semantic'] as TokenSwatch['group'][]) as group (group)}
			<section class="tg-group" aria-labelledby={`${group}-tokens`}>
				<h3 id={`${group}-tokens`}>{group}</h3>
				<div class="tg-swatches">
					{#each groups[group] as token (token.name)}
						<article class="tg-card">
							<div
								class="tg-color"
								style={`--swatch: ${token.value}; --swatch-fg: ${token.foreground ?? '#111827'}`}
							>
								<span>{token.value}</span>
							</div>
							<div class="tg-copy">
								<h4>{readableTokenName(token.name)}</h4>
								<code>{token.name}</code>
								<p>{token.usage}</p>
								<span>{tokenContrastLabel(contrastRatio(token.value, token.foreground))}</span>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</section>

<style>
	.token-grid,
	.tg-groups,
	.tg-swatches,
	.tg-copy {
		display: grid;
		gap: 16px;
	}

	.token-grid header p {
		margin: 0 0 6px;
		color: #0f766e;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.token-grid h2 {
		margin: 0;
		font: 900 clamp(1.7rem, 3vw, 2.5rem) / 1 var(--font-display, Georgia, serif);
	}

	.tg-group {
		display: grid;
		gap: 10px;
	}

	.tg-group h3 {
		margin: 0;
		font: 900 12px/1 var(--font-mono, ui-monospace, monospace);
		text-transform: uppercase;
	}

	.tg-swatches {
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
	}

	.tg-card {
		overflow: hidden;
		border: 1px solid var(--border, #d9dde5);
		border-radius: 6px;
		background: var(--surface, #fff);
	}

	.tg-color {
		display: grid;
		min-height: 110px;
		align-items: end;
		padding: 12px;
		background: var(--swatch);
		color: var(--swatch-fg);
	}

	.tg-color span {
		width: max-content;
		padding: 5px 8px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.74);
		color: #111827;
		font: 900 11px/1 var(--font-mono, ui-monospace, monospace);
	}

	.tg-copy {
		gap: 7px;
		padding: 12px;
	}

	.tg-copy h4,
	.tg-copy p {
		margin: 0;
	}

	.tg-copy h4 {
		text-transform: capitalize;
	}

	.tg-copy code {
		color: #0f766e;
		font-size: 12px;
		overflow-wrap: anywhere;
	}

	.tg-copy p {
		color: var(--fg-2, #4b5563);
	}

	.tg-copy > span {
		width: max-content;
		padding: 4px 7px;
		border-radius: 4px;
		background: #ecfdf5;
		color: #047857;
		font: 900 10px/1 var(--font-mono, ui-monospace, monospace);
	}
</style>
