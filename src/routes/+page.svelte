<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let heroSvg = $state('');
	let heroError = $state('');
	let flagshipSvg = $state('');
	let flagshipError = $state('');

	const heroDiagram = `flowchart LR
  CTX["import context<br/>repo · stack · task"] -.->|then| SKL["import skills<br/>the ones that fit"]
  SKL -.setup.-> ART(("Art<br/>Vandeley"))
  ART ==>|architect · judge · export| WELL[["Well-architected<br/>component<br/>papers · stamped"]]
  ART -.speaks in.-> DIAG{{"Mermaid + Markdown"}}`;

	const flagshipDiagram = `flowchart LR
  PROB["A problem"] ==>|"/architect"| DESIGN{{"Map + doctrine<br/>components · seams · decisions"}}
  DESIGN ==>|"/judge"| VERDICT{"The verdict"}
  VERDICT ==>|"stamped — approved for export"| SHIP[["/export<br/>component in your stack"]]
  VERDICT -.back to the bench.-> PROB`;

	const flagshipCargo = [
		{
			command: '/architect',
			role: 'The drafting table',
			body: 'Turns a problem into a well-architected map — components, boundaries, seams, and the load-bearing decisions. Diagram first, doctrine second.',
			tagline: 'It designs; it does not build.'
		},
		{
			command: '/judge',
			role: 'The tribunal',
			body: 'Weighs the design against five criteria — depth, seams, coupling, failure modes, fit — and renders a decisive verdict. The ruling is binding.',
			tagline: 'It rules; it does not rewrite.'
		},
		{
			command: '/export',
			role: 'The shipping dock',
			body: 'Fabricates the component from a stamped design — small interface, deep implementation, in your stack, papers attached. Refuses unstamped cargo.',
			tagline: 'Nothing ships without the stamp.'
		}
	];

	const doctrine = [
		{
			title: 'Imports context, then skills',
			body: 'Reads your repo, stack, and task — read-only recon — then pulls in only the few skills that match. Two imports, said once: precision over volume, then on with the show.'
		},
		{
			title: 'Exports a real component',
			body: 'What leaves the dock is a well-architected component in your own stack — small interface, deep implementation, papers attached. That is the product; the imports are machinery serving it.'
		},
		{
			title: 'Ships stamped cargo',
			body: 'Nothing exports without a verdict from the tribunal. "Back to the bench" means back to the bench — the stamp has teeth.'
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

	const marketplaceCommand = '/plugin marketplace add https://vandeley.art/marketplace.json';
	const marketplaceSourceCommand = '/plugin marketplace add grzlz/arquitectura';
	const installCommands = ['/plugin install art-vandeley@vandeley'];
	const crateSkills = ['architect', 'judge', 'export', 'verify', 'commit'];

	let copied = $state('');
	let copyResetTimer;
	async function copyCommand(text, key) {
		try {
			await navigator.clipboard.writeText(text);
			copied = key;
			clearTimeout(copyResetTimer);
			copyResetTimer = setTimeout(() => (copied = ''), 1800);
		} catch {
			// clipboard unavailable — leave the button label alone
		}
	}

	onMount(async () => {
		if (!browser) return;
		let mermaid;
		try {
			mermaid = (await import('mermaid')).default;
			mermaid.initialize(mermaidInit);
		} catch {
			heroError = flagshipError = 'The diagram declined to render — even Art has off days.';
			return;
		}
		try {
			const { svg } = await mermaid.render('hero-diagram', heroDiagram);
			heroSvg = svg;
		} catch {
			heroError = 'The diagram declined to render — even Art has off days.';
		}
		try {
			const { svg } = await mermaid.render('flagship-diagram', flagshipDiagram);
			flagshipSvg = svg;
		} catch {
			flagshipError = 'The diagram declined to render — even Art has off days.';
		}
	});
</script>

<svelte:head>
	<title>Art Vandeley — Importer of Skills, Exporter of Well-Architected Components</title>
</svelte:head>

<div class="sheet-bg grain min-h-screen font-tech text-paper selection:bg-brass selection:text-ink">
	<Nav />

	<main class="mx-auto max-w-6xl px-6">
		<!-- Hero — the drawing sheet -->
		<section class="relative mt-10 mb-24 border border-paper/15 p-8 md:p-14">
			<span class="reg-mark -top-[9px] -left-[9px]"></span>
			<span class="reg-mark -top-[9px] -right-[9px]"></span>
			<span class="reg-mark -bottom-[9px] -left-[9px]"></span>
			<span class="reg-mark -right-[9px] -bottom-[9px]"></span>

			<div
				class="rise mb-10 flex flex-wrap items-baseline justify-between gap-2 text-[10px] tracking-[0.25em] text-paper/35 uppercase"
				style="--d: 0s"
			>
				<span>Vandeley Industries · Import / Export Division</span>
				<span class="text-brass/70">DWG № AV-001 · Rev A</span>
			</div>

			<h1
				class="rise max-w-4xl font-display text-5xl leading-[0.95] font-light tracking-tight text-paper sm:text-6xl md:text-8xl"
				style="--d: 0.08s"
			>
				Importer of skills. <br /> Exporter of <br />
				<em class="font-normal text-brass-bright">well-architected <br /> components</em>.
			</h1>

			<p class="rise mt-8 max-w-xl text-sm leading-relaxed text-paper/55" style="--d: 0.18s">
				Art Vandeley ships well-architected components with papers — drawn at the drafting table,
				tried by the tribunal, stamped at the dock. Two imports pack the crate: he imports the
				<em class="text-paper/75">context</em> of your repo, then the
				<em class="text-paper/75">skills</em> that fit it. Yes —
				<em class="text-paper/75">that</em> Art Vandeley. The cover story finally landed a real job.
			</p>

			<div class="rise mt-10 flex flex-wrap items-center gap-6" style="--d: 0.28s">
				<a
					href={resolve('/flowchart')}
					class="group inline-flex items-center gap-3 border border-brass/60 bg-brass/10 px-6 py-3 text-xs tracking-[0.2em] text-brass-bright uppercase transition-all hover:border-brass hover:bg-brass hover:text-ink"
				>
					Enter the Studio
					<span class="transition-transform group-hover:translate-x-1">→</span>
				</a>
				<span class="text-xs text-paper/40">
					or say hello — <code class="text-brass/90">/hello-art</code>
				</span>
			</div>

			<figure class="rise mt-14 border-t border-paper/15 pt-6" style="--d: 0.38s">
				{#if heroError}
					<p class="py-8 text-center text-sm text-paper/40">{heroError}</p>
				{/if}
				<div class="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG comes from mermaid.render over a hardcoded diagram, not user input -->
					{@html heroSvg}
				</div>
				<figcaption class="mt-4 text-[10px] tracking-[0.25em] text-paper/35 uppercase">
					<span class="text-brass/70">Fig. 1</span> — Operating principle
				</figcaption>
			</figure>
		</section>

		<!-- Doctrine — numbered manifest lines -->
		<section id="doctrine" class="mb-24 scroll-mt-10">
			<h2 class="mb-2 text-[10px] tracking-[0.3em] text-brass/70 uppercase">The Doctrine</h2>
			<div class="border-t border-paper/15">
				{#each doctrine as { title, body }, i (title)}
					<div
						class="grid gap-2 border-b border-paper/15 py-7 transition-colors hover:bg-paper/[0.03] md:grid-cols-12 md:items-baseline md:gap-6"
					>
						<span class="text-xs text-brass/60 md:col-span-1">0{i + 1}</span>
						<h3
							class="font-display text-2xl font-light text-paper italic md:col-span-4 md:text-3xl"
						>
							{title}
						</h3>
						<p class="text-sm leading-relaxed text-paper/50 md:col-span-7">{body}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Flagship cargo -->
		<section id="flagship" class="mb-24 scroll-mt-10">
			<div class="mb-8 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Flagship Cargo</h2>
				<p class="text-xs text-paper/40">
					The pipeline — drafting table to tribunal to dock. Nothing ships without the stamp.
				</p>
			</div>

			<div class="grid gap-px border border-paper/15 bg-paper/15 md:grid-cols-3">
				{#each flagshipCargo as { command, role, body, tagline }, i (command)}
					<article class="group relative bg-ink p-8 transition-colors hover:bg-surface">
						<span
							class="absolute top-6 right-6 rotate-6 border border-brass/30 px-2 py-1 text-[9px] tracking-[0.2em] text-brass/50 uppercase transition-colors group-hover:border-brass/60 group-hover:text-brass/80"
						>
							{i === 2 ? 'Approved for export' : `Stage 0${i + 1}`}
						</span>
						<p class="mb-1 text-[10px] tracking-[0.25em] text-paper/35 uppercase">{role}</p>
						<h3 class="font-display text-3xl font-light text-brass-bright md:text-4xl">
							{command}
						</h3>
						<p class="mt-5 max-w-md text-sm leading-relaxed text-paper/55">{body}</p>
						<p class="mt-5 font-display text-base text-paper/40 italic">{tagline}</p>
					</article>
				{/each}
			</div>

			<figure class="mt-8 border border-paper/15 p-6">
				{#if flagshipError}
					<p class="py-8 text-center text-sm text-paper/40">{flagshipError}</p>
				{/if}
				<div class="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG comes from mermaid.render over a hardcoded diagram, not user input -->
					{@html flagshipSvg}
				</div>
				<figcaption class="mt-4 text-[10px] tracking-[0.25em] text-paper/35 uppercase">
					<span class="text-brass/70">Fig. 2</span> — The pipeline
				</figcaption>
			</figure>
		</section>

		<!-- Install — customs & onboarding -->
		<section id="install" class="mb-24 scroll-mt-10">
			<div class="mb-8 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">
					Customs &amp; Onboarding
				</h2>
				<p class="text-xs text-paper/40">
					Two lines inside any Claude Code session, and Art's aboard.
				</p>
			</div>

			<div class="grid gap-px border border-paper/15 bg-paper/15 md:grid-cols-2">
				<div class="min-w-0 bg-ink p-8 transition-colors hover:bg-surface">
					<p class="mb-1 text-[10px] tracking-[0.25em] text-paper/35 uppercase">Step 01</p>
					<h3 class="font-display text-3xl font-light text-paper md:text-4xl">
						Dock the marketplace
					</h3>
					<p class="mt-5 max-w-md text-sm leading-relaxed text-paper/55">
						One line registers the <span class="text-brass-bright">vandeley</span> marketplace with
						Claude Code, straight from <span class="text-brass-bright">vandeley.art</span>. Or dock
						from source, under his legal name.
					</p>
					<div
						class="mt-6 flex min-w-0 items-center justify-between gap-4 border border-paper/15 bg-surface px-4 py-3"
					>
						<code
							class="min-w-0 flex-1 overflow-x-auto text-sm whitespace-nowrap text-brass-bright"
						>
							<span class="text-paper/30">❯</span>
							{marketplaceCommand}
						</code>
						<button
							onclick={() => copyCommand(marketplaceCommand, 'marketplace')}
							class="shrink-0 cursor-pointer text-[10px] tracking-[0.2em] text-paper/40 uppercase transition-colors hover:text-brass-bright"
						>
							{copied === 'marketplace' ? 'Copied ✓' : 'Copy'}
						</button>
					</div>
					<button
						onclick={() => copyCommand(marketplaceSourceCommand, 'source')}
						class="mt-3 cursor-pointer text-xs text-paper/40 transition-colors hover:text-brass-bright"
					>
						{copied === 'source'
							? 'Copied ✓ · grzlz/arquitectura'
							: 'or from source · grzlz/arquitectura'}
					</button>
				</div>

				<div class="min-w-0 bg-ink p-8 transition-colors hover:bg-surface">
					<p class="mb-1 text-[10px] tracking-[0.25em] text-paper/35 uppercase">Step 02</p>
					<h3 class="font-display text-3xl font-light text-paper md:text-4xl">Import the cargo</h3>
					<p class="mt-5 max-w-md text-sm leading-relaxed text-paper/55">
						One crate, everything inside — the agent, <code class="text-brass/90">/hello-art</code>,
						and his five skills. Art packs his own luggage.
					</p>
					<div class="mt-6 border border-paper/15 bg-surface">
						<div class="flex items-center justify-between border-b border-paper/15 px-4 py-2">
							<span class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">
								Manifest · 1 crate
							</span>
							<button
								onclick={() => copyCommand(installCommands.join('\n'), 'manifest')}
								class="cursor-pointer text-[10px] tracking-[0.2em] text-paper/40 uppercase transition-colors hover:text-brass-bright"
							>
								{copied === 'manifest' ? 'Copied ✓' : 'Copy'}
							</button>
						</div>
						<div class="overflow-x-auto px-4 py-3">
							{#each installCommands as command (command)}
								<div class="text-sm leading-7 whitespace-nowrap">
									<span class="text-paper/30">❯</span>
									<span class="text-brass-bright">{command}</span>
								</div>
							{/each}
							<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-paper/10 pt-3">
								{#each crateSkills as skill (skill)}
									<span class="text-xs whitespace-nowrap text-paper/45">
										<span class="text-brass/70">▸</span>
										{skill}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>

			<p class="mt-4 text-xs text-paper/40">
				New releases later — <code class="text-brass/90">/plugin marketplace update vandeley</code>.
				Same dock, fresh cargo.
			</p>
		</section>

		<!-- Studio — index of drawing sheets -->
		<section id="studio" class="mb-24 scroll-mt-10">
			<div class="mb-8 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">The Studio</h2>
				<p class="text-xs text-paper/40">Art's showroom — one editor per diagram type.</p>
			</div>
			<div class="border-t border-paper/15">
				{#each studioTypes as { href, label, desc }, i (href)}
					<a
						{href}
						class="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-paper/15 py-5 transition-colors hover:bg-paper/[0.04] sm:grid-cols-[5rem_1fr_1fr_auto]"
					>
						<span class="text-xs text-brass/60">SHT 0{i + 1}</span>
						<span
							class="font-display text-2xl font-light text-paper transition-colors group-hover:text-brass-bright md:text-3xl"
						>
							{label}
						</span>
						<span class="hidden text-xs text-paper/40 sm:block">{desc}</span>
						<span
							class="pr-2 text-brass/50 transition-all group-hover:translate-x-1 group-hover:text-brass-bright"
						>
							→
						</span>
					</a>
				{/each}
			</div>
		</section>

		<!-- Title block footer -->
		<footer class="mb-10">
			<div
				class="grid grid-cols-2 gap-px border border-paper/15 bg-paper/15 text-[10px] tracking-[0.2em] uppercase md:grid-cols-5"
			>
				{#each [['Drawn by', 'A. Vandeley'], ['Checked', 'H.E. Pennypacker'], ['Firm', 'Vandeley Industries'], ['Scale', 'None'], ['Sheet', '1 of 1']] as [k, v] (k)}
					<div class="bg-ink px-4 py-3">
						<p class="mb-1 text-paper/30">{k}</p>
						<p class="text-paper/70">{v}</p>
					</div>
				{/each}
			</div>
			<p class="mt-4 text-center text-[10px] tracking-[0.2em] text-paper/25 uppercase">
				Latex, architecture &amp; well-made skills
			</p>
		</footer>
	</main>
</div>
