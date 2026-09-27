<script>
	import { resolve } from '$app/paths';

	// Editors run a wider column than the landing; the masthead rule follows the page column.
	let { wide = false } = $props();

	const links = [
		{ href: '/flowchart', label: 'Studio' },
		{ href: '/#update', label: 'Update' },
		{ href: '/#install', label: 'Install', cta: true }
	];
</script>

<header class="mx-auto px-6 {wide ? 'max-w-7xl' : 'max-w-6xl'}">
	<div
		class="flex flex-col items-start gap-4 border-b-2 border-ink py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0"
	>
		<a href={resolve('/')} class="group flex items-baseline gap-3">
			<span
				class="font-display text-[1.75rem] leading-none font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent"
			>
				Art Vandeley
			</span>
			<span class="hidden kicker font-medium text-ink/60 sm:inline">Import / Export</span>
		</a>
		<nav class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-8">
			{#each links as { href, label, cta } (href)}
				<a
					{href}
					class={cta
						? 'bg-ink px-3 py-1.5 kicker text-paper transition-colors hover:bg-accent'
						: 'py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-ink hover:underline'}
				>
					{label}
				</a>
			{/each}
		</nav>
	</div>
</header>
