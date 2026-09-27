<script>
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`stateDiagram-v2
    [*] --> Idle
    Idle --> Active
    Active --> [*]`);

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
			name: 'Simple Toggle',
			description: 'Basic on/off state - simplest state machine',
			complexity: 1,
			code: `stateDiagram-v2
    [*] --> Off
    Off --> On: Turn On
    On --> Off: Turn Off
    Off --> [*]`
		},
		{
			name: 'User Authentication',
			description: 'Login/logout flow with session states',
			complexity: 2,
			code: `stateDiagram-v2
    [*] --> LoggedOut
    LoggedOut --> LoggingIn: Submit credentials
    LoggingIn --> LoggedIn: Success
    LoggingIn --> LoggedOut: Failed
    LoggedIn --> LoggedOut: Logout
    LoggedOut --> [*]`
		},
		{
			name: 'Order Lifecycle',
			description: 'E-commerce order states with multiple paths',
			complexity: 3,
			code: `stateDiagram-v2
    [*] --> Pending
    Pending --> Confirmed: Payment received
    Pending --> Cancelled: Timeout / User cancels

    Confirmed --> Shipped: Dispatched
    Shipped --> Delivered: Signed

    Delivered --> Returned: Customer returns
    Returned --> Refunded: Processed

    Cancelled --> [*]
    Refunded --> [*]
    Delivered --> [*]`
		},
		{
			name: 'Document Approval Workflow',
			description: 'Multi-stage approval with rejections',
			complexity: 4,
			code: `stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: Author submits

    Submitted --> UnderReview: Manager picks up
    UnderReview --> Approved: Manager approves
    UnderReview --> Rejected: Manager rejects

    Rejected --> Draft: Author revises

    Approved --> Published: System publishes
    Published --> Archived: After 1 year

    Archived --> [*]

    note right of UnderReview
        Manager has 48hrs
        to review
    end note`
		},
		{
			name: 'Multi-Step Form Wizard',
			description: 'Complex form with validation and progress',
			complexity: 5,
			code: `stateDiagram-v2
    [*] --> PersonalInfo

    PersonalInfo --> AddressInfo: Next (valid)
    PersonalInfo --> PersonalInfo: Validation error

    AddressInfo --> PersonalInfo: Back
    AddressInfo --> PaymentInfo: Next (valid)
    AddressInfo --> AddressInfo: Validation error

    PaymentInfo --> AddressInfo: Back
    PaymentInfo --> Review: Next (valid)
    PaymentInfo --> PaymentInfo: Validation error

    Review --> PaymentInfo: Edit payment
    Review --> AddressInfo: Edit address
    Review --> PersonalInfo: Edit personal
    Review --> Submitting: Confirm

    Submitting --> Success: API success
    Submitting --> Error: API failure

    Error --> Review: Try again

    Success --> [*]

    note right of Review
        User can navigate
        back to any step
    end note`
		},
		{
			name: 'Shopping Cart States',
			description: 'Cart lifecycle with composite states',
			complexity: 6,
			code: `stateDiagram-v2
    [*] --> Empty
    Empty --> Active: Add item

    state Active {
        [*] --> Browsing
        Browsing --> Calculating: Item added/removed
        Calculating --> Browsing: Recalculated
    }

    Active --> Empty: Clear cart
    Active --> CheckingOut: Proceed to checkout

    state CheckingOut {
        [*] --> ValidatingInventory
        ValidatingInventory --> ProcessingPayment: Available
        ValidatingInventory --> InventoryError: Out of stock
        ProcessingPayment --> PaymentSuccess: Charged
        ProcessingPayment --> PaymentFailed: Declined
    }

    CheckingOut --> Active: Back to cart

    state CheckingOut {
        InventoryError --> [*]
        PaymentFailed --> [*]
        PaymentSuccess --> [*]
    }

    CheckingOut --> Completed: Payment success
    CheckingOut --> Active: Payment failed

    Completed --> [*]`
		},
		{
			name: 'CI/CD Pipeline States',
			description: 'Deployment pipeline with parallel stages',
			complexity: 7,
			code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Running: Git push

    state Running {
        [*] --> Building
        Building --> Testing: Build success
        Building --> Failed: Build error

        state Testing {
            [*] --> UnitTests
            UnitTests --> IntegrationTests
            IntegrationTests --> E2ETests
        }

        Testing --> Deploying: All tests pass
        Testing --> Failed: Test failure

        state Deploying {
            [*] --> DeployStaging
            DeployStaging --> SmokeTests
            SmokeTests --> DeployProduction
        }

        Deploying --> Success: Deploy complete
        Deploying --> Failed: Deploy error
    }

    Running --> Idle: Success
    Running --> Idle: Failed (after notification)

    note right of Deploying
        Auto-rollback on failure
    end note`
		},
		{
			name: 'Task Queue with Retries',
			description: 'Job processing with exponential backoff',
			complexity: 8,
			code: `stateDiagram-v2
    [*] --> Queued

    Queued --> Processing: Worker picks up

    state Processing {
        [*] --> Executing
        Executing --> Validating: Execution complete
        Validating --> Success: Valid result
        Validating --> Retry: Invalid result
    }

    Processing --> Completed: Success
    Processing --> Retrying: Needs retry

    state Retrying {
        [*] --> WaitingRetry1
        WaitingRetry1 --> Processing: After 10s

        Processing --> WaitingRetry2: Fail (attempt 2)
        WaitingRetry2 --> Processing: After 30s

        Processing --> WaitingRetry3: Fail (attempt 3)
        WaitingRetry3 --> Processing: After 90s

        Processing --> Failed: Max retries
    }

    Retrying --> Completed: Eventually succeeds
    Retrying --> DeadLetter: Max retries exceeded

    Completed --> [*]

    state DeadLetter {
        [*] --> ManualReview
        ManualReview --> Queued: Admin re-queues
        ManualReview --> Discarded: Admin discards
    }

    DeadLetter --> [*]

    note right of Retrying
        Exponential backoff:
        10s → 30s → 90s
    end note`
		},
		{
			name: 'Saga Pattern Orchestration',
			description: 'Distributed transaction with compensations',
			complexity: 9,
			code: `stateDiagram-v2
    [*] --> SagaStarted

    SagaStarted --> OrderCreated: Create order

    state OrderCreated {
        [*] --> ReservingInventory
        ReservingInventory --> InventoryReserved: Success
        ReservingInventory --> CompensateOrder: Failure
    }

    OrderCreated --> ProcessingPayment: Inventory OK
    OrderCreated --> Compensating: Inventory fail

    state ProcessingPayment {
        [*] --> ChargingCard
        ChargingCard --> PaymentCompleted: Success
        ChargingCard --> CompensateInventory: Failure
    }

    ProcessingPayment --> ArrangingShipping: Payment OK
    ProcessingPayment --> Compensating: Payment fail

    state ArrangingShipping {
        [*] --> CreatingShipment
        CreatingShipment --> ShipmentScheduled: Success
        CreatingShipment --> CompensatePayment: Failure
    }

    ArrangingShipping --> SagaCompleted: Shipping OK
    ArrangingShipping --> Compensating: Shipping fail

    state Compensating {
        [*] --> RollingBack

        state RollingBack {
            [*] --> RefundPayment
            RefundPayment --> ReleaseInventory
            ReleaseInventory --> CancelOrder
        }

        RollingBack --> CompensationComplete
    }

    Compensating --> SagaFailed: Compensated

    SagaCompleted --> [*]
    SagaFailed --> [*]

    note right of Compensating
        Each step has
        compensating transaction:
        - Refund payment
        - Release inventory
        - Cancel order
    end note

    note left of SagaCompleted
        All steps succeeded
        Order fully processed
    end note`
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
				const saved = localStorage.getItem('mermaid-state-diagrams');
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
			localStorage.setItem('mermaid-state-diagrams', JSON.stringify(savedDiagrams));
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
			localStorage.setItem('mermaid-state-diagrams', JSON.stringify(savedDiagrams));
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
		a.download = `${currentName || 'state-diagram'}.svg`;
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
	<title>State — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 03 · State</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">State</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				State machines — from simple toggles to distributed sagas
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
					placeholder="stateDiagram-v2&#10;    [*] --> StateA&#10;    StateA --> StateB&#10;    StateB --> [*]"
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
					<span class="font-semibold text-ink">Fig. 1</span> — Your state diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						State machine patterns
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
							Beginner — basic state transitions
						{:else if examples[currentExampleIndex].complexity <= 4}
							Intermediate — workflows & validation
						{:else if examples[currentExampleIndex].complexity <= 6}
							Advanced — composite states
						{:else}
							Expert — distributed systems
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

		<!-- Saved diagrams — a table of contents, like the Studio index -->
		<section class="mt-24">
			<header class="mb-8 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">The manifest</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Saved state diagrams
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
