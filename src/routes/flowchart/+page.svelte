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
			errEl.className = 'p-4 font-tech text-sm text-red-300';
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

<div class="sheet-bg grain min-h-screen font-tech text-paper selection:bg-brass selection:text-ink">
	<Nav />

	<main class="mx-auto max-w-7xl px-6 py-10">
		<header class="relative mb-12 border border-paper/15 p-6 md:p-8">
			<span class="reg-mark -top-[9px] -left-[9px]"></span>
			<span class="reg-mark -top-[9px] -right-[9px]"></span>
			<span class="reg-mark -bottom-[9px] -left-[9px]"></span>
			<span class="reg-mark -right-[9px] -bottom-[9px]"></span>

			<div
				class="mb-8 flex flex-wrap items-baseline justify-between gap-2 text-[10px] tracking-[0.25em] text-paper/35 uppercase"
			>
				<span>The Studio · Drawing Sheet</span>
				<span class="text-brass/70">SHT 01 · Flowchart</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						Flowchart
					</h1>
					<p class="mt-3 text-sm text-paper/55">graph LR / TD / TB — edit, then hit Compilar</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Diagram name..."
						aria-label="Diagram name"
						class="w-full border border-paper/15 bg-surface px-4 py-2 text-sm text-paper placeholder-paper/30 transition-colors focus:border-brass/60 focus:outline-none sm:w-auto sm:min-w-[200px]"
					/>
					<button
						onclick={saveDiagram}
						class="cursor-pointer border border-brass/60 bg-brass/10 px-4 py-2 text-[11px] tracking-[0.2em] text-brass-bright uppercase transition-all hover:border-brass hover:bg-brass hover:text-ink"
					>
						Save
					</button>
					<button
						onclick={exportSVG}
						class="cursor-pointer border border-paper/15 px-4 py-2 text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:border-paper/40 hover:text-paper"
					>
						Export
					</button>
					<button
						onclick={copyCode}
						class="cursor-pointer border border-paper/15 px-4 py-2 text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:border-paper/40 hover:text-paper"
					>
						Copy
					</button>
					<button
						onclick={renderDiagram}
						aria-label="Refresh diagram"
						class="cursor-pointer border border-paper/15 px-3 py-2 text-[11px] text-paper/55 transition-all hover:rotate-90 hover:border-paper/40 hover:text-paper"
					>
						↻
					</button>
				</div>
			</div>
		</header>

		<!-- Error Banner -->
		{#if error}
			<div class="mb-6 border border-red-400/40 bg-red-950/30 p-4">
				<p class="text-sm text-red-300">
					<span class="mr-3 text-[10px] tracking-[0.2em] text-red-400/70 uppercase">
						Held at customs
					</span>
					{error}
				</p>
			</div>
		{/if}

		<!-- Workspace -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Editor Panel -->
			<div class="flex flex-col overflow-hidden border border-paper/15 bg-ink">
				<div class="flex items-center justify-between border-b border-paper/15 px-6 py-3">
					<h3 class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Code Editor</h3>
					<button
						onclick={renderDiagram}
						aria-label="Compile diagram"
						class="flex cursor-pointer items-center gap-2 border px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-all {dirty
							? 'border-brass bg-brass/15 text-brass-bright hover:bg-brass hover:text-ink'
							: 'border-paper/15 text-paper/50 hover:border-paper/40 hover:text-paper'}"
					>
						{#if dirty}<span class="h-1.5 w-1.5 rounded-full bg-brass-bright"></span>{/if}
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
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 text-sm leading-relaxed text-paper placeholder-paper/30 focus:outline-none md:min-h-[500px]"
				/>
			</div>

			<!-- Preview Panel -->
			<div class="flex flex-col overflow-hidden border border-paper/15 bg-ink">
				<div class="flex items-center justify-between border-b border-paper/15 px-6 py-3">
					<h3 class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Preview</h3>
					<span
						class="text-[10px] tracking-[0.2em] uppercase {dirty
							? 'text-brass/70'
							: 'text-paper/35'}"
					>
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
			<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Diagram Patterns</h2>
				<div class="flex items-center gap-4 text-[10px] tracking-[0.2em] text-paper/35 uppercase">
					<span>Level {examples[currentExampleIndex].complexity}</span>
					<span class="text-brass/70">{currentExampleIndex + 1} / {examples.length}</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-px border border-paper/15 bg-paper/15 lg:grid-cols-3">
				<!-- Example Info -->
				<div class="flex flex-col bg-ink p-6 lg:col-span-1">
					<p class="mb-1 text-[10px] tracking-[0.25em] text-paper/35 uppercase">
						Pattern 0{currentExampleIndex + 1}
					</p>
					<h3 class="font-display text-2xl font-light text-paper">
						{examples[currentExampleIndex].name}
					</h3>
					<p class="mt-1 text-xs text-paper/40">{examples[currentExampleIndex].description}</p>

					<p class="mt-4 text-sm leading-relaxed text-paper/55">
						{examples[currentExampleIndex].useCase}
					</p>

					<div class="mt-6">
						<div class="flex gap-1">
							{#each Array(5), i (i)}
								<div
									class="h-1 flex-1 {i < examples[currentExampleIndex].complexity
										? 'bg-brass/70'
										: 'bg-paper/10'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-paper/40">
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
							class="flex-1 cursor-pointer border border-paper/15 px-4 py-2 text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:border-paper/40 hover:text-paper"
						>
							← Prev
						</button>
						<button
							onclick={nextExample}
							class="flex-1 cursor-pointer border border-paper/15 px-4 py-2 text-[11px] tracking-[0.2em] text-paper/55 uppercase transition-colors hover:border-paper/40 hover:text-paper"
						>
							Next →
						</button>
					</div>

					<button
						onclick={loadExample}
						class="mt-2 w-full cursor-pointer border border-brass/60 bg-brass/10 px-4 py-2 text-[11px] tracking-[0.2em] text-brass-bright uppercase transition-all hover:border-brass hover:bg-brass hover:text-ink"
					>
						Load this example
					</button>
				</div>

				<!-- Example Code Preview -->
				<div class="flex flex-col overflow-hidden bg-ink lg:col-span-2">
					<div class="border-b border-paper/15 px-4 py-3">
						<span class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Code preview</span>
					</div>
					<pre
						class="max-h-64 flex-1 overflow-auto p-4 text-sm leading-relaxed text-paper/80">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</section>

		<!-- Saved Diagrams -->
		{#if savedDiagrams.length > 0}
			<section class="mt-12">
				<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
					<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Saved Diagrams</h2>
					<p class="text-xs text-paper/40">{savedDiagrams.length} in the manifest</p>
				</div>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each savedDiagrams as diagram, index (diagram.timestamp)}
						<div class="flex gap-px border border-paper/15 bg-paper/15">
							<button
								onclick={() => loadDiagram(diagram)}
								class="group flex-1 cursor-pointer bg-ink p-4 text-left transition-colors hover:bg-surface"
							>
								<div class="text-sm text-paper transition-colors group-hover:text-brass-bright">
									{diagram.name}
								</div>
								<div class="mt-1 text-xs text-paper/40">
									{new Date(diagram.timestamp).toLocaleDateString()}
								</div>
							</button>
							{#if confirmingDelete === index}
								<div class="flex w-14 flex-col gap-px">
									<button
										onclick={() => confirmDelete(index)}
										class="flex-1 cursor-pointer bg-ink text-[10px] tracking-[0.15em] text-red-300 uppercase transition-colors hover:bg-red-950/40"
										>Del</button
									>
									<button
										onclick={() => (confirmingDelete = -1)}
										class="flex-1 cursor-pointer bg-ink text-[10px] tracking-[0.15em] text-paper/40 uppercase transition-colors hover:bg-surface"
										>No</button
									>
								</div>
							{:else}
								<button
									onclick={() => requestDelete(index)}
									aria-label="Delete {diagram.name}"
									class="w-14 cursor-pointer bg-ink text-lg text-paper/40 transition-colors hover:bg-red-950/30 hover:text-red-300"
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
			class="fixed right-6 bottom-6 z-[60] border border-brass/50 bg-ink px-4 py-3 text-sm text-paper"
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
