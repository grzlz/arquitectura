// Stall detector unit tests. Run: node --test plugins/art-vandeley/tests/stall.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { step, THRESHOLD } from '../scripts/stall.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '../scripts/stall.mjs');

test('nudges once, on the prompt that reaches the threshold', () => {
	let count = 0;
	const nudges = [];
	for (let i = 1; i <= THRESHOLD + 3; i++) {
		const r = step(count, 'prompt');
		count = r.count;
		nudges.push(r.nudge);
	}
	assert.deepEqual(
		nudges.map((n, i) => (n ? i + 1 : 0)).filter(Boolean),
		[THRESHOLD]
	);
});

test('an edit resets the count, so a new stall nudges again', () => {
	let { count } = step(THRESHOLD - 1, 'prompt');
	({ count } = step(count, 'edit'));
	assert.equal(count, 0);
	for (let i = 1; i < THRESHOLD; i++) assert.equal(step(i - 1, 'prompt').nudge, false);
	assert.equal(step(THRESHOLD - 1, 'prompt').nudge, true);
});

const run = (mode, input, env) =>
	spawnSync('node', [SCRIPT, mode], { input, env: { ...process.env, ...env }, encoding: 'utf8' });

test('end to end: silent until the threshold, then one line of context', () => {
	const env = { ART_VANDELEY_STATE_DIR: mkdtempSync(join(tmpdir(), 'stall-')) };
	const input = JSON.stringify({ session_id: 'abc-123', hook_event_name: 'UserPromptSubmit' });
	const outs = [];
	for (let i = 0; i < THRESHOLD; i++) outs.push(run('prompt', input, env));
	for (const o of outs) assert.equal(o.status, 0);
	assert.deepEqual(outs.slice(0, -1).map((o) => o.stdout), Array(THRESHOLD - 1).fill(''));
	assert.match(outs.at(-1).stdout, /lets-get-cracking/);
	assert.equal(run('edit', input, env).stdout, '');
	assert.equal(run('prompt', input, env).stdout, '');
});

test('fails open: bad input exits 0 with no output', () => {
	for (const input of ['', 'not json', '{}', JSON.stringify({ session_id: '../../etc' })]) {
		const o = run('prompt', input, { ART_VANDELEY_STATE_DIR: mkdtempSync(join(tmpdir(), 'stall-')) });
		assert.equal(o.status, 0);
		assert.equal(o.stdout, '');
	}
});
