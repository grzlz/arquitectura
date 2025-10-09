<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

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

  const examples = [
    {
      name: 'Basic Request-Response',
      description: 'Simplest sequence diagram - client-server interaction',
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

    par Queue metrics
        QueueManager->>Queue: Count pending
        Queue->>QueueManager: 47 tasks
    and Worker health
        QueueManager->>Worker1: Health check
        Worker1->>QueueManager: ✓ Healthy
        QueueManager->>Worker2: Health check
        Worker2->>QueueManager: ❌ Unresponsive
    end

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
        deactivate Worker1
    else Task failed (retry)
        Worker1->>Queue: NACK + retry
        deactivate Worker1
        Queue->>Queue: Re-enqueue
    else Max retries exceeded
        Worker1->>DeadLetterQueue: Move to DLQ
        deactivate Worker1
        DeadLetterQueue->>Alerting: Failed task alert
    end

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
        securityLevel: 'loose',
      });

      const saved = localStorage.getItem('mermaid-sequence-diagrams');
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
    localStorage.setItem('mermaid-sequence-diagrams', JSON.stringify(savedDiagrams));
    currentName = '';
  }

  function loadDiagram(diagram) {
    diagramCode = diagram.code;
    renderDiagram();
  }

  function deleteDiagram(index) {
    savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
    localStorage.setItem('mermaid-sequence-diagrams', JSON.stringify(savedDiagrams));
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
  }

  function copyCode() {
    navigator.clipboard.writeText(diagramCode);
    alert('Code copied!');
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]">
  <div class="max-w-7xl mx-auto">
    <div class="glass-enhanced rounded-2xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Sequence Diagram Mastery</h1>
          <p class="text-white/90 text-sm">Learn interaction patterns from basic to advanced</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <input
            type="text"
            bind:value={currentName}
            placeholder="Enter diagram name..."
            class="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm min-w-[200px]"
          />
          <button
            onclick={saveDiagram}
            class="px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-primary-600 font-medium transition-all hover:scale-105 hover:shadow-lg"
          >
            💾 Save
          </button>
          <button
            onclick={exportSVG}
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
          >
            📥 Export
          </button>
          <button
            onclick={copyCode}
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
          >
            📋 Copy
          </button>
          <button
            onclick={renderDiagram}
            class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all hover:rotate-90"
          >
            ↻
          </button>
        </div>
      </div>
    </div>

    {#if error}
      <div class="glass-accent rounded-xl p-4 mb-6 bg-red-500/30 border-red-400/40 animate-in slide-in-from-top">
        <div class="flex items-center gap-3 text-white">
          <span class="text-xl">⚠️</span>
          <span class="font-mono text-sm">{error}</span>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-enhanced rounded-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 bg-white/10 border-b border-white/20 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wide">Editor</h3>
          <span class="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-medium">
            Sequence Diagram
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={renderDiagram}
          spellcheck="false"
          placeholder="sequenceDiagram&#10;    participant A&#10;    participant B&#10;    A->>B: Message"
          class="flex-1 min-h-[500px] p-6 bg-white/5 text-white font-mono text-sm leading-relaxed focus:outline-none placeholder-white/40 resize-none"
        />
      </div>

      <div class="glass-enhanced rounded-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 bg-white/10 border-b border-white/20 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wide">Preview</h3>
          <span class="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-medium">
            Live Render
          </span>
        </div>
        <div class="flex-1 min-h-[500px] p-6 bg-gray-900 overflow-auto">
          <div id="preview" class="bg-gray-800 rounded-lg flex items-center justify-center min-h-full"></div>
        </div>
      </div>
    </div>

    <!-- Learning Examples Carousel -->
    <div class="glass-enhanced rounded-2xl p-6 mt-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Architecture Patterns</h2>
          <p class="text-white/60 text-sm mt-1">Progressive complexity from request-response to distributed systems</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
            Level {examples[currentExampleIndex].complexity}
          </span>
          <span class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
            {currentExampleIndex + 1} / {examples.length}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Example Info Panel -->
        <div class="lg:col-span-1 flex flex-col gap-3">
          <div class="glass-accent rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                {examples[currentExampleIndex].complexity}
              </div>
              <div class="flex-1">
                <h3 class="text-white font-semibold">{examples[currentExampleIndex].name}</h3>
                <p class="text-white/60 text-xs">Complexity Level {examples[currentExampleIndex].complexity}</p>
              </div>
            </div>

            <p class="text-white/70 text-sm mb-4">{examples[currentExampleIndex].description}</p>

            <div class="flex gap-2">
              <button
                onclick={prevExample}
                class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
              >
                ← Prev
              </button>
              <button
                onclick={nextExample}
                class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
              >
                Next →
              </button>
            </div>

            <button
              onclick={loadExample}
              class="w-full mt-3 px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-primary-600 font-medium transition-all hover:scale-105"
            >
              Load & Study This Pattern
            </button>
          </div>

          <div class="glass-accent rounded-xl p-4">
            <h4 class="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">Complexity Progression</h4>
            <div class="flex gap-1">
              {#each Array(9) as _, i}
                <div class="flex-1 h-2 rounded-full {i < examples[currentExampleIndex].complexity ? 'bg-primary-500' : 'bg-white/20'}"></div>
              {/each}
            </div>
            <p class="text-white/60 text-xs mt-2">
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
        <div class="lg:col-span-2 glass-accent rounded-xl overflow-hidden">
          <div class="px-4 py-3 bg-white/5 border-b border-white/20 flex items-center justify-between">
            <span class="text-white/80 text-xs font-mono">Preview Code</span>
            <span class="text-white/60 text-xs">
              {diagramCode.split('\n').length} lines
            </span>
          </div>
          <pre class="p-4 overflow-auto max-h-64 text-white/90 text-sm font-mono leading-relaxed">{examples[currentExampleIndex].code}</pre>
        </div>
      </div>
    </div>

    <!-- Saved Diagrams -->
    {#if savedDiagrams.length > 0}
      <div class="glass-enhanced rounded-2xl p-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Saved Sequence Diagrams</h2>
          <span class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
            {savedDiagrams.length}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each savedDiagrams as diagram, index}
            <div class="flex gap-2 animate-in slide-in-from-left">
              <button
                onclick={() => loadDiagram(diagram)}
                class="flex-1 p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all hover:scale-105 text-left group"
              >
                <div class="text-white font-medium text-sm mb-1 group-hover:text-white/90">
                  {diagram.name}
                </div>
                <div class="text-white/60 text-xs">
                  {new Date(diagram.timestamp).toLocaleDateString()}
                </div>
              </button>
              <button
                onclick={() => deleteDiagram(index)}
                class="w-12 rounded-lg bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/40 text-white hover:text-red-200 text-xl transition-all hover:scale-110"
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
