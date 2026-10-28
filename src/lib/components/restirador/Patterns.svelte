<script>
	// The examples carousel: one pattern at a time, its source beside it as Fig. 2.
	let { diagram, examples, onload } = $props();

	let index = $state(0);
	let example = $derived(examples[index]);
	let level = $derived(diagram.levels.find(([max]) => example.complexity <= max)[1]);

	const next = () => (index = (index + 1) % examples.length);
	const prev = () => (index = (index - 1 + examples.length) % examples.length);
</script>

<section class="mt-24">
	<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
		<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
		<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
			<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
				{diagram.patterns}
			</h2>
			<p class="kicker font-medium text-ink/60 tabular-nums">
				{index + 1} of {examples.length}
			</p>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
		<article class="flex flex-col md:col-span-5">
			<p class="kicker font-medium text-ink/60 tabular-nums">
				Pattern {String(index + 1).padStart(2, '0')} · Level {example.complexity} of {diagram.maxLevel}
			</p>
			<h3 class="mt-3 font-display text-3xl tracking-[-0.01em] md:text-4xl">
				{example.name}
			</h3>
			<!-- With a use case, the description is the deck; without one, it is the body -->
			{#if example.useCase}
				<p class="mt-2 font-serif text-xl text-ink/75 italic">{example.description}</p>
			{/if}
			<p class="mt-5 max-w-measure font-serif text-lg/relaxed text-ink/85">
				{example.useCase ?? example.description}
			</p>
			<p class="mt-5 font-sans text-sm text-ink/60">{level}</p>
			<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/15 pt-3">
				<button
					onclick={() => onload(example.code)}
					class="cursor-pointer py-1 kicker text-ink underline underline-offset-4 transition-colors hover:text-accent"
				>
					Load this example
				</button>
				<span class="ml-auto flex gap-6">
					<button
						onclick={prev}
						class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
						>← Previous</button
					>
					<button
						onclick={next}
						class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
						>Next →</button
					>
				</span>
			</div>
		</article>

		<figure class="min-w-0 md:col-span-7">
			<pre
				class="max-h-96 overflow-auto bg-surface p-6 font-mono text-sm leading-relaxed text-ink/85">{example.code}</pre>
			<figcaption class="mt-4 font-sans text-sm text-ink/60">
				<span class="font-semibold text-ink">Fig. 2</span> — Pattern source, {example.code.split(
					'\n'
				).length} lines
			</figcaption>
		</figure>
	</div>
</section>
