<script>
	import { onMount, tick } from 'svelte';
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
			await document.fonts.ready;

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
			localStorage.setItem('mermaid-swimlane-diagrams', JSON.stringify(savedDiagrams));
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
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

<svelte:head>
	<title>Swimlane — El Restirador · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>El Restirador · Free Mermaid editors</span>
				<span class="text-accent">No. 06 · Swimlane</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">Swimlane</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				Multi-actor processes — from simple handoffs to enterprise workflows
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
					placeholder="graph TB&#10;    subgraph Actor1&#10;        A[Step]&#10;    end"
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
					<span class="font-semibold text-ink">Fig. 1</span> — Your swimlane diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Process flow patterns
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
						].complexity} of 9
					</p>
					<h3 class="mt-3 font-display text-3xl tracking-[-0.01em] md:text-4xl">
						{examples[currentExampleIndex].name}
					</h3>
					<p class="mt-5 max-w-measure font-serif text-lg/relaxed text-ink/85">
						{examples[currentExampleIndex].description}
					</p>
					<p class="mt-5 font-sans text-sm text-ink/60">
						{#if examples[currentExampleIndex].complexity <= 2}
							Beginner — simple 2-3 lane flows
						{:else if examples[currentExampleIndex].complexity <= 4}
							Intermediate — multi-lane with loops
						{:else if examples[currentExampleIndex].complexity <= 6}
							Advanced — parallel paths & sync
						{:else}
							Expert — enterprise workflows
						{/if}
					</p>
					<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/15 pt-3">
						<button
							onclick={loadExample}
							class="cursor-pointer py-1 kicker text-ink underline underline-offset-4 transition-colors hover:text-accent"
						>
							Load & study this pattern
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

		<!-- Saved diagrams — a table of contents, like the Restirador index -->
		<section class="mt-24">
			<header class="mb-8 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">The manifest</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Saved swimlane diagrams
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
