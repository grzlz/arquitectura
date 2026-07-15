<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

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
			name: 'Single Class',
			description: 'Basic class with properties and methods',
			useCase:
				"You're designing a new model and want to capture its shape before writing any code. A single class diagram is a contract: here are the fields, here are the methods, here is the visibility. Cheaper to debate at this stage than after the PR is open.",
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
			useCase:
				'A customer places orders. That sentence implies a relationship — and relationships have cardinality. This diagram introduces the `"1" --> "*"` notation that answers: can one customer have many orders? Can an order exist without a customer? These questions matter before you write a single foreign key.',
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
			useCase:
				"You have Dog, Cat, and Bird — they all make sounds, but differently. The `<<abstract>>` annotation and `<|--` arrows communicate the design intent: there's a shared contract, and each subclass fulfills it in its own way. Classic OOP, but the diagram makes the hierarchy impossible to misread.",
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
			useCase:
				'You\'re building a shopping system and need to align the team on the domain model before anyone writes a line of code. Six classes, six relationships — this is the kind of diagram you draw on a whiteboard in the first technical meeting. The multiplicity annotations (`"0..1"` on Shipment) already encode business rules.',
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
			useCase:
				'You\'re implementing RBAC and need to explain to the security team how users, roles, and permissions connect — and how sessions and audit logs fit in. This diagram is the spec. When someone asks "why does this user have access to that resource?", you trace it through exactly these relationships.',
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
			useCase:
				"You're building a SaaS product where each customer gets their own isolated workspace, their own subscription plan, and their own usage tracking. This diagram maps the tenant isolation model — who owns what, what's shared, and how billing connects to features. The architecture decision that shapes everything else.",
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
			useCase:
				'You need a system where every state change is captured as an immutable event and the read model is derived from replaying those events. This diagram shows the full DDD stack: aggregates, domain events, event store, projections, and read models. Heavy pattern — the diagram is how you justify the complexity to your team.',
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
			useCase:
				'Your data team needs to onboard a new engineer onto the analytics infrastructure. This diagram maps the full ETL pipeline — sources, transformations, quality checks, the warehouse, OLAP cubes, and the BI layer on top. The `DataSource <<interface>>` pattern shows how multiple source types plug into the same pipeline.',
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
			useCase:
				"You're designing an MLOps platform from scratch and need to show how datasets, feature engineering, training experiments, the model registry, deployments, and drift monitoring all connect. This is the diagram you present to the architecture review board — it shows you've thought through the full lifecycle, not just model training.",
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
			mermaid.initialize(mermaidInit);

			try {
				const saved = localStorage.getItem('mermaid-class-diagrams');
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
			localStorage.setItem('mermaid-class-diagrams', JSON.stringify(savedDiagrams));
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
			localStorage.setItem('mermaid-class-diagrams', JSON.stringify(savedDiagrams));
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
		a.download = `${currentName || 'class-diagram'}.svg`;
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
	<title>Class — The Studio · Art Vandeley</title>
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
				<span class="text-brass/70">SHT 05 · Class</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						Class
					</h1>
					<p class="mt-3 text-sm text-paper/55">
						Object-oriented systems — from simple classes to ML platforms
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
					<span class="text-[10px] tracking-[0.2em] text-brass/70 uppercase">Class diagram</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="classDiagram&#10;    class MyClass&#10;        +property&#10;        +method()"
					class="min-h-[300px] flex-1 resize-none bg-transparent p-6 text-sm leading-relaxed text-paper placeholder-paper/30 focus:outline-none md:min-h-[500px]"
				/>
			</div>

			<div class="flex flex-col overflow-hidden border border-paper/15 bg-ink">
				<div class="flex items-center justify-between border-b border-paper/15 px-6 py-3">
					<h3 class="text-[10px] tracking-[0.25em] text-paper/35 uppercase">Preview</h3>
					<span class="text-[10px] tracking-[0.2em] text-brass/70 uppercase">Live render</span>
				</div>
				<div class="min-h-[300px] flex-1 overflow-auto p-6 md:min-h-[500px]">
					<div id="preview" class="flex min-h-full items-center justify-center"></div>
				</div>
			</div>
		</div>

		<!-- Learning Examples Carousel -->
		<section class="mt-12">
			<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">OOP Design Patterns</h2>
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
							{examples[currentExampleIndex].code.split('\n').length} lines
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
					<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">Saved Class Diagrams</h2>
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
