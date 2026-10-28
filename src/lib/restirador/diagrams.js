// The Restirador's diagram types, in selector order. The slug is the URL (/restirador/<slug>);
// each type's default sheet and examples load on demand from ./examples/<slug>.js.
// storageKey predates the Restirador (flowchart's unprefixed key is the original studio's):
// changing one strands every saved diagram under it.

// Pattern levels as [highest complexity, caption]; most types grade on nine.
const NINE_LEVELS = (beginner, intermediate, advanced, expert) => [
	[2, `Beginner — ${beginner}`],
	[4, `Intermediate — ${intermediate}`],
	[6, `Advanced — ${advanced}`],
	[Infinity, `Expert — ${expert}`]
];

export const diagrams = [
	{
		slug: 'flowchart',
		name: 'Flowchart',
		deck: 'graph LR / TD / TB — edit, then hit Compilar',
		placeholder: 'Start typing your Mermaid diagram…',
		patterns: 'Diagram patterns',
		storageKey: 'mermaid-diagrams',
		maxLevel: 5,
		levels: [
			[2, 'Beginner — actors, systems and subsystems'],
			[3, 'Intermediate — routing, parallel tracks'],
			[Infinity, 'Advanced — phases and full system flows']
		],
		load: () => import('./examples/flowchart.js')
	},
	{
		slug: 'sequence',
		name: 'Sequence',
		deck: 'Interactions over time — from request-response to distributed systems',
		placeholder: 'sequenceDiagram\n    participant A\n    participant B\n    A->>B: Message',
		patterns: 'Architecture patterns',
		storageKey: 'mermaid-sequence-diagrams',
		maxLevel: 9,
		levels: NINE_LEVELS(
			'basic interactions',
			'error handling & async',
			'microservices & patterns',
			'distributed systems'
		),
		load: () => import('./examples/sequence.js')
	},
	{
		slug: 'state',
		name: 'State',
		deck: 'State machines — from simple toggles to distributed sagas',
		placeholder: 'stateDiagram-v2\n    [*] --> StateA\n    StateA --> StateB\n    StateB --> [*]',
		patterns: 'State machine patterns',
		storageKey: 'mermaid-state-diagrams',
		maxLevel: 9,
		levels: NINE_LEVELS(
			'basic state transitions',
			'workflows & validation',
			'composite states',
			'distributed systems'
		),
		load: () => import('./examples/state.js')
	},
	{
		slug: 'journey',
		name: 'Journey',
		deck: 'User journeys — from simple visits to multi-month experiences',
		placeholder: 'journey\n    title Customer Journey\n    section Step\n      Task: 5: Actor',
		patterns: 'Customer journey patterns',
		storageKey: 'mermaid-journey-diagrams',
		maxLevel: 9,
		levels: NINE_LEVELS(
			'simple linear journeys',
			'multi-actor experiences',
			'complex multi-stage flows',
			'long-term enterprise journeys'
		),
		load: () => import('./examples/journey.js')
	},
	{
		slug: 'class',
		name: 'Class',
		deck: 'Object-oriented systems — from simple classes to ML platforms',
		placeholder: 'classDiagram\n    class MyClass\n        +property\n        +method()',
		patterns: 'OOP design patterns',
		storageKey: 'mermaid-class-diagrams',
		maxLevel: 9,
		levels: NINE_LEVELS(
			'basic OOP concepts',
			'domain modeling',
			'enterprise patterns',
			'data & ML platforms'
		),
		load: () => import('./examples/class.js')
	},
	{
		slug: 'swimlane',
		name: 'Swimlane',
		deck: 'Multi-actor processes — from simple handoffs to enterprise workflows',
		placeholder: 'graph TB\n    subgraph Actor1\n        A[Step]\n    end',
		patterns: 'Process flow patterns',
		storageKey: 'mermaid-swimlane-diagrams',
		maxLevel: 9,
		levels: NINE_LEVELS(
			'simple 2-3 lane flows',
			'multi-lane with loops',
			'parallel paths & sync',
			'enterprise workflows'
		),
		load: () => import('./examples/swimlane.js')
	}
];

export const findDiagram = (slug) => diagrams.find((d) => d.slug === slug);
