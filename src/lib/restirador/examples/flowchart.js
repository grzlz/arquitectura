// Flowchart patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `flowchart LR
  U([User])
  S[System]

  U -- input --> S
  S -- output --> U`;

export const examples = [
	{
		name: 'System with Subsystems',
		description: 'The base pattern extended with internal structure',
		useCase:
			"The natural starting point: you have a user and a system. When you need to show that system isn't a black box but has internal parts that collaborate, you add subsystems. Same outer flow, more interior detail.",
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
		useCase:
			'When a system grows into multiple domains, you need to show who owns what. Subgraphs map bounded contexts — team boundaries, service ownership, and interaction points — in one view that both engineers and product leads can read.',
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
		useCase:
			"In event-driven systems, services don't call each other — they publish and subscribe. This diagram makes that contract visible: what events exist, who emits them, and which services react. Critical for debugging and onboarding.",
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
		useCase:
			'API composition is one of the trickiest patterns to explain. This diagram shows an orchestrator calling three services in parallel, aggregating results, and handling the timeout case — all the decisions that would otherwise live in a PR description.',
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
		useCase:
			'Architecture review time. This diagram shows all four layers of a production system — edge, application, data, and async — and how they connect. Use it to align the team before a refactor, during incident review, or when pitching infrastructure changes.',
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
