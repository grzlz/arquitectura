<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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
	<title>Swimlane Diagram Mastery — Architect's Studio</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]"
>
	<div class="mx-auto max-w-7xl">
		<Nav />

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">Swimlane Diagram Mastery</h1>
					<p class="text-sm text-white/90">
						Map multi-actor processes from simple handoffs to enterprise workflows
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
						aria-label="Diagram name"
						class="min-w-[200px] rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
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
						📥 Export
					</button>
					<button
						onclick={copyCode}
						class="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
					>
						📋 Copy
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
						Swimlane Diagram
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="graph TB&#10;    subgraph Actor1&#10;        A[Step]&#10;    end"
					class="min-h-[500px] flex-1 resize-none bg-white/5 p-6 font-mono text-sm leading-relaxed text-white placeholder-white/40 focus:outline-none"
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
				<div class="min-h-[500px] flex-1 overflow-auto bg-gray-900 p-6">
					<div
						id="preview"
						class="flex min-h-full items-center justify-center rounded-lg bg-gray-800"
					></div>
				</div>
			</div>
		</div>

		<!-- Learning Examples Carousel -->
		<div class="glass-enhanced mt-6 rounded-2xl p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Process Flow Patterns</h2>
					<p class="mt-1 text-sm text-white/60">
						Progressive complexity from simple handoffs to enterprise procurement
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
				<!-- Example Info Panel -->
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
							Load & Study This Pattern
						</button>
					</div>

					<div class="glass-accent rounded-xl p-4">
						<h4 class="mb-2 text-xs font-semibold tracking-wide text-white/80 uppercase">
							Complexity Progression
						</h4>
						<div class="flex gap-1">
							{#each Array(9) as _, i}
								<div
									class="h-2 flex-1 rounded-full {i < examples[currentExampleIndex].complexity
										? 'bg-primary-500'
										: 'bg-white/20'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-white/60">
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
				</div>

				<!-- Example Code Preview -->
				<div class="glass-accent overflow-hidden rounded-xl lg:col-span-2">
					<div
						class="flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-3"
					>
						<span class="font-mono text-xs text-white/80">Preview Code</span>
						<span class="text-xs text-white/60">
							{examples[currentExampleIndex].code.split('\n').length} lines
						</span>
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
					<h2 class="text-lg font-semibold text-white">Saved Swimlane Diagrams</h2>
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
