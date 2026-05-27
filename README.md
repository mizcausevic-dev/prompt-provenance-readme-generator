# prompt-provenance-readme-generator

[![CI](https://github.com/mizcausevic-dev/prompt-provenance-readme-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/prompt-provenance-readme-generator/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)

Generate a human-readable Markdown README from a **prompt-provenance** JSON document (per [prompt-provenance-spec v0.1](https://github.com/mizcausevic-dev/prompt-provenance-spec)).

Third in the readme-generator trio:

- [`agent-card-readme-generator`](https://github.com/mizcausevic-dev/agent-card-readme-generator) — A2A AgentCards
- [`mcp-server-readme-generator`](https://github.com/mizcausevic-dev/mcp-server-readme-generator) — MCP server `tools/list`
- **`prompt-provenance-readme-generator`** — prompt provenance docs

Part of the [Kinetic Gain Suite](https://suite.kineticgain.com/).

---

## What it renders

| section | source |
|---|---|
| **Title + purpose** | `prompt.name` (fallback `prompt.id`), `intent.purpose` |
| **Identity badges** | approval state badge (`📝 draft` / `🟡 proposed` / `🟢 approved` / `⚪ deprecated` / `🔴 revoked`), prompt version, eval pass-rate (`2/3 evals passing` or `⚠ no evaluations`) |
| **Identity block** | id, version, hash, content URI, content type |
| **Approval** | state + policy URI |
| **Lineage** | parent ref, derivation note, derived-at — or "this is a root" if none |
| **Authorship** | created/approved/reviewed |
| **Intent** | purpose, in-scope, out-of-scope, models supported |
| **Evaluations** | suite, ✅/❌, score, ran-at, result URI |

## CLI

```bash
npx prompt-provenance-readme-generator path/to/provenance.json > README.md
```

### Options

| flag             | meaning |
|---|---|
| `--out FILE`     | Write to `FILE` instead of stdout |
| `--hide-badges`  | Suppress the identity-badge line under the title |
| `-h`, `--help`   | Print help and exit |

Exit codes:

- `0` — README emitted
- `2` — usage / I/O error or malformed document

## Library API

```ts
import { generateReadme } from "prompt-provenance-readme-generator";
import type { ProvenanceDoc } from "prompt-provenance-readme-generator";

const doc: ProvenanceDoc = JSON.parse(readFileSync("provenance.json", "utf8"));
const md = generateReadme(doc, { hideBadges: false });
```

Throws on missing `prompt`, `approval`, or `authorship` blocks.

## License

[AGPL-3.0-or-later](LICENSE)
