<script>
	import { onMount, tick } from 'svelte';
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
			await document.fonts.ready;

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
			localStorage.setItem('mermaid-sequence-diagrams', JSON.stringify(savedDiagrams));
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
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

<svelte:head>
	<title>Sequence — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 02 · Sequence</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">Sequence</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				Interactions over time — from request-response to distributed systems
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
					placeholder="sequenceDiagram&#10;    participant A&#10;    participant B&#10;    A->>B: Message"
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
					<span class="font-semibold text-ink">Fig. 1</span> — Your sequence diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Architecture patterns
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
					<p class="mt-2 font-serif text-xl text-ink/75 italic">
						{examples[currentExampleIndex].description}
					</p>
					<p class="mt-5 max-w-measure font-serif text-lg/relaxed text-ink/85">
						{examples[currentExampleIndex].useCase}
					</p>
					<p class="mt-5 font-sans text-sm text-ink/60">
						{#if examples[currentExampleIndex].complexity <= 2}
							Beginner — basic interactions
						{:else if examples[currentExampleIndex].complexity <= 4}
							Intermediate — error handling & async
						{:else if examples[currentExampleIndex].complexity <= 6}
							Advanced — microservices & patterns
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
						Saved sequence diagrams
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
