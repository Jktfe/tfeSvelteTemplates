<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';

	let basicOn = $state(false);
	let darkMode = $state(false);
	let publicProfile = $state(true);

	let smOn = $state(false);
	let mdOn = $state(true);
	let lgOn = $state(false);

	let defaultOn = $state(true);
	let successOn = $state(true);
	let dangerOn = $state(true);

	let notifications = $state(true);
	let weeklyDigest = $state(false);
	let saved = $state<null | 'pending' | 'saved'>(null);
	const dirty = $derived(saved === null || saved === 'pending');

	function save() {
		saved = 'pending';
		setTimeout(() => (saved = 'saved'), 400);
	}

	function reset() {
		notifications = true;
		weeklyDigest = false;
		saved = null;
	}
</script>

<svelte:head>
	<title>Switch | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Switch</h1>
			<p class="text-xl text-muted-foreground">
				iOS-style boolean toggle with sliding thumb, two-way binding, three sizes, three variants,
				and accessible <code>role="switch"</code> semantics.
			</p>
		</header>

		<section class="bg-white rounded-2xl p-12 border border-neutral-200 shadow-xl space-y-12">
			<div class="space-y-3">
				<h3 class="text-sm font-medium text-neutral-500">Basic — uncontrolled toggle</h3>
				<Switch bind:checked={basicOn} ariaLabel="Toggle" />
				<p class="text-xs text-neutral-500">
					State: <code>{basicOn ? 'on' : 'off'}</code> · No label, falls back to
					<code>aria-label="Toggle"</code>.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">With label — left and right</h3>
				<div class="space-y-3">
					<Switch bind:checked={darkMode} label="Dark mode" />
					<Switch bind:checked={publicProfile} label="Public profile" labelPosition="left" />
				</div>
				<p class="text-xs text-neutral-500">
					Either side of the track. Click on the label flips the switch — it's a real
					<code>&lt;label for&gt;</code>.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Three sizes</h3>
				<div class="flex items-center gap-8">
					<Switch bind:checked={smOn} size="sm" label="Small" />
					<Switch bind:checked={mdOn} size="md" label="Medium" />
					<Switch bind:checked={lgOn} size="lg" label="Large" />
				</div>
				<p class="text-xs text-neutral-500">
					Track widths 32 / 44 / 56 px — match the surrounding text size.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Three variants — on-state colour</h3>
				<div class="flex items-center gap-8">
					<Switch bind:checked={defaultOn} label="Default (blue)" variant="default" />
					<Switch bind:checked={successOn} label="Success (green)" variant="success" />
					<Switch bind:checked={dangerOn} label="Danger (red)" variant="danger" />
				</div>
				<p class="text-xs text-neutral-500">
					Use <code>success</code> for positive confirmations, <code>danger</code> for destructive flags.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Disabled state</h3>
				<div class="flex items-center gap-8">
					<Switch checked={true} label="Account verified" disabled />
					<Switch checked={false} label="Beta features (admin only)" disabled />
				</div>
				<p class="text-xs text-neutral-500">
					Uses the real <code>disabled</code> attribute — keyboard focus is also blocked.
				</p>
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Live demo — settings panel</h3>
				<div class="space-y-3 max-w-md">
					<Switch bind:checked={notifications} label="Email notifications" onChange={() => (saved = 'pending')} />
					<Switch bind:checked={weeklyDigest} label="Weekly digest" onChange={() => (saved = 'pending')} />
				</div>
				<div class="flex items-center gap-3 pt-2">
					<button
						type="button"
						onclick={save}
						disabled={!dirty}
						class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
					>
						{saved === 'pending' ? 'Saving…' : 'Save'}
					</button>
					<button
						type="button"
						onclick={reset}
						class="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium hover:bg-neutral-50"
					>
						Reset
					</button>
					{#if saved === 'saved' && !dirty}
						<span class="text-xs text-emerald-700">✓ Saved</span>
					{/if}
				</div>
				<p class="text-xs text-neutral-500">
					Each switch fires <code>onChange</code> to mark the form dirty. Save commits;
					Reset returns to defaults.
				</p>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Native <code>role="switch"</code> + <code>aria-checked</code></li>
					<li>Two-way binding via <code>$bindable</code> (<code>bind:checked</code>)</li>
					<li>Three sizes — sm / md / lg</li>
					<li>Three variants — default / success / danger</li>
					<li>Optional label, left or right of the track</li>
					<li>Real <code>disabled</code> attribute (not aria-disabled)</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Binary settings that apply immediately (no Save button)</li>
					<li>Feature flags, theme selection, notification opt-ins</li>
					<li>Profile preferences (public / private)</li>
				</ul>
				<h2 class="text-2xl font-semibold pt-4">When not to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Form fields that need explicit Save → use checkbox</li>
					<li>More than two options → use SegmentedControl</li>
					<li>Ordinal values (1–5) → use RatingStars or Slider</li>
				</ul>
			</div>
		</section>
	</div>
</div>
