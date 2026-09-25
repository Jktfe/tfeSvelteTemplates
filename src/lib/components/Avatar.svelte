<!--
  ============================================================
  Avatar — User Identity Image with Initials Fallback
  ============================================================
  WHAT — Shows a user's photo, or their initials on a colour derived from
  their name when there is no photo or it fails to load.

  WHY — The single identity element; for overlapping groups with an
  overflow counter, use AvatarStack.

  FEATURES
  - Automatic <img> onerror fallback to initials (resets if src changes)
  - Deterministic background colour from the name, so the same user
    gets the same colour everywhere
  - Three sizes (sm / md / lg) and three shapes (circle / rounded / square)
  - Optional presence dot: online / away / busy / offline
  - children snippet to render a custom glyph instead of initials

  ACCESSIBILITY
  - role="img" with aria-label (alt, then name, then "User")
  - Inner image, initials and status dot are aria-hidden so the label
    is announced once
  - No motion

  DEPENDENCIES — Zero. Pure Svelte 5 runes and scoped CSS.

  PERFORMANCE — Trivial; initials and colour are $derived.

  USAGE
      <Avatar name="Ada Lovelace" src="/ada.jpg" size="lg" status="online" />

  PROPS
  | Prop     | Type                                     | Default  | Description |
  |----------|------------------------------------------|----------|-------------|
  | src      | string                                   | —        | Image URL; falls back to initials on error |
  | name     | string                                   | —        | Used for initials, colour and the label |
  | alt      | string                                   | name     | Accessible label override |
  | size     | 'sm' | 'md' | 'lg'                      | 'md'     | Diameter scale |
  | shape    | 'circle' | 'rounded' | 'square'        | 'circle' | Corner treatment |
  | status   | 'online' | 'away' | 'busy' | 'offline' | —        | Presence dot |
  | children | Snippet                                  | —        | Custom content instead of initials |
  | class    | string                                   | ''       | Extra classes |
  ============================================================
-->
<script lang="ts">
	/*
	 * Avatar
	 *
	 * Single user identity element. If `src` is provided, renders an <img>
	 * with onerror auto-fallback to initials. If no src (or the image fails),
	 * renders the user's initials on a deterministically-coloured background
	 * derived from the name, so the same user gets the same colour everywhere.
	 *
	 * Theming: dual light / dark. The only chrome is --avatar-ring, the
	 * cut-out ring around the status dot, which has to match the surface the
	 * avatar sits on — so it flips under prefers-color-scheme: dark. Initials
	 * colours are brand (identity) and status colours are semantic; neither
	 * flips. See docs/THEMING.md.
	 *
	 * For overlapping groups with overflow counter, see AvatarStack.
	 */

	type Size = 'sm' | 'md' | 'lg';
	type Shape = 'circle' | 'rounded' | 'square';
	type Status = 'online' | 'away' | 'busy' | 'offline';

	type Props = {
		src?: string;
		name?: string;
		alt?: string;
		size?: Size;
		shape?: Shape;
		status?: Status;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		src,
		name,
		alt,
		size = 'md',
		shape = 'circle',
		status,
		class: className = '',
		children
	}: Props = $props();

	let imgFailed = $state(false);

	const PALETTE = [
		'#0ea5e9',
		'#6366f1',
		'#a855f7',
		'#ec4899',
		'#f97316',
		'#eab308',
		'#14b8a6',
		'#10b981'
	];

	function initialsFor(n: string | undefined) {
		if (!n) return '?';
		const tokens = n.trim().split(/\s+/).filter(Boolean);
		if (tokens.length === 0) return '?';
		const first = tokens[0]?.[0] ?? '';
		const second = tokens[1]?.[0] ?? '';
		return (first + second).toUpperCase() || '?';
	}

	function colourFor(n: string | undefined) {
		if (!n) return PALETTE[0];
		let sum = 0;
		for (let i = 0; i < n.length; i += 1) sum += n.charCodeAt(i);
		return PALETTE[sum % PALETTE.length];
	}

	let initials = $derived(initialsFor(name));
	let bgColour = $derived(colourFor(name));
	let showImage = $derived(Boolean(src) && !imgFailed);
	let label = $derived(alt ?? name ?? 'User');
	let inlineStyle = $derived(showImage || children ? '' : `background-color: ${bgColour};`);

	function onImgError() {
		imgFailed = true;
	}

	$effect(() => {
		// reset failure flag if src changes
		void src;
		imgFailed = false;
	});
</script>

<span
	class="avatar avatar-{size} avatar-{shape} {className}"
	role="img"
	aria-label={label}
	style={inlineStyle}
>
	{#if children}
		{@render children()}
	{:else if showImage}
		<img src={src} alt="" aria-hidden="true" onerror={onImgError} />
	{:else}
		<span class="initials" aria-hidden="true">{initials}</span>
	{/if}

	{#if status}
		<span class="status status-{status}" aria-hidden="true"></span>
	{/if}
</span>

<style>
	/* Theme tokens — light defaults; chrome flips in the dark block at the
	   end of this stylesheet. See docs/THEMING.md. */
	.avatar {
		--avatar-initials-fg: #fff;
		--avatar-status-online: #10b981;
		--avatar-status-away: #f59e0b;
		--avatar-status-busy: #ef4444;
		--avatar-status-offline: #94a3b8;
		--avatar-ring: #fff;
	}

	.avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
		color: var(--avatar-initials-fg);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-weight: 600;
		line-height: 1;
		user-select: none;
		flex-shrink: 0;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Sizes */
	.avatar-sm {
		width: 2rem;
		height: 2rem;
		font-size: 0.75rem;
	}
	.avatar-md {
		width: 3rem;
		height: 3rem;
		font-size: 1rem;
	}
	.avatar-lg {
		width: 4.5rem;
		height: 4.5rem;
		font-size: 1.5rem;
	}

	/* Shapes */
	.avatar-circle {
		border-radius: 9999px;
	}
	.avatar-rounded {
		border-radius: 0.5rem;
	}
	.avatar-square {
		border-radius: 0;
	}

	.avatar-circle img,
	.avatar-rounded img,
	.avatar-square img {
		border-radius: inherit;
	}

	.initials {
		display: inline-block;
	}

	/* Status dot */
	.status {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 0.6em;
		height: 0.6em;
		border-radius: 9999px;
		border: 2px solid var(--avatar-ring);
		box-sizing: content-box;
	}

	.avatar-square .status,
	.avatar-rounded .status {
		bottom: -2px;
		right: -2px;
	}

	.status-online {
		background: var(--avatar-status-online);
	}
	.status-away {
		background: var(--avatar-status-away);
	}
	.status-busy {
		background: var(--avatar-status-busy);
	}
	.status-offline {
		background: var(--avatar-status-offline);
	}

	/*
	 * Dark scheme — only the status-dot ring flips so it keeps punching a
	 * clean hole against a dark surface. Identity and status colours stay.
	 */
	@media (prefers-color-scheme: dark) {
		.avatar {
			--avatar-ring: #111827;
		}
	}
</style>
