<script>
	import Nav from '$lib/components/Nav.svelte';
	import TypeSelector from '$lib/components/restirador/TypeSelector.svelte';
	import DiagramEditor from '$lib/components/restirador/DiagramEditor.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.diagram.name} — El Restirador · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<p class="border-b border-ink/15 pb-3 kicker font-medium text-ink/60">
				El Restirador · Free Mermaid editors
			</p>
			<TypeSelector current={data.diagram.slug} />
			<h1 class="mt-10 font-display text-title font-light">{data.diagram.name}</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">{data.diagram.deck}</p>
		</header>

		<!-- A fresh editor per type: its state is that type's draft, saves, and examples -->
		{#key data.diagram.slug}
			<DiagramEditor
				diagram={data.diagram}
				defaultCode={data.defaultCode}
				examples={data.examples}
			/>
		{/key}
	</main>
</div>
