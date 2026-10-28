// State patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `stateDiagram-v2
    [*] --> Idle
    Idle --> Active
    Active --> [*]`;

export const examples = [
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
