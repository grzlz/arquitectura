<script>
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`flowchart LR
  U([User])
  S[System]

  U -- input --> S
  S -- output --> U`);

	let savedDiagrams = $state([]);
	let currentName = $state('');
	let error = $state('');
	let currentExampleIndex = $state(0);
	let feedback = $state(''); // 'saved' | 'copied' | 'copy-failed'
	let saveError = $state('');
	let confirmingDelete = $state(-1);
	let dirty = $state(false);
	let feedbackTimer;

	function flash(state) {
		feedback = state;
		clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => (feedback = ''), 1800);
	}

	function handleInput() {
		dirty = true;
	}

	function handleKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			renderDiagram();
		}
	}

	// The × swaps for Del / No, so focus follows the swap instead of falling to <body>
	async function requestDelete(index) {
		confirmingDelete = index;
		await tick();
		document.querySelector('[data-confirm-delete]')?.focus();
	}

	async function cancelDelete(index) {
		confirmingDelete = -1;
		await tick();
		document.querySelector(`[data-delete="${index}"]`)?.focus();
	}

	function confirmDelete(index) {
		deleteDiagram(index);
		confirmingDelete = -1;
		document.getElementById('diagram-name')?.focus();
	}

	const examples = [
		{
			name: 'System with Subsystems',
			description: 'The base pattern extended with internal structure',
			useCase:
				"The natural starting point: you have a user and a system. When you need to show that system isn't a black box but has internal parts that collaborate, you add subsystems. Same outer flow, more interior detail.",
			complexity: 1,
			code: `flowchart LR
  U([User])

  subgraph S [System]
    SUB1[Subsystem A]
    SUB2[Subsystem B]
    SUB1 -- data --> SUB2
  end

  U -- input --> S
  SUB1 -- output --> U`
		},
		{
			name: 'Bounded Contexts',
			description: 'Actors interacting with domain-separated subsystems',
			useCase:
				'When a system grows into multiple domains, you need to show who owns what. Subgraphs map bounded contexts — team boundaries, service ownership, and interaction points — in one view that both engineers and product leads can read.',
			complexity: 2,
			code: `flowchart LR
  User([User])
  Admin([Admin])

  subgraph Identity [Identity Domain]
    AUTH[Auth Service]
    PROFILE[Profile Service]
    AUTH -- context --> PROFILE
  end

  subgraph Catalog [Catalog Domain]
    PROD[Product Service]
    SEARCH[Search Service]
  end

  User -- login --> Identity
  Admin -- manages --> Identity
  User -- browse --> Catalog
  Identity -- user context --> Catalog`
		},
		{
			name: 'Event-Driven Architecture',
			description: 'Event bus routing messages to multiple consumers',
			useCase:
				"In event-driven systems, services don't call each other — they publish and subscribe. This diagram makes that contract visible: what events exist, who emits them, and which services react. Critical for debugging and onboarding.",
			complexity: 3,
			code: `flowchart LR
  SRC([Order Service])

  SRC -- order.created --> BUS[Event Bus]

  BUS -- order.created --> INV[Inventory Service]
  BUS -- order.created --> NOTIF[Notification Service]
  BUS -- order.created --> BILL[Billing Service]

  INV -- stock.reserved --> BUS
  NOTIF -- email.queued --> BUS
  BILL -- invoice.created --> BUS`
		},
		{
			name: 'Parallel Service Aggregation',
			description: 'Orchestrator fans out and merges results from multiple services',
			useCase:
				'API composition is one of the trickiest patterns to explain. This diagram shows an orchestrator calling three services in parallel, aggregating results, and handling the timeout case — all the decisions that would otherwise live in a PR description.',
			complexity: 4,
			code: `flowchart TD
  Client([Client]) -- request --> ORCH[Orchestrator]

  ORCH -- fetch profile --> USR[User Service]
  ORCH -- check permissions --> PERM[Permissions Service]
  ORCH -- get flags --> FLAGS[Feature Flags]

  USR -- profile --> AGG[Aggregator]
  PERM -- roles --> AGG
  FLAGS -- features --> AGG

  AGG --> V{All resolved?}
  V -- yes --> RESP[Compose response]
  V -- timeout --> FB[Return defaults]

  RESP -- 200 --> Client
  FB -- 200 partial --> Client`
		},
		{
			name: 'Layered System Architecture',
			description: 'Full stack with edge, application, data, and async layers',
			useCase:
				'Architecture review time. This diagram shows all four layers of a production system — edge, application, data, and async — and how they connect. Use it to align the team before a refactor, during incident review, or when pitching infrastructure changes.',
			complexity: 5,
			code: `flowchart TD
  Client([Client App])

  subgraph Edge [Edge Layer]
    GW[API Gateway]
    CDN[CDN]
  end

  subgraph App [Application Layer]
    AUTHSVC[Auth Service]
    BIZ[Business Service]
    CACHE[Cache]
  end

  subgraph Data [Data Layer]
    DB[(Primary DB)]
    RDB[(Read Replica)]
  end

  subgraph Async [Event Layer]
    QUEUE[Message Queue]
    WORKER[Background Worker]
  end

  Client -- request --> Edge
  GW -- validate --> AUTHSVC
  AUTHSVC -- context --> BIZ
  BIZ -- read --> CACHE
  CACHE -- miss --> DB
  DB -- replicate --> RDB
  BIZ -- emit event --> QUEUE
  QUEUE -- process --> WORKER`
		}
	];

	function nextExample() {
		currentExampleIndex = (currentExampleIndex + 1) % examples.length;
	}

	function prevExample() {
		currentExampleIndex = currentExampleIndex === 0 ? examples.length - 1 : currentExampleIndex - 1;
	}

	function loadExample() {
		diagramCode = examples[currentExampleIndex].code;
		renderDiagram();
	}

	onMount(async () => {
		if (browser) {
			mermaid = (await import('mermaid')).default;
			mermaid.initialize(mermaidInit);
			await document.fonts.ready;

			// Load saved diagrams from localStorage
			try {
				const saved = localStorage.getItem('mermaid-diagrams');
				if (saved) savedDiagrams = JSON.parse(saved);
			} catch {
				/* localStorage unavailable */
			}

			renderDiagram();
		}
	});

	async function renderDiagram() {
		if (!mermaid || !browser) return;

		const preview = document.getElementById('preview');
		if (!preview) return;

		dirty = false;

		try {
			preview.innerHTML = '';
			const { svg } = await mermaid.render('preview-diagram', diagramCode);
			preview.innerHTML = svg;
			error = '';
		} catch (e) {
			error = e.message;
			preview.innerHTML = '';
			const note = document.createElement('p');
			note.className = 'font-serif text-lg text-ink/60 italic';
			note.textContent = 'Nothing to preview until the code compiles.';
			preview.appendChild(note);
		}
	}

	function saveDiagram() {
		if (!currentName.trim()) {
			saveError = 'Enter a name to save';
			document.getElementById('diagram-name')?.focus();
			return;
		}

		const newDiagram = {
			name: currentName.trim(),
			code: diagramCode,
			timestamp: new Date().toISOString()
		};

		savedDiagrams = [...savedDiagrams, newDiagram];
		try {
			localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
		} catch {
			saveError = 'Could not save — this browser blocks local storage';
			return;
		}
		saveError = '';
		currentName = '';
		flash('saved');
	}

	function loadDiagram(diagram) {
		diagramCode = diagram.code;
		renderDiagram();
	}

	function deleteDiagram(index) {
		savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
		try {
			localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
		} catch {
			/* ignore */
		}
		confirmingDelete = -1;
	}

	function exportSVG() {
		const svg = document.querySelector('#preview svg');
		if (!svg) return;

		const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${currentName || 'diagram'}.svg`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 100);
	}

	function copyCode() {
		navigator.clipboard
			.writeText(diagramCode)
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

<svelte:head>
	<title>Flowchart — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 01 · Flowchart</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">Flowchart</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				graph LR / TD / TB — edit, then hit Compilar
			</p>
		</header>

		<!-- Toolbar: one hairline band; Compilar is the page's only solid button -->
		<div class="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-ink/15 py-3">
			<div class="flex w-full min-w-0 items-baseline gap-3 sm:w-auto">
				<label for="diagram-name" class="kicker text-ink/60">Name</label>
				<input
					id="diagram-name"
					type="text"
					bind:value={currentName}
					oninput={() => (saveError = '')}
					aria-invalid={saveError ? 'true' : undefined}
					aria-describedby={saveError ? 'diagram-name-error' : undefined}
					class="min-w-0 flex-1 border-b border-ink/30 bg-transparent py-1 font-serif text-lg text-ink transition-colors focus:border-ink sm:w-64 sm:flex-none"
				/>
			</div>
			<div class="flex items-center gap-6">
				<button
					onclick={saveDiagram}
					class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
				>
					{feedback === 'saved' ? 'Saved ✓' : 'Save'}
				</button>
				<button
					onclick={exportSVG}
					class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
					>Export SVG</button
				>
				<button
					onclick={copyCode}
					class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
				>
					{feedback === 'copied'
						? 'Copied ✓'
						: feedback === 'copy-failed'
							? 'Copy failed'
							: 'Copy code'}
				</button>
			</div>
			<button
				onclick={renderDiagram}
				aria-keyshortcuts="Meta+Enter Control+Enter"
				class="ml-auto flex cursor-pointer items-baseline gap-2 bg-ink px-4 py-2 kicker text-paper transition-colors hover:bg-accent"
			>
				Compilar
				<kbd aria-hidden="true" class="font-sans text-[11px] tracking-normal normal-case opacity-75"
					>⌘↵</kbd
				>
			</button>
			{#if saveError}
				<p id="diagram-name-error" class="w-full kicker text-accent">{saveError}</p>
			{/if}
			<span class="sr-only" role="status">
				{feedback === 'saved'
					? 'Diagram saved'
					: feedback === 'copied'
						? 'Code copied'
						: feedback === 'copy-failed'
							? 'Could not copy the code'
							: ''}
			</span>
		</div>

		{#if error}
			<div role="alert" class="mt-8 border-t-2 border-accent pt-3">
				<p class="kicker text-accent">Held at customs</p>
				<pre
					class="mt-2 overflow-x-auto font-mono text-sm leading-6 whitespace-pre-wrap text-ink">{error}</pre>
			</div>
		{/if}

		<!-- Workspace: source and figure, split by a column hairline -->
		<div class="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-ink/15">
			<section aria-labelledby="source-label" class="flex min-w-0 flex-col lg:pr-8">
				<div class="mb-3 flex items-baseline justify-between">
					<h2 id="source-label" class="kicker text-ink/60">Source</h2>
					<span class="kicker text-ink/60">Mermaid</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					onkeydown={handleKeydown}
					spellcheck="false"
					aria-labelledby="source-label"
					placeholder="Start typing your Mermaid diagram…"
					class="min-h-[300px] flex-1 resize-none bg-surface p-6 font-mono text-sm leading-relaxed text-ink placeholder-ink/60 md:min-h-[520px]"
				></textarea>
			</section>

			<figure class="flex min-w-0 flex-col lg:pl-8">
				<div class="mb-3 flex items-baseline justify-between">
					<h2 class="kicker text-ink/60">Preview</h2>
					<span class="kicker {dirty || error ? 'text-accent' : 'text-ink/60'}">
						{dirty ? 'Uncompiled changes' : error ? 'Did not compile' : 'Compiled'}
					</span>
				</div>
				<div class="min-h-[300px] flex-1 overflow-auto md:min-h-[520px]">
					<div id="preview" class="flex min-h-full items-center justify-center">
						<p class="font-serif text-lg text-ink/60 italic">Setting the type…</p>
					</div>
				</div>
				<figcaption class="mt-4 font-sans text-sm text-ink/60">
					<span class="font-semibold text-ink">Fig. 1</span> — Your flowchart diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Diagram patterns
					</h2>
					<p class="kicker font-medium text-ink/60 tabular-nums">
						{currentExampleIndex + 1} of {examples.length}
					</p>
				</div>
			</header>

			<div class="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
				<article class="flex flex-col md:col-span-5">
					<p class="kicker font-medium text-ink/60 tabular-nums">
						Pattern {String(currentExampleIndex + 1).padStart(2, '0')} · Level {examples[
							currentExampleIndex
						].complexity} of 5
					</p>
					<h3 class="mt-3 font-display text-3xl tracking-[-0.01em] md:text-4xl">
						{examples[currentExampleIndex].name}
					</h3>
					<p class="mt-2 font-serif text-xl text-ink/75 italic">
						{examples[currentExampleIndex].description}
					</p>
					<p class="mt-5 max-w-measure font-serif text-lg/relaxed text-ink/85">
						{examples[currentExampleIndex].useCase}
					</p>
					<p class="mt-5 font-sans text-sm text-ink/60">
						{#if examples[currentExampleIndex].complexity <= 2}
							Beginner — actors, systems and subsystems
						{:else if examples[currentExampleIndex].complexity <= 3}
							Intermediate — routing, parallel tracks
						{:else}
							Advanced — phases and full system flows
						{/if}
					</p>
					<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/15 pt-3">
						<button
							onclick={loadExample}
							class="cursor-pointer py-1 kicker text-ink underline underline-offset-4 transition-colors hover:text-accent"
						>
							Load this example
						</button>
						<span class="ml-auto flex gap-6">
							<button
								onclick={prevExample}
								class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
								>← Previous</button
							>
							<button
								onclick={nextExample}
								class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
								>Next →</button
							>
						</span>
					</div>
				</article>

				<figure class="min-w-0 md:col-span-7">
					<pre
						class="max-h-96 overflow-auto bg-surface p-6 font-mono text-sm leading-relaxed text-ink/85">{examples[
							currentExampleIndex
						].code}</pre>
					<figcaption class="mt-4 font-sans text-sm text-ink/60">
						<span class="font-semibold text-ink">Fig. 2</span> — Pattern source, {examples[
							currentExampleIndex
						].code.split('\n').length} lines
					</figcaption>
				</figure>
			</div>
		</section>

		<!-- Saved diagrams — a table of contents, like the Studio index -->
		<section class="mt-24">
			<header class="mb-8 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">The manifest</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Saved diagrams
					</h2>
					<p class="kicker font-medium text-ink/60 tabular-nums">{savedDiagrams.length} saved</p>
				</div>
			</header>

			{#if savedDiagrams.length > 0}
				<ol class="border-t border-ink/15">
					{#each savedDiagrams as diagram, index (diagram.timestamp)}
						<li class="flex items-baseline gap-6 border-b border-ink/15 py-4">
							<button
								onclick={() => loadDiagram(diagram)}
								class="group min-w-0 flex-1 cursor-pointer text-left font-display text-2xl text-ink transition-colors hover:text-accent md:text-3xl"
							>
								{diagram.name}
							</button>
							<span class="hidden font-sans text-sm text-ink/60 tabular-nums sm:inline">
								{new Date(diagram.timestamp).toLocaleDateString()}
							</span>
							{#if confirmingDelete === index}
								<span class="flex items-baseline gap-4">
									<button
										data-confirm-delete
										onclick={() => confirmDelete(index)}
										class="cursor-pointer py-1 kicker text-accent underline underline-offset-4"
									>
										Delete
									</button>
									<button
										onclick={() => cancelDelete(index)}
										class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
										>Keep</button
									>
								</span>
							{:else}
								<button
									data-delete={index}
									onclick={() => requestDelete(index)}
									aria-label="Delete {diagram.name}"
									class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
								>
									Delete
								</button>
							{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<p class="max-w-measure font-serif text-lg text-ink/75">
					<em>Nothing saved yet.</em> Name the diagram above and press Save — it stays in this browser,
					ready to reload.
				</p>
			{/if}
		</section>
	</main>
</div>

<style>
	#preview :global(svg) {
		max-width: 100%;
		height: auto;
	}
</style>
