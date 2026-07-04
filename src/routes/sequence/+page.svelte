<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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
	<title>Sequence Diagram Mastery — Architect's Studio</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]"
>
	<div class="mx-auto max-w-7xl">
		<Nav />

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">Sequence Diagram Mastery</h1>
					<p class="text-sm text-white/90">Learn interaction patterns from basic to advanced</p>
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
						Sequence Diagram
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="sequenceDiagram&#10;    participant A&#10;    participant B&#10;    A->>B: Message"
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
					<h2 class="text-lg font-semibold text-white">Architecture Patterns</h2>
					<p class="mt-1 text-sm text-white/60">
						Progressive complexity from request-response to distributed systems
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

						<p class="mb-2 text-xs text-white/50">{examples[currentExampleIndex].description}</p>
						<p class="mb-4 text-sm leading-relaxed text-white/70">
							{examples[currentExampleIndex].useCase}
						</p>

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
				</div>

				<!-- Example Code Preview -->
				<div class="glass-accent overflow-hidden rounded-xl lg:col-span-2">
					<div
						class="flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-3"
					>
						<span class="font-mono text-xs text-white/80">Preview Code</span>
						<span class="text-xs text-white/60">
							{diagramCode.split('\n').length} lines
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
					<h2 class="text-lg font-semibold text-white">Saved Sequence Diagrams</h2>
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
