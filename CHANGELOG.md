# Changelog

## v0.1.0 — 2026-05-26

- Initial release: `generateReadme(doc, opts?)` → Markdown for a prompt-provenance document.
- Renders title (`prompt.name` or `prompt.id`) + identity badges (approval state, version, eval pass-rate or "no evaluations" warning).
- Approval block (state badge + policy URI), Lineage block (parent / derivation / derived-at — or "root" placeholder), Authorship block (created/approved/reviewed).
- Intent block with selective rendering of purpose / in-scope / out-of-scope / models-supported.
- Evaluations table with ✅/❌ pass marker, score (2dp), ran-at date, result URI.
- CLI: `prompt-provenance-readme-generator <provenance.json> [--out FILE] [--hide-badges]`.
- Two fixtures: `provenance.json` (full incident-summary-generator v1.1.0 with lineage + 3 evals incl. 1 failure) and `draft-no-evals.json` (minimal draft with no lineage, no evals, no intent — exercises empty-state rendering).
- Third in the readme-gen trio with `agent-card-readme-generator` (A2A) and `mcp-server-readme-generator` (MCP).
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
