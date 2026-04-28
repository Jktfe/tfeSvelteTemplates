<script lang="ts">
	import Stepper from '$lib/components/Stepper.svelte';

	const checkout = ['Cart', 'Shipping', 'Payment', 'Review'];
	const onboarding = ['Account', 'Verify email', 'Profile', 'Preferences', 'Done'];

	let step = $state(1);

	function next() {
		step = Math.min(checkout.length - 1, step + 1);
	}
	function prev() {
		step = Math.max(0, step - 1);
	}
</script>

<svelte:head>
	<title>Stepper | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Stepper</h1>
			<p class="text-xl text-muted-foreground">
				Multi-step progress indicator. Done / current / pending states with optional click-to-jump.
			</p>
		</header>

		<!-- Read-only horizontal -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Read-only horizontal</h2>
			<p class="text-sm text-neutral-500">
				A static view of the user's progress. Done steps show a tick; current shows its number.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6">
				<Stepper steps={checkout} currentStep={2} />
			</div>
		</section>

		<!-- Live interactive -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold">Interactive (clickable + buttons)</h2>
				<div class="flex gap-2">
					<button
						onclick={prev}
						disabled={step === 0}
						class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
					>
						← Back
					</button>
					<button
						onclick={next}
						disabled={step === checkout.length - 1}
						class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{step === checkout.length - 1 ? 'Submit' : 'Next →'}
					</button>
				</div>
			</div>
			<p class="text-sm text-neutral-500">
				Click any completed step to go back. Pending steps stay locked.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6">
				<Stepper
					steps={checkout}
					currentStep={step}
					clickable
					onSelect={(i) => (step = i)}
				/>
			</div>
			<p class="text-xs text-neutral-500">
				Current step index: <code>{step}</code> ({checkout[step]})
			</p>
		</section>

		<!-- Vertical orientation -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Vertical orientation</h2>
			<p class="text-sm text-neutral-500">
				Better for sidebars, narrow viewports, or longer flows. Connectors switch axis automatically.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 max-w-sm">
				<Stepper steps={onboarding} currentStep={2} orientation="vertical" />
			</div>
		</section>

		<!-- Custom palette -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Custom palettes</h2>
			<p class="text-sm text-neutral-500">
				Use brand colours by passing <code>activeColor</code>, <code>doneColor</code>, and
				<code>pendingColor</code>.
			</p>
			<div class="grid md:grid-cols-2 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-6">
					<Stepper
						steps={['Plan', 'Build', 'Ship']}
						currentStep={1}
						activeColor="#a855f7"
						doneColor="#7c3aed"
						pendingColor="#e9d5ff"
					/>
				</div>
				<div class="bg-neutral-900 rounded-xl p-6 text-neutral-100">
					<Stepper
						steps={['Plan', 'Build', 'Ship']}
						currentStep={2}
						activeColor="#fbbf24"
						doneColor="#22c55e"
						pendingColor="#475569"
					/>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Done / current / pending states auto-derived from <code>currentStep</code></li>
					<li>Horizontal and vertical orientations</li>
					<li>Optional <code>clickable</code> with <code>onSelect</code> callback</li>
					<li>Pending steps locked even when clickable</li>
					<li><code>role="list"</code> and <code>aria-current="step"</code> for screen readers</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Zero dependencies — CSS + inline SVG checkmark</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import Stepper from '$lib/components/Stepper.svelte';

  let step = $state(1);
  const steps = ['Cart', 'Shipping', 'Payment', 'Review'];
</${''}script>

<Stepper
  {steps}
  currentStep={step}
  clickable
  onSelect={(i) => step = i}
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>
