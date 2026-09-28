// Editorial Mermaid theme — ink on paper, shared by the landing and every Restirador editor.
// Diagrams read like newspaper infographics: monochrome, sans labels, one weight of rule.
const INK = '#111111';
const PAPER = '#ffffff';
const SURFACE = '#f6f5f1';
const RULE = '#6f6d68';

export const mermaidInit = {
	startOnLoad: false,
	securityLevel: 'loose',
	theme: 'base',
	themeVariables: {
		background: 'transparent',
		fontFamily: "'Libre Franklin', 'Helvetica Neue', Arial, sans-serif",
		primaryColor: PAPER,
		primaryTextColor: INK,
		primaryBorderColor: INK,
		nodeTextColor: INK,
		lineColor: INK,
		secondaryColor: SURFACE,
		tertiaryColor: PAPER,
		edgeLabelBackground: PAPER,
		clusterBkg: SURFACE,
		clusterBorder: RULE,
		titleColor: INK,

		/* sequence */
		actorBkg: PAPER,
		actorBorder: INK,
		actorTextColor: INK,
		actorLineColor: RULE,
		signalColor: INK,
		signalTextColor: INK,
		labelBoxBkgColor: PAPER,
		labelBoxBorderColor: INK,
		labelTextColor: INK,
		loopTextColor: INK,
		noteBkgColor: SURFACE,
		noteBorderColor: RULE,
		noteTextColor: INK,
		activationBkgColor: SURFACE,
		activationBorderColor: INK,
		sequenceNumberColor: PAPER,

		/* class / state */
		classText: INK,
		transitionColor: INK,
		stateLabelColor: INK,
		stateBkg: PAPER,
		compositeBackground: SURFACE,
		compositeTitleBackground: SURFACE,
		innerEndBackground: INK,
		specialStateColor: INK,

		/* journey — warm greys, never hues */
		faceColor: PAPER,
		taskTextColor: INK,
		taskTextOutsideColor: INK,
		taskTextLightColor: INK,
		fillType0: '#f6f5f1',
		fillType1: '#ebe9e3',
		fillType2: '#e0ddd5',
		fillType3: '#f1efe9',
		fillType4: '#d6d2c8',
		fillType5: '#faf9f6',
		fillType6: '#ebe9e3',
		fillType7: '#e0ddd5',
		// actor dots — ink, red pencil, then greys (journey.actorColours can't be
		// overridden: mermaid union-merges config arrays, defaults first)
		actor0: INK,
		actor1: '#b3261e',
		actor2: RULE,
		actor3: '#c9c5bb',
		actor4: '#3d3b37',
		actor5: '#8a8883'
	}
};
