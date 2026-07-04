<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

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
			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				securityLevel: 'loose'
			});

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
			errEl.className = 'text-red-400 p-4 font-mono text-sm';
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
	<title>User Journey Mastery — Architect's Studio</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-950 p-8 font-[family-name:var(--font-primary)]"
>
	<div class="mx-auto max-w-7xl">
		<Nav />

		<div class="glass-enhanced mb-6 rounded-2xl p-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 class="text-shadow mb-2 text-3xl font-bold text-white">User Journey Mastery</h1>
					<p class="text-sm text-white/90">
						Map customer experiences from simple visits to complex multi-month journeys
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<input
						type="text"
						bind:value={currentName}
						placeholder="Enter diagram name..."
						aria-label="Diagram name"
						class="min-w-[200px] rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
					/>
					<button
						onclick={saveDiagram}
						class="glass-gold rounded-lg px-4 py-2 font-medium text-white transition-all hover:scale-105"
					>
						Save
					</button>
					<button
						onclick={exportSVG}
						class="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
					>
						📥 Export
					</button>
					<button
						onclick={copyCode}
						class="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
					>
						📋 Copy
					</button>
					<button
						onclick={renderDiagram}
						aria-label="Refresh diagram"
						class="rounded-lg border border-white/30 bg-white/10 px-3 py-2 font-medium text-white transition-all hover:rotate-90 hover:bg-white/20"
					>
						↻
					</button>
				</div>
			</div>
		</div>

		{#if error}
			<div
				class="glass-accent animate-in slide-in-from-top mb-6 rounded-xl border-red-400/40 bg-red-500/30 p-4"
			>
				<div class="flex items-center gap-3 text-white">
					<span class="text-xl">⚠️</span>
					<span class="font-mono text-sm">{error}</span>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div class="glass-enhanced flex flex-col overflow-hidden rounded-2xl">
				<div
					class="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4"
				>
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">Editor</h3>
					<span
						class="rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-xs font-medium text-white"
					>
						User Journey
					</span>
				</div>
				<textarea
					bind:value={diagramCode}
					oninput={handleInput}
					spellcheck="false"
					aria-label="Diagram code editor"
					placeholder="journey&#10;    title Customer Journey&#10;    section Step&#10;      Task: 5: Actor"
					class="min-h-[500px] flex-1 resize-none bg-white/5 p-6 font-mono text-sm leading-relaxed text-white placeholder-white/40 focus:outline-none"
				/>
			</div>

			<div class="glass-enhanced flex flex-col overflow-hidden rounded-2xl">
				<div
					class="flex items-center justify-between border-b border-white/20 bg-white/10 px-6 py-4"
				>
					<h3 class="text-sm font-semibold tracking-wide text-white uppercase">Preview</h3>
					<span
						class="rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-xs font-medium text-white"
					>
						Live Render
					</span>
				</div>
				<div class="min-h-[500px] flex-1 overflow-auto bg-gray-900 p-6">
					<div
						id="preview"
						class="flex min-h-full items-center justify-center rounded-lg bg-gray-800"
					></div>
				</div>
			</div>
		</div>

		<!-- Learning Examples Carousel -->
		<div class="glass-enhanced mt-6 rounded-2xl p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Customer Journey Patterns</h2>
					<p class="mt-1 text-sm text-white/60">
						Progressive complexity from single touchpoints to multi-month experiences
					</p>
				</div>
				<div class="flex items-center gap-3">
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						Level {examples[currentExampleIndex].complexity}
					</span>
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						{currentExampleIndex + 1} / {examples.length}
					</span>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Example Info Panel -->
				<div class="flex flex-col gap-3 lg:col-span-1">
					<div class="glass-accent rounded-xl p-4">
						<div class="mb-3 flex items-center gap-2">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white"
							>
								{examples[currentExampleIndex].complexity}
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-white">{examples[currentExampleIndex].name}</h3>
								<p class="text-xs text-white/60">
									Complexity Level {examples[currentExampleIndex].complexity}
								</p>
							</div>
						</div>

						<p class="mb-4 text-sm text-white/70">{examples[currentExampleIndex].description}</p>

						<div class="flex gap-2">
							<button
								onclick={prevExample}
								class="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
							>
								← Prev
							</button>
							<button
								onclick={nextExample}
								class="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all hover:bg-white/20"
							>
								Next →
							</button>
						</div>

						<button
							onclick={loadExample}
							class="mt-3 w-full rounded-lg bg-white/90 px-4 py-2 font-medium text-primary-600 transition-all hover:scale-105 hover:bg-white"
						>
							Load & Study This Pattern
						</button>
					</div>

					<div class="glass-accent rounded-xl p-4">
						<h4 class="mb-2 text-xs font-semibold tracking-wide text-white/80 uppercase">
							Complexity Progression
						</h4>
						<div class="flex gap-1">
							{#each Array(9) as _, i}
								<div
									class="h-2 flex-1 rounded-full {i < examples[currentExampleIndex].complexity
										? 'bg-primary-500'
										: 'bg-white/20'}"
								></div>
							{/each}
						</div>
						<p class="mt-2 text-xs text-white/60">
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
				</div>

				<!-- Example Code Preview -->
				<div class="glass-accent overflow-hidden rounded-xl lg:col-span-2">
					<div
						class="flex items-center justify-between border-b border-white/20 bg-white/5 px-4 py-3"
					>
						<span class="font-mono text-xs text-white/80">Preview Code</span>
						<span class="text-xs text-white/60">
							{examples[currentExampleIndex].code.split('\n').length} lines
						</span>
					</div>
					<pre
						class="max-h-64 overflow-auto p-4 font-mono text-sm leading-relaxed text-white/90">{examples[
							currentExampleIndex
						].code}</pre>
				</div>
			</div>
		</div>

		<!-- Saved Diagrams -->
		{#if savedDiagrams.length > 0}
			<div class="glass-enhanced mt-6 rounded-2xl p-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-white">Saved Journey Diagrams</h2>
					<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
						{savedDiagrams.length}
					</span>
				</div>

				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each savedDiagrams as diagram, index}
						<div class="animate-in slide-in-from-left flex gap-2">
							<button
								onclick={() => loadDiagram(diagram)}
								class="group flex-1 rounded-lg border border-white/20 bg-white/10 p-3 text-left transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20"
							>
								<div class="mb-1 text-sm font-medium text-white group-hover:text-white/90">
									{diagram.name}
								</div>
								<div class="text-xs text-white/60">
									{new Date(diagram.timestamp).toLocaleDateString()}
								</div>
							</button>
							{#if confirmingDelete === index}
								<div class="flex w-12 flex-col gap-1">
									<button
										onclick={() => confirmDelete(index)}
										class="rounded-lg border border-red-400/40 bg-red-500/40 py-1 text-xs font-medium text-white transition-all hover:bg-red-500/60"
										>Del</button
									>
									<button
										onclick={() => (confirmingDelete = -1)}
										class="rounded-lg border border-white/20 bg-white/10 py-1 text-xs text-white/60 transition-all hover:bg-white/20"
										>No</button
									>
								</div>
							{:else}
								<button
									onclick={() => requestDelete(index)}
									aria-label="Delete {diagram.name}"
									class="w-12 rounded-lg border border-white/20 bg-white/10 text-xl text-white transition-all hover:border-red-400/40 hover:bg-red-500/30 hover:text-red-200"
								>
									×
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if toast}
		<div
			class="glass-accent fixed right-6 bottom-6 z-50 rounded-xl px-4 py-3 text-sm text-white"
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
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
	}
</style>
