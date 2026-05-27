# Security Policy

`prompt-provenance-readme-generator` is a pure-transform library and CLI: it reads a prompt-provenance JSON file and emits Markdown. No network listener, no remote fetch, no execution of user-supplied code.

The input may include internal prompt content URIs, approver identities, and evaluation result URIs that are sensitive in your environment. The Markdown output includes those values verbatim — be deliberate about where you publish the rendered README.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/prompt-provenance-readme-generator/security/advisories/new)

Do not file public issues for security reports.
