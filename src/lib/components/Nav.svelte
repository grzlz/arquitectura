<script>
	const links = [
		{ href: '/#doctrine', label: 'Doctrine' },
		{ href: '/#flagship', label: 'Flagship' },
		{ href: '/#studio', label: 'Studio' }
	];
</script>

<header class="border-b border-paper/15">
	<div class="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-5">
		<a href="/" class="group flex items-baseline gap-3">
			<span
				class="font-tech text-sm font-medium tracking-[0.25em] text-paper uppercase transition-colors group-hover:text-brass-bright"
			>
				Art Vandelay
			</span>
			<span class="hidden font-tech text-[10px] tracking-[0.2em] text-paper/35 uppercase sm:inline">
				Import / Export
			</span>
		</a>
		<nav class="flex items-baseline gap-6 sm:gap-8">
			{#each links as { href, label }}
				<a
					{href}
					class="font-tech text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:text-brass-bright"
				>
					{label}
				</a>
			{/each}
		</nav>
	</div>
</header>
