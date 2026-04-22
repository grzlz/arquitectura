<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Nav from '$lib/components/Nav.svelte';
  
  let mermaid;
  let diagramCode = $state(`graph TD
    A[Your System] --> B[Component]
    B --> C[Another Component]`);
  
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
    toastTimer = setTimeout(() => { toast = ''; }, 2500);
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
      name: 'Linear Process',
      description: 'A straight sequence of steps with no branching',
      useCase: 'You need to onboard a new employee and the process is the same every time. A linear flowchart makes the steps impossible to miss or skip — no one can claim they didn\'t know what came next.',
      complexity: 1,
      code: `graph TD
    A[New employee arrives] --> B[Collect documents]
    B --> C[Create system accounts]
    C --> D[Assign workspace]
    D --> E[Pair with buddy]
    E --> F[Onboarding complete]`
    },
    {
      name: 'Decision Branch',
      description: 'A flow that splits based on a yes/no condition',
      useCase: 'A user tries to log in. You need to show what happens when it works and when it doesn\'t. Decision diamonds make branching logic visible at a glance — no need to read code to understand the behavior.',
      complexity: 2,
      code: `graph TD
    A[User submits login] --> B{Credentials valid?}
    B -->|Yes| C[Create session]
    B -->|No| D[Increment attempt counter]
    D --> E{Max attempts reached?}
    E -->|Yes| F[Lock account]
    E -->|No| G[Show error message]
    C --> H[Redirect to dashboard]`
    },
    {
      name: 'Multi-Path Routing',
      description: 'Multiple conditions route work to different destinations',
      useCase: 'A support ticket arrives. Depending on severity and type, it routes to different teams with different SLAs. This diagram replaces a page of routing rules with something a new agent can understand in 10 seconds.',
      complexity: 3,
      code: `graph LR
    A[Ticket received] --> B{Severity?}
    B -->|Critical| C[Page on-call]
    B -->|High| D[Assign to senior]
    B -->|Medium| E[Add to sprint]
    B -->|Low| F[Add to backlog]

    C --> G{Type?}
    G -->|Infrastructure| H[DevOps team]
    G -->|Application| I[Backend team]
    G -->|Data| J[Data team]

    D --> K[Notify team lead]
    E --> L[Next sprint planning]`
    },
    {
      name: 'Parallel Tracks',
      description: 'Concurrent paths that must all pass before continuing',
      useCase: 'A pull request triggers code review and automated checks simultaneously — you can\'t merge until both pass. This pattern shows parallel work and the gate that reunifies the paths, critical for any approval workflow.',
      complexity: 4,
      code: `graph TD
    A[PR opened] --> B[Trigger pipeline]
    B --> C[Code review]
    B --> D[Run tests]
    B --> E[Security scan]

    C --> F{Review approved?}
    D --> G{Tests pass?}
    E --> H{No vulnerabilities?}

    F -->|No| I[Request changes]
    G -->|No| J[Fix failures]
    H -->|No| K[Fix vulnerabilities]

    F -->|Yes| L[Gate]
    G -->|Yes| L
    H -->|Yes| L

    L --> M{All checks passed?}
    M -->|Yes| N[Merge to main]
    M -->|No| O[Block merge]`
    },
    {
      name: 'Subgraph Phases',
      description: 'Steps grouped into named phases with clear boundaries',
      useCase: 'A deployment pipeline has distinct phases: build, test, release. Subgraphs cluster related steps so stakeholders see both the big picture and the implementation detail in the same diagram — no context switching.',
      complexity: 5,
      code: `graph TD
    subgraph Build["Build Phase"]
        A[Pull source] --> B[Install deps]
        B --> C[Compile assets]
        C --> D[Build Docker image]
    end

    subgraph Test["Test Phase"]
        E[Unit tests] --> F[Integration tests]
        F --> G[E2E smoke test]
    end

    subgraph Release["Release Phase"]
        H[Tag version] --> I[Push to registry]
        I --> J[Deploy to staging]
        J --> K{Manual approval?}
        K -->|Approved| L[Deploy to production]
        K -->|Rejected| M[Rollback]
    end

    Build --> Test
    Test --> Release`
    },
    {
      name: 'Full System Journey',
      description: 'End-to-end flow across multiple systems and teams',
      useCase: 'A customer places an order. The request touches payment, inventory, fulfillment, and notifications — each owned by a different team. This diagram is the contract between those teams: everyone sees their piece and exactly how it connects to the whole.',
      complexity: 6,
      code: `graph TD
    A[Customer places order] --> B[Validate cart]
    B --> C{Items in stock?}
    C -->|No| D[Notify out of stock]
    C -->|Yes| E[Reserve inventory]

    E --> F[Process payment]
    F --> G{Payment approved?}
    G -->|Declined| H[Release inventory]
    H --> I[Notify customer: failed]
    G -->|Approved| J[Confirm order]

    J --> K[Create shipment]
    K --> L[Assign warehouse]
    L --> M[Pick and pack]
    M --> N[Hand off to carrier]

    J --> O[Send confirmation email]
    N --> P[Send tracking info]

    subgraph Async["Background Jobs"]
        Q[Update analytics]
        R[Trigger loyalty points]
        S[Reorder check]
    end

    J --> Async`
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
      
      // Load saved diagrams from localStorage
      try {
        const saved = localStorage.getItem('mermaid-diagrams');
        if (saved) savedDiagrams = JSON.parse(saved);
      } catch { /* localStorage unavailable */ }
      
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
      localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
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
      localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
    } catch { /* ignore */ }
    confirmingDelete = -1;
  }
  
  function exportSVG() {
    const svg = document.querySelector('#preview svg');
    if (!svg) return;
    
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentName || 'diagram'}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function copyCode() {
    navigator.clipboard.writeText(diagramCode)
      .then(() => showToast('Code copied to clipboard'))
      .catch(() => showToast('Could not copy — check browser permissions'));
  }
