<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { mermaidInit } from '$lib/mermaidTheme.js';

	let mermaid;
	let diagramCode = $state(`journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`);

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
				const saved = localStorage.getItem('mermaid-journey-diagrams');
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
			localStorage.setItem('mermaid-journey-diagrams', JSON.stringify(savedDiagrams));
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
			localStorage.setItem('mermaid-journey-diagrams', JSON.stringify(savedDiagrams));
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
		a.download = `${currentName || 'journey-diagram'}.svg`;
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
	<title>Journey — The Studio · Art Vandeley</title>
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
				<span class="text-brass/70">SHT 04 · Journey</span>
			</div>

			<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="font-display text-4xl font-light tracking-tight text-paper md:text-5xl">
						Journey
					</h1>
					<p class="mt-3 text-sm text-paper/55">
						User journeys — from simple visits to multi-month experiences
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
					<span class="text-[10px] tracking-[0.2em] text-brass/70 uppercase">User journey</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="journey&#10;    title Customer Journey&#10;    section Step&#10;      Task: 5: Actor"
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
				<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">
					Customer Journey Patterns
				</h2>
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

					<p class="mt-4 text-sm leading-relaxed text-paper/55">
						{examples[currentExampleIndex].description}
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
								Beginner - Simple linear journeys
							{:else if examples[currentExampleIndex].complexity <= 4}
								Intermediate - Multi-actor experiences
							{:else if examples[currentExampleIndex].complexity <= 6}
								Advanced - Complex multi-stage flows
							{:else}
								Expert - Long-term enterprise journeys
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
					<h2 class="text-[10px] tracking-[0.3em] text-brass/70 uppercase">
						Saved Journey Diagrams
					</h2>
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
