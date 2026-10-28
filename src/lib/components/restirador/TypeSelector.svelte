<script>
	// The Restirador's contents line: every diagram type, numbered; the open one marked.
	import { resolve } from '$app/paths';
	import { diagrams } from '$lib/restirador/diagrams.js';

	let { current } = $props();
</script>

<nav aria-label="Diagram types" class="border-b border-ink/15">
	<ul class="flex flex-wrap gap-x-7">
		{#each diagrams as { slug, name }, i (slug)}
			{@const active = slug === current}
			<li>
				<a
					href={resolve('/restirador/[type=diagram]', { type: slug })}
					aria-current={active ? 'page' : undefined}
					class="-mb-px flex items-baseline gap-2 border-b-2 py-3 kicker transition-colors {active
						? 'border-ink text-ink'
						: 'border-transparent text-ink/75 hover:text-accent'}"
				>
					<span class="tabular-nums {active ? 'text-accent' : 'text-ink/60'}"
						>{String(i + 1).padStart(2, '0')}</span
					>
					{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
