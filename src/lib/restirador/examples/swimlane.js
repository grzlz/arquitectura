// Swimlane patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `graph TB
    subgraph Customer
      A[Browse] --> B[Buy]
    end
    subgraph System
      B --> C[Process]
    end`;

export const examples = [
	{
		name: 'Simple Handoff',
		description: 'Two-lane process showing customer-support interaction',
		complexity: 1,
		code: `graph TB
    subgraph Customer
        A[Report issue]
        A --> B[Receive solution]
    end

    subgraph Support
        C[Receive ticket]
        C --> D[Investigate]
        D --> E[Resolve issue]
    end

    A --> C
    E --> B`
	},
	{
		name: 'Order Processing',
		description: 'Three-lane e-commerce flow with handoffs',
		complexity: 2,
		code: `graph TB
    subgraph Customer
        A[Browse products]
        A --> B[Add to cart]
        B --> C[Checkout]
    end

    subgraph Payment_System[Payment System]
        D[Process payment]
        D --> E{Approved?}
        E -->|Yes| F[Confirm]
        E -->|No| G[Decline]
    end

    subgraph Warehouse
        H[Pick items]
        H --> I[Pack]
        I --> J[Ship]
    end

    C --> D
    F --> H
    G -.-> B
    J --> K

    subgraph Customer2[Customer]
        K[Receive package]
    end`
	},
	{
		name: 'Support Ticket Escalation',
		description: 'Four-lane support flow with escalation paths',
		complexity: 3,
		code: `graph TB
    subgraph User
        A[Report bug]
        A --> B[Provide info]
        Q[Receive solution]
    end

    subgraph L1_Support[L1 Support]
        C[Create ticket]
        C --> D{Can resolve?}
        D -->|Yes| E[Fix issue]
        D -->|No| F[Escalate to L2]
    end

    subgraph L2_Support[L2 Support]
        G[Investigate]
        G --> H{Can resolve?}
        H -->|Yes| I[Fix issue]
        H -->|No| J[Escalate to Manager]
    end

    subgraph Manager
        K[Review]
        K --> L[Assign specialist]
        L --> M[Resolve]
    end

    A --> C
    E --> Q
    F --> G
    I --> Q
    J --> K
    M --> Q

    B -.Additional info.-> C
    B -.Additional info.-> G`
	},
	{
		name: 'Hiring Process',
		description: 'Multi-stage recruitment with decision loops',
		complexity: 4,
		code: `graph TB
    subgraph Candidate
        A[Submit application]
        B[Phone interview]
        C[Technical interview]
        D[Final interview]
        E[Accept offer]
    end

    subgraph Recruiter
        F[Screen resume]
        F --> G{Qualified?}
        G -->|No| H[Reject]
        G -->|Yes| I[Schedule phone screen]
        I --> J[Conduct call]
        J --> K{Pass?}
        K -->|Yes| L[Forward to Manager]
        K -->|No| H
    end

    subgraph Manager
        M[Review candidate]
        M --> N[Technical assessment]
        N --> O{Pass?}
        O -->|Yes| P[Schedule final]
        O -->|No| H
        P --> Q[Make decision]
        Q --> R{Hire?}
        R -->|Yes| S[Send offer]
        R -->|No| H
    end

    subgraph HR
        T[Prepare offer]
        T --> U[Send paperwork]
        U --> V[Process onboarding]
    end

    A --> F
    I --> B
    L --> M
    P --> D
    S --> T
    U --> E`
	},
	{
		name: 'Insurance Claim',
		description: 'Complex routing with multiple decision points',
		complexity: 5,
		code: `graph TB
    subgraph Client
        A[File claim]
        B[Provide documents]
        C[Receive payout]
    end

    subgraph Agent
        D[Receive claim]
        D --> E[Validate info]
        E --> F{Complete?}
        F -->|No| G[Request documents]
        F -->|Yes| H[Forward to underwriter]
    end

    subgraph Underwriter
        I[Review policy]
        I --> J{Covered?}
        J -->|No| K[Deny claim]
        J -->|Yes| L{Amount?}
        L -->|Under 10k| M[Approve]
        L -->|Over 10k| N[Forward to Claims]
    end

    subgraph Claims_Manager[Claims Manager]
        O[Review large claim]
        O --> P{Investigate?}
        P -->|Yes| Q[Order inspection]
        P -->|No| R[Approve]
    end

    subgraph Finance
        S[Process payment]
        S --> T[Issue check]
    end

    A --> D
    G --> B
    B --> H
    H --> I
    K -.Rejection letter.-> Client
    M --> S
    N --> O
    R --> S
    T --> C`
	},
	{
		name: 'Software Release',
		description: 'Parallel review paths with sync points',
		complexity: 6,
		code: `graph TB
    subgraph Dev
        A[Create PR]
        A --> B[Address feedback]
        P[Deploy to prod]
    end

    subgraph QA
        C[Test feature]
        C --> D{Bugs?}
        D -->|Yes| E[Report issues]
        D -->|No| F[Approve QA]
    end

    subgraph Security
        G[Security scan]
        G --> H{Vulnerabilities?}
        H -->|Yes| I[Report CVEs]
        H -->|No| J[Approve Security]
    end

    subgraph Code_Review[Code Review]
        K[Review code]
        K --> L{Changes needed?}
        L -->|Yes| M[Request changes]
        L -->|No| N[Approve]
    end

    subgraph Ops
        O[Deploy to staging]
        O --> Q[Monitor metrics]
        Q --> R{Stable?}
        R -->|Yes| S[Promote to prod]
        R -->|No| T[Rollback]
    end

    A --> C
    A --> G
    A --> K

    E --> B
    I --> B
    M --> B

    F --> X
    J --> X
    N --> X
    X{All approved?} -->|Yes| O
    X -->|No| B

    S --> P`
	},
	{
		name: 'Loan Approval',
		description: 'Multi-department financial process',
		complexity: 7,
		code: `graph TB
    subgraph Applicant
        A[Submit application]
        B[Provide documents]
        C[Sign agreement]
        D[Receive funds]
    end

    subgraph Loan_Officer[Loan Officer]
        E[Review application]
        E --> F{Pre-qualified?}
        F -->|No| G[Reject]
        F -->|Yes| H[Request documents]
        H --> I[Verify employment]
        I --> J[Calculate DTI]
    end

    subgraph Credit
        K[Pull credit report]
        K --> L{Score > 680?}
        L -->|No| M[High risk - escalate]
        L -->|Yes| N[Approve credit]
    end

    subgraph Compliance
        O[Regulatory check]
        O --> P{AML compliant?}
        P -->|No| Q[Investigate]
        P -->|Yes| R[Approve compliance]
    end

    subgraph Underwriting
        S[Risk assessment]
        S --> T{Accept risk?}
        T -->|No| G
        T -->|Yes| U[Set terms]
    end

    subgraph Finance
        V[Fund approval]
        V --> W{Budget available?}
        W -->|Yes| X[Allocate funds]
        W -->|No| Y[Wait for budget]
    end

    A --> E
    H --> B
    B --> J
    J --> K
    J --> O

    M --> S
    N --> S
    Q --> S
    R --> S

    U --> V
    X --> C
    C --> D

    G -.Rejection.-> Applicant`
	},
	{
		name: 'Healthcare Referral',
		description: 'Patient journey through multiple providers',
		complexity: 8,
		code: `graph TB
    subgraph Patient
        A[Report symptoms]
        B[Visit PCP]
        C[Get referral]
        H[Visit specialist]
        N[Get test]
        S[Receive results]
        T[Start treatment]
    end

    subgraph PCP[Primary Care]
        D[Examine patient]
        D --> E{Needs specialist?}
        E -->|No| F[Prescribe treatment]
        E -->|Yes| G[Create referral]
    end

    subgraph Specialist
        I[Review case]
        I --> J{Diagnostic test needed?}
        J -->|Yes| K[Order lab work]
        J -->|No| L[Diagnose]
    end

    subgraph Insurance
        M[Verify coverage]
        M --> O{Covered?}
        O -->|No| P[Deny - patient pays]
        O -->|Yes| Q[Approve]
        R[Pre-auth test]
        R --> W{Approved?}
        W -->|Yes| X[Authorize]
        W -->|No| Y[Deny]
    end

    subgraph Lab
        U[Run tests]
        U --> V[Send results]
    end

    A --> B
    B --> D
    F -.Direct treatment.-> Patient
    G --> M
    Q --> C
    C --> H
    H --> I
    K --> R
    X --> N
    N --> U
    V --> S
    S --> L
    L --> T`
	},
	{
		name: 'Enterprise Procurement',
		description: 'Complex multi-stakeholder approval chain',
		complexity: 9,
		code: `graph TB
    subgraph Requester
        A[Identify need]
        A --> B[Create requisition]
        Z[Receive goods]
    end

    subgraph Manager
        C[Review request]
        C --> D{Approve?}
        D -->|No| E[Reject with reason]
        D -->|Yes| F{Budget?}
        F -->|< 10k| G[Approve]
        F -->|> 10k| H[Forward to Director]
    end

    subgraph Director
        I[Strategic review]
        I --> J{Aligns with goals?}
        J -->|No| E
        J -->|Yes| K[Approve]
    end

    subgraph Procurement
        L[Market research]
        L --> M[RFP process]
        M --> N[Vendor evaluation]
        N --> O[Select vendor]
        O --> P[Negotiate terms]
    end

    subgraph Finance
        Q[Budget check]
        Q --> R{Funds available?}
        R -->|No| S[Request budget allocation]
        R -->|Yes| T[Reserve funds]
        T --> U[Approve PO]
    end

    subgraph Legal
        V[Contract review]
        V --> W{Terms acceptable?}
        W -->|No| X[Request revisions]
        W -->|Yes| Y[Approve contract]
    end

    subgraph Vendor
        AA[Receive PO]
        AA --> AB[Fulfill order]
        AB --> AC[Ship goods]
        AC --> AD[Send invoice]
    end

    B --> C
    E -.Rejection.-> Requester
    G --> L
    H --> I
    K --> L
    P --> Q
    P --> V
    X -.Negotiate.-> Procurement
    T --> V
    Y --> U
    U --> AA
    AC --> Z
    AD --> Finance`
	}
];
