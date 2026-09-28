<script>
	import { onMount, tick } from 'svelte';
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
			await document.fonts.ready;

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
			localStorage.setItem('mermaid-journey-diagrams', JSON.stringify(savedDiagrams));
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
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

<svelte:head>
	<title>Journey — El Restirador · Art Vandeley</title>
</svelte:head>

<div class="min-h-screen bg-paper font-sans text-ink">
	<Nav wide />

	<main class="mx-auto max-w-7xl px-6 pt-4 pb-20">
		<header>
			<div
				class="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink/15 pb-3 kicker font-medium text-ink/60"
			>
				<span>El Restirador · Free Mermaid editors</span>
				<span class="text-accent">No. 04 · Journey</span>
			</div>
			<h1 class="mt-10 font-display text-title font-light">Journey</h1>
			<p class="mt-4 max-w-measure font-serif text-deck text-ink/75 italic">
				User journeys — from simple visits to multi-month experiences
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
					placeholder="journey&#10;    title Customer Journey&#10;    section Step&#10;      Task: 5: Actor"
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
					<span class="font-semibold text-ink">Fig. 1</span> — Your journey diagram
				</figcaption>
			</figure>
		</div>

		<!-- Patterns -->
		<section class="mt-24">
			<header class="mb-10 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">Patterns</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Customer journey patterns
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
					<p class="mt-5 max-w-measure font-serif text-lg/relaxed text-ink/85">
						{examples[currentExampleIndex].description}
					</p>
					<p class="mt-5 font-sans text-sm text-ink/60">
						{#if examples[currentExampleIndex].complexity <= 2}
							Beginner — simple linear journeys
						{:else if examples[currentExampleIndex].complexity <= 4}
							Intermediate — multi-actor experiences
						{:else if examples[currentExampleIndex].complexity <= 6}
							Advanced — complex multi-stage flows
						{:else}
							Expert — long-term enterprise journeys
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

		<!-- Saved diagrams — a table of contents, like the Restirador index -->
		<section class="mt-24">
			<header class="mb-8 grid gap-3 border-t-2 border-ink pt-4 md:grid-cols-12 md:gap-6">
				<p class="pt-2 kicker text-accent md:col-span-3">The manifest</p>
				<div class="flex flex-wrap items-baseline justify-between gap-4 md:col-span-9">
					<h2 class="font-display text-4xl font-light tracking-[-0.02em] md:text-5xl">
						Saved journey diagrams
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
