<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

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
	let renderTimer;
	let toastTimer;

	function showToast(message) {
		toast = message;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast = '';
		}, 2500);
	}

	function handleInput() {
		clearTimeout(renderTimer);
		renderTimer = setTimeout(renderDiagram, 250);
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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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

		try {
			preview.innerHTML = '';
			const { svg } = await mermaid.render('preview-diagram', diagramCode);
			preview.innerHTML = svg;
			error = '';
		} catch (e) {
			error = e.message;
			preview.innerHTML = '';
			const errEl = document.createElement('div');
			errEl.className = 'text-red-400 p-4 font-mono text-sm';
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
	<title>Diagram Editor — Architect's Studio</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-4 font-[family-name:var(--font-primary)] md:p-8"
>
	<div class="mx-auto max-w-7xl">
		<Nav />

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">Diagram Editor</h1>
					<p class="text-sm text-white/90">Create diagrams with real-time preview</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Diagram name..."
						aria-label="Diagram name"
						class="w-full rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none sm:w-auto sm:min-w-[200px]"
					/>
					<button
						onclick={saveDiagram}
						class="glass-gold rounded-lg px-4 py-2 font-medium text-white transition-all hover:scale-105"
					>
						Save
					</button>
					<button
						onclick={exportSVG}
						class="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
					>
						Export
					</button>
					<button
						onclick={copyCode}
						class="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
					>
						Copy
					</button>
					<button
						onclick={renderDiagram}
						aria-label="Refresh diagram"
						class="rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-medium text-white transition-all hover:rotate-90 hover:bg-white/20"
					>
						↻
					</button>
				</div>
			</div>
		</div>

		<!-- Error Banner -->
		{#if error}
			<div
				class="glass-accent animate-in slide-in-from-top mb-6 rounded-xl border-red-400/40 bg-red-500/30 p-4"
			>
				<div class="flex items-center gap-3 text-white">
					<span class="text-xl">⚠️</span>
					<span class="font-mono text-sm">{error}</span>
				</div>
			</div>
		{/if}

		<!-- Workspace -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Editor Panel -->
			<div class="glass-enhanced flex flex-col overflow-hidden rounded-2xl">
				<div
					class="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4"
				>
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">Code Editor</h3>
					<span
						class="rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-xs font-medium text-white"
					>
						Mermaid Syntax
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="Start typing your Mermaid diagram..."
					class="min-h-[300px] flex-1 resize-none bg-white/5 p-6 font-mono text-sm leading-relaxed text-white placeholder-white/40 focus:outline-none md:min-h-[500px]"
				/>
			</div>

			<!-- Preview Panel -->
			<div class="glass-enhanced flex flex-col overflow-hidden rounded-2xl">
				<div
					class="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4"
				>
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">Preview</h3>
					<span
						class="rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-xs font-medium text-white"
					>
						Live Render
					</span>
				</div>
				<div class="min-h-[300px] flex-1 overflow-auto bg-gray-900 p-6 md:min-h-[500px]">
					<div
						id="preview"
						class="flex min-h-full items-center justify-center rounded-lg bg-gray-800"
					></div>
				</div>
			</div>
		</div>

		<!-- Examples Carousel -->
		<div class="glass-enhanced mt-6 rounded-2xl p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Diagram Patterns</h2>
					<p class="mt-1 text-sm text-white/60">
						Progressive complexity — from a simple flow to a full system
					</p>
				</div>
				<div class="flex items-center gap-3">
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						Level {examples[currentExampleIndex].complexity}
					</span>
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						{currentExampleIndex + 1} / {examples.length}
					</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Example Info -->
				<div class="flex flex-col gap-3 lg:col-span-1">
					<div class="glass-accent rounded-xl p-4">
						<div class="mb-3 flex items-center gap-2">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white"
							>
								{examples[currentExampleIndex].complexity}
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-white">{examples[currentExampleIndex].name}</h3>
								<p class="text-xs text-white/50">{examples[currentExampleIndex].description}</p>
							</div>
						</div>

						<p class="mb-4 text-sm leading-relaxed text-white/70">
							{examples[currentExampleIndex].useCase}
						</p>

						<div class="flex gap-2">
							<button
								onclick={prevExample}
								class="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
							>
								← Previous
							</button>
							<button
								onclick={nextExample}
								class="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
							>
								Next →
							</button>
						</div>

						<button
							onclick={loadExample}
							class="mt-3 w-full rounded-lg bg-white/90 px-4 py-2 font-medium text-primary-600 transition-all hover:scale-105 hover:bg-white"
						>
							Load this example
						</button>
					</div>

					<div class="glass-accent rounded-xl p-4">
						<h4 class="mb-2 text-xs font-semibold tracking-wide text-white/80 uppercase">
							Complexity Progression
						</h4>
						<div class="flex gap-1">
							{#each Array(5) as _, i}
								<div
									class="h-2 flex-1 rounded-full {i < examples[currentExampleIndex].complexity
										? 'bg-primary-500'
										: 'bg-white/20'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-white/60">
							{#if examples[currentExampleIndex].complexity <= 2}
								Beginner — actors, systems and subsystems
							{:else if examples[currentExampleIndex].complexity <= 3}
								Intermediate — routing, parallel tracks
							{:else}
								Advanced — phases and full system flows
							{/if}
						</p>
					</div>
				</div>

				<!-- Example Code Preview -->
				<div class="glass-accent overflow-hidden rounded-xl lg:col-span-2">
					<div class="border-b border-white/20 bg-white/5 px-4 py-3">
						<span class="font-mono text-xs text-white/80">Code preview</span>
					</div>
					<pre
						class="max-h-64 overflow-auto p-4 font-mono text-sm leading-relaxed text-white/90">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</div>

		<!-- Saved Diagrams -->
		{#if savedDiagrams.length > 0}
			<div class="glass-enhanced mt-6 rounded-2xl p-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-white">Saved Diagrams</h2>
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						{savedDiagrams.length}
					</span>
				</div>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each savedDiagrams as diagram, index}
						<div class="animate-in slide-in-from-left flex gap-2">
							<button
								onclick={() => loadDiagram(diagram)}
								class="group flex-1 rounded-lg border border-white/20 bg-white/10 p-3 text-left transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20"
							>
								<div class="mb-1 text-sm font-medium text-white group-hover:text-white/90">
									{diagram.name}
								</div>
								<div class="text-xs text-white/60">
									{new Date(diagram.timestamp).toLocaleDateString()}
								</div>
							</button>
							{#if confirmingDelete === index}
								<div class="flex w-12 flex-col gap-1">
									<button
										onclick={() => confirmDelete(index)}
										class="rounded-lg border border-red-400/40 bg-red-500/40 py-1 text-xs font-medium text-white transition-all hover:bg-red-500/60"
										>Del</button
									>
									<button
										onclick={() => (confirmingDelete = -1)}
										class="rounded-lg border border-white/20 bg-white/10 py-1 text-xs text-white/60 transition-all hover:bg-white/20"
										>No</button
									>
								</div>
							{:else}
								<button
									onclick={() => requestDelete(index)}
									aria-label="Delete {diagram.name}"
									class="w-12 rounded-lg border border-white/20 bg-white/10 text-xl text-white transition-all hover:border-red-400/40 hover:bg-red-500/30 hover:text-red-200"
								>
									×
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if toast}
		<div
			class="glass-accent fixed right-6 bottom-6 z-50 rounded-xl px-4 py-3 text-sm text-white"
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
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
	}
</style>
