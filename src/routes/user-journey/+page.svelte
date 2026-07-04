<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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
			preview.innerHTML = `<div class="error text-red-400 p-4">${e.message}</div>`;
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

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-4 font-[family-name:var(--font-primary)] md:p-8"
>
	<div class="mx-auto max-w-7xl">
		<!-- Navigation -->
		<div class="glass-enhanced mb-6 rounded-2xl p-4">
			<div class="flex flex-wrap items-center gap-3">
				<a
					href="/"
					class="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
				>
					🏠 General
				</a>
				<a
					href="/sequence"
					class="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
				>
					🔄 Sequence
				</a>
				<a
					href="/state"
					class="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
				>
					🎯 State
				</a>
				<a
					href="/user-journey"
					class="rounded-lg border-2 border-white/40 bg-white/20 px-4 py-2 font-medium text-white"
				>
					🗺️ Journey
				</a>
				<a
					href="/swimlane"
					class="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
				>
					🏊 Swimlane
				</a>
			</div>
		</div>

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">User Journey Studio</h1>
					<p class="text-sm text-white/90">Model user experiences with Mermaid Journey diagrams</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
						class="w-full rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none sm:w-auto sm:min-w-[200px]"
					/>
					<button
						onclick={saveDiagram}
						class="rounded-lg bg-white/90 px-4 py-2 font-medium text-primary-600 transition-all hover:scale-105 hover:bg-white hover:shadow-lg"
					>
						💾 Save
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
						class="rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-medium text-white transition-all hover:rotate-90 hover:bg-white/20"
					>
						↻
					</button>
				</div>
			</div>
		</div>

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

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="glass-enhanced flex flex-col overflow-hidden rounded-2xl">
				<div
					class="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4"
				>
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">Editor</h3>
					<span
						class="rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-xs font-medium text-white"
					>
						Journey Diagram
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={renderDiagram}
					spellcheck="false"
					placeholder="journey&#10;    title Experience&#10;    section Discovery&#10;      Step: 3: User"
					class="min-h-[300px] flex-1 resize-none bg-white/5 p-6 font-mono text-sm leading-relaxed text-white placeholder-white/40 focus:outline-none md:min-h-[500px]"
				/>
			</div>

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

		<div class="glass-enhanced mt-6 rounded-2xl p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Journey Patterns</h2>
					<p class="mt-1 text-sm text-white/60">Seven examples with increasing complexity</p>
				</div>
				<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
					{examples[currentExampleIndex].complexity} / 7
				</span>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div class="flex flex-col gap-3 lg:col-span-1">
					<div class="glass-accent rounded-xl p-4">
						<div class="mb-3 flex items-center gap-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white"
							>
								{examples[currentExampleIndex].complexity}
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-white">{examples[currentExampleIndex].name}</h3>
								<p class="text-xs text-white/60">
									Complexity Level {examples[currentExampleIndex].complexity}
								</p>
							</div>
						</div>

						<p class="mb-4 text-sm text-white/70">{examples[currentExampleIndex].description}</p>

						<div class="flex gap-2">
							<button
								onclick={prevExample}
								class="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
							>
								← Prev
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
							Load & Study This Journey
						</button>
					</div>

					<div class="glass-accent rounded-xl p-4">
						<h4 class="mb-2 text-xs font-semibold tracking-wide text-white/80 uppercase">
							Complexity Progression
						</h4>
						<div class="flex gap-1">
							{#each Array(7) as _, i}
								<div
									class="h-2 flex-1 rounded-full {i < examples[currentExampleIndex].complexity
										? 'bg-primary-500'
										: 'bg-white/20'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-white/60">
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
				</div>

				<div class="glass-accent overflow-hidden rounded-xl lg:col-span-2">
					<div
						class="flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-3"
					>
						<span class="font-mono text-xs text-white/80">Preview Code</span>
						<span class="text-xs text-white/60">
							{examples[currentExampleIndex].code.split('\\n').length} lines
						</span>
					</div>
					<pre
						class="max-h-64 overflow-auto p-4 font-mono text-sm leading-relaxed text-white/90">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</div>

		{#if savedDiagrams.length > 0}
			<div class="glass-enhanced mt-6 rounded-2xl p-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-white">Saved Journeys</h2>
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
							<button
								onclick={() => deleteDiagram(index)}
								class="w-12 rounded-lg border border-white/20 bg-white/10 text-xl text-white transition-all hover:scale-110 hover:border-red-400/40 hover:bg-red-500/30 hover:text-red-200"
							>
								×
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	#preview :global(svg) {
		max-width: 100%;
		height: auto;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
	}
</style>
