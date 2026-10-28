// Class patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }`;

export const examples = [
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
