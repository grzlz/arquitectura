<script module>
	// Drafts outlive the editor: switching type and back restores what you were writing.
	const drafts = {};
</script>

<script>
	// One Restirador editor — source, compiled figure, exports, patterns, saved diagrams.
	// The page remounts it per type ({#key}), so props are read once, at mount.
	import { onMount, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { mermaidInit } from '$lib/mermaidTheme.js';
	import { downloadSVG, downloadPDF } from '$lib/diagramExport.js';
	import Patterns from './Patterns.svelte';
	import SavedDiagrams from './SavedDiagrams.svelte';

	let { diagram, defaultCode, examples } = $props();
	const { slug, name, placeholder, storageKey } = untrack(() => diagram);

	let mermaid;
	let diagramCode = $state(drafts[slug] ?? untrack(() => defaultCode));
	let savedDiagrams = $state([]);
	let currentName = $state('');
	let error = $state('');
	let feedback = $state(''); // 'saved' | 'copied' | 'copy-failed'
	let saveError = $state('');
	let dirty = $state(false);
	let exporting = $state(''); // 'svg' | 'pdf'
	let exportError = $state('');
	let renderedCode = ''; // last code that compiled — what the preview shows, and what exports
	let feedbackTimer;

	$effect(() => {
		drafts[slug] = diagramCode;
	});

	function flash(state) {
		feedback = state;
		clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => (feedback = ''), 1800);
	}

	function handleKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			renderDiagram();
		}
	}

	onMount(async () => {
		if (!browser) return;
		mermaid = (await import('mermaid')).default;
		mermaid.initialize(mermaidInit);
		await document.fonts.ready;

		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) savedDiagrams = JSON.parse(saved);
		} catch {
			/* localStorage unavailable */
		}

		renderDiagram();
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
			renderedCode = diagramCode;
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

	function load(code) {
		diagramCode = code;
		renderDiagram();
	}

	function persist() {
		localStorage.setItem(storageKey, JSON.stringify(savedDiagrams));
	}

	function saveDiagram() {
		if (!currentName.trim()) {
			saveError = 'Enter a name to save';
			document.getElementById('diagram-name')?.focus();
			return;
		}

		savedDiagrams = [
			...savedDiagrams,
			{ name: currentName.trim(), code: diagramCode, timestamp: new Date().toISOString() }
		];
		try {
			persist();
		} catch {
			saveError = 'Could not save — this browser blocks local storage';
			return;
		}
		saveError = '';
		currentName = '';
		flash('saved');
	}

	function deleteDiagram(index) {
		savedDiagrams = savedDiagrams.filter((_, i) => i !== index);
		try {
			persist();
		} catch {
			/* ignore */
		}
	}

	async function exportAs(format) {
		if (!renderedCode || exporting) return;
		exporting = format;
		exportError = '';
		try {
			const download = format === 'pdf' ? downloadPDF : downloadSVG;
			await download(mermaid, renderedCode, currentName.trim() || `${slug}-diagram`);
		} catch (e) {
			exportError = `Export failed — ${e.message}`;
		} finally {
			exporting = '';
		}
	}

	function copyCode() {
		navigator.clipboard
			.writeText(diagramCode)
			.then(() => flash('copied'))
			.catch(() => flash('copy-failed'));
	}
</script>

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
		{#each ['svg', 'pdf'] as format (format)}
			<button
				onclick={() => exportAs(format)}
				disabled={exporting !== ''}
				class="cursor-pointer py-1 kicker text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline disabled:cursor-wait disabled:text-ink/60 disabled:no-underline"
			>
				{exporting === format ? 'Exporting…' : `Export ${format.toUpperCase()}`}
			</button>
		{/each}
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
	{#if exportError}
		<p role="alert" class="w-full kicker text-accent">{exportError}</p>
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
			oninput={() => (dirty = true)}
			onkeydown={handleKeydown}
			spellcheck="false"
			aria-labelledby="source-label"
			{placeholder}
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
			<span class="font-semibold text-ink">Fig. 1</span> — Your {name.toLowerCase()} diagram
		</figcaption>
	</figure>
</div>

<Patterns {diagram} {examples} onload={load} />

<SavedDiagrams {name} saved={savedDiagrams} onload={(d) => load(d.code)} ondelete={deleteDiagram} />

<style>
	#preview :global(svg) {
		max-width: 100%;
		height: auto;
	}
</style>
