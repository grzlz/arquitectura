<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

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
        securityLevel: 'loose',
      });

      const saved = localStorage.getItem('mermaid-swimlane-diagrams');
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
    localStorage.setItem('mermaid-swimlane-diagrams', JSON.stringify(savedDiagrams));
    currentName = '';
  }

  function loadDiagram(diagram) {
    diagramCode = diagram.code;
    renderDiagram();
  }

  function deleteDiagram(index) {
    savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
    localStorage.setItem('mermaid-swimlane-diagrams', JSON.stringify(savedDiagrams));
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
        <a href="/state" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🎯 State
        </a>
        <a href="/user-journey" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🗺️ Journey
        </a>
        <a href="/swimlane" class="px-4 py-2 rounded-lg bg-white/20 text-white font-medium border-2 border-white/40">
          🏊 Swimlane
        </a>
      </div>
    </div>

    <div class="glass-enhanced rounded-2xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Swimlane Diagram Mastery</h1>
          <p class="text-white/90 text-sm">Map multi-actor processes from simple handoffs to enterprise workflows</p>
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
            Swimlane Diagram
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={renderDiagram}
          spellcheck="false"
          placeholder="graph TB&#10;    subgraph Actor1&#10;        A[Step]&#10;    end"
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
          <h2 class="text-lg font-semibold text-white">Process Flow Patterns</h2>
          <p class="text-white/60 text-sm mt-1">Progressive complexity from simple handoffs to enterprise procurement</p>
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
          <h2 class="text-lg font-semibold text-white">Saved Swimlane Diagrams</h2>
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