</script>
<svelte:head>
  <title>Flowchart Editor — Architect's Studio</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]">
  <div class="max-w-7xl mx-auto">
    <Nav />

    <div class="glass-enhanced rounded-2xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Flowchart Editor</h1>
          <p class="text-white/90 text-sm">Create beautiful diagrams with live preview</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <input
            type="text"
            bind:value={currentName}
            placeholder="Enter diagram name..."
            aria-label="Diagram name"
            class="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm min-w-[200px]"
          />
          <button
            onclick={saveDiagram}
            class="glass-gold px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          >
            Save
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
            aria-label="Refresh diagram"
            class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all hover:rotate-90"
          >
            ↻
          </button>
        </div>
      </div>
    </div>

    <!-- Error Banner -->
    {#if error}
      <div class="glass-accent rounded-xl p-4 mb-6 bg-red-500/30 border-red-400/40 animate-in slide-in-from-top">
        <div class="flex items-center gap-3 text-white">
          <span class="text-xl">⚠️</span>
          <span class="font-mono text-sm">{error}</span>
        </div>
      </div>
    {/if}

    <!-- Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Editor Panel -->
      <div class="glass-enhanced rounded-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 bg-white/10 border-b border-white/20 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wide">Editor</h3>
          <span class="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-medium">
            Mermaid Syntax
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={handleInput}
          spellcheck="false"
          aria-label="Diagram code editor"
          placeholder="Start typing your Mermaid diagram..."
          class="flex-1 min-h-[500px] p-6 bg-white/5 text-white font-mono text-sm leading-relaxed focus:outline-none placeholder-white/40 resize-none"
        />
      </div>

      <!-- Preview Panel -->
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

    <!-- Examples Carousel -->
    <div class="glass-enhanced rounded-2xl p-6 mt-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Flowchart Patterns</h2>
          <p class="text-white/60 text-sm mt-1">Progressive complexity — from a single path to a full system</p>
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
        <!-- Example Info -->
        <div class="lg:col-span-1 flex flex-col gap-3">
          <div class="glass-accent rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shrink-0">
                {examples[currentExampleIndex].complexity}
              </div>
              <div class="flex-1">
                <h3 class="text-white font-semibold">{examples[currentExampleIndex].name}</h3>
                <p class="text-white/50 text-xs">{examples[currentExampleIndex].description}</p>
              </div>
            </div>

            <p class="text-white/70 text-sm mb-4 leading-relaxed">{examples[currentExampleIndex].useCase}</p>

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
              Load This Example
            </button>
          </div>

          <div class="glass-accent rounded-xl p-4">
            <h4 class="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">Complexity Progression</h4>
            <div class="flex gap-1">
              {#each Array(6) as _, i}
                <div class="flex-1 h-2 rounded-full {i < examples[currentExampleIndex].complexity ? 'bg-primary-500' : 'bg-white/20'}"></div>
              {/each}
            </div>
            <p class="text-white/60 text-xs mt-2">
              {#if examples[currentExampleIndex].complexity <= 2}
                Beginner — linear flows and simple decisions
              {:else if examples[currentExampleIndex].complexity <= 4}
                Intermediate — routing, parallel tracks
              {:else}
                Advanced — phases and full system journeys
              {/if}
            </p>
          </div>
        </div>

        <!-- Example Code Preview -->
        <div class="lg:col-span-2 glass-accent rounded-xl overflow-hidden">
          <div class="px-4 py-3 bg-white/5 border-b border-white/20">
            <span class="text-white/80 text-xs font-mono">Preview Code</span>
          </div>
          <pre class="p-4 overflow-auto max-h-64 text-white/90 text-sm font-mono leading-relaxed">{examples[currentExampleIndex].code}</pre>
        </div>
      </div>
    </div>

    <!-- Saved Diagrams -->
    {#if savedDiagrams.length > 0}
      <div class="glass-enhanced rounded-2xl p-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Saved Diagrams</h2>
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
              {#if confirmingDelete === index}
                <div class="flex flex-col gap-1 w-12">
                  <button onclick={() => confirmDelete(index)} class="rounded-lg bg-red-500/40 hover:bg-red-500/60 border border-red-400/40 text-white text-xs font-medium transition-all py-1">Del</button>
                  <button onclick={() => confirmingDelete = -1} class="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/60 text-xs transition-all py-1">No</button>
                </div>
              {:else}
                <button
                  onclick={() => requestDelete(index)}
                  aria-label="Delete {diagram.name}"
                  class="w-12 rounded-lg bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/40 text-white hover:text-red-200 text-xl transition-all"
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
    <div class="fixed bottom-6 right-6 glass-accent rounded-xl px-4 py-3 text-white text-sm z-50" role="status" aria-live="polite">
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
