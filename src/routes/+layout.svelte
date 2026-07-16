<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0d0b09" />
	<meta
		name="description"
		content="Well-architected components with papers — drawn at the drafting table, tried by the tribunal, stamped at the dock. Yes, that Art Vandeley."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Art Vandeley" />
	<meta
		property="og:title"
		content="Art Vandeley — Importer of Skills, Exporter of Well-Architected Components"
	/>
	<meta
		property="og:description"
		content="Well-architected components with papers — drawn at the drafting table, tried by the tribunal, stamped at the dock. Yes, that Art Vandeley."
	/>
	<meta property="og:url" content="https://vandeley.art/" />
	<meta property="og:image" content="https://vandeley.art/og.png" />
	<meta property="og:image:width" content="2400" />
	<meta property="og:image:height" content="1260" />
	<meta
		property="og:image:alt"
		content="Drafting sheet DWG № AV-001 — Importer of skills. Exporter of well-architected components. Stamped: approved for export."
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Art Vandeley — Importer of Skills, Exporter of Well-Architected Components"
	/>
	<meta
		name="twitter:description"
		content="Well-architected components with papers — drawn, judged, stamped. Yes, that Art Vandeley."
	/>
	<meta name="twitter:image" content="https://vandeley.art/og.png" />
</svelte:head>

{@render children?.()}
