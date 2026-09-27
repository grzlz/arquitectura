<script>
	import { onMount, tick } from 'svelte';
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
			await document.fonts.ready;

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
			localStorage.setItem('mermaid-class-diagrams', JSON.stringify(savedDiagrams));
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
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

<svelte:head>
	<title>Class — The Studio · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>The Studio · Free Mermaid editors</span>
				<span class="text-accent">No. 05 · Class</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">Class</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				Object-oriented systems — from simple classes to ML platforms
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
					placeholder="classDiagram&#10;    class MyClass&#10;        +property&#10;        +method()"
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
					<span class="font-semibold text-ink">Fig. 1</span> — Your class diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						OOP design patterns
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
							Beginner — basic OOP concepts
						{:else if examples[currentExampleIndex].complexity <= 4}
							Intermediate — domain modeling
						{:else if examples[currentExampleIndex].complexity <= 6}
							Advanced — enterprise patterns
						{:else}
							Expert — data & ML platforms
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
						Saved class diagrams
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
