<script>
	import Nav from '$lib/components/Nav.svelte';

	const version = '0.11.0';

	const marketplaceCommand = '/plugin marketplace add https://vandeley.art/marketplace.json';
	const install = [
		{ command: marketplaceCommand, note: 'Dock the marketplace.' },
		{
			command: '/plugin install art-vandeley@vandeley',
			note: 'Import the crate — agent, /hello-art, every skill.'
		}
	];
	const sourceCommand = '/plugin marketplace add grzlz/arquitectura';

	const update = [
		{ command: '/plugin marketplace update vandeley', note: 'Refresh the manifest.' },
		{
			command: '/plugin update art-vandeley@vandeley',
			note: 'Pull the new crate. Restart Claude Code after.'
		}
	];

	const colophon = [
		['Drawn by', 'A. Vandeley'],
		['Checked', 'H.E. Pennypacker'],
		['Firm', 'Vandeley Industries'],
		['Set in', 'Newsreader, Libre Franklin & IBM Plex Mono']
	];

	let copied = $state('');
	let copyResetTimer;
	async function copyCommand(text) {
		try {
			await navigator.clipboard.writeText(text);
			copied = text;
			clearTimeout(copyResetTimer);
			copyResetTimer = setTimeout(() => (copied = ''), 1800);
		} catch {
			// clipboard unavailable — leave the button label alone
		}
	}
</script>

<svelte:head>
	<title>Art Vandeley — Importer of Skills, Exporter of Well-Architected Components</title>
</svelte:head>

{#snippet sectionHead(kicker, title, note)}
	<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
		<p class="pt-2 kicker text-accent md:col-span-3">{kicker}</p>
		<div class="md:col-span-9">
			<h2 class="font-display text-title font-light text-balance">{title}</h2>
			<p class="mt-3 max-w-measure text-xl text-ink/75 italic">{note}</p>
		</div>
	</header>
{/snippet}

{#snippet steps(list)}
	<ol class="border-t border-ink/15 md:ml-[25%]">
		{#each list as { command, note }, i (command)}
			<li class="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-ink/15 py-6">
				<span class="font-display text-4xl leading-none font-light text-ink/60 tabular-nums">
					{i + 1}
				</span>
				<div class="min-w-0">
					<p class="font-sans text-sm text-ink/75">{note}</p>
					<div class="mt-3 flex min-w-0 items-center gap-4 bg-surface py-3 pr-3 pl-4">
						<code class="min-w-0 flex-1 text-sm leading-6 [overflow-wrap:anywhere]">{command}</code>
						<button
							onclick={() => copyCommand(command)}
							class="shrink-0 cursor-pointer bg-ink px-3 py-1.5 kicker text-paper transition-colors hover:bg-accent"
						>
							{copied === command ? 'Copied ✓' : 'Copy'}
						</button>
					</div>
				</div>
			</li>
		{/each}
	</ol>
{/snippet}

<div class="min-h-screen bg-paper font-serif text-ink">
	<Nav />

	<main class="mx-auto max-w-6xl px-6">
		<!-- Cover -->
		<section class="pt-4 pb-20">
			<div
				class="rise flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
				style="--d: 0s"
			>
				<span>Vandeley Industries · Import / Export Division</span>
				<span class="tabular-nums">Crate v{version}</span>
			</div>

			<p class="rise mt-12 kicker text-accent" style="--d: 0.05s">A Claude Code plugin</p>
			<h1 class="rise mt-4 max-w-5xl font-display text-headline font-light" style="--d: 0.1s">
				Importer of skills.<br />
				Exporter of <em><span class="whitespace-nowrap">well-architected</span> components</em>.
			</h1>
		</section>

		<!-- Install -->
		<section id="install" class="rise mb-24 scroll-mt-10" style="--d: 0.2s">
			{@render sectionHead(
				'Install',
				'Two lines, and Art’s aboard.',
				'Inside any Claude Code session.'
			)}
			{@render steps(install)}
			<p class="mt-4 font-sans text-sm text-ink/75 md:ml-[25%]">
				Prefer the source?
				<button
					onclick={() => copyCommand(sourceCommand)}
					class="cursor-pointer py-1 font-mono text-ink underline underline-offset-4 transition-colors hover:text-accent"
				>
					{copied === sourceCommand ? 'Copied ✓' : sourceCommand}
				</button>
			</p>
		</section>

		<!-- Update -->
		<section id="update" class="mb-28 scroll-mt-10">
			{@render sectionHead(
				'Update',
				'Already aboard? Two more.',
				'New cargo does not ship itself.'
			)}
			{@render steps(update)}
			<p class="mt-4 max-w-measure font-sans text-sm leading-6 text-ink/75 md:ml-[25%]">
				Then ask <code>/art-vandeley:news</code> what came off the dock. To stop checking by hand,
				turn on auto-update for <em>vandeley</em> under <code>/plugin</code> → Marketplaces.
			</p>
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
