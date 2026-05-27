// Generate a human-readable Markdown README from a prompt-provenance JSON document.
// Reference: https://github.com/mizcausevic-dev/prompt-provenance-spec

export type ApprovalState = "draft" | "proposed" | "approved" | "deprecated" | "revoked";

export interface ProvenanceDoc {
  provenance_version: string;
  prompt: {
    id: string;
    name?: string;
    version: string;
    hash: string;
    content_uri?: string;
    content_type?: string;
  };
  lineage?: {
    parent?: string;
    derivation?: string;
    derived_at?: string;
  };
  authorship: {
    created_by: string;
    reviewed_by?: string[];
    approved_by?: string;
    created_at: string;
    approved_at?: string;
  };
  intent?: {
    purpose?: string;
    in_scope?: string[];
    out_of_scope?: string[];
    models_supported?: string[];
  };
  evaluations?: Array<{
    suite: string;
    result_uri?: string;
    score?: number;
    passed?: boolean;
    ran_at?: string;
  }>;
  approval: {
    state: ApprovalState;
    policy_uri?: string;
  };
}

export interface GenerateOptions {
  /** Suppress the trailing badge line under the title. */
  hideBadges?: boolean;
  /** Anchor prefix for section headings. Default "section-". */
  anchorPrefix?: string;
}
