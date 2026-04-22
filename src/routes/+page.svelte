<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Nav from '$lib/components/Nav.svelte';
  
  let mermaid;
  let diagramCode = $state(`flowchart LR
  U([User])
  S[System]

  U -- input --> S
  S -- output --> U`);
  
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
      name: 'System with Subsystems',
      description: 'The base pattern extended with internal structure',
      useCase: 'The natural starting point: you have a user and a system. When you need to show that system isn\'t a black box but has internal parts that collaborate, you add subsystems. Same outer flow, more interior detail.',
      complexity: 1,
      code: `flowchart LR
  U([User])

  subgraph S [System]
    SUB1[Subsystem A]
    SUB2[Subsystem B]
    SUB1 -- data --> SUB2
  end

  U -- input --> S
  SUB1 -- output --> U`
    },
    {
      name: 'Bounded Contexts',
      description: 'Actors interacting with domain-separated subsystems',
      useCase: 'When a system grows into multiple domains, you need to show who owns what. Subgraphs map bounded contexts — team boundaries, service ownership, and interaction points — in one view that both engineers and product leads can read.',
      complexity: 2,
      code: `flowchart LR
  User([User])
  Admin([Admin])

  subgraph Identity [Identity Domain]
    AUTH[Auth Service]
    PROFILE[Profile Service]
    AUTH -- context --> PROFILE
  end

  subgraph Catalog [Catalog Domain]
    PROD[Product Service]
    SEARCH[Search Service]
  end

  User -- login --> Identity
  Admin -- manages --> Identity
  User -- browse --> Catalog
  Identity -- user context --> Catalog`
    },
    {
      name: 'Event-Driven Architecture',
      description: 'Event bus routing messages to multiple consumers',
      useCase: 'In event-driven systems, services don\'t call each other — they publish and subscribe. This diagram makes that contract visible: what events exist, who emits them, and which services react. Critical for debugging and onboarding.',
      complexity: 3,
      code: `flowchart LR
  SRC([Order Service])

  SRC -- order.created --> BUS[Event Bus]

  BUS -- order.created --> INV[Inventory Service]
  BUS -- order.created --> NOTIF[Notification Service]
  BUS -- order.created --> BILL[Billing Service]

  INV -- stock.reserved --> BUS
  NOTIF -- email.queued --> BUS
  BILL -- invoice.created --> BUS`
    },
    {
      name: 'Parallel Service Aggregation',
      description: 'Orchestrator fans out and merges results from multiple services',
      useCase: 'API composition is one of the trickiest patterns to explain. This diagram shows an orchestrator calling three services in parallel, aggregating results, and handling the timeout case — all the decisions that would otherwise live in a PR description.',
      complexity: 4,
      code: `flowchart TD
  Client([Client]) -- request --> ORCH[Orchestrator]

  ORCH -- fetch profile --> USR[User Service]
  ORCH -- check permissions --> PERM[Permissions Service]
  ORCH -- get flags --> FLAGS[Feature Flags]

  USR -- profile --> AGG[Aggregator]
  PERM -- roles --> AGG
  FLAGS -- features --> AGG

  AGG --> V{All resolved?}
  V -- yes --> RESP[Compose response]
  V -- timeout --> FB[Return defaults]

  RESP -- 200 --> Client
  FB -- 200 partial --> Client`
    },
    {
      name: 'Layered System Architecture',
      description: 'Full stack with edge, application, data, and async layers',
      useCase: 'Architecture review time. This diagram shows all four layers of a production system — edge, application, data, and async — and how they connect. Use it to align the team before a refactor, during incident review, or when pitching infrastructure changes.',
      complexity: 5,
      code: `flowchart TD
  Client([Client App])

  subgraph Edge [Edge Layer]
    GW[API Gateway]
    CDN[CDN]
  end

  subgraph App [Application Layer]
    AUTHSVC[Auth Service]
    BIZ[Business Service]
    CACHE[Cache]
  end

  subgraph Data [Data Layer]
    DB[(Primary DB)]
    RDB[(Read Replica)]
  end

  subgraph Async [Event Layer]
    QUEUE[Message Queue]
    WORKER[Background Worker]
  end

  Client -- request --> Edge
  GW -- validate --> AUTHSVC
  AUTHSVC -- context --> BIZ
  BIZ -- read --> CACHE
  CACHE -- miss --> DB
  DB -- replicate --> RDB
  BIZ -- emit event --> QUEUE
  QUEUE -- process --> WORKER`
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
      showToast('Ingresa un nombre para guardar');
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
      showToast('No se pudo guardar — almacenamiento no disponible');
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
      .then(() => showToast('Código copiado al portapapeles'))
      .catch(() => showToast('No se pudo copiar — verifica los permisos del navegador'));
  }
