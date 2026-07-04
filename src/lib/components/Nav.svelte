<script>
	const links = [
		{ href: '/#doctrine', label: 'Doctrine' },
		{ href: '/#flagship', label: 'Flagship' },
		{ href: '/#studio', label: 'Studio' },
		{ href: '/#install', label: 'Install', cta: true }
	];
</script>

<header class="border-b border-paper/15">
	<div class="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-5">
		<a href="/" class="group flex items-baseline gap-3">
			<span
				class="font-tech text-sm font-medium tracking-[0.25em] text-paper uppercase transition-colors group-hover:text-brass-bright"
			>
				Art Vandeley
			</span>
			<span class="hidden font-tech text-[10px] tracking-[0.2em] text-paper/35 uppercase sm:inline">
				Import / Export
			</span>
		</a>
		<nav class="flex items-center gap-4 sm:gap-8">
			{#each links as { href, label, cta } (href)}
				<a
					{href}
					class={cta
						? 'border border-brass/60 bg-brass/10 px-3.5 py-1.5 font-tech text-[11px] tracking-[0.2em] text-brass-bright uppercase transition-all hover:border-brass hover:bg-brass hover:text-ink'
						: 'font-tech text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:text-brass-bright'}
				>
					{label}
				</a>
			{/each}
		</nav>
	</div>
</header>
