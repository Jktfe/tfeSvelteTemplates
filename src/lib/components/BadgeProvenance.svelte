<!--
  ============================================================
  BadgeProvenance
  ============================================================

  WHAT
  Small, gentle "inspired by …" chip rendered alongside any
  component whose visual idea was sparked by an external source.
  This is intentionally low-key (chip, not banner) — these
  components are TFE's own implementation, not clones.

  USAGE
  <BadgeProvenance kind="gsap" sourceLabel="GreenSock pen xxmaNYj"
    sourceUrl="https://codepen.io/GreenSock/pen/xxmaNYj" />

  PROPS
  | Prop        | Type                                     | Default     |
  |-------------|------------------------------------------|-------------|
  | kind        | 'gsap' | 'aura' | 'davevault' | 'codepen' | 'davevault' |
  | sourceLabel | string                                   | required    |
  | sourceUrl   | string                                   | required    |
  | tone        | 'soft' | 'ink'                           | 'soft'      |
  ============================================================
-->

<script lang="ts" module>
	export type BadgeProvenanceKind = 'gsap' | 'aura' | 'davevault' | 'codepen' | 'custom';
	export interface BadgeProvenanceProps {
		kind?: BadgeProvenanceKind;
		sourceLabel: string;
		sourceUrl: string;
		tone?: 'soft' | 'ink';
	}

	const KIND_LABEL: Record<BadgeProvenanceKind, string> = {
		gsap: 'Inspired by GSAP',
		aura: 'Inspired by Aura',
		davevault: 'Spec by Dave Vault',
		codepen: 'Inspired by CodePen',
		custom: 'Inspired by'
	};

	export function provenanceText(kind: BadgeProvenanceKind, label: string): string {
		return `${KIND_LABEL[kind]} · ${label}`;
	}
</script>

<script lang="ts">
	import '$lib/styles/gsap-tokens.css';

	let { kind = 'davevault', sourceLabel, sourceUrl, tone = 'soft' }: BadgeProvenanceProps = $props();
	const label = $derived(provenanceText(kind, sourceLabel));
</script>

<a
	class="badge"
	class:badge--ink={tone === 'ink'}
	href={sourceUrl}
	target="_blank"
	rel="noopener noreferrer"
	title={label}
>
	<span class="badge__dot" aria-hidden="true"></span>
	<span class="badge__text">{label}</span>
	<svg
		width="11"
		height="11"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-width="1.6"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M5 11l6-6" />
		<path d="M6 5h5v5" />
	</svg>
</a>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		max-width: 100%;
		padding: 6px 12px 6px 10px;
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-pill);
		background: var(--gsap-surface-1);
		color: var(--gsap-fg-muted);
		font-family: var(--gsap-font-sans);
		font-size: var(--gsap-text-xs);
		font-weight: 600;
		letter-spacing: 0.02em;
		text-decoration: none;
		transition:
			background var(--gsap-duration-fast) var(--gsap-ease-out),
			color var(--gsap-duration-fast) var(--gsap-ease-out),
			border-color var(--gsap-duration-fast) var(--gsap-ease-out);
	}

	.badge:hover,
	.badge:focus-visible {
		background: var(--gsap-surface-2);
		border-color: var(--gsap-border-strong);
		color: var(--gsap-fg-strong);
		outline: none;
	}

	.badge--ink {
		background: rgba(245, 243, 236, 0.06);
		border-color: var(--gsap-border-on-ink);
		color: var(--gsap-fg-on-ink-muted);
	}

	.badge--ink:hover,
	.badge--ink:focus-visible {
		background: rgba(245, 243, 236, 0.12);
		border-color: var(--gsap-border-strong-on-ink);
		color: var(--gsap-fg-on-ink);
	}

	.badge__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--gsap-accent);
		flex: 0 0 auto;
	}

	.badge__text {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.badge svg {
		flex: 0 0 auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.badge {
			transition: none;
		}
	}
</style>
