// Diagram export — SVG and PDF downloads for the Restirador editors.
// Exports re-render the diagram with labels as SVG <text>: the on-screen render uses
// <foreignObject> HTML labels, which svg2pdf, Figma, Illustrator and Inkscape all drop.
import { mermaidInit } from '$lib/mermaidTheme.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PAPER = '#ffffff';
const PDF_MARGIN = 24;
const INK = mermaidInit.themeVariables.primaryTextColor;

// Solid edges ship as stroke-dasharray:0, which SVG reads as solid but PDF as "draw nothing".
// Every edge carries .edge-pattern-solid (dotted ones too), hence the :not — chained, since
// svg2pdf splits selectors on every comma, even inside :not().
// Edge-label backgrounds ship at 50% opacity, so the edge strikes through its own label.
// Journey text labels ship white (task) or in their own section fill — invisible on paper.
const EXPORT_CSS = `
	.edge-pattern-solid:not(.edge-pattern-dotted):not(.edge-pattern-dashed) { stroke-dasharray: none; }
	.edgeLabel rect { opacity: 1; }
	text.task, text.journey-section { fill: ${INK}; }`;

// Labels as SVG text: flowchart/class/state read htmlLabels; journey has its own switch.
const TEXT_LABELS = {
	htmlLabels: false,
	flowchart: { htmlLabels: false },
	journey: { textPlacement: 'tspan' }
};

async function render(mermaid, code, labels) {
	mermaid.initialize({ ...mermaidInit, ...labels, themeCSS: EXPORT_CSS });
	try {
		return (await mermaid.render('export-diagram', code)).svg;
	} finally {
		mermaid.initialize(mermaidInit);
	}
}

// Returns a detached, self-sized <svg> on a paper background, plus its width/height.
async function renderForExport(mermaid, code, { pdf = false } = {}) {
	let svg;
	try {
		svg = await render(mermaid, code, TEXT_LABELS);
	} catch (e) {
		// Mermaid's text-label mode throws on a markdown list ("- item") inside a label.
		// SVG can keep the HTML labels; PDF can't draw them, so say why instead.
		if (pdf)
			throw new Error(
				`PDF can't set these labels as text (${e.message}). A label line starting with "- " is the usual cause — try "·", or export SVG`,
				{ cause: e }
			);
		svg = await render(mermaid, code, {});
	}

	const host = document.createElement('div');
	host.innerHTML = svg;
	const el = host.querySelector('svg');

	// Mermaid ships width="100%" + max-width; standalone files need an intrinsic size.
	const [x, y, width, height] = el
		.getAttribute('viewBox')
		.split(/[\s,]+/)
		.map(Number);
	el.setAttribute('width', width);
	el.setAttribute('height', height);
	el.removeAttribute('style');

	const bg = document.createElementNS(SVG_NS, 'rect');
	for (const [k, v] of Object.entries({ x, y, width, height, fill: PAPER })) bg.setAttribute(k, v);
	el.insertBefore(bg, el.firstChild);

	tidyText(el);
	return { el, width, height };
}

// Text-label mode leaves a few things only a browser reads right.
function tidyText(el) {
	// Mermaid's sanitizer turns "<" into the literal text "&lt;"; decode it back.
	const decoder = document.createElement('textarea');
	for (const text of el.querySelectorAll('text')) {
		const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
		while (walker.nextNode()) {
			const node = walker.currentNode;
			if (!node.data.includes('&')) continue;
			decoder.innerHTML = node.data;
			node.data = decoder.value;
		}
	}
	// The journey title: fill="" and font-size in ex, neither of which svg2pdf can read.
	for (const t of el.querySelectorAll('text[fill=""]')) t.removeAttribute('fill');
	for (const t of el.querySelectorAll('text[font-size$="ex"]'))
		t.setAttribute('font-size', `${parseFloat(t.getAttribute('font-size')) * 8}px`);
}

function save(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadSVG(mermaid, code, name) {
	const { el } = await renderForExport(mermaid, code);
	// XMLSerializer, not outerHTML: outerHTML writes HTML (<br>, &nbsp;) that isn't valid XML.
	const xml =
		'<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(el);
	save(new Blob([xml], { type: 'image/svg+xml' }), `${name}.svg`);
}

export async function downloadPDF(mermaid, code, name) {
	const [{ el, width, height }, { jsPDF }, { svg2pdf }] = await Promise.all([
		renderForExport(mermaid, code, { pdf: true }),
		import('jspdf'),
		import('svg2pdf.js')
	]);

	const pageW = width + PDF_MARGIN * 2;
	const pageH = height + PDF_MARGIN * 2;
	const doc = new jsPDF({
		unit: 'pt',
		format: [pageW, pageH],
		orientation: pageW > pageH ? 'landscape' : 'portrait'
	});

	await svg2pdf(el, doc, { x: PDF_MARGIN, y: PDF_MARGIN, width, height });

	doc.save(`${name}.pdf`);
}
