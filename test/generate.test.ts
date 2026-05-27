import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generateReadme } from "../src/generate.js";
import type { ProvenanceDoc } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));

function load(name: string): ProvenanceDoc {
  return JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as ProvenanceDoc;
}

describe("generateReadme", () => {
  it("renders title from prompt.name when set", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("# Incident Summary Generator");
    expect(md).toContain("Summarize an incident timeline");
  });

  it("falls back to prompt.id when prompt.name absent", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("# experimental-rephraser");
  });

  it("renders approval badge for the current state", () => {
    expect(generateReadme(load("provenance.json"))).toContain("🟢 approved");
    expect(generateReadme(load("draft-no-evals.json"))).toContain("📝 draft");
  });

  it("includes version and eval-pass badges", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("**v1.1.0**");
    expect(md).toContain("2/3 evals passing");
  });

  it("shows '⚠ no evaluations' badge when none recorded", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("⚠ no evaluations");
  });

  it("hides the badge line when --hide-badges is set", () => {
    const md = generateReadme(load("provenance.json"), { hideBadges: true });
    expect(md).not.toContain("evals passing");
    expect(md).not.toContain("**v1.1.0**");
    // Approval section still renders the state badge — that's a separate concern.
    expect(md).toContain("## Approval");
  });

  it("renders identity block (id, version, hash, URIs)", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("**Prompt id:** `incident-summary-generator`");
    expect(md).toContain("**Version:** `1.1.0`");
    expect(md).toContain("**Hash:** `sha256:b4c2e9f3");
    expect(md).toContain("**Content URI:** https://example.com/prompts/incident-summary/v1.1.0/template.j2");
    expect(md).toContain("**Content type:** `text/jinja2`");
  });

  it("renders Approval section with policy URI", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("## Approval");
    expect(md).toContain("- **State:** 🟢 approved");
    expect(md).toContain("- **Policy:** https://policy.example.com/prompts/approval-v2");
  });

  it("renders Lineage section with parent + derivation + derived_at", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("## Lineage");
    expect(md).toContain("- **Parent:** `incident-summary-generator@1.0.0`");
    expect(md).toContain("- **Derivation:** Fine-tuned wording for SEV-2");
    expect(md).toContain("- **Derived at:** 2026-05-19T00:00:00Z");
  });

  it("reports root prompts (no lineage)", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("_This prompt has no declared parent — it is a root._");
  });

  it("renders Authorship with created/approved/reviewed", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("## Authorship");
    expect(md).toContain("- **Created by:** mirzacausevic@example.com (2026-05-19T01:00:00Z)");
    expect(md).toContain("- **Approved by:** sre-lead@example.com (2026-05-19T01:30:00Z)");
    expect(md).toContain("- **Reviewed by:** `sre-lead@example.com`, `compliance@example.com`");
  });

  it("renders Authorship with only created_by when minimal", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("- **Created by:** mirzacausevic@example.com (2026-05-26T00:00:00Z)");
    expect(md).not.toContain("**Approved by:**");
    expect(md).not.toContain("**Reviewed by:**");
  });

  it("renders Intent with purpose, in-scope, out-of-scope, models", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("## Intent");
    expect(md).toContain("**Purpose:** Summarize an incident timeline");
    expect(md).toContain("**In scope:**");
    expect(md).toContain("- production incidents");
    expect(md).toContain("**Out of scope:**");
    expect(md).toContain("- root-cause analysis");
    expect(md).toContain("**Models supported:** `claude-opus-4-*`, `claude-sonnet-4-*`");
  });

  it("renders Intent placeholder when none declared", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("_No intent metadata declared._");
  });

  it("renders Evaluations table with pass/fail markers, score, date, link", () => {
    const md = generateReadme(load("provenance.json"));
    expect(md).toContain("## Evaluations (3)");
    expect(md).toContain("| incident-summary-quality-v3 | ✅ | 0.94 | 2026-05-19 |");
    expect(md).toContain("| tone-formal-v2 | ❌ | 0.72 | 2026-05-19 |");
    expect(md).toContain("[link](https://eval.example.com/runs/1.1.0-b)");
  });

  it("renders Evaluations placeholder when empty", () => {
    const md = generateReadme(load("draft-no-evals.json"));
    expect(md).toContain("## Evaluations (0)");
    expect(md).toContain("_No evaluations recorded._");
  });

  it("renders eval with unknown passed/score/ran_at as em-dash", () => {
    const md = generateReadme({
      provenance_version: "0.1",
      prompt: { id: "x", version: "1", hash: "sha256:0" },
      authorship: { created_by: "a", created_at: "2026-01-01T00:00:00Z" },
      approval: { state: "draft" },
      evaluations: [{ suite: "unknown-suite" }]
    });
    expect(md).toContain("| unknown-suite | — | — | — | — |");
  });

  it("falls through unknown approval state to raw label", () => {
    const md = generateReadme({
      provenance_version: "0.1",
      prompt: { id: "x", version: "1", hash: "sha256:0" },
      authorship: { created_by: "a", created_at: "2026-01-01T00:00:00Z" },
      approval: { state: "weirdstate" as unknown as "draft" }
    });
    expect(md).toContain("weirdstate");
  });

  it("renders only filled intent fields", () => {
    const md = generateReadme({
      provenance_version: "0.1",
      prompt: { id: "x", version: "1", hash: "sha256:0" },
      authorship: { created_by: "a", created_at: "2026-01-01T00:00:00Z" },
      approval: { state: "draft" },
      intent: { purpose: "Just a purpose" }
    });
    expect(md).toContain("**Purpose:** Just a purpose");
    expect(md).not.toContain("**In scope:**");
    expect(md).not.toContain("**Out of scope:**");
  });

  it("throws on malformed input", () => {
    expect(() => generateReadme(null as unknown as ProvenanceDoc)).toThrow();
    expect(() => generateReadme({} as ProvenanceDoc)).toThrow();
    expect(() => generateReadme({ prompt: {} } as unknown as ProvenanceDoc)).toThrow();
    expect(() => generateReadme({ prompt: { id: "a" }, approval: { state: "draft" } } as unknown as ProvenanceDoc)).toThrow();
  });
});
