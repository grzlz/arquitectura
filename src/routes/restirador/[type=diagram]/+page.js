import { findDiagram } from '$lib/restirador/diagrams.js';

export async function load({ params }) {
	const diagram = findDiagram(params.type);
	const { defaultCode, examples } = await diagram.load();
	return { diagram, defaultCode, examples };
}
