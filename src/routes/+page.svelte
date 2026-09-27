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
			body: 'Nothing exports without a verdict from the tribunal. “Back to the bench” means back to the bench — the stamp has teeth.'
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
	const crateSkills = [
		'architect',
		'judge',
		'export',
		'verify',
		'commit',
		'next-steps',
		'iterate',
		'opinions',
		'unslopify',
		'drama',
		'lets-get-cracking'
	];

	const updateCommands = [
		'/plugin marketplace update vandeley',
		'/plugin update art-vandeley@vandeley'
	];
	const novedades = [
		{
			version: '0.9.0',
			date: '2026-09-26',
			kind: 'New skill',
			command: '/lets-get-cracking',
			role: 'The cast-off',
			body: 'Breaks a session out of a planning loop. Reads the conversation for the actual ask, names what stalled it, drops plan mode and any brainstorm or grill ritual, and drafts feedback when you are fed up. Then it builds the smallest slice that runs, with at most one question. The plan already on the table is cargo, not ballast.',
			usage: ["let's get cracking", 'enough planning, just build it', '/lets-get-cracking']
		},
		{
			version: '0.8.0',
			date: '2026-09-22',
			kind: 'New skill',
			command: '/drama',
			role: 'The gangway',
			body: 'Stages the call to action a page exists for. The main action and one quieter companion sit right under the hook; each button fades in place into the single field it needs, focused and labeled; and once one action lands, the other is offered in one click with the email already given. Ask late, ask once. Fade, never dance.',
			usage: [
				'/drama',
				"we don't have a clear CTA on the course page",
				'make the enroll button turn into an email field'
			]
		},
		{
			version: '0.7.0',
			date: '2026-09-09',
			kind: 'New skill',
			command: '/unslopify',
			role: 'The fitting-out berth',
			body: 'Pumps the AI slop out of a UI. Audits it against the design practice GitHub (Primer) and Tailwind actually publish — indigo gradients, three equal cards, one fuzzy shadow under everything — then refits type, color, spacing, states, motion and copy in your own tokens. Every rule cites its source. Removes defaults nobody chose; never re-brands.',
			usage: [
				'/unslopify',
				'unslopify the hero in src/routes/+page.svelte',
				'this looks AI-generated — de-slop it'
			]
		}
	];

	const formatDate = (iso) =>
		new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	const currentIssue = novedades[0];

	const colophon = [
		['Drawn by', 'A. Vandeley'],
		['Checked', 'H.E. Pennypacker'],
		['Firm', 'Vandeley Industries'],
		['Set in', 'Newsreader, Libre Franklin & IBM Plex Mono']
	];

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
			await document.fonts.ready; // mermaid sizes boxes from the loaded face
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

