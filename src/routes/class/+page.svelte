<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let mermaid;
  let diagramCode = $state(`classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }`);

  let savedDiagrams = $state([]);
  let currentName = $state('');
  let error = $state('');
  let currentExampleIndex = $state(0);

  const examples = [
    {
      name: 'Single Class',
      description: 'Basic class with properties and methods',
      complexity: 1,
      code: `classDiagram
    class User {
        +String username
        +String email
        +Date createdAt
        +login()
        +logout()
        +updateProfile()
    }`
    },
    {
      name: 'Two Classes with Association',
      description: 'Basic relationship between classes',
      complexity: 2,
      code: `classDiagram
    class Customer {
        +String name
        +String email
        +String phone
        +placeOrder()
    }

    class Order {
        +String orderId
        +Date orderDate
        +String status
        +calculateTotal()
        +cancel()
    }

    Customer "1" --> "*" Order : places`
    },
    {
      name: 'Inheritance Hierarchy',
      description: 'Parent-child relationships with polymorphism',
      complexity: 3,
      code: `classDiagram
    class Animal {
        <<abstract>>
        +String name
        +int age
        +makeSound()*
        +eat()
    }

    class Dog {
        +String breed
        +makeSound()
        +fetch()
    }

    class Cat {
        +boolean indoor
        +makeSound()
        +scratch()
    }

    class Bird {
        +float wingspan
        +makeSound()
        +fly()
    }

    Animal <|-- Dog
    Animal <|-- Cat
    Animal <|-- Bird`
    },
    {
      name: 'E-commerce Domain Model',
      description: 'Complete shopping system with multiple relationships',
      complexity: 4,
      code: `classDiagram
    class Customer {
        +String customerId
        +String name
        +String email
        +Address shippingAddress
        +placeOrder()
        +viewOrderHistory()
    }

    class Order {
        +String orderId
        +Date orderDate
        +String status
        +Money total
        +addItem()
        +removeItem()
        +checkout()
        +cancel()
    }

    class OrderItem {
        +int quantity
        +Money unitPrice
        +Money subtotal
        +calculateSubtotal()
    }

    class Product {
        +String productId
        +String name
        +String description
        +Money price
        +int stockQuantity
        +updateStock()
    }

    class Payment {
        +String paymentId
        +String method
        +Money amount
        +String status
        +process()
        +refund()
    }

    class Shipment {
        +String trackingNumber
        +String carrier
        +Date shippedDate
        +Date deliveryDate
        +track()
        +updateStatus()
    }

    Customer "1" --> "*" Order : places
    Order "1" --> "*" OrderItem : contains
    OrderItem "*" --> "1" Product : references
    Order "1" --> "1" Payment : paid_by
    Order "1" --> "0..1" Shipment : shipped_via`
    },
    {
      name: 'Authentication & Authorization System',
      description: 'Security model with roles and permissions',
      complexity: 5,
      code: `classDiagram
    class User {
        +String userId
        +String username
        +String email
        +String passwordHash
        +Date lastLogin
        +login()
        +logout()
        +changePassword()
        +resetPassword()
    }

    class Role {
        +String roleId
        +String name
        +String description
        +assignPermission()
        +revokePermission()
    }

    class Permission {
        +String permissionId
        +String resource
        +String action
        +validate()
    }

    class Session {
        +String sessionId
        +String token
        +Date expiresAt
        +boolean isActive
        +refresh()
        +invalidate()
    }

    class AuditLog {
        +String logId
        +String action
        +Date timestamp
        +String ipAddress
        +record()
    }

    class UserProfile {
        +String profileId
        +String firstName
        +String lastName
        +String avatar
        +updateProfile()
    }

    User "1" --> "1" UserProfile : has
    User "*" --> "*" Role : assigned_to
    Role "*" --> "*" Permission : includes
    User "1" --> "*" Session : creates
    User "1" --> "*" AuditLog : generates
    Session --> AuditLog : logs`
    },
    {
      name: 'Multi-Tenant SaaS Architecture',
      description: 'Tenant isolation with subscription management',
      complexity: 6,
      code: `classDiagram
    class Tenant {
        +String tenantId
        +String name
        +String subdomain
        +Date createdAt
        +boolean isActive
        +configure()
        +suspend()
        +activate()
    }

    class Subscription {
        +String subscriptionId
        +String plan
        +Money amount
        +Date startDate
        +Date endDate
        +String status
        +upgrade()
        +downgrade()
        +cancel()
        +renew()
    }

    class User {
        +String userId
        +String email
        +String role
        +inviteUser()
        +removeUser()
    }

    class Organization {
        +String orgId
        +String name
        +int maxUsers
        +addMember()
        +removeMember()
    }

    class Feature {
        +String featureId
        +String name
        +boolean enabled
        +toggle()
    }

    class UsageMetrics {
        +String metricId
        +Date timestamp
        +int apiCalls
        +int storageUsed
        +track()
        +report()
    }

    class Invoice {
        +String invoiceId
        +Money amount
        +Date dueDate
        +String status
        +generate()
        +send()
        +pay()
    }

    Tenant "1" --> "1" Subscription : subscribes_to
    Tenant "1" --> "*" Organization : contains
    Organization "1" --> "*" User : has_members
    Subscription "*" --> "*" Feature : includes
    Tenant "1" --> "*" UsageMetrics : tracks
    Subscription "1" --> "*" Invoice : generates`
    },
    {
      name: 'Event Sourcing Pattern',
      description: 'CQRS with event store and projections',
      complexity: 7,
      code: `classDiagram
    class AggregateRoot {
        <<abstract>>
        +String aggregateId
        +int version
        +applyEvent()*
        +getUncommittedEvents()
    }

    class OrderAggregate {
        +String orderId
        +String status
        +Money total
        +createOrder()
        +addItem()
        +confirmPayment()
        +ship()
        +applyEvent()
    }

    class DomainEvent {
        <<interface>>
        +String eventId
        +Date timestamp
        +String aggregateId
        +int version
    }

    class OrderCreated {
        +String orderId
        +String customerId
        +Date orderDate
    }

    class ItemAdded {
        +String productId
        +int quantity
        +Money price
    }

    class PaymentConfirmed {
        +String paymentId
        +Money amount
    }

    class EventStore {
        +appendEvent()
        +getEvents()
        +getSnapshot()
        +saveSnapshot()
    }

    class ReadModel {
        <<interface>>
        +update()*
        +query()*
    }

    class OrderReadModel {
        +String orderId
        +String customerName
        +Money total
        +String status
        +update()
        +query()
    }

    class EventHandler {
        +handle()
        +subscribe()
    }

    class Projection {
        +String projectionId
        +String name
        +int lastProcessedVersion
        +project()
        +rebuild()
    }

    AggregateRoot <|-- OrderAggregate
    DomainEvent <|.. OrderCreated
    DomainEvent <|.. ItemAdded
    DomainEvent <|.. PaymentConfirmed
    OrderAggregate --> DomainEvent : generates
    EventStore --> DomainEvent : stores
    ReadModel <|.. OrderReadModel
    EventHandler --> DomainEvent : consumes
    EventHandler --> Projection : updates
    Projection --> ReadModel : builds`
    },
    {
      name: 'Data Analytics Pipeline',
      description: 'ETL, data warehouse, and BI reporting architecture',
      complexity: 8,
      code: `classDiagram
    class DataSource {
        <<interface>>
        +String sourceId
        +String connectionString
        +Map~String~ credentials
        +connect()
        +disconnect()
        +extract()*
    }

    class DatabaseSource {
        +String dbType
        +String host
        +int port
        +executeQuery()
        +extract()
    }

    class APISource {
        +String endpoint
        +String apiKey
        +int rateLimit
        +fetchData()
        +extract()
    }

    class FileSource {
        +String filePath
        +String format
        +readFile()
        +extract()
    }

    class ETLJob {
        +String jobId
        +String name
        +String schedule
        +String status
        +execute()
        +retry()
        +monitor()
    }

    class Transform {
        +String transformId
        +String type
        +Map~String~ config
        +clean()
        +normalize()
        +aggregate()
        +join()
    }

    class DataQuality {
        +String ruleId
        +String rule
        +String severity
        +validate()
        +report()
    }

    class DataWarehouse {
        +String warehouseId
        +String schema
        +load()
        +query()
        +optimize()
    }

    class FactTable {
        +String tableId
        +String name
        +Date partitionDate
        +insert()
        +update()
    }

    class DimensionTable {
        +String tableId
        +String name
        +String type
        +upsert()
        +lookup()
    }

    class Cube {
        +String cubeId
        +String name
        +List~String~ dimensions
        +List~String~ measures
        +build()
        +refresh()
        +query()
    }

    class Report {
        +String reportId
        +String name
        +String type
        +generate()
        +schedule()
        +export()
    }

    class Dashboard {
        +String dashboardId
        +String name
        +List~Widget~ widgets
        +refresh()
        +share()
    }

    class MetricsStore {
        +String metricId
        +String name
        +String aggregation
        +calculate()
        +cache()
    }

    DataSource <|-- DatabaseSource
    DataSource <|-- APISource
    DataSource <|-- FileSource
    ETLJob --> DataSource : extracts_from
    ETLJob --> Transform : applies
    ETLJob --> DataQuality : validates
    ETLJob --> DataWarehouse : loads_to
    DataWarehouse "1" --> "*" FactTable : contains
    DataWarehouse "1" --> "*" DimensionTable : contains
    FactTable "*" --> "*" DimensionTable : references
    Cube --> FactTable : aggregates
    Cube --> DimensionTable : uses
    Report --> Cube : queries
    Dashboard --> Report : displays
    Dashboard --> MetricsStore : fetches
    MetricsStore --> Cube : computes_from`
    },
    {
      name: 'ML/AI Data Platform',
      description: 'Feature stores, model registry, and ML operations',
      complexity: 9,
      code: `classDiagram
    class Dataset {
        +String datasetId
        +String name
        +String version
        +String schema
        +int rowCount
        +load()
        +validate()
        +split()
        +version()
    }

    class FeatureStore {
        +String storeId
        +String name
        +register()
        +getFeatures()
        +materialize()
    }

    class Feature {
        +String featureId
        +String name
        +String dataType
        +String transformation
        +compute()
        +validate()
    }

    class FeatureGroup {
        +String groupId
        +String name
        +List~Feature~ features
        +addFeature()
        +removeFeature()
    }

    class TrainingJob {
        +String jobId
        +String algorithm
        +Map~String~ hyperparameters
        +String status
        +train()
        +monitor()
        +stop()
    }

    class Model {
        +String modelId
        +String name
        +String version
        +String framework
        +Map~String~ metrics
        +train()
        +evaluate()
        +predict()
    }

    class Experiment {
        +String experimentId
        +String name
        +Date startTime
        +String status
        +logMetric()
        +logParameter()
        +compare()
    }

    class ModelRegistry {
        +String registryId
        +register()
        +getModel()
        +promoteToProduction()
        +archive()
    }

    class ModelVersion {
        +String versionId
        +int versionNumber
        +String stage
        +Date createdAt
        +Map~String~ metadata
        +promote()
        +rollback()
    }

    class Deployment {
        +String deploymentId
        +String environment
        +String endpoint
        +int replicas
        +deploy()
        +scale()
        +rollback()
    }

    class PredictionService {
        +String serviceId
        +String modelVersion
        +predict()
        +batchPredict()
        +explain()
    }

    class DataDrift {
        +String driftId
        +Date timestamp
        +float score
        +String status
        +detect()
        +alert()
    }

    class ModelMonitor {
        +String monitorId
        +String modelId
        +trackPerformance()
        +detectDrift()
        +alert()
    }

    class Pipeline {
        +String pipelineId
        +String name
        +List~Step~ steps
        +execute()
        +schedule()
        +retry()
    }

    class ArtifactStore {
        +String storeId
        +String path
        +store()
        +retrieve()
        +version()
    }

    Dataset --> FeatureStore : feeds
    FeatureStore "1" --> "*" FeatureGroup : organizes
    FeatureGroup "1" --> "*" Feature : contains
    TrainingJob --> Dataset : uses
    TrainingJob --> FeatureStore : consumes
    TrainingJob --> Model : produces
    Experiment "1" --> "*" TrainingJob : tracks
    Model --> ModelRegistry : registered_in
    ModelRegistry "1" --> "*" ModelVersion : maintains
    ModelVersion --> Deployment : deployed_as
    Deployment --> PredictionService : runs
    PredictionService --> Model : serves
    ModelMonitor --> PredictionService : monitors
    ModelMonitor --> DataDrift : detects
    Pipeline --> TrainingJob : orchestrates
    Pipeline --> Deployment : orchestrates
    ArtifactStore --> Model : stores
    ArtifactStore --> Dataset : stores
    ArtifactStore --> FeatureStore : stores`
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

      const saved = localStorage.getItem('mermaid-class-diagrams');
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
    localStorage.setItem('mermaid-class-diagrams', JSON.stringify(savedDiagrams));
    currentName = '';
  }

  function loadDiagram(diagram) {
    diagramCode = diagram.code;
    renderDiagram();
  }

  function deleteDiagram(index) {
    savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
    localStorage.setItem('mermaid-class-diagrams', JSON.stringify(savedDiagrams));
  }

  function exportSVG() {
    const svg = document.querySelector('#preview svg');
    if (!svg) return;

    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentName || 'class-diagram'}.svg`;
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
      <div class="flex items-center gap-3">
        <a href="/" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🏠 General
        </a>
        <a href="/sequence" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🔄 Sequence
        </a>
        <a href="/state" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🎯 State
        </a>
        <a href="/journey" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
          🗺️ Journey
        </a>
        <a href="/class" class="px-4 py-2 rounded-lg bg-white/20 text-white font-medium border-2 border-white/40">
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
          <h1 class="text-3xl font-bold text-white text-shadow mb-2">Class Diagram Mastery</h1>
          <p class="text-white/90 text-sm">Design object-oriented systems from simple classes to ML platforms</p>
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
            Class Diagram
          </span>
        </div>
        <textarea
          bind:value={diagramCode}
          oninput={renderDiagram}
          spellcheck="false"
          placeholder="classDiagram&#10;    class MyClass&#10;        +property&#10;        +method()"
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
          <h2 class="text-lg font-semibold text-white">OOP Design Patterns</h2>
          <p class="text-white/60 text-sm mt-1">Progressive complexity from single classes to data platforms</p>
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
                Beginner - Basic OOP concepts
              {:else if examples[currentExampleIndex].complexity <= 4}
                Intermediate - Domain modeling
              {:else if examples[currentExampleIndex].complexity <= 6}
                Advanced - Enterprise patterns
              {:else}
                Expert - Data & ML platforms
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
          <h2 class="text-lg font-semibold text-white">Saved Class Diagrams</h2>
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
