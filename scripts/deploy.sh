#!/usr/bin/env bash
#
# Deploy vandeley.art on icarus: build aside → stop → swap build → start.
#
#   npm run deploy                  # deploy HEAD
#   npm run deploy -- --revisar     # only show what would ship; touch nothing
#   npm run deploy -- --sucio       # deploy even with uncommitted changes
#   npm run deploy -- --revertir    # go back to the previous build (build.prev)
#
# Why not "npm run build && systemctl restart": the unit runs build/index.js from
# this directory, and `vite build` deletes the old chunks in build/ while the old
# process still serves them. The first request for one crashes it (ENOENT); it
# happened here on 2026-09-22. So we build into build.next with prod up, and the
# outage shrinks to node's startup: stop → mv → start.
#
# No database here: unlike creta-website, there is nothing to back up first.
#
set -euo pipefail

main() {
	cd "$(dirname "$0")/.."

	SERVICIO=arquitectura
	PUERTO=3065

	paso() { printf '\n\033[1m→ %s\033[0m\n' "$*"; }
	falla() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

	REVISAR=0 SUCIO=0 REVERTIR=0
	for arg in "$@"; do
		case "$arg" in
		--revisar) REVISAR=1 ;;
		--sucio) SUCIO=1 ;;
		--revertir) REVERTIR=1 ;;
		*) falla "usage: npm run deploy [-- --revisar | --sucio | --revertir]" ;;
		esac
	done

	if [ "$REVERTIR" = 1 ]; then
		[ -d build.prev ] || falla "no build.prev to go back to"
		paso "Going back to build.prev ($(cat build.prev/.commit 2>/dev/null || echo '?'))"
		cambiar_build build.prev build.next
		esperar_salud || falla "$SERVICIO did not answer after reverting — check journalctl -u $SERVICIO"
		exit 0
	fi

	# ── 0. What ships ─────────────────────────────────────────────────────
	# A dirty tree may hold another session's WIP: it doesn't ship by default.
	COMMIT="$(git log --oneline -1)"
	printf '\n\033[1mWhat ships\033[0m\n'
	printf '  in prod   %s\n' "$(cat build/.commit 2>/dev/null || echo 'unknown')"
	printf '  going up  %s (%s)\n' "$COMMIT" "$(git rev-parse --abbrev-ref HEAD)"
	SUCIOS="$(git status --porcelain)"
	if [ -n "$SUCIOS" ]; then
		printf '  \033[33mtree      %s uncommitted file(s)\033[0m\n' "$(echo "$SUCIOS" | wc -l)"
		echo "$SUCIOS" | sed 's/^/              /'
		[ "$SUCIO" = 1 ] || [ "$REVISAR" = 1 ] ||
			falla "dirty tree: commit, or rerun with -- --sucio if it really ships like this"
	else
		printf '  tree      clean\n'
	fi
	if [ "$(git rev-parse HEAD)" != "$(git rev-parse '@{u}' 2>/dev/null)" ]; then
		printf '  \033[33mremote    HEAD is not what origin/main has: the repo install serves origin\033[0m\n'
	fi

	# `npm install` with prod up would swap node_modules under the live process, so a
	# lockfile that disagrees with node_modules stops here for a person to decide.
	# Compared by content, not mtime: npm writes package-lock.json after
	# node_modules/.package-lock.json, so mtime flags a fresh install as stale.
	dependencias_al_dia ||
		falla "package-lock.json and node_modules disagree: run \`npm install\` and deploy again"

	if [ "$REVISAR" = 1 ]; then
		printf '\n\033[36m--revisar: nothing touched.\033[0m\n'
		exit 0
	fi

	# ── 1. Build aside, with prod serving ─────────────────────────────────
	paso "Build to build.next (prod stays up)"
	rm -rf build.next
	BUILD_OUT=build.next npm run build
	echo "$COMMIT$([ -n "$SUCIOS" ] && echo ' +dirty')" >build.next/.commit

	# ── 2. Swap and start ─────────────────────────────────────────────────
	paso "Swapping build (outage starts here)"
	cambiar_build build.next build.prev

	if esperar_salud; then
		printf '\033[32m✓ %s up with %s\033[0m\n' "$SERVICIO" "$COMMIT"
		exit 0
	fi

	# ── 3. Didn't come up: go back on its own ─────────────────────────────
	printf '\033[31m✗ no answer in 30 s; last log lines:\033[0m\n' >&2
	journalctl -u "$SERVICIO" --since '-2 min' --no-pager | tail -30 >&2
	paso "Going back to the previous build"
	cambiar_build build.prev build.next
	esperar_salud && printf '\033[33mprod is back on the previous build; the new one is in build.next\033[0m\n' >&2
	exit 1
}

# Makes $1 the build/ and keeps the current build as $2, with the service stopped.
cambiar_build() {
	sudo -n systemctl stop "$SERVICIO"
	rm -rf "$2"
	[ -d build ] && mv build "$2"
	mv "$1" build
	sudo -n systemctl start "$SERVICIO"
}

# Every package the lockfile pins is installed at that version. Optional packages
# for other platforms (@esbuild/darwin-arm64…) are rightly absent and skipped.
dependencias_al_dia() {
	node --input-type=module -e '
		import { readFileSync } from "node:fs";
		const leer = (f) => JSON.parse(readFileSync(f, "utf8")).packages;
		const lock = leer("package-lock.json");
		const instalado = leer("node_modules/.package-lock.json");
		const distintos = Object.entries(lock).filter(
			([ruta, p]) => ruta && !(p.optional && !instalado[ruta]) && instalado[ruta]?.version !== p.version
		);
		for (const [ruta] of distintos.slice(0, 5)) console.error("  differs: " + ruta);
		process.exit(distintos.length ? 1 : 0);
	'
}

# `systemctl start` returns when the process is born, not when it answers.
esperar_salud() {
	for _ in $(seq 1 30); do
		curl -fs -o /dev/null --max-time 2 "http://127.0.0.1:${PUERTO}/" && return 0
		sleep 1
	done
	return 1
}

# Everything inside functions: bash reads the script in chunks while it runs, and a
# checkout mid-run would split it. This way it is read whole before it starts.
main "$@"
