# The Gangway — mechanics

The reference staging, first proven on a course page (enroll + download the syllabus). Framework-neutral rules first, then the same thing in Svelte 5 and React. Translate to the repo's own stack, tokens, and copy language — these are mechanics, not styles.

## Rules the code must keep

| Rule                                     | Why                                                                                          |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Scene is **derived** from state          | `open ? 'field-'+open : done ? 'done' : 'buttons'` — one source of truth                     |
| Re-key the wrapper on the scene          | changing scene is what triggers the fade; an error inside a scene does not re-fade           |
| All scenes in **one grid cell**          | `grid` parent, each scene `col-start-1 row-start-1` — outgoing and incoming overlap, no jump |
| In slower than out, in delayed           | ≈260ms in / 90ms delay, ≈140ms out: the old scene is gone before the new one reads           |
| Reduced motion → duration 0              | read the media query; never animate for someone who asked not to                             |
| Autofocus the revealed field             | the click was the request; use an attach/ref callback, not the `autofocus` attr              |
| Esc on the **input**, Cancel as a link   | key handlers on a `<form>` fail a11y lint; Cancel is secondary, never a big button           |
| Shared `email` across actions            | the encore calls the second action directly when the email is already known                  |
| `sending` guard + progress verb          | "Enrolling…" on the submit; no double posts; never `disabled` as validation                  |
| Error in `role="alert"` inside the scene | the visitor stays where they typed                                                           |

## Svelte 5

```svelte
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';

	type Action = 'enroll' | 'download';
	let open = $state<Action | null>(null);
	let email = $state('');
	let sending = $state(false);
	let error = $state('');
	let enrolled = $state(false);
	let downloaded = $state(false);

	const scene = $derived(open ? `field-${open}` : enrolled || downloaded ? 'done' : 'buttons');
	const enter = $derived({ duration: prefersReducedMotion.current ? 0 : 260, delay: 90 });
	const leave = $derived({ duration: prefersReducedMotion.current ? 0 : 140 });
	const focus = (el: HTMLInputElement) => el.focus();

	async function run(action: Action) {
		if (sending) return;
		sending = true;
		error = '';
		try {
			await (action === 'enroll' ? enroll() : download()); // each sets its own flag
			open = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong.';
		} finally {
			sending = false;
		}
	}
	// The encore: email already known → act at once, no second field.
	const start = (a: Action) => (email && (enrolled || downloaded) ? run(a) : (open = a));
</script>

<div class="grid">
	{#key scene}
		<div class="col-start-1 row-start-1" in:fade={enter} out:fade={leave}>
			{#if open}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						run(open!);
					}}
					novalidate
				>
					<label for="cta-email">Your email to save your seat.</label>
					<input
						id="cta-email"
						type="email"
						bind:value={email}
						autocomplete="email"
						{@attach focus}
						onkeydown={(e) => e.key === 'Escape' && (open = null)}
					/>
					<button type="submit">{sending ? 'Enrolling…' : 'Enroll →'}</button>
					<button type="button" onclick={() => (open = null)}>Cancel</button>
				</form>
			{:else if enrolled || downloaded}
				<!-- outcome line, next-step promise, then the other action via start() -->
			{:else}
				<button onclick={() => start('enroll')}>Enroll in the course →</button>
				<button onclick={() => start('download')}>Download syllabus ↓</button>
			{/if}
			{#if error}<p role="alert">{error}</p>{/if}
		</div>
	{/key}
</div>
```

## React

Same scene derivation. Key the scene wrapper (`<div key={scene} className="cta-scene">`) inside a `grid` parent and fade with CSS instead of a transition library:

```css
.cta-scene {
	grid-area: 1 / 1;
	animation: cta-in 260ms 90ms both ease-out;
}
@keyframes cta-in {
	from {
		opacity: 0;
	}
}
@media (prefers-reduced-motion: reduce) {
	.cta-scene {
		animation: none;
	}
}
```

React unmounts the old key at once, so there is no fade-out; that's acceptable. Only reach for a library (Motion's `AnimatePresence mode="popLayout"`) if the repo already carries one. Focus with a ref callback: `ref={(el) => el?.focus()}`.

## Backend, at minimum

`POST /api/<act>` with `{ email, <subject> }` → schema-validate and lowercase the email, rate-limit by client, refuse closed or archived subjects, record under a named source (`enroll-<slug>`, `download-<slug>`) so one panel can read both lists. Test the source naming and the refusal first.
