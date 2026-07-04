<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

	let heroEl = $state();
	let heroError = $state('');
	let flagshipEl = $state();
	let flagshipError = $state('');

	const heroDiagram = `flowchart LR
  ENV[["Your environment<br/>repo · stack · task"]] ==>|reads the room| ART(("Art<br/>Vandelay"))
  ART ==>|imports| FIT["Skills that fit"]
  ART ==>|exports| WELL["Well-architected<br/>skills"]
  ART -.speaks in.-> DIAG{{"Mermaid + Markdown"}}`;

	const flagshipDiagram = `flowchart LR
  PROB["A problem"] ==>|"/architect"| DESIGN{{"Map + doctrine<br/>components · seams · decisions"}}
  DESIGN ==>|"/judge"| VERDICT{"Ship it? Ship with<br/>conditions? Back to bench?"}
  VERDICT -.back to the bench.-> PROB`;

	const flagshipCargo = [
		{
			command: '/architect',
			role: "Art's export engine",
			body: 'Turns a problem into a well-architected map — components, boundaries, seams, and the load-bearing decisions. Diagram first, doctrine second.',
			tagline: 'It designs; it does not build.'
		},
		{
			command: '/judge',
			role: "Art's tribunal",
			body: 'Weighs an existing design, diff, or module against five criteria — depth, seams, coupling, failure modes, fit — and renders a decisive verdict.',
			tagline: 'It rules; it does not rewrite.'
		}
	];

	const doctrine = [
		{
			title: 'Reads the room',
			body: 'Inspects your repo, stack, and the task on the table — read-only recon, nothing gets clobbered.'
		},
		{
			title: 'Imports what fits',
			body: 'Pulls in the few skills that genuinely match the work. Precision over volume — importing everything is importing nothing.'
		},
		{
			title: 'Speaks in diagrams',
			body: 'Answers in Mermaid + Markdown first. A diagram before a paragraph — always.'
		}
	];

	const studioTypes = [
		{ href: '/flowchart', label: 'Flowchart', desc: 'graph LR / TD / TB' },
		{ href: '/sequence', label: 'Sequence', desc: 'interactions over time' },
		{ href: '/state', label: 'State', desc: 'state machines' },
		{ href: '/journey', label: 'Journey', desc: 'user journeys' },
		{ href: '/class', label: 'Class', desc: 'class diagrams' },
		{ href: '/swimlane', label: 'Swimlane', desc: 'subgraph lanes' }
	];

	onMount(async () => {
		if (!browser) return;
		try {
			const mermaid = (await import('mermaid')).default;
			mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
			const { svg } = await mermaid.render('hero-diagram', heroDiagram);
			if (heroEl) heroEl.innerHTML = svg;
		} catch (e) {
			heroError = 'The diagram declined to render — even Art has off days.';
		}
		try {
			const mermaid = (await import('mermaid')).default;
			const { svg } = await mermaid.render('flagship-diagram', flagshipDiagram);
			if (flagshipEl) flagshipEl.innerHTML = svg;
		} catch (e) {
			flagshipError = 'The diagram declined to render — even Art has off days.';
		}
	});
</script>

<svelte:head>
	<title>Art Vandelay — Importer/Exporter of Well-Architected Skills</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950">
	<div class="mx-auto max-w-6xl px-4 py-6 font-[family-name:var(--font-primary)]">
		<Nav />

		<!-- Hero — the one gold moment on the page -->
		<section class="glass-gold mb-8 rounded-3xl p-8 md:p-12">
			<p class="mb-4 text-xs tracking-[0.3em] text-amber-300/80 uppercase">Importer / Exporter</p>
			<h1 class="mb-4 text-5xl font-bold tracking-tight text-white md:text-7xl">
				Art <span class="text-amber-300">Vandelay</span>
			</h1>
			<p class="mb-2 max-w-2xl text-xl text-white/80 md:text-2xl">
				Importer &amp; exporter of well-architected skills.
			</p>
			<p class="mb-8 max-w-2xl text-white/50">
				He reads your environment, imports the skills that fit, and answers in diagrams. Yes — <em
					>that</em
				> Art Vandelay. The cover story finally landed a real job.
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<a
					href="/flowchart"
					class="rounded-lg border border-amber-400/40 bg-amber-500/20 px-5 py-2.5 font-medium text-amber-100 transition-all hover:bg-amber-500/30"
				>
					Enter the Studio
				</a>
				<span class="text-sm text-white/40">
					or say hello — <code class="font-mono text-amber-200/90">/hello-art</code>
				</span>
			</div>

			<div class="mt-10 overflow-x-auto rounded-2xl bg-black/20 p-4">
				{#if heroError}
					<p class="py-8 text-center text-sm text-white/40">{heroError}</p>
				{/if}
				<div bind:this={heroEl} class="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"></div>
			</div>
		</section>

		<!-- Flagship Cargo — architect + judge, Art's two signature exports -->
		<section
			id="flagship"
			class="glass-enhanced mb-8 rounded-2xl border-l-2 border-amber-400/40 p-6 md:p-8"
		>
			<div class="mb-5">
				<p class="mb-1 text-xs tracking-[0.3em] text-amber-300/70 uppercase">Flagship Cargo</p>
				<h2 class="text-2xl font-semibold text-white">Art's two signature exports</h2>
				<p class="mt-1 text-sm text-white/50">
					Invocable directly — they pair, and a "back to the bench" verdict loops to the architect
					again.
				</p>
			</div>

			<div class="mb-6 overflow-x-auto rounded-2xl bg-black/20 p-4">
				{#if flagshipError}
					<p class="py-8 text-center text-sm text-white/40">{flagshipError}</p>
				{/if}
				<div
					bind:this={flagshipEl}
					class="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
				></div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				{#each flagshipCargo as { command, role, body, tagline }}
					<div class="glass-accent rounded-xl p-5">
						<div class="mb-1 flex items-baseline justify-between gap-2">
							<code class="font-mono text-lg font-semibold text-amber-200">{command}</code>
							<span class="text-xs tracking-wide text-white/40 uppercase">{role}</span>
						</div>
						<p class="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
						<p class="mt-3 text-xs text-white/35 italic">{tagline}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Doctrine -->
		<section class="mb-8 grid gap-4 md:grid-cols-3">
			{#each doctrine as { title, body }}
				<div class="glass-enhanced rounded-2xl p-6">
					<h3 class="mb-2 font-semibold text-amber-200">{title}</h3>
					<p class="text-sm leading-relaxed text-white/60">{body}</p>
				</div>
			{/each}
		</section>

		<!-- The Studio — now a feature of Art's house, not the whole house -->
		<section class="glass-accent rounded-2xl p-6 md:p-8">
			<div class="mb-5 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-2xl font-semibold text-white">The Studio</h2>
				<p class="text-sm text-white/50">Art's showroom — one editor per diagram type.</p>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
				{#each studioTypes as { href, label, desc }}
					<a
						{href}
						class="glass-enhanced group rounded-xl p-4 transition-all hover:border-amber-400/30"
					>
						<div class="font-medium text-white transition-colors group-hover:text-amber-200">
							{label}
						</div>
						<div class="mt-1 font-mono text-xs text-white/40">{desc}</div>
					</a>
				{/each}
			</div>
		</section>

		<footer class="mt-10 pb-6 text-center text-xs text-white/30">
			Vandelay Industries · Importer / Exporter · latex, architecture &amp; well-made skills
		</footer>
	</div>
</div>
