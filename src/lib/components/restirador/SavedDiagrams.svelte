<script>
	// The manifest: diagrams saved in this browser, set as a table of contents.
	import { tick } from 'svelte';

	let { name, saved, onload, ondelete } = $props();

	let confirming = $state(-1);

	// The Delete swaps for Delete / Keep, so focus follows the swap instead of falling to <body>
	async function request(index) {
		confirming = index;
		await tick();
		document.querySelector('[data-confirm-delete]')?.focus();
	}

	async function cancel(index) {
		confirming = -1;
		await tick();
		document.querySelector(`[data-delete="${index}"]`)?.focus();
	}

	function confirm(index) {
		ondelete(index);
		confirming = -1;
		document.getElementById('diagram-name')?.focus();
	}
</script>

<section class="mt-24">
	<header class="mb-8 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
		<p class="pt-2 kicker text-accent md:col-span-3">The manifest</p>
		<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
			<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
				Saved {name.toLowerCase()} diagrams
			</h2>
			<p class="kicker font-medium text-ink/60 tabular-nums">{saved.length} saved</p>
		</div>
	</header>

	{#if saved.length > 0}
		<ol class="border-t border-ink/15">
			{#each saved as diagram, index (diagram.timestamp)}
				<li class="flex items-baseline gap-6 border-b border-ink/15 py-4">
					<button
						onclick={() => onload(diagram)}
						class="group min-w-0 flex-1 cursor-pointer text-left font-display text-2xl text-ink transition-colors hover:text-accent md:text-3xl"
					>
						{diagram.name}
					</button>
					<span class="hidden font-sans text-sm text-ink/60 tabular-nums sm:inline">
						{new Date(diagram.timestamp).toLocaleDateString()}
					</span>
					{#if confirming === index}
						<span class="flex items-baseline gap-4">
							<button
								data-confirm-delete
								onclick={() => confirm(index)}
								class="cursor-pointer py-1 kicker text-accent underline underline-offset-4"
							>
								Delete
							</button>
							<button
								onclick={() => cancel(index)}
								class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
								>Keep</button
							>
						</span>
					{:else}
						<button
							data-delete={index}
							onclick={() => request(index)}
							aria-label="Delete {diagram.name}"
							class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
						>
							Delete
						</button>
					{/if}
				</li>
			{/each}
		</ol>
	{:else}
		<p class="max-w-measure font-serif text-lg text-ink/75">
			<em>Nothing saved yet.</em> Name the diagram above and press Save — it stays in this browser, ready
			to reload.
		</p>
	{/if}
</section>
