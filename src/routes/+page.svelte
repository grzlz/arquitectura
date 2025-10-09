<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let mermaid;
  let diagramCode = $state(`graph TD
    A[Your System] --> B[Component]
    B --> C[Another Component]`);
  
  let savedDiagrams = $state([]);
  let currentName = $state('');
  let error = $state('');
  let currentExampleIndex = $state(0);

  const examples = [
    {
      name: 'Basic Graph',
      description: 'Simple graph with styling',
      code: `graph LR
    Start[Start]

    %% Horizontal section
    Start --> H1[Step 1]
    H1 --> H2[Step 2]
    H2 --> H3[Step 3]

    %% Bridge element
    H3 --> Bridge[ ]

    %% Vertical section - use line breaks to stack
    Bridge --> V1["Step A<br/><br/>↓<br/><br/>Step B"]

    %% Styling
    classDef horizontalStyle fill:#fff4e6,stroke:#ffa500,stroke-width:2px
    classDef verticalStyle fill:#e6f3ff,stroke:#0066cc,stroke-width:2px
    classDef invisible fill:none,stroke:none

    class H1,H2,H3 horizontalStyle
    class V1 verticalStyle
    class Bridge invisible`
    },
    {
      name: 'Assignment Flow',
      description: 'Flowchart with decision nodes',
      code: `graph LR
    A[Manager receives<br/>Avalúo request] --> B{Assignment<br/>Type?}
    B -->|Current| C[Assign to<br/>Honorario Perito]
    B -->|New| D[Assign to<br/>Colegio]
    D --> E[Colegio Rep<br/>assigns internally]
    E --> F[Perito<br/>works case]
    C --> F
    F --> G[Complete<br/>Avalúo]`
    },
    {
      name: 'Data Model',
      description: 'Entity Relationship Diagram',
      code: `erDiagram
    AVALUOS ||--o{ COLEGIOS : "assigned_to"
    COLEGIOS ||--o{ PERITOS : "has_members"
    PERITOS ||--o{ AVALUOS : "works_on"

    AVALUOS {
        int id
        string folio
        int honorario_id
        int colegio_id
        int perito_id
        string status
    }

    COLEGIOS {
        int id
        string name
        int representative_id
        string contact_info
        boolean active
    }

    PERITOS {
        int id
        int colegio_id
        string name
        string specializations
        int active_cases
    }`
    },
    {
      name: 'User Journey',
      description: 'Sequence diagram showing interactions',
      code: `sequenceDiagram
    participant M as Manager
    participant S as System
    participant C as Colegio Rep
    participant P as Perito

    M->>S: Create avalúo request
    M->>S: Assign to Colegio X
    S->>C: Notify new assignment
    C->>S: View available peritos
    C->>S: Assign to Perito
    S->>P: Notify assignment
    P->>S: Update status
    S->>M: Track progress
    P->>S: Submit completed work
    S->>M: Notify completion`
    },
    {
      name: 'Component Architecture',
      description: 'System architecture with services',
      code: `graph TD
    A[IAValua Routes] --> B[/colegios]
    A --> C[/mi-trabajo]
    A --> D[/analytics]

    B --> E[Colegio List]
    B --> F[Colegio Dashboard]
    B --> G[Perito Management]

    H[Shared Services] --> I[colegiosService.js]
    H --> J[crudService.js]
    H --> K[analyticsService.js]

    E -.uses.-> I
    F -.uses.-> I
    G -.uses.-> I

    L[Components] --> M[ColegioCard]
    L --> N[PeritoAssigner]
    L --> O[WorkloadIndicator]

    F -.renders.-> N
    F -.renders.-> O`
    },
    {
      name: 'Status State Machine',
      description: 'State transitions diagram',
      code: `stateDiagram-v2
    [*] --> SinAsignar: Avalúo created
    SinAsignar --> AsignadoColegio: Manager assigns
    AsignadoColegio --> AsignadoPerito: Colegio rep assigns
    AsignadoPerito --> EnProgreso: Perito accepts
    EnProgreso --> EnRevision: Work submitted
    EnRevision --> Observaciones: Needs changes
    Observaciones --> EnProgreso: Perito fixes
    EnRevision --> Completado: Approved
    Completado --> [*]`
    },
    {
      name: 'Dashboard Layout',
      description: 'Complex graph with subgraphs',
      code: `graph TB
    subgraph Dashboard["Colegio Representative Dashboard"]
        A[Pending Assignments]
        B[Available Peritos]
        C[Active Cases]
        D[Performance Metrics]
    end

    A --> E{Assign?}
    E -->|Yes| F[Select Perito]
    F --> G[Check workload]
    G -->|OK| H[Assign case]
    G -->|Overloaded| I[Warning modal]
    I --> F

    B --> J[Filter by<br/>specialization]
    B --> K[Sort by<br/>workload]

    C --> L[Status filters]
    C --> M[Age tracking]`
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
      const saved = localStorage.getItem('mermaid-diagrams');
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
      preview.innerHTML = `<div class="error">${e.message}</div>`;
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
    localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
    currentName = '';
  }
  
  function loadDiagram(diagram) {
    diagramCode = diagram.code;
    renderDiagram();
  }
  
  function deleteDiagram(index) {
    savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
    localStorage.setItem('mermaid-diagrams', JSON.stringify(savedDiagrams));
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
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Mermaid Flowchart Studio</h1>
          <p class="text-white/90 text-sm">Create beautiful diagrams with live preview</p>
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
          oninput={renderDiagram}
          spellcheck="false"
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
          <h2 class="text-lg font-semibold text-white">Learning Examples</h2>
          <p class="text-white/60 text-sm mt-1">Progressively complex Mermaid diagrams</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
          {currentExampleIndex + 1} / {examples.length}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Example Info -->
        <div class="lg:col-span-1 flex flex-col gap-3">
          <div class="glass-accent rounded-xl p-4">
            <h3 class="text-white font-semibold mb-2">{examples[currentExampleIndex].name}</h3>
            <p class="text-white/70 text-sm mb-4">{examples[currentExampleIndex].description}</p>

            <div class="flex gap-2">
              <button
                onclick={prevExample}
                class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
              >
                ← Previous
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
            <h4 class="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">Complexity Level</h4>
            <div class="flex gap-1">
              {#each Array(7) as _, i}
                <div class="flex-1 h-2 rounded-full {i <= currentExampleIndex ? 'bg-primary-500' : 'bg-white/20'}"></div>
              {/each}
            </div>
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
