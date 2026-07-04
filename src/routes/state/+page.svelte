<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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
	<title>State Diagram Mastery — Architect's Studio</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]"
>
	<div class="mx-auto max-w-7xl">
		<Nav />

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">State Diagram Mastery</h1>
					<p class="text-sm text-white/90">
						Learn state machines from simple toggles to distributed sagas
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
						State Diagram
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="stateDiagram-v2&#10;    [*] --> StateA&#10;    StateA --> StateB&#10;    StateB --> [*]"
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
					<h2 class="text-lg font-semibold text-white">State Machine Patterns</h2>
					<p class="mt-1 text-sm text-white/60">
						Progressive complexity from toggles to distributed transactions
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
					<h2 class="text-lg font-semibold text-white">Saved State Diagrams</h2>
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
