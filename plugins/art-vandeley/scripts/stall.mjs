// Art Vandeley stall detector — the cast-off's lookout.
// UserPromptSubmit (`prompt`) counts prompts; PostToolUse on a file edit (`edit`) resets.
// On the prompt that reaches THRESHOLD with no edit in between, it prints one line of
// context suggesting lets-get-cracking. Silent otherwise, no network, and it fails open:
// any error exits 0 with no output, so a broken hook never reaches the user.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const THRESHOLD = 4;

export const NUDGE =
	`art-vandeley: ${THRESHOLD} prompts in a row with no file edited. If those turns went to ` +
	'plans, specs, or clarifying questions for something the user asked you to build, invoke ' +
	'the lets-get-cracking skill now. If they were questions, explanations, or reviews, ignore this.';

/** Next count after an event; `nudge` only on the prompt that reaches the threshold. */
export function step(count, event) {
	if (event === 'edit') return { count: 0, nudge: false };
	const next = count + 1;
	return { count: next, nudge: next === THRESHOLD };
}

function main(mode) {
	const { session_id } = JSON.parse(readFileSync(0, 'utf8'));
	const id = String(session_id ?? '').replace(/[^A-Za-z0-9_-]/g, '');
	if (!id || (mode !== 'prompt' && mode !== 'edit')) return;

	const dir = process.env.ART_VANDELEY_STATE_DIR || join(tmpdir(), 'art-vandeley-stall');
	const file = join(dir, id);
	let count = 0;
	try {
		count = Number(readFileSync(file, 'utf8')) || 0;
	} catch {}

	const r = step(count, mode);
	mkdirSync(dir, { recursive: true });
	writeFileSync(file, String(r.count));
	if (r.nudge) process.stdout.write(NUDGE);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
	try {
		main(process.argv[2]);
	} catch {}
	process.exit(0);
}
