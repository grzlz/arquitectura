<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`journey
    title Product Discovery
    section Discovery
      Talk to stakeholder: 4: Team
      Register requirements: 5: Team
    section Follow-up
      Share expectations: 3: Stakeholder
      Validate initial plan: 4: Team`);

	let savedDiagrams = $state([]);
	let currentName = $state('');
	let error = $state('');
	let currentExampleIndex = $state(0);

	const examples = [
		{
			name: 'Signup Happy Path',
			description: 'First-contact experience with minimal branching',
			complexity: 1,
			code: `journey
    title User starts onboarding
    section Discovery
      Visits landing page: 3: Prospect
      Reads benefits: 4: Prospect
      Clicks "Create account": 5: Prospect
    section Registration
      Completes basic form: 3: Prospect
      Confirms email: 4: Prospect
      Accesses dashboard: 5: Prospect`
		},
		{
			name: 'Avalúo Solicitation',
			description: 'Happy path for creating a new Avalúo request',
			complexity: 2,
			code: `journey
    title Initial request flow
    section Preparation
      Receives email instructions: 2: Manager
      Gathers required documents: 3: Manager
    section Submission
      Logs into portal: 4: Manager
      Completes appraisal form: 4: Manager
      Reviews summary: 5: Manager
    section Post-submission
      Submits request: 5: Manager
      Receives confirmation: 4: System
      Awaits college assignment: 2: Manager`
		},
		{
			name: 'Colegio Assignment Loop',
			description: 'Introduces feedback when data is incomplete',
			complexity: 3,
			code: `journey
    title Subdirectorate assigns college
    section Initial Review
      Reviews request queue: 3: Subdirectorate
      Validates information: 4: Subdirectorate
      Detects missing data: 1: Subdirectorate
    section Corrections
      Requests additional data: 2: Subdirectorate
      Completes data: 3: Manager
      Confirms receipt: 4: Subdirectorate
    section Assignment
      Selects appropriate college: 4: Subdirectorate
      Notifies college: 3: System
      College accepts case: 4: College`
		},
		{
			name: 'Perito Experience',
			description: 'Parallel emotions for perito and colegio during acceptance',
			complexity: 4,
			code: `journey
    title Expert assignment experience
    section College
      Reviews expert availability: 3: College
      Sends proposal to expert: 4: College
      Awaits response: 1: College
    section Expert
      Receives notification: 3: Expert
      Evaluates workload: 2: Expert
      Accepts case: 4: Expert
      Updates status on platform: 3: Expert
    section System
      Records acceptance: 4: System
      Notifies Subdirectorate and Manager: 3: System`
		},
		{
			name: 'Revisión con Observaciones',
			description: 'Captures rework cycles and differing sentiment per persona',
			complexity: 5,
			code: `journey
    title Appraisal review with observations
    section Expert
      Submits preliminary version: 3: Expert
      Receives observations: 2: Expert
      Schedules adjustments: 2: Expert
      Resubmits corrected version: 4: Expert
    section Reviewer
      Reviews initial submission: 3: Reviewer
      Detects inconsistencies: 2: Reviewer
      Documents comments: 3: Reviewer
      Validates corrections: 4: Reviewer
    section Manager
      Receives "Observations" status: 1: Manager
      Monitors rework: 2: Manager
      Confirms resolution: 4: Manager`
		},
		{
			name: 'Cliente Tracking Journey',
			description: 'Shows multi-touch points including proactive communication',
			complexity: 6,
			code: `journey
    title End client follow-up
    section Start
      Calls to check status: 2: Client
      Receives promise of response: 3: Subdirectorate
    section Proactivity
      System sends automatic notification: 4: System
      Client checks tracking portal: 3: Client
      Sends feedback: 4: Client
    section Closure
      Receives approved result: 5: Client
      Rates satisfaction: 4: Client
      Recommends service: 5: Client`
		},
		{
			name: 'Multi-Persona Delivery',
			description: 'End-to-end journey with four roles and emotional variance',
			complexity: 7,
			code: `journey
    title Appraisal delivery and billing
    section Product
      Generates final report: 4: Expert
      Reviewer approves version: 5: Reviewer
      Subdirectorate signs digitally: 4: Subdirectorate
    section Delivery
      System sends secure link: 4: System
      Client downloads document: 4: Client
      Client requests minor adjustments: 2: Client
      Subdirectorate coordinates clarifications: 3: Subdirectorate
      Adjustments confirmed: 5: Client
    section Billing
      College prepares invoice: 3: College
      Client validates tax data: 2: Client
      Payment recorded: 4: System
      Case closed with NPS survey: 5: System`
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

			const saved = localStorage.getItem('mermaid-journey-diagrams');
			if (saved) savedDiagrams = JSON.parse(saved);

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
			preview.innerHTML = `<div class="error p-4 font-tech text-sm text-red-300">${e.message}</div>`;
		}
	}

	function saveDiagram() {
		if (!currentName) {
			alert('Please enter a diagram name');
			return;
		}

		const newDiagram = {
			name: currentName,
			code: diagramCode,
			timestamp: new Date().toISOString()
		};

		savedDiagrams = [...savedDiagrams, newDiagram];
		localStorage.setItem('mermaid-journey-diagrams', JSON.stringify(savedDiagrams));
		currentName = '';
	}

	function loadDiagram(diagram) {
		diagramCode = diagram.code;
		renderDiagram();
	}

	function deleteDiagram(index) {
		savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
		localStorage.setItem('mermaid-journey-diagrams', JSON.stringify(savedDiagrams));
	}

	function exportSVG() {
		const svg = document.querySelector('#preview svg');
		if (!svg) return;

		const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${currentName || 'user-journey'}.svg`;
		a.click();
	}

	function copyCode() {
		navigator.clipboard.writeText(diagramCode);
		alert('Code copied!');
	}
</script>

<svelte:head>
	<title>User Journey — The Studio · Art Vandeley</title>
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
				<span class="text-brass/70">SHT 04-A · User Journey</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						User Journey
					</h1>
					<p class="mt-3 text-sm text-paper/55">
						Model user experiences with Mermaid Journey diagrams
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
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
						class="cursor-pointer border border-paper/15 px-3 py-2 text-[11px] text-paper/55 transition-all hover:rotate-90 hover:border-paper/40 hover:text-paper"
					>
						↻
					</button>
				</div>
			</div>
		</header>

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

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="flex flex-col overflow-hidden border border-paper/15 bg-ink">
				<div class="flex items-center justify-between border-b border-paper/15 px-6 py-3">
					<h3 class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Code Editor</h3>
					<span class="text-[10px] tracking-[0.2em] text-brass/70 uppercase">Journey diagram</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={renderDiagram}
					spellcheck="false"
					placeholder="journey&#10;    title Experience&#10;    section Discovery&#10;      Step: 3: User"
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 text-sm leading-relaxed text-paper placeholder-paper/30 focus:outline-none md:min-h-[500px]"
				/>
			</div>

			<div class="flex flex-col overflow-hidden border border-paper/15 bg-ink">
				<div class="flex items-center justify-between border-b border-paper/15 px-6 py-3">
					<h3 class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Preview</h3>
					<span class="text-[10px] tracking-[0.2em] text-brass/70 uppercase">Live render</span>
				</div>
				<div class="min-h-[300px] flex-1 overflow-auto p-6 md:min-h-[500px]">
					<div id="preview" class="flex min-h-full items-center justify-center"></div>
				</div>
			</div>
		</div>

		<section class="mt-12">
			<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Journey Patterns</h2>
				<div class="flex items-center gap-4 text-[10px] tracking-[0.2em] text-paper/35 uppercase">
					<span class="text-brass/70">{examples[currentExampleIndex].complexity} / 7</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-px border border-paper/15 bg-paper/15 lg:grid-cols-3">
				<div class="flex flex-col bg-ink p-6 lg:col-span-1">
					<p class="mb-1 text-[10px] tracking-[0.25em] text-paper/35 uppercase">
						Pattern {(currentExampleIndex + 1).toString().padStart(2, '0')}
					</p>
					<h3 class="font-display text-2xl font-light text-paper">
						{examples[currentExampleIndex].name}
					</h3>

					<p class="mt-4 text-sm leading-relaxed text-paper/55">
						{examples[currentExampleIndex].description}
					</p>

					<div class="mt-6">
						<div class="flex gap-1">
							{#each Array(7), i (i)}
								<div
									class="h-1 flex-1 {i < examples[currentExampleIndex].complexity
										? 'bg-brass/70'
										: 'bg-paper/10'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-paper/40">
							{#if examples[currentExampleIndex].complexity <= 2}
								Beginner - Basic onboarding
							{:else if examples[currentExampleIndex].complexity <= 4}
								Intermediate - Collaboration and rework
							{:else if examples[currentExampleIndex].complexity <= 6}
								Advanced - Multiple roles and touchpoints
							{:else}
								Expert - Full delivery and billing
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
						Load & study this journey
					</button>
				</div>

				<div class="flex flex-col overflow-hidden bg-ink lg:col-span-2">
					<div class="flex items-center justify-between border-b border-paper/15 px-4 py-3">
						<span class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Preview code</span>
						<span class="text-[10px] tracking-[0.2em] text-paper/35 uppercase">
							{examples[currentExampleIndex].code.split('\\n').length} lines
						</span>
					</div>
					<pre
						class="max-h-64 flex-1 overflow-auto p-4 text-sm leading-relaxed text-paper/80">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</section>

		{#if savedDiagrams.length > 0}
			<section class="mt-12">
				<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
					<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Saved Journeys</h2>
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
							<button
								onclick={() => deleteDiagram(index)}
								class="w-14 cursor-pointer bg-ink text-lg text-paper/40 transition-colors hover:bg-red-950/30 hover:text-red-300"
							>
								×
							</button>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>

<style>
	#preview :global(svg) {
		max-width: 100%;
		height: auto;
	}
</style>