{#snippet sectionHead(kicker, title, note)}
	<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
		<p class="pt-2 kicker text-accent md:col-span-3">{kicker}</p>
		<div class="md:col-span-9">
			<h2 class="font-display text-title font-light">{title}</h2>
			<p class="mt-3 max-w-measure text-xl text-ink/75 italic">{note}</p>
		</div>
	</header>
{/snippet}

{#snippet copyButton(text, key)}
	<button
		onclick={() => copyCommand(text, key)}
		class="shrink-0 cursor-pointer kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
	>
		{copied === key ? 'Copied ✓' : 'Copy'}
	</button>
{/snippet}

<div class="min-h-screen bg-paper font-serif text-ink">
	<Nav />

	<main class="mx-auto max-w-6xl px-6">
		<!-- Cover -->
		<section class="pt-4 pb-24">
			<div
				class="rise flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
				style="--d: 0s"
			>
				<span>Vandeley Industries · Import / Export Division</span>
				<span class="tabular-nums">
					Issue {currentIssue.version} · {formatDate(currentIssue.date)}
				</span>
			</div>

			<p class="rise mt-12 kicker text-accent" style="--d: 0.05s">A Claude Code plugin</p>
			<h1 class="rise mt-4 max-w-5xl font-display text-headline font-light" style="--d: 0.1s">
				Importer of skills.<br />
				Exporter of <em><span class="whitespace-nowrap">well-architected</span> components</em>.
			</h1>

			<div class="mt-12 grid gap-12 md:grid-cols-12">
				<div class="rise md:col-span-7" style="--d: 0.2s">
					<p class="max-w-measure text-deck text-ink/85 italic">
						An agent that designs a component before building it — and ships nothing without an
						approved verdict.
					</p>
					<p class="mt-6 kicker font-medium text-ink/60">
						By A. Vandeley · Checked by H.E. Pennypacker
					</p>
					<p class="dropcap mt-6 max-w-measure text-lg/relaxed text-ink/85">
						Art Vandeley is a Claude Code plugin. <code>/architect</code> draws the map,
						<code>/judge</code> rules on it, and <code>/export</code> ships the code in your stack.
						Yes — <em>that</em> Art Vandeley. The cover story finally landed a real job.
					</p>
				</div>

				<aside class="rise md:col-span-5" style="--d: 0.3s">
					<div class="border-t-2 border-ink pt-4">
						<p class="kicker text-ink/60">Step 1 of 2</p>
						<p class="mt-2 font-display text-3xl">Dock the marketplace.</p>
						<div class="mt-5 flex min-w-0 items-center gap-4 bg-surface py-3 pr-3 pl-4">
							<code class="min-w-0 flex-1 text-sm leading-6 [overflow-wrap:anywhere]">
								{marketplaceCommand}
							</code>
							<button
								onclick={() => copyCommand(marketplaceCommand, 'hero')}
								class="shrink-0 cursor-pointer bg-ink px-3 py-1.5 kicker text-paper transition-colors hover:bg-accent"
							>
								{copied === 'hero' ? 'Copied ✓' : 'Copy'}
							</button>
						</div>
						<p class="mt-4 font-sans text-sm leading-6 text-ink/75">
							<a
								href="#install"
								class="font-medium text-ink underline underline-offset-4 hover:text-accent"
							>
								Full manifest below ↓</a
							>
							· or browse
							<a
								href={resolve('/flowchart')}
								class="font-medium text-ink underline underline-offset-4 hover:text-accent"
							>
								the Studio</a
							>, free Mermaid editors.
						</p>
					</div>
				</aside>
			</div>

			<figure class="rise mt-20 border-t border-ink/15 pt-10" style="--d: 0.4s">
				{#if heroError}
					<p class="py-8 text-center text-ink/60 italic">{heroError}</p>
				{/if}
				<div class="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG comes from mermaid.render over a hardcoded diagram, not user input -->
					{@html heroSvg}
				</div>
				<figcaption class="mt-8 font-sans text-sm text-ink/60">
					<span class="font-semibold text-ink">Fig. 1</span> — Operating principle
				</figcaption>
			</figure>
		</section>

		<!-- Novedades — what just came off the dock -->
		<section id="novedades" class="mb-28 scroll-mt-10">
			{@render sectionHead('Novedades', 'Fresh off the dock.', 'Update the crate and it is yours.')}

			<div class="grid gap-12 md:grid-cols-12">
				<div class="divide-y divide-ink/15 md:col-span-8">
					{#each novedades as item (item.version + item.command)}
						<article class="py-10 first:pt-0">
							<p class="kicker font-medium text-ink/60">
								{item.kind} · {item.role} ·
								<span class="tabular-nums">v{item.version}, {formatDate(item.date)}</span>
							</p>
							<h3 class="mt-3 font-display text-4xl tracking-[-0.02em] md:text-5xl">
								{item.command}
							</h3>
							<p class="mt-5 max-w-measure text-lg/relaxed text-ink/85">{item.body}</p>
							<p class="mt-6 kicker text-ink/60">Then say</p>
							<ul class="mt-2 space-y-1">
								{#each item.usage as line (line)}
									<li class="overflow-x-auto whitespace-nowrap">
										{#if line.startsWith('/')}
											<code class="text-sm">{line}</code>
										{:else}
											<span class="text-lg italic">“{line}”</span>
										{/if}
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>

				<aside class="md:col-span-4">
					<div class="border-t-2 border-ink pt-4 md:sticky md:top-8">
						<p class="kicker text-ink/60">Already aboard?</p>
						<p class="mt-2 font-display text-3xl">Update the crate.</p>
						<p class="mt-2 text-lg text-ink/75">
							New here? <a
								href="#install"
								class="text-ink underline underline-offset-4 hover:text-accent">Install first</a
							>.
						</p>
						<div class="mt-5 bg-surface">
							<div class="flex items-center justify-between border-b border-ink/10 px-4 py-2">
								<span class="kicker text-ink/60">Update</span>
								{@render copyButton(updateCommands.join('\n'), 'update')}
							</div>
							<div class="overflow-x-auto px-4 py-3">
								{#each updateCommands as command (command)}
									<code class="block text-sm leading-7 whitespace-nowrap">{command}</code>
								{/each}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</section>

		<!-- Flagship cargo -->
		<section id="flagship" class="mb-28 scroll-mt-10">
			{@render sectionHead(
				'Flagship cargo',
				'Three skills, one pipeline.',
				'Design, verdict, code. Nothing ships without the stamp.'
			)}

			<div class="grid divide-y divide-ink/15 md:grid-cols-3 md:divide-x md:divide-y-0">
				{#each flagshipCargo as { command, role, body, tagline }, i (command)}
					<article class="py-8 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
						<p class="kicker font-medium text-ink/60">
							<span class="tabular-nums">Stage 0{i + 1}</span> · {role}
						</p>
						<h3 class="mt-3 font-display text-4xl tracking-[-0.02em] md:text-5xl">{command}</h3>
						<p class="mt-5 text-lg/relaxed text-ink/85">{body}</p>
						<p class="mt-5 font-display text-xl italic">{tagline}</p>
						{#if i === 2}
							<p
								class="mt-6 inline-block -rotate-3 border-2 border-accent px-2 py-1 kicker text-accent"
							>
								Approved for export
							</p>
						{/if}
					</article>
				{/each}
			</div>

			<figure class="mt-14 border-t border-ink/15 pt-10">
				{#if flagshipError}
					<p class="py-8 text-center text-ink/60 italic">{flagshipError}</p>
				{/if}
				<div class="flex justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- SVG comes from mermaid.render over a hardcoded diagram, not user input -->
					{@html flagshipSvg}
				</div>
				<figcaption class="mt-8 font-sans text-sm text-ink/60">
					<span class="font-semibold text-ink">Fig. 2</span> — The pipeline
				</figcaption>
			</figure>
		</section>

		<!-- Pull quote -->
		<figure class="mb-28 border-y border-ink/15 py-16 text-center">
			<blockquote
				class="mx-auto max-w-4xl font-display text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] font-light tracking-[-0.02em] text-balance italic"
			>
				<span class="text-accent">“</span>A diagram before a paragraph — always.<span
					class="text-accent">”</span
				>
			</blockquote>
			<figcaption class="mt-6 kicker text-ink/60">The Doctrine · Article 04</figcaption>
		</figure>

		<!-- Install — customs & onboarding -->
		<section id="install" class="mb-28 scroll-mt-10">
			{@render sectionHead(
				'Customs & onboarding',
				'Two lines, and Art’s aboard.',
				'Inside any Claude Code session.'
			)}

			<div class="grid divide-y divide-ink/15 md:grid-cols-2 md:divide-x md:divide-y-0">
				<div class="min-w-0 pb-10 md:pr-10 md:pb-0">
					<div class="flex items-baseline gap-4">
						<span class="font-display text-6xl leading-none font-light text-ink/60">1</span>
						<h3 class="font-display text-3xl md:text-4xl">Dock the marketplace</h3>
					</div>
					<p class="mt-5 max-w-measure text-lg/relaxed text-ink/85">
						One line registers the <em>vandeley</em> marketplace with Claude Code, straight from
						<em>vandeley.art</em>. Or dock from source, under his legal name.
					</p>
					<div class="mt-6 flex min-w-0 items-center gap-4 bg-surface px-4 py-3">
						<code class="min-w-0 flex-1 text-sm leading-6 [overflow-wrap:anywhere]">
							{marketplaceCommand}
						</code>
						{@render copyButton(marketplaceCommand, 'marketplace')}
					</div>
					<button
						onclick={() => copyCommand(marketplaceSourceCommand, 'source')}
						class="mt-3 cursor-pointer font-sans text-sm text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
					>
						{copied === 'source'
							? 'Copied ✓ · grzlz/arquitectura'
							: 'or from source · grzlz/arquitectura'}
					</button>
				</div>

				<div class="min-w-0 pt-10 md:pt-0 md:pl-10">
					<div class="flex items-baseline gap-4">
						<span class="font-display text-6xl leading-none font-light text-ink/60">2</span>
						<h3 class="font-display text-3xl md:text-4xl">Import the cargo</h3>
					</div>
					<p class="mt-5 max-w-measure text-lg/relaxed text-ink/85">
						One crate, everything inside — the agent, <code>/hello-art</code>, and his eleven
						skills. Art packs his own luggage.
					</p>
					<div class="mt-6 bg-surface">
						<div class="flex items-center justify-between border-b border-ink/10 px-4 py-2">
							<span class="kicker text-ink/60">Manifest · 1 crate</span>
							{@render copyButton(installCommands.join('\n'), 'manifest')}
						</div>
						<div class="overflow-x-auto px-4 py-3">
							{#each installCommands as command (command)}
								<code class="block text-sm leading-7 whitespace-nowrap">{command}</code>
							{/each}
							<p class="mt-2 border-t border-ink/10 pt-3 font-mono text-xs leading-6 text-ink/75">
								{crateSkills.join(' · ')}
							</p>
						</div>
					</div>
				</div>
			</div>

			<p class="mt-10 font-sans text-sm text-ink/75">
				New releases later — <code>/plugin marketplace update vandeley</code>. Same dock, fresh
				cargo.
			</p>
		</section>

		<!-- Studio — table of contents -->
		<section id="studio" class="mb-28 scroll-mt-10">
			{@render sectionHead(
				'The Studio',
				'A separate deck.',
				'Free standalone Mermaid editors — no plugin required.'
			)}

			<ol class="border-t border-ink/15">
				{#each studioTypes as { href, label, desc }, i (href)}
					<li>
						<a
							{href}
							class="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-ink/15 py-5 sm:grid-cols-[4rem_1fr_1fr_auto]"
						>
							<span class="font-sans text-sm text-ink/60 tabular-nums">0{i + 1}</span>
							<span
								class="font-display text-3xl transition-colors group-hover:text-accent md:text-4xl"
							>
								{label}
							</span>
							<span class="hidden text-lg text-ink/60 italic sm:block">{desc}</span>
							<span
								class="pr-2 font-sans text-ink/60 transition-all group-hover:translate-x-1 group-hover:text-accent"
							>
								→
							</span>
						</a>
					</li>
				{/each}
			</ol>
		</section>

		<!-- Doctrine — numbered articles -->
		<section id="doctrine" class="mb-28 scroll-mt-10">
			{@render sectionHead('The Doctrine', 'How Art operates.', 'For the already-convinced.')}

			<ol>
				{#each doctrine as { title, body }, i (title)}
					<li
						class="grid gap-2 border-b border-ink/15 py-8 first:pt-0 md:grid-cols-12 md:items-baseline md:gap-6"
					>
						<span
							class="font-display text-4xl leading-none font-light text-ink/60 tabular-nums md:col-span-1"
						>
							0{i + 1}
						</span>
						<h3 class="font-display text-2xl italic md:col-span-4 md:text-3xl">{title}</h3>
						<p class="text-lg/relaxed text-ink/85 md:col-span-7">{body}</p>
					</li>
				{/each}
			</ol>
		</section>

		<!-- Colophon -->
		<footer class="mb-12 border-t-2 border-ink pt-6">
			<dl class="grid gap-6 font-sans text-sm sm:grid-cols-2 md:grid-cols-4">
				{#each colophon as [term, detail] (term)}
					<div>
						<dt class="kicker text-ink/60">{term}</dt>
						<dd class="mt-1">{detail}</dd>
					</div>
				{/each}
			</dl>
			<p class="mt-12 text-center font-display text-xl text-ink/75 italic">
				Latex, architecture &amp; well-made skills.
			</p>
		</footer>
	</main>
</div>