</script>
<svelte:head>
  <title>Editor de Diagramas — Architect's Studio</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]">
  <div class="max-w-7xl mx-auto">
    <Nav />

    <div class="glass-enhanced rounded-2xl p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Editor de Diagramas</h1>
          <p class="text-white/90 text-sm">Crea diagramas con vista previa en tiempo real</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <input
            type="text"
            bind:value={currentName}
            placeholder="Nombre del diagrama..."
            aria-label="Nombre del diagrama"
            class="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm min-w-[200px]"
          />
          <button
            onclick={saveDiagram}
            class="glass-gold px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
          >
            Guardar
          </button>
          <button
            onclick={exportSVG}
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
          >
            📥 Exportar
          </button>
          <button
            onclick={copyCode}
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
          >
            📋 Copiar
          </button>
          <button
            onclick={renderDiagram}
            aria-label="Actualizar diagrama"
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
          <h3 class="text-sm font-semibold text-white uppercase tracking-wide">Editor de Código</h3>
          <span class="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-medium">
            Mermaid Syntax
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={handleInput}
          spellcheck="false"
          aria-label="Editor de código del diagrama"
          placeholder="Start typing your Mermaid diagram..."
          class="flex-1 min-h-[500px] p-6 bg-white/5 text-white font-mono text-sm leading-relaxed focus:outline-none placeholder-white/40 resize-none"
        />
      </div>

      <!-- Preview Panel -->
      <div class="glass-enhanced rounded-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-4 bg-white/10 border-b border-white/20 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wide">Vista Previa</h3>
          <span class="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-medium">
            Renderizado en Vivo
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
          <h2 class="text-lg font-semibold text-white">Patrones de Diagramas</h2>
          <p class="text-white/60 text-sm mt-1">Complejidad progresiva — desde un flujo simple hasta un sistema completo</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
            Nivel {examples[currentExampleIndex].complexity}
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
                ← Anterior
              </button>
              <button
                onclick={nextExample}
                class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium transition-all"
              >
                Siguiente →
              </button>
            </div>

            <button
              onclick={loadExample}
              class="w-full mt-3 px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-primary-600 font-medium transition-all hover:scale-105"
            >
              Cargar este ejemplo
            </button>
          </div>

          <div class="glass-accent rounded-xl p-4">
            <h4 class="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">Progresión de Complejidad</h4>
            <div class="flex gap-1">
              {#each Array(5) as _, i}
                <div class="flex-1 h-2 rounded-full {i < examples[currentExampleIndex].complexity ? 'bg-primary-500' : 'bg-white/20'}"></div>
              {/each}
            </div>
            <p class="text-white/60 text-xs mt-2">
              {#if examples[currentExampleIndex].complexity <= 2}
                Principiante — actores, sistemas y subsistemas
              {:else if examples[currentExampleIndex].complexity <= 3}
                Intermedio — enrutamiento, tracks paralelos
              {:else}
                Avanzado — fases y flujos de sistema completo
              {/if}
            </p>
          </div>
        </div>

        <!-- Example Code Preview -->
        <div class="lg:col-span-2 glass-accent rounded-xl overflow-hidden">
          <div class="px-4 py-3 bg-white/5 border-b border-white/20">
            <span class="text-white/80 text-xs font-mono">Vista previa del código</span>
          </div>
          <pre class="p-4 overflow-auto max-h-64 text-white/90 text-sm font-mono leading-relaxed">{examples[currentExampleIndex].code}</pre>
        </div>
      </div>
    </div>

    <!-- Saved Diagrams -->
    {#if savedDiagrams.length > 0}
      <div class="glass-enhanced rounded-2xl p-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Diagramas Guardados</h2>
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
                  <button onclick={() => confirmDelete(index)} class="rounded-lg bg-red-500/40 hover:bg-red-500/60 border border-red-400/40 text-white text-xs font-medium transition-all py-1">Elim</button>
                  <button onclick={() => confirmingDelete = -1} class="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/60 text-xs transition-all py-1">No</button>
                </div>
              {:else}
                <button
                  onclick={() => requestDelete(index)}
                  aria-label="Eliminar {diagram.name}"
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
