<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`sequenceDiagram
    participant Client
    participant Server

    Client->>Server: Request
    Server->>Client: Response`);

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
			name: 'Basic Request-Response',
			description: 'Simplest sequence diagram — client-server interaction',
			useCase:
				'You\'re documenting a new API endpoint and need to show how a client talks to a server. This is the "hello world" of sequence diagrams — two actors, one exchange. Start here before adding any complexity.',
			complexity: 1,
			code: `sequenceDiagram
    participant Client
    participant Server

    Client->>Server: GET /api/users
    Server->>Client: 200 OK (user list)`
		},
		{
			name: 'User Authentication',
			description: 'Classic login flow with validation',
			useCase:
				'Every developer builds a login. This diagram makes the four-actor handoff — user, frontend, backend, database — explicit. When something breaks at 2am, this is what you open to find where the chain snapped.',
			complexity: 2,
			code: `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /login
    Backend->>Database: Query user
    Database->>Backend: User data
    Backend->>Backend: Verify password
    Backend->>Frontend: JWT Token
    Frontend->>User: Redirect to dashboard`
		},
		{
			name: 'API with Error Handling',
			description: 'Using alt blocks for conditional flows',
			useCase:
				'An API that only shows the happy path is a lie. This diagram introduces `alt` blocks to document what actually happens — valid input, bad input, and database failures. This is what your error handling spec should look like.',
			complexity: 3,
			code: `sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /create-user
    API->>API: Validate input

    alt Input valid
        API->>Database: INSERT user
        Database->>API: Success
        API->>Client: 201 Created
    else Input invalid
        API->>Client: 400 Bad Request
    end

    alt Database error
        Database->>API: Connection failed
        API->>Client: 503 Service Unavailable
    end`
		},
		{
			name: 'Async Job Processing',
			description: 'Background tasks with callbacks',
			useCase:
				"A user uploads a large file. You can't make them wait. This diagram shows how a system accepts the request immediately, processes it in the background, and notifies the user when done — the `activate/deactivate` blocks make the async boundary visible.",
			complexity: 4,
			code: `sequenceDiagram
    participant User
    participant API
    participant Queue
    participant Worker
    participant Storage
    participant Webhook

    User->>API: Upload large file
    API->>Queue: Enqueue job
    API->>User: 202 Accepted (job_id)

    Note over Queue,Worker: Async processing

    Queue->>Worker: Dequeue job
    activate Worker
    Worker->>Storage: Process & store
    Storage->>Worker: URL
    Worker->>Webhook: POST completion
    deactivate Worker

    Webhook->>User: Email notification`
		},
		{
			name: 'Microservices Communication',
			description: 'Multiple services with orchestration',
			useCase:
				"You're joining a team with five backend services and need to understand how a single user request touches all of them. The `par` block is the key syntax here — it shows that two requests fire simultaneously, which is often where performance bugs hide.",
			complexity: 5,
			code: `sequenceDiagram
    participant Client
    participant Gateway
    participant Auth
    participant UserService
    participant OrderService
    participant PaymentService
    participant NotificationService

    Client->>Gateway: GET /my-orders
    Gateway->>Auth: Validate token
    Auth->>Gateway: User ID

    par Fetch user data
        Gateway->>UserService: GET /users/{id}
        UserService->>Gateway: User profile
    and Fetch orders
        Gateway->>OrderService: GET /orders?user={id}
        OrderService->>Gateway: Order list
    end

    Gateway->>Client: Combined response

    Note over Gateway: API Gateway pattern<br/>Parallel requests for performance`
		},
		{
			name: 'Event Sourcing Pattern',
			description: 'CQRS with event store',
			useCase:
				'Your system needs an immutable audit trail and separate read/write models. This diagram shows CQRS in motion: a command lands, an event gets appended, a projection updates, and a separate query path serves reads. The `Note` annotations make the architectural intent explicit.',
			complexity: 6,
			code: `sequenceDiagram
    participant Client
    participant CommandAPI
    participant EventStore
    participant EventBus
    participant ReadModel
    participant QueryAPI

    Note over CommandAPI,EventStore: Write Side (Commands)

    Client->>CommandAPI: CreateOrder command
    CommandAPI->>CommandAPI: Validate business rules
    CommandAPI->>EventStore: Append OrderCreated event
    EventStore->>EventBus: Publish event

    Note over EventBus,ReadModel: Event Processing

    EventBus->>ReadModel: OrderCreated event
    ReadModel->>ReadModel: Update projection

    Note over ReadModel,QueryAPI: Read Side (Queries)

    Client->>QueryAPI: GET /orders/{id}
    QueryAPI->>ReadModel: Query projection
    ReadModel->>QueryAPI: Order view
    QueryAPI->>Client: Order details

    Note over CommandAPI,QueryAPI: CQRS: Separate read/write models`
		},
		{
			name: 'Saga Pattern (Distributed Transaction)',
			description: 'Compensating transactions for failures',
			useCase:
				'An order goes through payment and inventory. Inventory fails. Now you need to refund the payment you just charged. This is the saga pattern — each step has a compensating rollback. The diagram makes the failure path as visible as the happy path, which is exactly the conversation you need to have with your team.',
			complexity: 7,
			code: `sequenceDiagram
    participant Client
    participant Orchestrator
    participant OrderService
    participant PaymentService
    participant InventoryService
    participant ShippingService

    Client->>Orchestrator: Place order

    Note over Orchestrator: Saga begins

    Orchestrator->>OrderService: Create order
    activate OrderService
    OrderService->>Orchestrator: Order created
    deactivate OrderService

    Orchestrator->>PaymentService: Charge payment
    activate PaymentService
    PaymentService->>Orchestrator: Payment successful
    deactivate PaymentService

    Orchestrator->>InventoryService: Reserve items
    activate InventoryService
    InventoryService->>Orchestrator: ❌ Out of stock
    deactivate InventoryService

    Note over Orchestrator: Compensation required!

    Orchestrator->>PaymentService: Refund payment
    activate PaymentService
    PaymentService->>Orchestrator: Refunded
    deactivate PaymentService

    Orchestrator->>OrderService: Cancel order
    activate OrderService
    OrderService->>Orchestrator: Cancelled
    deactivate OrderService

    Orchestrator->>Client: Order failed (inventory)

    Note over Orchestrator: Saga pattern ensures<br/>distributed consistency`
		},
		{
			name: 'E-commerce Checkout Flow',
			description: 'Real-world complex scenario with multiple systems',
			useCase:
				"You're onboarding onto an e-commerce platform and need to understand the full checkout journey end-to-end. This diagram maps every system involved — cart, pricing, payment, orders, email, analytics — and shows exactly which paths are parallel and which are sequential. The kind of diagram you pin to the wall on launch day.",
			complexity: 8,
			code: `sequenceDiagram
    participant User
    participant Frontend
    participant Gateway
    participant CartService
    participant InventoryService
    participant PricingService
    participant PaymentService
    participant OrderService
    participant EmailService
    participant Analytics

    User->>Frontend: Click "Checkout"
    Frontend->>Gateway: POST /checkout/initiate

    Gateway->>CartService: GET /cart/{userId}
    CartService->>Gateway: Cart items

    par Validate inventory
        Gateway->>InventoryService: Check availability
        InventoryService->>Gateway: ✓ In stock
    and Calculate pricing
        Gateway->>PricingService: Calculate total
        PricingService->>Gateway: Total + tax
    end

    Gateway->>Frontend: Checkout summary
    Frontend->>User: Show payment form

    User->>Frontend: Submit payment
    Frontend->>Gateway: POST /checkout/complete

    Gateway->>PaymentService: Charge card
    activate PaymentService

    alt Payment successful
        PaymentService->>Gateway: Transaction ID

        Gateway->>OrderService: Create order
        OrderService->>InventoryService: Reserve items
        OrderService->>Gateway: Order confirmed

        par Send notifications
            Gateway->>EmailService: Send confirmation
            EmailService->>User: Order email
        and Track analytics
            Gateway->>Analytics: Track conversion
        end

        Gateway->>CartService: Clear cart
        Gateway->>Frontend: Success (order_id)
        Frontend->>User: Show confirmation

    else Payment failed
        PaymentService->>Gateway: ❌ Card declined
        Gateway->>Frontend: Payment error
        Frontend->>User: Try different card
    end

    deactivate PaymentService

    Note over User,Analytics: Full e-commerce checkout<br/>with error handling & analytics`
		},
		{
			name: 'Work Queue Operations Dashboard',
			description: 'Monitoring, health checks, and task management',
			useCase:
				'You run a distributed worker system and need to document how the ops dashboard interacts with the queue, workers, and alerting. This diagram covers the full operational loop: health checks, failure detection, manual recovery, and the DLQ retry cycle — the stuff that only gets documented after an outage.',
			complexity: 5,
			code: `sequenceDiagram
    participant Dashboard
    participant QueueManager
    participant Queue
    participant Worker1
    participant Worker2
    participant DeadLetterQueue
    participant Alerting

    Note over Dashboard,Alerting: Operational Monitoring System

    Dashboard->>QueueManager: GET /queue/status

    QueueManager->>Queue: Count pending
    Queue->>QueueManager: 47 tasks

    QueueManager->>Worker1: Health check
    Worker1->>QueueManager: ✓ Healthy

    QueueManager->>Worker2: Health check
    Worker2->>QueueManager: ❌ Unresponsive

    QueueManager->>Dashboard: Status report

    Note over Worker2,Alerting: Worker failure detected

    QueueManager->>Alerting: Worker2 down
    Alerting->>Dashboard: Alert notification

    Dashboard->>QueueManager: Restart Worker2
    QueueManager->>Worker2: Restart command
    Worker2->>QueueManager: ✓ Restarted

    Note over Queue,Worker1: Normal processing

    Queue->>Worker1: Dequeue task
    activate Worker1
    Worker1->>Worker1: Process task

    alt Task successful
        Worker1->>Queue: ACK
    else Task failed (retry)
        Worker1->>Queue: NACK + retry
        Queue->>Queue: Re-enqueue
    else Max retries exceeded
        Worker1->>DeadLetterQueue: Move to DLQ
        DeadLetterQueue->>Alerting: Failed task alert
    end
    deactivate Worker1

    Dashboard->>DeadLetterQueue: GET /failed-tasks
    DeadLetterQueue->>Dashboard: Failed task list

    Dashboard->>QueueManager: Retry task manually
    QueueManager->>Queue: Re-enqueue task

    Note over Dashboard,Alerting: Real-time queue operations<br/>with failure recovery`
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
				const saved = localStorage.getItem('mermaid-sequence-diagrams');
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
			localStorage.setItem('mermaid-sequence-diagrams', JSON.stringify(savedDiagrams));
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
			localStorage.setItem('mermaid-sequence-diagrams', JSON.stringify(savedDiagrams));
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
		a.download = `${currentName || 'sequence-diagram'}.svg`;
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
	<title>Sequence — The Studio · Art Vandeley</title>
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
				<span class="text-brass/70">SHT 02 · Sequence</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						Sequence
					</h1>
					<p class="mt-3 text-sm text-paper/55">
						Interactions over time — from request-response to distributed systems
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
					placeholder="sequenceDiagram&#10;    participant A&#10;    participant B&#10;    A->>B: Message"
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
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Architecture Patterns</h2>
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
					<p class="mt-1 text-xs text-paper/40">{examples[currentExampleIndex].description}</p>

					<p class="mt-4 text-sm leading-relaxed text-paper/55">
						{examples[currentExampleIndex].useCase}
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
								Beginner - Basic interactions
							{:else if examples[currentExampleIndex].complexity <= 4}
								Intermediate - Error handling & async
							{:else if examples[currentExampleIndex].complexity <= 6}
								Advanced - Microservices & patterns
							{:else}
								Expert - Distributed systems
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
							{diagramCode.split('\n').length} lines
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
						Saved Sequence Diagrams
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
