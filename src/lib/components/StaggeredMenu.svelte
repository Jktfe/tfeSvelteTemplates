<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { MenuItem } from '$lib/types';

	interface Props {
		items: MenuItem[];
		isOpen?: boolean;
	}

	let { items, isOpen = $bindable(true) }: Props = $props();
</script>

<nav class="staggered-menu" aria-label="Main navigation">
	{#if isOpen}
		<ul class="menu-list">
			{#each items as item, index}
				<li
					class="menu-item"
					style="--stagger-delay: {index * 0.05}s"
					in:fly={{ y: -10, duration: 300, delay: index * 50 }}
				>
					<a
						href={item.href}
						class="menu-link"
						class:active={item.active}
						aria-current={item.active ? 'page' : undefined}
					>
						{#if item.icon}
							<span class="menu-icon" aria-hidden="true">{item.icon}</span>
						{/if}
						<span class="menu-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.staggered-menu {
		width: 100%;
	}

	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.menu-item {
		opacity: 0;
		animation: fade-in 0.3s ease-out forwards;
		animation-delay: var(--stagger-delay, 0s);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.menu-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		text-decoration: none;
		color: #4a5568;
		font-weight: 500;
		font-size: 0.95rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		position: relative;
	}

	.menu-link:hover {
		color: #146ef5;
		background-color: rgba(20, 110, 245, 0.05);
		transform: translateY(-1px);
	}

	.menu-link:focus {
		outline: 2px solid #146ef5;
		outline-offset: 2px;
	}

	.menu-link.active {
		color: #146ef5;
		font-weight: 600;
	}

	.menu-link.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 1.25rem;
		right: 1.25rem;
		height: 2px;
		background: linear-gradient(90deg, #146ef5, #667eea);
		border-radius: 2px;
	}

	.menu-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.menu-label {
		line-height: 1;
	}

	/* Responsive: Mobile */
	@media (max-width: 768px) {
		.menu-list {
			flex-direction: column;
			gap: 0.5rem;
		}

		.menu-link {
			padding: 1rem 1.5rem;
			width: 100%;
		}
	}

	/* Responsive: Tablet and above */
	@media (min-width: 769px) {
		.menu-list {
			flex-direction: row;
		}
	}
</style>
