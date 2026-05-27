import type { ApprovalState, GenerateOptions, ProvenanceDoc } from "./types.js";

const APPROVAL_BADGE: Record<ApprovalState, string> = {
  draft: "📝 draft",
  proposed: "🟡 proposed",
  approved: "🟢 approved",
  deprecated: "⚪ deprecated",
  revoked: "🔴 revoked"
};

function header(doc: ProvenanceDoc, opts: GenerateOptions): string {
  const lines: string[] = [];
  const title = doc.prompt.name ?? doc.prompt.id;
  lines.push(`# ${title}`);
  lines.push("");
  if (doc.intent?.purpose) lines.push(doc.intent.purpose);
  if (!opts.hideBadges) {
    const badges: string[] = [];
    badges.push(APPROVAL_BADGE[doc.approval.state] ?? doc.approval.state);
    badges.push(`**v${doc.prompt.version}**`);
    if (doc.evaluations && doc.evaluations.length > 0) {
      const passing = doc.evaluations.filter((e) => e.passed === true).length;
      badges.push(`${passing}/${doc.evaluations.length} evals passing`);
    } else {
      badges.push("⚠ no evaluations");
    }
    lines.push("");
    lines.push(badges.join("  ·  "));
  }
  lines.push("");
  lines.push(`**Prompt id:** \`${doc.prompt.id}\` · **Version:** \`${doc.prompt.version}\``);
  lines.push(`**Hash:** \`${doc.prompt.hash}\``);
  if (doc.prompt.content_uri) lines.push(`**Content URI:** ${doc.prompt.content_uri}`);
  if (doc.prompt.content_type) lines.push(`**Content type:** \`${doc.prompt.content_type}\``);
  return lines.join("\n");
}

function lineageBlock(doc: ProvenanceDoc): string {
  const l = doc.lineage;
  const lines: string[] = [`## Lineage`, ""];
  if (!l || (!l.parent && !l.derivation && !l.derived_at)) {
    lines.push("_This prompt has no declared parent — it is a root._");
    return lines.join("\n");
  }
  if (l.parent) lines.push(`- **Parent:** \`${l.parent}\``);
  if (l.derivation) lines.push(`- **Derivation:** ${l.derivation}`);
  if (l.derived_at) lines.push(`- **Derived at:** ${l.derived_at}`);
  return lines.join("\n");
}

function authorshipBlock(doc: ProvenanceDoc): string {
  const a = doc.authorship;
  const lines: string[] = [`## Authorship`, ""];
  lines.push(`- **Created by:** ${a.created_by} (${a.created_at})`);
  if (a.approved_by) {
    const when = a.approved_at ? ` (${a.approved_at})` : "";
    lines.push(`- **Approved by:** ${a.approved_by}${when}`);
  }
  if (a.reviewed_by && a.reviewed_by.length > 0) {
    lines.push(`- **Reviewed by:** ${a.reviewed_by.map((r) => `\`${r}\``).join(", ")}`);
  }
  return lines.join("\n");
}

function approvalBlock(doc: ProvenanceDoc): string {
  const lines: string[] = [`## Approval`, ""];
  lines.push(`- **State:** ${APPROVAL_BADGE[doc.approval.state] ?? doc.approval.state}`);
  if (doc.approval.policy_uri) lines.push(`- **Policy:** ${doc.approval.policy_uri}`);
  return lines.join("\n");
}

function intentBlock(doc: ProvenanceDoc): string {
  const i = doc.intent;
  const lines: string[] = [`## Intent`, ""];
  if (!i || (!i.purpose && !i.in_scope && !i.out_of_scope && !i.models_supported)) {
    lines.push("_No intent metadata declared._");
    return lines.join("\n");
  }
  if (i.purpose) {
    lines.push(`**Purpose:** ${i.purpose}`);
    lines.push("");
  }
  if (i.in_scope && i.in_scope.length > 0) {
    lines.push(`**In scope:**`);
    for (const s of i.in_scope) lines.push(`- ${s}`);
    lines.push("");
  }
  if (i.out_of_scope && i.out_of_scope.length > 0) {
    lines.push(`**Out of scope:**`);
    for (const s of i.out_of_scope) lines.push(`- ${s}`);
    lines.push("");
  }
  if (i.models_supported && i.models_supported.length > 0) {
    lines.push(`**Models supported:** ${i.models_supported.map((m) => `\`${m}\``).join(", ")}`);
  }
  return lines.join("\n").trimEnd();
}

function evaluationsBlock(doc: ProvenanceDoc): string {
  const evals = doc.evaluations ?? [];
  const lines: string[] = [`## Evaluations (${evals.length})`, ""];
  if (evals.length === 0) {
    lines.push("_No evaluations recorded._");
    return lines.join("\n");
  }
  lines.push(`| suite | passed | score | ran at | result |`);
  lines.push(`|---|---|---|---|---|`);
  for (const e of evals) {
    const pass = e.passed === true ? "✅" : e.passed === false ? "❌" : "—";
    const score = e.score === undefined ? "—" : e.score.toFixed(2);
    const ran = e.ran_at ? e.ran_at.slice(0, 10) : "—";
    const link = e.result_uri ? `[link](${e.result_uri})` : "—";
    lines.push(`| ${e.suite} | ${pass} | ${score} | ${ran} | ${link} |`);
  }
  return lines.join("\n");
}

export function generateReadme(doc: ProvenanceDoc, opts: GenerateOptions = {}): string {
  if (!doc || !doc.prompt || !doc.approval || !doc.authorship) {
    throw new Error("input must be a valid prompt-provenance document");
  }
  const sections = [
    header(doc, opts),
    approvalBlock(doc),
    lineageBlock(doc),
    authorshipBlock(doc),
    intentBlock(doc),
    evaluationsBlock(doc)
  ];
  return sections.join("\n\n").trimEnd() + "\n";
}
