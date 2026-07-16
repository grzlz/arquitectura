<script>
	import { resolve } from '$app/paths';

	const links = [
		{ href: '/#flagship', label: 'Pipeline' },
		{ href: '/#studio', label: 'Studio' },
		{ href: '/#doctrine', label: 'Doctrine' },
		{ href: '/#install', label: 'Install', cta: true }
	];
</script>

<header class="border-b border-paper/15">
	<div
		class="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0"
	>
		<a href={resolve('/')} class="group flex items-baseline gap-3">
			<span
				class="font-tech text-sm font-medium tracking-[0.25em] text-paper uppercase transition-colors group-hover:text-brass-bright"
			>
				Art Vandeley
			</span>
			<span class="hidden font-tech text-[10px] tracking-[0.2em] text-paper/35 uppercase sm:inline">
				Import / Export
			</span>
		</a>
		<nav class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-8">
			{#each links as { href, label, cta } (href)}
				<a
					{href}
					class={cta
						? 'border border-brass/60 bg-brass/10 px-2.5 py-1.5 font-tech text-[10px] tracking-[0.15em] text-brass-bright uppercase transition-all hover:border-brass hover:bg-brass hover:text-ink sm:px-3.5 sm:text-[11px] sm:tracking-[0.2em]'
						: 'font-tech text-[10px] tracking-[0.15em] text-paper/55 uppercase transition-colors hover:text-brass-bright sm:text-[11px] sm:tracking-[0.2em]'}
				>
					{label}
				</a>
			{/each}
		</nav>
	</div>
</header>
