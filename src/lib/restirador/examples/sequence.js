// Sequence patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `sequenceDiagram
    participant Client
    participant Server

    Client->>Server: Request
    Server->>Client: Response`;

export const examples = [
	{
		name: 'Basic Request-Response',
		description: 'Simplest sequence diagram — client-server interaction',
		useCase:
			'You\'re documenting a new API endpoint and need to show how a client talks to a server. This is the "hello world" of sequence diagrams — two actors, one exchange. Start here before adding any complexity.',
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
		useCase:
			'Every developer builds a login. This diagram makes the four-actor handoff — user, frontend, backend, database — explicit. When something breaks at 2am, this is what you open to find where the chain snapped.',
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
		useCase:
			'An API that only shows the happy path is a lie. This diagram introduces `alt` blocks to document what actually happens — valid input, bad input, and database failures. This is what your error handling spec should look like.',
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
		useCase:
			"A user uploads a large file. You can't make them wait. This diagram shows how a system accepts the request immediately, processes it in the background, and notifies the user when done — the `activate/deactivate` blocks make the async boundary visible.",
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
		useCase:
			"You're joining a team with five backend services and need to understand how a single user request touches all of them. The `par` block is the key syntax here — it shows that two requests fire simultaneously, which is often where performance bugs hide.",
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
		useCase:
			'Your system needs an immutable audit trail and separate read/write models. This diagram shows CQRS in motion: a command lands, an event gets appended, a projection updates, and a separate query path serves reads. The `Note` annotations make the architectural intent explicit.',
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
		useCase:
			'An order goes through payment and inventory. Inventory fails. Now you need to refund the payment you just charged. This is the saga pattern — each step has a compensating rollback. The diagram makes the failure path as visible as the happy path, which is exactly the conversation you need to have with your team.',
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
		useCase:
			"You're onboarding onto an e-commerce platform and need to understand the full checkout journey end-to-end. This diagram maps every system involved — cart, pricing, payment, orders, email, analytics — and shows exactly which paths are parallel and which are sequential. The kind of diagram you pin to the wall on launch day.",
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
		useCase:
			'You run a distributed worker system and need to document how the ops dashboard interacts with the queue, workers, and alerting. This diagram covers the full operational loop: health checks, failure detection, manual recovery, and the DLQ retry cycle — the stuff that only gets documented after an outage.',
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

    QueueManager->>Queue: Count pending
    Queue->>QueueManager: 47 tasks

    QueueManager->>Worker1: Health check
    Worker1->>QueueManager: ✓ Healthy

    QueueManager->>Worker2: Health check
    Worker2->>QueueManager: ❌ Unresponsive

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
    else Task failed (retry)
        Worker1->>Queue: NACK + retry
        Queue->>Queue: Re-enqueue
    else Max retries exceeded
        Worker1->>DeadLetterQueue: Move to DLQ
        DeadLetterQueue->>Alerting: Failed task alert
    end
    deactivate Worker1

    Dashboard->>DeadLetterQueue: GET /failed-tasks
    DeadLetterQueue->>Dashboard: Failed task list

    Dashboard->>QueueManager: Retry task manually
    QueueManager->>Queue: Re-enqueue task

    Note over Dashboard,Alerting: Real-time queue operations<br/>with failure recovery`
	}
];
