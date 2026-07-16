#!/usr/bin/env bash
# Art Vandeley pipeline smoke tests — drives the real plugin headless and
# asserts the three promises the landing page makes:
#   1. the judge issues (or explicitly withholds) the STAMPED line
#   2. the export dock refuses unstamped cargo — and writes nothing
#   3. /hello-art keeps its format: diagram first, verbatim menu, closing line
#
# Usage: bash plugins/art-vandeley/tests/pipeline-tests.sh
# Requires: claude CLI. Each case is one headless run (~30-90s).
set -u

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
LOGDIR="${LOGDIR:-/tmp/art-vandeley-test-logs}"
trap 'rm -rf "$WORK"' EXIT
PASS=0
FAIL=0

run_claude() { # run_claude <cwd> <prompt> [extra flags...]
	local cwd="$1" prompt="$2"
	shift 2
	(cd "$cwd" && claude -p --plugin-dir "$PLUGIN_DIR" "$@" "$prompt" 2>&1)
}

check() { # check <case> <description> <grep -E pattern> <<< "$output"
	local case="$1" desc="$2" pattern="$3" output
	output="$(cat)"
	if grep -qE "$pattern" <<<"$output"; then
		echo "  ok    $desc"
		PASS=$((PASS + 1))
	else
		echo "  FAIL  $desc"
		mkdir -p "$LOGDIR"
		echo "$output" >>"$LOGDIR/$case.log"
		echo "        (full output: $LOGDIR/$case.log)"
		FAIL=$((FAIL + 1))
	fi
}

# ---------------------------------------------------------------- case 1
echo "case 1: judge issues or withholds the stamp"
DESIGN='A single module `slugify(title: string): string` — lowercases, trims,
replaces non-alphanumerics with single hyphens. Pure function, no dependencies,
one exported function, used by the blog post router to build URLs.'
OUT1="$(run_claude "$WORK" "/art-vandeley:judge this design: $DESIGN")"
# Any ruling is legitimate; the contract is: ship verdicts carry the literal
# stamp line, back-to-the-bench explicitly withholds it. Formatting may bold
# or backtick the token, so allow markdown around STAMPED.
check c1 "verdict rendered (one of the three rulings)" \
	'[Ss]hip it|[Ss]hip with conditions|[Bb]ack to the bench' <<<"$OUT1"
if grep -qiE 'back to the bench' <<<"$OUT1"; then
	check c1 "stamp explicitly withheld on back-to-the-bench" \
		'refus|no stamp|not stamp|withh[oe]ld' <<<"$OUT1"
else
	check c1 "STAMPED line present on a ship verdict" \
		'STAMPED[* `]*—' <<<"$OUT1"
fi

# ---------------------------------------------------------------- case 2
echo "case 2: export dock refuses unstamped cargo"
DOCK="$WORK/dock"
mkdir -p "$DOCK"
printf '{ "name": "dock-test", "type": "module" }\n' >"$DOCK/package.json"
git -C "$DOCK" init -q
OUT2="$(run_claude "$DOCK" \
	"/art-vandeley:export build slugify.js from this design (no judge has seen it): $DESIGN" \
	--permission-mode acceptEdits)"
# The invariant is "nothing ships without a verdict", not "export must error":
# the skill permits convening the judge in-flight and shipping on approval.
# So: either a hard refusal (no files, stamp named) or files + STAMPED line.
NEW_FILES="$(git -C "$DOCK" status --porcelain | grep -v 'package.json' || true)"
if [ -z "$NEW_FILES" ]; then
	echo "  ok    hard refusal — no files written"
	PASS=$((PASS + 1))
	check c2 "refusal names the missing stamp / sends to the bench" \
		'[Ss]tamp|judge|bench|verdict' <<<"$OUT2"
else
	echo "  info  dock convened the tribunal in-flight and shipped:"
	echo "$NEW_FILES" | sed 's/^/        /'
	check c2 "shipped cargo carries a stamp (judge's STAMPED or dock's APPROVED FOR EXPORT)" \
		'STAMPED[* `]*—|APPROVED FOR EXPORT' <<<"$OUT2"
fi

# ---------------------------------------------------------------- case 3
echo "case 3: /hello-art keeps its format"
OUT3="$(run_claude "$WORK" "/art-vandeley:hello-art")"
check c3 "leads with a mermaid flowchart" 'flowchart (LR|TD|TB)' <<<"$OUT3"
check c3 "menu line: draft a README" 'art, draft a README for this repo' <<<"$OUT3"
check c3 "menu line: diagram the architecture" "art, diagram this repo's architecture" <<<"$OUT3"
check c3 "menu line: start the pipeline" '/art-vandeley:architect' <<<"$OUT3"
check c3 "closing line intact" "[Pp]oint me at the work and I.ll draw the papers" <<<"$OUT3"

# ---------------------------------------------------------------- report
echo
echo "passed $PASS · failed $FAIL"
[ "$FAIL" -eq 0 ]
