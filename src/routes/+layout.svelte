<script>
	import '../app.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';

	const og = {
		image: 'https://vandeley.art/og.jpg',
		alt: 'A printed sheet on a pale table, an editor’s red pencil across its corner. Set in Newsreader: “Art Vandeley — Importer of skills. Exporter of well-architected components.”'
	};

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#ffffff" />
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
	<meta property="og:url" content={new URL(page.url.pathname, 'https://vandeley.art').href} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content={og.image} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="2400" />
	<meta property="og:image:height" content="1260" />
	<meta property="og:image:alt" content={og.alt} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Art Vandeley — Importer of Skills, Exporter of Well-Architected Components"
	/>
	<meta
		name="twitter:description"
		content="Well-architected components with papers — drawn, judged, stamped. Yes, that Art Vandeley."
	/>
	<meta name="twitter:image" content={og.image} />
	<meta name="twitter:image:alt" content={og.alt} />
</svelte:head>

{@render children?.()}
