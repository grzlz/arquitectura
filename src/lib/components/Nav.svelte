<script>
	import { page } from '$app/stores';

	const links = [
		{ href: '/#flagship', label: 'Flagship' },
		{ href: '/flowchart', label: 'Flowchart' },
		{ href: '/sequence', label: 'Sequence' },
		{ href: '/state', label: 'State' },
		{ href: '/class', label: 'Class' }
	];
</script>

<div class="glass-enhanced mb-6 rounded-2xl p-4">
	<div class="flex flex-wrap items-center gap-6">
		<a
			href="/"
			class="mr-2 font-semibold tracking-tight text-white transition-colors hover:text-amber-200"
		>
			Art <span class="text-amber-300">Vandelay</span>
		</a>
		<div class="h-5 w-px bg-white/20"></div>
		<div class="flex flex-wrap items-center gap-2">
			{#each links as { href, label }}
				{@const active = $page.url.pathname === href}
				<a
					{href}
					class="rounded-lg px-4 py-2 font-medium transition-all
          {active
						? 'border border-amber-400/30 bg-amber-500/15 text-amber-200'
						: 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}"
				>
					{label}
				</a>
			{/each}
		</div>
	</div>
</div>
