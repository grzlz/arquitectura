<script>
	import { onMount } from 'svelte';
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
			localStorage.setItem('mermaid-state-diagrams', JSON.stringify(savedDiagrams));
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
			.then(() => showToast('Code copied to clipboard'))
			.catch(() => showToast('Could not copy — check browser permissions'));
	}
</script>

<svelte:head>
	<title>State — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-16">
		<header class="mb-12 border-b border-ink/15 pb-10">
			<div
				class="mb-8 flex flex-wrap items-baseline justify-between gap-2 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 03 · State</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-title font-light">State</h1>
					<p class="mt-4 max-w-xl font-serif text-deck text-ink/75 italic">
						State machines — from simple toggles to distributed sagas
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
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

		{#if error}
			<div class="mb-6 border border-accent/30 bg-accent/5 p-4">
				<p class="text-sm text-ink">
					<span class="mr-3 kicker text-accent"> Held at customs </span>
					{error}
				</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
					placeholder="stateDiagram-v2&#10;    [*] --> StateA&#10;    StateA --> StateB&#10;    StateB --> [*]"
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 font-mono text-sm leading-relaxed text-ink placeholder-ink/40 focus:outline-none md:min-h-[500px]"
				/>
			</div>

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

		<!-- Learning Examples Carousel -->
		<section class="mt-12">
			<div
				class="mb-8 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-ink pt-4"
			>
				<h2 class="font-display text-4xl font-light">State Machine Patterns</h2>
				<div class="flex items-center gap-4 kicker font-medium text-ink/60">
					<span>Level {examples[currentExampleIndex].complexity}</span>
					<span class="text-accent tabular-nums">{currentExampleIndex + 1} / {examples.length}</span
					>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 lg:grid-cols-3">
				<!-- Example Info Panel -->
				<div class="flex flex-col bg-paper p-6 lg:col-span-1">
					<p class="mb-1 kicker text-ink/60">
						Pattern {(currentExampleIndex + 1).toString().padStart(2, '0')}
					</p>
					<h3 class="font-display text-3xl">
						{examples[currentExampleIndex].name}
					</h3>

					<p class="mt-4 font-serif text-[1.0625rem] leading-relaxed text-ink/85">
						{examples[currentExampleIndex].description}
					</p>

					<div class="mt-6">
						<div class="flex gap-1">
							{#each Array(9), i (i)}
								<div
									class="h-1 flex-1 {i < examples[currentExampleIndex].complexity
										? 'bg-ink'
										: 'bg-ink/10'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-ink/60">
							{#if examples[currentExampleIndex].complexity <= 2}
								Beginner - Basic state transitions
							{:else if examples[currentExampleIndex].complexity <= 4}
								Intermediate - Workflows & validation
							{:else if examples[currentExampleIndex].complexity <= 6}
								Advanced - Composite states
							{:else}
								Expert - Distributed systems
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
						Load & study this pattern
					</button>
				</div>

				<!-- Example Code Preview -->
				<div class="flex flex-col overflow-hidden bg-paper lg:col-span-2">
					<div class="flex items-center justify-between border-b border-ink/15 px-4 py-3">
						<span class="kicker text-ink/60">Preview code</span>
						<span class="text-[10px] tracking-[0.2em] text-ink/60 uppercase">
							{examples[currentExampleIndex].code.split('\n').length} lines
						</span>
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
					<h2 class="font-display text-4xl font-light">Saved State Diagrams</h2>
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
