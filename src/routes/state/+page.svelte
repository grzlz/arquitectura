<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let mermaid;
  let diagramCode = $state(`stateDiagram-v2
    [*] --> Idle
    Idle --> Active
    Active --> [*]`);

  let savedDiagrams = $state([]);
  let currentName = $state('');
  let error = $state('');
  let currentExampleIndex = $state(0);

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
        securityLevel: 'loose',
      });

      const saved = localStorage.getItem('mermaid-state-diagrams');
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
    localStorage.setItem('mermaid-state-diagrams', JSON.stringify(savedDiagrams));
    currentName = '';
  }

  function loadDiagram(diagram) {
    diagramCode = diagram.code;
    renderDiagram();
  }

  function deleteDiagram(index) {
    savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
    localStorage.setItem('mermaid-state-diagrams', JSON.stringify(savedDiagrams));
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
  }

  function copyCode() {
    navigator.clipboard.writeText(diagramCode);
    alert('Code copied!');
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]">
  <div class="max-w-7xl mx-auto">
    <!-- Navigation -->
    <div class="glass-enhanced rounded-2xl p-4 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
        <a href="/" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🏠 General
        </a>
        <a href="/sequence" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🔄 Sequence
        </a>
        <a href="/state" class="px-4 py-2 rounded-lg bg-white/20 text-white font-medium border-2 border-white/40">
          🎯 State
        </a>
        <a href="/journey" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🗺️ Journey
        </a>
        <a href="/class" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          📦 Class
        </a>
        <a href="/swimlane" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🏊 Swimlane
        </a>
      </div>
    </div>

    <div class="glass-enhanced rounded-2xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">State Diagram Mastery</h1>
          <p class="text-white/90 text-sm">Learn state machines from simple toggles to distributed sagas</p>
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
            State Diagram
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={renderDiagram}
          spellcheck="false"
          placeholder="stateDiagram-v2&#10;    [*] --> StateA&#10;    StateA --> StateB&#10;    StateB --> [*]"
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
          <h2 class="text-lg font-semibold text-white">State Machine Patterns</h2>
          <p class="text-white/60 text-sm mt-1">Progressive complexity from toggles to distributed transactions</p>
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
        <div class="lg:col-span-2 glass-accent rounded-xl overflow-hidden">
          <div class="px-4 py-3 bg-white/5 border-b border-white/20 flex items-center justify-between">
            <span class="text-white/80 text-xs font-mono">Preview Code</span>
            <span class="text-white/60 text-xs">
              {examples[currentExampleIndex].code.split('\n').length} lines
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
          <h2 class="text-lg font-semibold text-white">Saved State Diagrams</h2>
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
