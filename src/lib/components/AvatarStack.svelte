<!--
  ============================================================
  AvatarStack - Overlapping People Group with Overflow
  ============================================================

  🎯 WHAT IT DOES
  Renders a horizontal group of overlapping circular avatars with an optional
  "+N more" counter when the group is larger than `max`. Each avatar is
  keyboard-focusable, has a native tooltip, and gracefully falls back from
  image → explicit initials → derived initials.

  ✨ FEATURES
  • Image src + initials fallback (auto-derived from name)
  • Deterministic background colour per name (eight-step palette)
  • Configurable size, overlap, max, border colour
  • "+N" overflow tile that itself shows the next person's tooltip text on hover
  • Native <img> with onerror → initials swap if a URL 404s
  • Pure CSS (no transforms — uses negative margins for overlap)

  ♿ ACCESSIBILITY
  • Each avatar is a <button> with aria-label = full name
  • Initials fallback marks the visual letter aria-hidden so SR reads the name
  • Native title attribute provides instant tooltip
  • Keyboard: Tab to focus, Enter/Space to activate (consumer wires the handler)

  📦 DEPENDENCIES
  Zero external dependencies (Svelte 5 + Tailwind utility classes only)

  ⚡ PERFORMANCE
  • Visible avatars rendered to the DOM only (max + 1 nodes max)
  • No requestAnimationFrame, no observers — pure layout

  🎨 USAGE
  <script lang="ts">
    import AvatarStack from '$lib/components/AvatarStack.svelte';
    const team = [
      { name: 'Ada Lovelace', src: '/img/ada.jpg' },
      { name: 'Grace Hopper' },
      { name: 'Margaret Hamilton' },
      { name: 'Katherine Johnson' },
      { name: 'Hedy Lamarr' }
    ];
  </script>
  <AvatarStack people={team} max={3} />

  📋 PROPS
  | Prop          | Type                | Default | Description |
  |---------------|---------------------|---------|-------------|
  | people        | AvatarStackPerson[] | []      | List of people to render |
  | max           | number              | 4       | Avatars shown before "+N" tile |
  | size          | number              | 36      | Avatar diameter (px) |
  | overlap       | number              | 12      | Pixel overlap between avatars |
  | borderColor   | string              | 'white' | Ring separating each avatar |
  | showOverflow  | boolean             | true    | Render "+N" tile when needed |
  | class         | string              | ''      | Extra container classes |

  ============================================================
-->

<script lang="ts">
	import type { AvatarStackProps, AvatarStackPerson } from '$lib/types';
	import { cn } from '$lib/utils';

	let {
		people = [],
		max = 4,
		size = 36,
		overlap = 12,
		borderColor = 'white',
		showOverflow = true,
		class: className = ''
	}: AvatarStackProps = $props();

	// 8-colour palette — chosen to be readable with white text and visually distinct.
	const palette = [
		'#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
		'#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'
	];

	// Track which images have failed to load so we can swap to the initials fallback.
	let failedImages = $state<Record<number, boolean>>({});

	function deriveInitials(person: AvatarStackPerson): string {
		if (person.initials) return person.initials.slice(0, 2).toUpperCase();
		const words = person.name.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return '?';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return (words[0][0] + words[words.length - 1][0]).toUpperCase();
	}

	function deriveColor(person: AvatarStackPerson): string {
		if (person.color) return person.color;
		// Simple hash → palette index. Collisions are fine; goal is consistent-per-name colour.
		let hash = 0;
		for (let i = 0; i < person.name.length; i++) {
			hash = (hash * 31 + person.name.charCodeAt(i)) | 0;
		}
		return palette[Math.abs(hash) % palette.length];
	}

	// Pre-compute the visible slice and overflow count once per `people` change.
	let visiblePeople = $derived(people.slice(0, max));
	let overflowCount = $derived(Math.max(0, people.length - max));
	let nextPerson = $derived(people[max]); // first person in the overflow, used for the tile's tooltip
</script>

<div
	class={cn('avatar-stack inline-flex items-center', className)}
	style:--avatar-size={`${size}px`}
	style:--avatar-overlap={`${overlap}px`}
	style:--avatar-border={borderColor}
	role="list"
	aria-label="People"
>
	{#each visiblePeople as person, i (person.name + i)}
		{@const showImg = person.src && !failedImages[i]}
		{@const initials = deriveInitials(person)}
		{@const bg = deriveColor(person)}
		<button
			type="button"
			class="avatar-item"
			title={person.alt ?? person.name}
			aria-label={person.alt ?? person.name}
			style:background-color={showImg ? 'transparent' : bg}
		>
			{#if showImg}
				<img
					src={person.src}
					alt={person.alt ?? person.name}
					onerror={() => (failedImages[i] = true)}
					loading="lazy"
				/>
			{:else}
				<span class="avatar-initials" aria-hidden="true">{initials}</span>
			{/if}
		</button>
	{/each}

	{#if showOverflow && overflowCount > 0}
		<button
			type="button"
			class="avatar-item avatar-overflow"
			title={nextPerson ? `${nextPerson.name} and ${overflowCount - 1} more` : `${overflowCount} more`}
			aria-label={`${overflowCount} more people`}
		>
			+{overflowCount}
		</button>
	{/if}
</div>

<style>
	.avatar-stack {
		isolation: isolate;
	}

	.avatar-item {
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: 9999px;
		border: 2px solid var(--avatar-border);
		font-size: calc(var(--avatar-size) * 0.4);
		font-weight: 600;
		color: white;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		cursor: pointer;
		font-family: inherit;
		padding: 0;
		position: relative;
		transition: transform 0.15s ease, z-index 0s 0.15s;
	}

	/* Negative margin creates the overlap; first child has no overlap. */
	.avatar-item + .avatar-item {
		margin-left: calc(-1 * var(--avatar-overlap));
	}

	/* Stacking order: leftmost on top by default; on hover/focus the active one pops forward. */
	.avatar-item:hover,
	.avatar-item:focus-visible {
		transform: translateY(-2px);
		z-index: 10;
		transition: transform 0.15s ease;
	}

	.avatar-item:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.avatar-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.avatar-initials {
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.avatar-overflow {
		background: #475569;
		color: white;
	}

	@media (prefers-reduced-motion: reduce) {
		.avatar-item {
			transition: none !important;
		}
		.avatar-item:hover,
		.avatar-item:focus-visible {
			transform: none;
		}
	}
</style>
