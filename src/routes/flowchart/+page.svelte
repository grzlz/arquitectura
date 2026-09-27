<script>
	import { onMount } from 'svelte';
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
	let toast = $state('');
	let confirmingDelete = $state(-1);
	let dirty = $state(false);
	let toastTimer;

	function showToast(message) {
		toast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast = '';
		}, 2500);
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

	function requestDelete(index) {
		confirmingDelete = index;
	}

	function confirmDelete(index) {
		deleteDiagram(index);
		confirmingDelete = -1;
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
			const errEl = document.createElement('div');
			errEl.className = 'p-4 font-mono text-sm text-accent';
			errEl.textContent = e.message;
			preview.appendChild(errEl);
		}
	}

	function saveDiagram() {
		if (!currentName.trim()) {
			showToast('Enter a name to save');
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
			showToast('Could not save — storage unavailable');
		}
		currentName = '';
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
			.then(() => showToast('Code copied to clipboard'))
			.catch(() => showToast('Could not copy — check browser permissions'));
	}
</script>

<svelte:head>
	<title>Flowchart — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-16">
		<header class="mb-12 border-b border-ink/15 pb-10">
			<div
				class="mb-8 flex flex-wrap items-baseline justify-between gap-2 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 01 · Flowchart</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-title font-light">Flowchart</h1>
					<p class="mt-4 max-w-xl font-serif text-deck text-ink/75 italic">
						graph LR / TD / TB — edit, then hit Compilar
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Diagram name..."
						aria-label="Diagram name"
						class="w-full border-b border-ink/30 bg-transparent px-1 py-2 text-sm text-ink placeholder-ink/50 transition-colors focus:border-ink focus:outline-none sm:w-auto sm:min-w-[200px]"
					/>
					<button
						onclick={saveDiagram}
						class="cursor-pointer border border-ink bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-paper uppercase transition-colors hover:border-accent hover:bg-accent"
					>
						Save
					</button>
					<button
						onclick={exportSVG}
						class="cursor-pointer border border-ink/25 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink/75 uppercase transition-colors hover:border-ink hover:text-ink"
					>
						Export
					</button>
					<button
						onclick={copyCode}
						class="cursor-pointer border border-ink/25 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink/75 uppercase transition-colors hover:border-ink hover:text-ink"
					>
						Copy
					</button>
					<button
						onclick={renderDiagram}
						aria-label="Refresh diagram"
						class="cursor-pointer border border-ink/25 px-3 py-2 text-[11px] text-ink/75 transition-all hover:rotate-90 hover:border-ink hover:text-ink"
					>
						↻
					</button>
				</div>
			</div>
		</header>

		<!-- Error Banner -->
		{#if error}
			<div class="mb-6 border border-accent/30 bg-accent/5 p-4">
				<p class="text-sm text-ink">
					<span class="mr-3 kicker text-accent"> Held at customs </span>
					{error}
				</p>
			</div>
		{/if}

		<!-- Workspace -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Editor Panel -->
			<div
				class="flex flex-col overflow-hidden border border-ink/15 bg-surface transition-colors focus-within:border-ink/60"
			>
				<div class="flex items-center justify-between border-b border-ink/15 px-6 py-3">
					<h3 class="kicker text-ink/60">Code Editor</h3>
					<button
						onclick={renderDiagram}
						aria-label="Compile diagram"
						class="flex cursor-pointer items-center gap-2 border px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors {dirty
							? 'border-ink bg-ink text-paper hover:border-accent hover:bg-accent'
							: 'border-ink/25 text-ink/75 hover:border-ink hover:text-ink'}"
					>
						{#if dirty}<span class="h-1.5 w-1.5 rounded-full bg-paper"></span>{/if}
						Compilar
						<kbd class="text-[9px] tracking-normal normal-case opacity-50">⌘↵</kbd>
					</button>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					onkeydown={handleKeydown}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="Start typing your Mermaid diagram..."
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 font-mono text-sm leading-relaxed text-ink placeholder-ink/40 focus:outline-none md:min-h-[500px]"
				/>
			</div>

			<!-- Preview Panel -->
			<div class="flex flex-col overflow-hidden border border-ink/15 bg-paper">
				<div class="flex items-center justify-between border-b border-ink/15 px-6 py-3">
					<h3 class="kicker text-ink/60">Preview</h3>
					<span class="kicker {dirty ? 'text-accent' : 'text-ink/60'}">
						{dirty ? 'Uncompiled changes' : 'Compiled'}
					</span>
				</div>
				<div class="min-h-[300px] flex-1 overflow-auto p-6 md:min-h-[500px]">
					<div id="preview" class="flex min-h-full items-center justify-center"></div>
				</div>
			</div>
		</div>

		<!-- Examples Carousel -->
		<section class="mt-12">
			<div
				class="mb-8 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-ink pt-4"
			>
				<h2 class="font-display text-4xl font-light">Diagram Patterns</h2>
				<div class="flex items-center gap-4 kicker font-medium text-ink/60">
					<span>Level {examples[currentExampleIndex].complexity}</span>
					<span class="text-accent tabular-nums">{currentExampleIndex + 1} / {examples.length}</span
					>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 lg:grid-cols-3">
				<!-- Example Info -->
				<div class="flex flex-col bg-paper p-6 lg:col-span-1">
					<p class="mb-1 kicker text-ink/60">
						Pattern 0{currentExampleIndex + 1}
					</p>
					<h3 class="font-display text-3xl">
						{examples[currentExampleIndex].name}
					</h3>
					<p class="mt-1 font-serif text-lg text-ink/75 italic">
						{examples[currentExampleIndex].description}
					</p>

					<p class="mt-4 font-serif text-[1.0625rem] leading-relaxed text-ink/85">
						{examples[currentExampleIndex].useCase}
					</p>

					<div class="mt-6">
						<div class="flex gap-1">
							{#each Array(5), i (i)}
								<div
									class="h-1 flex-1 {i < examples[currentExampleIndex].complexity
										? 'bg-ink'
										: 'bg-ink/10'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-ink/60">
							{#if examples[currentExampleIndex].complexity <= 2}
								Beginner — actors, systems and subsystems
							{:else if examples[currentExampleIndex].complexity <= 3}
								Intermediate — routing, parallel tracks
							{:else}
								Advanced — phases and full system flows
							{/if}
						</p>
					</div>

					<div class="mt-auto flex gap-2 pt-6">
						<button
							onclick={prevExample}
							class="flex-1 cursor-pointer border border-ink/25 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink/75 uppercase transition-colors hover:border-ink hover:text-ink"
						>
							← Prev
						</button>
						<button
							onclick={nextExample}
							class="flex-1 cursor-pointer border border-ink/25 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink/75 uppercase transition-colors hover:border-ink hover:text-ink"
						>
							Next →
						</button>
					</div>

					<button
						onclick={loadExample}
						class="mt-2 w-full cursor-pointer border border-ink bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-paper uppercase transition-colors hover:border-accent hover:bg-accent"
					>
						Load this example
					</button>
				</div>

				<!-- Example Code Preview -->
				<div class="flex flex-col overflow-hidden bg-paper lg:col-span-2">
					<div class="border-b border-ink/15 px-4 py-3">
						<span class="kicker text-ink/60">Code preview</span>
					</div>
					<pre
						class="max-h-64 flex-1 overflow-auto bg-surface p-4 font-mono text-sm leading-relaxed text-ink/85">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</section>

		<!-- Saved Diagrams -->
		{#if savedDiagrams.length > 0}
			<section class="mt-12">
				<div
					class="mb-8 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-ink pt-4"
				>
					<h2 class="font-display text-4xl font-light">Saved Diagrams</h2>
					<p class="text-xs text-ink/60">{savedDiagrams.length} in the manifest</p>
				</div>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each savedDiagrams as diagram, index (diagram.timestamp)}
						<div class="flex gap-px border border-ink/15 bg-ink/15">
							<button
								onclick={() => loadDiagram(diagram)}
								class="group flex-1 cursor-pointer bg-paper p-4 text-left transition-colors hover:bg-surface"
							>
								<div
									class="font-display text-xl text-ink transition-colors group-hover:text-accent"
								>
									{diagram.name}
								</div>
								<div class="mt-1 text-xs text-ink/60">
									{new Date(diagram.timestamp).toLocaleDateString()}
								</div>
							</button>
							{#if confirmingDelete === index}
								<div class="flex w-14 flex-col gap-px">
									<button
										onclick={() => confirmDelete(index)}
										class="flex-1 cursor-pointer bg-paper text-[10px] font-semibold tracking-[0.14em] text-accent uppercase transition-colors hover:bg-accent/10"
										>Del</button
									>
									<button
										onclick={() => (confirmingDelete = -1)}
										class="flex-1 cursor-pointer bg-paper text-[10px] tracking-[0.15em] text-ink/60 uppercase transition-colors hover:bg-surface"
										>No</button
									>
								</div>
							{:else}
								<button
									onclick={() => requestDelete(index)}
									aria-label="Delete {diagram.name}"
									class="w-14 cursor-pointer bg-paper text-lg text-ink/60 transition-colors hover:bg-accent/10 hover:text-accent"
								>
									×
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	{#if toast}
		<div
			class="fixed right-6 bottom-6 z-[60] bg-ink px-4 py-3 text-sm text-paper"
			role="status"
			aria-live="polite"
		>
			{toast}
		</div>
	{/if}
</div>

<style>
	#preview :global(svg) {
		max-width: 100%;
		height: auto;
	}
</style>
