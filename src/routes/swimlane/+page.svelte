<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`graph TB
    subgraph Customer
      A[Browse] --> B[Buy]
    end
    subgraph System
      B --> C[Process]
    end`);

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
			name: 'Simple Handoff',
			description: 'Two-lane process showing customer-support interaction',
			complexity: 1,
			code: `graph TB
    subgraph Customer
        A[Report issue]
        A --> B[Receive solution]
    end

    subgraph Support
        C[Receive ticket]
        C --> D[Investigate]
        D --> E[Resolve issue]
    end

    A --> C
    E --> B`
		},
		{
			name: 'Order Processing',
			description: 'Three-lane e-commerce flow with handoffs',
			complexity: 2,
			code: `graph TB
    subgraph Customer
        A[Browse products]
        A --> B[Add to cart]
        B --> C[Checkout]
    end

    subgraph Payment_System[Payment System]
        D[Process payment]
        D --> E{Approved?}
        E -->|Yes| F[Confirm]
        E -->|No| G[Decline]
    end

    subgraph Warehouse
        H[Pick items]
        H --> I[Pack]
        I --> J[Ship]
    end

    C --> D
    F --> H
    G -.-> B
    J --> K

    subgraph Customer2[Customer]
        K[Receive package]
    end`
		},
		{
			name: 'Support Ticket Escalation',
			description: 'Four-lane support flow with escalation paths',
			complexity: 3,
			code: `graph TB
    subgraph User
        A[Report bug]
        A --> B[Provide info]
        Q[Receive solution]
    end

    subgraph L1_Support[L1 Support]
        C[Create ticket]
        C --> D{Can resolve?}
        D -->|Yes| E[Fix issue]
        D -->|No| F[Escalate to L2]
    end

    subgraph L2_Support[L2 Support]
        G[Investigate]
        G --> H{Can resolve?}
        H -->|Yes| I[Fix issue]
        H -->|No| J[Escalate to Manager]
    end

    subgraph Manager
        K[Review]
        K --> L[Assign specialist]
        L --> M[Resolve]
    end

    A --> C
    E --> Q
    F --> G
    I --> Q
    J --> K
    M --> Q

    B -.Additional info.-> C
    B -.Additional info.-> G`
		},
		{
			name: 'Hiring Process',
			description: 'Multi-stage recruitment with decision loops',
			complexity: 4,
			code: `graph TB
    subgraph Candidate
        A[Submit application]
        B[Phone interview]
        C[Technical interview]
        D[Final interview]
        E[Accept offer]
    end

    subgraph Recruiter
        F[Screen resume]
        F --> G{Qualified?}
        G -->|No| H[Reject]
        G -->|Yes| I[Schedule phone screen]
        I --> J[Conduct call]
        J --> K{Pass?}
        K -->|Yes| L[Forward to Manager]
        K -->|No| H
    end

    subgraph Manager
        M[Review candidate]
        M --> N[Technical assessment]
        N --> O{Pass?}
        O -->|Yes| P[Schedule final]
        O -->|No| H
        P --> Q[Make decision]
        Q --> R{Hire?}
        R -->|Yes| S[Send offer]
        R -->|No| H
    end

    subgraph HR
        T[Prepare offer]
        T --> U[Send paperwork]
        U --> V[Process onboarding]
    end

    A --> F
    I --> B
    L --> M
    P --> D
    S --> T
    U --> E`
		},
		{
			name: 'Insurance Claim',
			description: 'Complex routing with multiple decision points',
			complexity: 5,
			code: `graph TB
    subgraph Client
        A[File claim]
        B[Provide documents]
        C[Receive payout]
    end

    subgraph Agent
        D[Receive claim]
        D --> E[Validate info]
        E --> F{Complete?}
        F -->|No| G[Request documents]
        F -->|Yes| H[Forward to underwriter]
    end

    subgraph Underwriter
        I[Review policy]
        I --> J{Covered?}
        J -->|No| K[Deny claim]
        J -->|Yes| L{Amount?}
        L -->|Under 10k| M[Approve]
        L -->|Over 10k| N[Forward to Claims]
    end

    subgraph Claims_Manager[Claims Manager]
        O[Review large claim]
        O --> P{Investigate?}
        P -->|Yes| Q[Order inspection]
        P -->|No| R[Approve]
    end

    subgraph Finance
        S[Process payment]
        S --> T[Issue check]
    end

    A --> D
    G --> B
    B --> H
    H --> I
    K -.Rejection letter.-> Client
    M --> S
    N --> O
    R --> S
    T --> C`
		},
		{
			name: 'Software Release',
			description: 'Parallel review paths with sync points',
			complexity: 6,
			code: `graph TB
    subgraph Dev
        A[Create PR]
        A --> B[Address feedback]
        P[Deploy to prod]
    end

    subgraph QA
        C[Test feature]
        C --> D{Bugs?}
        D -->|Yes| E[Report issues]
        D -->|No| F[Approve QA]
    end

    subgraph Security
        G[Security scan]
        G --> H{Vulnerabilities?}
        H -->|Yes| I[Report CVEs]
        H -->|No| J[Approve Security]
    end

    subgraph Code_Review[Code Review]
        K[Review code]
        K --> L{Changes needed?}
        L -->|Yes| M[Request changes]
        L -->|No| N[Approve]
    end

    subgraph Ops
        O[Deploy to staging]
        O --> Q[Monitor metrics]
        Q --> R{Stable?}
        R -->|Yes| S[Promote to prod]
        R -->|No| T[Rollback]
    end

    A --> C
    A --> G
    A --> K

    E --> B
    I --> B
    M --> B

    F --> X
    J --> X
    N --> X
    X{All approved?} -->|Yes| O
    X -->|No| B

    S --> P`
		},
		{
			name: 'Loan Approval',
			description: 'Multi-department financial process',
			complexity: 7,
			code: `graph TB
    subgraph Applicant
        A[Submit application]
        B[Provide documents]
        C[Sign agreement]
        D[Receive funds]
    end

    subgraph Loan_Officer[Loan Officer]
        E[Review application]
        E --> F{Pre-qualified?}
        F -->|No| G[Reject]
        F -->|Yes| H[Request documents]
        H --> I[Verify employment]
        I --> J[Calculate DTI]
    end

    subgraph Credit
        K[Pull credit report]
        K --> L{Score > 680?}
        L -->|No| M[High risk - escalate]
        L -->|Yes| N[Approve credit]
    end

    subgraph Compliance
        O[Regulatory check]
        O --> P{AML compliant?}
        P -->|No| Q[Investigate]
        P -->|Yes| R[Approve compliance]
    end

    subgraph Underwriting
        S[Risk assessment]
        S --> T{Accept risk?}
        T -->|No| G
        T -->|Yes| U[Set terms]
    end

    subgraph Finance
        V[Fund approval]
        V --> W{Budget available?}
        W -->|Yes| X[Allocate funds]
        W -->|No| Y[Wait for budget]
    end

    A --> E
    H --> B
    B --> J
    J --> K
    J --> O

    M --> S
    N --> S
    Q --> S
    R --> S

    U --> V
    X --> C
    C --> D

    G -.Rejection.-> Applicant`
		},
		{
			name: 'Healthcare Referral',
			description: 'Patient journey through multiple providers',
			complexity: 8,
			code: `graph TB
    subgraph Patient
        A[Report symptoms]
        B[Visit PCP]
        C[Get referral]
        H[Visit specialist]
        N[Get test]
        S[Receive results]
        T[Start treatment]
    end

    subgraph PCP[Primary Care]
        D[Examine patient]
        D --> E{Needs specialist?}
        E -->|No| F[Prescribe treatment]
        E -->|Yes| G[Create referral]
    end

    subgraph Specialist
        I[Review case]
        I --> J{Diagnostic test needed?}
        J -->|Yes| K[Order lab work]
        J -->|No| L[Diagnose]
    end

    subgraph Insurance
        M[Verify coverage]
        M --> O{Covered?}
        O -->|No| P[Deny - patient pays]
        O -->|Yes| Q[Approve]
        R[Pre-auth test]
        R --> W{Approved?}
        W -->|Yes| X[Authorize]
        W -->|No| Y[Deny]
    end

    subgraph Lab
        U[Run tests]
        U --> V[Send results]
    end

    A --> B
    B --> D
    F -.Direct treatment.-> Patient
    G --> M
    Q --> C
    C --> H
    H --> I
    K --> R
    X --> N
    N --> U
    V --> S
    S --> L
    L --> T`
		},
		{
			name: 'Enterprise Procurement',
			description: 'Complex multi-stakeholder approval chain',
			complexity: 9,
			code: `graph TB
    subgraph Requester
        A[Identify need]
        A --> B[Create requisition]
        Z[Receive goods]
    end

    subgraph Manager
        C[Review request]
        C --> D{Approve?}
        D -->|No| E[Reject with reason]
        D -->|Yes| F{Budget?}
        F -->|< 10k| G[Approve]
        F -->|> 10k| H[Forward to Director]
    end

    subgraph Director
        I[Strategic review]
        I --> J{Aligns with goals?}
        J -->|No| E
        J -->|Yes| K[Approve]
    end

    subgraph Procurement
        L[Market research]
        L --> M[RFP process]
        M --> N[Vendor evaluation]
        N --> O[Select vendor]
        O --> P[Negotiate terms]
    end

    subgraph Finance
        Q[Budget check]
        Q --> R{Funds available?}
        R -->|No| S[Request budget allocation]
        R -->|Yes| T[Reserve funds]
        T --> U[Approve PO]
    end

    subgraph Legal
        V[Contract review]
        V --> W{Terms acceptable?}
        W -->|No| X[Request revisions]
        W -->|Yes| Y[Approve contract]
    end

    subgraph Vendor
        AA[Receive PO]
        AA --> AB[Fulfill order]
        AB --> AC[Ship goods]
        AC --> AD[Send invoice]
    end

    B --> C
    E -.Rejection.-> Requester
    G --> L
    H --> I
    K --> L
    P --> Q
    P --> V
    X -.Negotiate.-> Procurement
    T --> V
    Y --> U
    U --> AA
    AC --> Z
    AD --> Finance`
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

			try {
				const saved = localStorage.getItem('mermaid-swimlane-diagrams');
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
			localStorage.setItem('mermaid-swimlane-diagrams', JSON.stringify(savedDiagrams));
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
			localStorage.setItem('mermaid-swimlane-diagrams', JSON.stringify(savedDiagrams));
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
		a.download = `${currentName || 'swimlane-diagram'}.svg`;
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
	<title>Swimlane — The Studio · Art Vandeley</title>
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
				<span class="text-brass/70">SHT 06 · Swimlane</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						Swimlane
					</h1>
					<p class="mt-3 text-sm text-paper/55">
						Multi-actor processes — from simple handoffs to enterprise workflows
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
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
					placeholder="graph TB&#10;    subgraph Actor1&#10;        A[Step]&#10;    end"
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 text-sm leading-relaxed text-paper placeholder-paper/30 focus:outline-none md:min-h-[500px]"
				/>
			</div>

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

		<!-- Learning Examples Carousel -->
		<section class="mt-12">
			<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Process Flow Patterns</h2>
				<div class="flex items-center gap-4 text-[10px] tracking-[0.2em] text-paper/35 uppercase">
					<span>Level {examples[currentExampleIndex].complexity}</span>
					<span class="text-brass/70">{currentExampleIndex + 1} / {examples.length}</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-px border border-paper/15 bg-paper/15 lg:grid-cols-3">
				<!-- Example Info Panel -->
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
							{#each Array(9), i (i)}
								<div
									class="h-1 flex-1 {i < examples[currentExampleIndex].complexity
										? 'bg-brass/70'
										: 'bg-paper/10'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-paper/40">
							{#if examples[currentExampleIndex].complexity <= 2}
								Beginner - Simple 2-3 lane flows
							{:else if examples[currentExampleIndex].complexity <= 4}
								Intermediate - Multi-lane with loops
							{:else if examples[currentExampleIndex].complexity <= 6}
								Advanced - Parallel paths & sync
							{:else}
								Expert - Enterprise workflows
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
						Load & study this pattern
					</button>
				</div>

				<!-- Example Code Preview -->
				<div class="flex flex-col overflow-hidden bg-ink lg:col-span-2">
					<div class="flex items-center justify-between border-b border-paper/15 px-4 py-3">
						<span class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Preview code</span>
						<span class="text-[10px] tracking-[0.2em] text-paper/35 uppercase">
							{examples[currentExampleIndex].code.split('\n').length} lines
						</span>
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
					<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">
						Saved Swimlane Diagrams
					</h2>
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
