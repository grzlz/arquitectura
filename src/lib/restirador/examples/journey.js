// Journey patterns for the Restirador — the default sheet and the examples carousel.
export const defaultCode = `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`;

export const examples = [
	{
		name: 'Coffee Shop Visit',
		description: 'Simple customer journey - single actor',
		complexity: 1,
		code: `journey
    title Customer Coffee Shop Experience
    section Arrival
      Enter shop: 5: Customer
      Look at menu: 4: Customer
    section Order
      Place order: 3: Customer
      Pay: 4: Customer
    section Enjoy
      Receive coffee: 5: Customer
      Drink coffee: 5: Customer`
	},
	{
		name: 'Online Shopping',
		description: 'E-commerce purchase with pain points',
		complexity: 2,
		code: `journey
    title Online Shopping Experience
    section Discovery
      Search products: 4: Shopper
      View product page: 5: Shopper
      Read reviews: 3: Shopper
    section Purchase
      Add to cart: 5: Shopper
      Enter shipping info: 2: Shopper
      Enter payment: 2: Shopper
      Review order: 3: Shopper
    section Post-Purchase
      Receive confirmation: 5: Shopper
      Track package: 4: Shopper
      Receive product: 5: Shopper`
	},
	{
		name: 'Restaurant Dining',
		description: 'Multi-actor experience with staff interactions',
		complexity: 3,
		code: `journey
    title Restaurant Dining Experience
    section Arrival
      Make reservation: 4: Customer
      Arrive at restaurant: 5: Customer
      Get seated: 4: Customer, Host
    section Ordering
      Review menu: 3: Customer
      Ask questions: 4: Customer, Waiter
      Place order: 5: Customer, Waiter
    section Dining
      Receive appetizer: 5: Customer, Waiter
      Receive main course: 5: Customer, Chef, Waiter
      Request modifications: 2: Customer, Waiter
    section Checkout
      Request bill: 4: Customer, Waiter
      Pay: 3: Customer, Waiter
      Leave tip: 5: Customer
    section Departure
      Thank staff: 5: Customer, Waiter
      Exit restaurant: 5: Customer`
	},
	{
		name: 'SaaS Product Onboarding',
		description: 'New user activation flow with friction points',
		complexity: 4,
		code: `journey
    title SaaS Product Onboarding Journey
    section Discovery
      See ad: 3: User
      Visit landing page: 4: User
      Watch demo video: 5: User
    section Signup
      Click signup: 5: User
      Fill form: 2: User
      Verify email: 3: User
      Create password: 2: User
    section First Login
      Login: 4: User
      See welcome tour: 3: User
      Skip tutorial: 2: User
    section Setup
      Import data: 1: User
      Configure settings: 2: User, Support
      Invite team: 3: User
    section First Use
      Create first project: 4: User
      Get confused: 1: User
      Contact support: 2: User, Support
      Complete task: 5: User, Support
    section Activation
      Receive success email: 4: User
      Explore features: 5: User
      Upgrade plan: 5: User`
	},
	{
		name: 'Job Application Process',
		description: 'Complex multi-stage journey with multiple stakeholders',
		complexity: 5,
		code: `journey
    title Job Application Journey
    section Research
      Find job posting: 3: Candidate
      Research company: 5: Candidate
      Check Glassdoor: 3: Candidate
      Read job description: 4: Candidate
    section Application
      Prepare resume: 2: Candidate
      Write cover letter: 1: Candidate
      Fill application: 2: Candidate
      Submit application: 3: Candidate
    section Initial Review
      Application reviewed: 3: Candidate, Recruiter
      Receive rejection: 1: Candidate, Recruiter
      Get phone screen invite: 5: Candidate, Recruiter
    section Phone Screen
      Schedule call: 4: Candidate, Recruiter
      Phone interview: 3: Candidate, Recruiter
      Wait for response: 2: Candidate
      Invited to onsite: 5: Candidate, Recruiter
    section Onsite Interview
      Prepare for interview: 2: Candidate
      Travel to office: 3: Candidate
      Meet team: 5: Candidate, Team
      Technical interview: 2: Candidate, Engineer
      Cultural fit interview: 4: Candidate, Manager
    section Decision
      Wait for offer: 1: Candidate
      Receive offer: 5: Candidate, Recruiter
      Negotiate salary: 3: Candidate, Recruiter
      Accept offer: 5: Candidate, Recruiter`
	},
	{
		name: 'Hospital Patient Journey',
		description: 'Healthcare experience with multiple touchpoints',
		complexity: 6,
		code: `journey
    title Patient Hospital Visit Journey
    section Pre-Visit
      Experience symptoms: 1: Patient
      Search online: 2: Patient
      Call doctor: 3: Patient
      Book appointment: 4: Patient, Receptionist
      Receive confirmation: 4: Patient, System
    section Arrival
      Drive to hospital: 3: Patient
      Find parking: 1: Patient
      Check in: 3: Patient, Receptionist
      Fill forms: 2: Patient
      Wait: 2: Patient
    section Consultation
      Called to room: 4: Patient, Nurse
      Vital signs taken: 3: Patient, Nurse
      Explain symptoms: 3: Patient, Nurse
      Wait for doctor: 2: Patient
      Doctor examination: 4: Patient, Doctor
      Discuss diagnosis: 3: Patient, Doctor
    section Treatment
      Receive prescription: 4: Patient, Doctor
      Get blood work: 2: Patient, Lab Tech
      Wait for results: 1: Patient
      Review results: 3: Patient, Doctor
      Discuss treatment plan: 4: Patient, Doctor
    section Checkout
      Schedule follow-up: 4: Patient, Receptionist
      Get bill: 1: Patient, Billing
      Pay copay: 2: Patient, Billing
      Receive paperwork: 3: Patient, Receptionist
    section Post-Visit
      Go to pharmacy: 3: Patient
      Pick up medication: 4: Patient, Pharmacist
      Read instructions: 3: Patient
      Take medication: 4: Patient
      Feel better: 5: Patient`
	},
	{
		name: 'Home Buying Journey',
		description: 'Long-term multi-month process with many actors',
		complexity: 7,
		code: `journey
    title First-Time Home Buyer Journey
    section Research Phase
      Start browsing: 5: Buyer
      Get overwhelmed: 1: Buyer
      Talk to friends: 4: Buyer
      Research neighborhoods: 3: Buyer
      Check budget: 2: Buyer
    section Financial Preparation
      Meet bank: 3: Buyer, Loan Officer
      Get pre-approved: 4: Buyer, Loan Officer
      Review rates: 2: Buyer
      Submit documents: 1: Buyer, Loan Officer
      Receive approval: 5: Buyer, Loan Officer
    section Agent Selection
      Interview agents: 3: Buyer
      Select agent: 4: Buyer, Agent
      Discuss criteria: 5: Buyer, Agent
    section House Hunting
      View listings: 4: Buyer, Agent
      Visit open houses: 3: Buyer, Agent
      Reject houses: 2: Buyer
      Find dream home: 5: Buyer, Agent
    section Offer Process
      Discuss strategy: 4: Buyer, Agent
      Submit offer: 3: Buyer, Agent, Seller
      Counteroffer received: 2: Buyer, Agent, Seller
      Negotiate: 3: Buyer, Agent, Seller
      Offer accepted: 5: Buyer, Agent, Seller
    section Inspection
      Schedule inspection: 4: Buyer, Inspector
      Attend inspection: 2: Buyer, Inspector, Agent
      Review report: 1: Buyer, Inspector
      Request repairs: 3: Buyer, Agent, Seller
      Renegotiate: 2: Buyer, Agent, Seller
    section Closing
      Review documents: 2: Buyer, Lawyer
      Final walkthrough: 4: Buyer, Agent
      Sign papers: 3: Buyer, Lawyer, Seller
      Transfer funds: 2: Buyer, Bank
      Receive keys: 5: Buyer, Agent
    section Move In
      Hire movers: 3: Buyer
      Pack belongings: 1: Buyer
      Move in: 4: Buyer
      Unpack: 2: Buyer
      Celebrate: 5: Buyer`
	},
	{
		name: 'Enterprise Software Adoption',
		description: 'B2B sales cycle and implementation journey',
		complexity: 8,
		code: `journey
    title Enterprise Software Adoption Journey
    section Awareness
      Identify problem: 2: Manager
      Research solutions: 3: Manager
      Attend webinar: 4: Manager, Vendor
      Request demo: 5: Manager
    section Evaluation
      Initial demo: 4: Manager, Sales Rep
      Share with team: 3: Manager, Team
      Technical deep dive: 3: IT Manager, Sales Engineer
      Security review: 2: Security Team, Sales Engineer
      Pricing discussion: 2: Manager, Sales Rep
    section Procurement
      Get budget approval: 1: Manager, Finance
      Create RFP: 2: Procurement, Manager
      Vendor presentations: 3: Team, Vendors
      Reference calls: 4: Manager, References
      Negotiate contract: 2: Legal, Sales Rep, Procurement
      Sign contract: 4: Manager, Legal, Vendor
    section Implementation
      Kickoff meeting: 5: Team, Implementation Team
      Data migration: 1: IT Team, Implementation Team
      System configuration: 2: Admin, Implementation Team
      Integration setup: 2: IT Team, Implementation Team
      User acceptance testing: 3: Power Users, Implementation Team
    section Training
      Admin training: 3: Admin, Trainer
      Power user training: 4: Power Users, Trainer
      End user training: 2: End Users, Trainer
      Create documentation: 3: Admin, Trainer
    section Rollout
      Pilot group launch: 3: Pilot Users, Admin
      Gather feedback: 4: Pilot Users, Admin
      Fix issues: 2: IT Team, Support
      Company-wide launch: 3: All Users, Admin
      Monitor adoption: 4: Manager, Admin
    section Optimization
      Review usage analytics: 4: Manager, Account Manager
      Advanced training: 5: Power Users, Trainer
      Customize workflows: 4: Admin, Support
      Expand use cases: 5: Team, Account Manager`
	},
	{
		name: 'International Travel Journey',
		description: 'End-to-end travel experience across multiple countries',
		complexity: 9,
		code: `journey
    title International Travel Journey
    section Planning
      Get trip idea: 5: Traveler
      Research destinations: 4: Traveler
      Check passport: 3: Traveler
      Set budget: 2: Traveler
      Book flights: 3: Traveler, Airline
      Book hotels: 4: Traveler, Hotel
      Plan itinerary: 3: Traveler
    section Pre-Departure
      Apply for visa: 1: Traveler, Embassy
      Wait for visa: 1: Traveler
      Get vaccinations: 2: Traveler, Doctor
      Buy travel insurance: 3: Traveler, Insurance
      Exchange currency: 2: Traveler, Bank
      Pack bags: 2: Traveler
    section Departure Day
      Wake up early: 2: Traveler
      Drive to airport: 3: Traveler
      Check in: 3: Traveler, Airline Staff
      Security screening: 1: Traveler, TSA
      Wait at gate: 3: Traveler
      Board flight: 4: Traveler, Flight Crew
    section Flight
      Find seat: 4: Traveler, Flight Crew
      Takeoff: 3: Traveler
      In-flight meal: 3: Traveler, Flight Crew
      Try to sleep: 2: Traveler
      Landing: 4: Traveler
    section Arrival
      Immigration: 2: Traveler, Officer
      Collect baggage: 3: Traveler
      Customs: 2: Traveler, Officer
      Find transportation: 3: Traveler
      Check into hotel: 4: Traveler, Hotel Staff
      Unpack: 3: Traveler
      Jet lag: 1: Traveler
    section Exploration
      City sightseeing: 5: Traveler, Guide
      Try local food: 5: Traveler, Restaurant
      Visit museum: 4: Traveler, Museum Staff
      Get lost: 2: Traveler
      Ask for directions: 3: Traveler, Local
      Shopping: 4: Traveler, Merchant
      Take photos: 5: Traveler
    section Challenges
      Language barrier: 1: Traveler, Local
      Lost wallet: 1: Traveler, Police
      Cancel cards: 1: Traveler, Bank
      Embassy visit: 2: Traveler, Embassy
      Get emergency cash: 3: Traveler, Bank
    section Return Prep
      Pack souvenirs: 4: Traveler
      Check out hotel: 3: Traveler, Hotel Staff
      Airport transfer: 3: Traveler
      Extra security: 2: Traveler, Security
      Duty free shopping: 4: Traveler
    section Return Home
      Long flight back: 2: Traveler
      Immigration home: 4: Traveler, Officer
      Collect bags: 4: Traveler
      Home at last: 5: Traveler
      Share photos: 5: Traveler, Friends
      Plan next trip: 5: Traveler`
	}
];
