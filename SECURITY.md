# Security Policy

support-me handles wallet connections and recurring payments, so a security
report deserves a private channel rather than a public issue.

## Scope

This policy covers:

- The Soroban smart contracts under `contracts/` (`donation`,
  `creator-registry`, and the shared `common` crate), including the
  subscription/recurring-donation logic inside `donation`.
- The backend API (`backend/`), including authentication, rate limiting, and
  any route that touches wallet addresses, tokens, or payment state.
- The frontend (`frontend/`), including wallet-connection flows and any
  client-side handling of transaction signing.

A published contract security review is available at
[`docs/security/contract-security-review-2026-09.md`](docs/security/contract-security-review-2026-09.md).
It is a point-in-time review, not a substitute for reporting a newly
discovered issue.

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Please use
[GitHub's private vulnerability reporting](https://github.com/ssupportme/support-me/security/advisories/new)
for this repository. This opens a private draft security advisory visible
only to you and the maintainers, where you can describe the issue, its
impact, and reproduction steps without disclosing it publicly.

If you are unable to use private vulnerability reporting for any reason,
open a minimal public issue stating only that you have a security report to
make, with no technical detail, and a maintainer will follow up to arrange a
private channel.

## What to Include

- A clear description of the vulnerability and its potential impact (e.g.
  fund loss, auth bypass, data exposure).
- Steps to reproduce, including affected contract function, API route, or
  frontend flow.
- Any proof-of-concept code, transaction, or request.
- Whether the issue is already publicly known or exploited.

## Response Expectations

- **Acknowledgement:** within 3 business days of a report.
- **Initial assessment:** within 7 business days, including a severity
  classification and an estimated timeline for a fix.
- **Disclosure:** coordinated with the reporter once a fix is available or
  merged; we ask that details not be made public before then.

## Out of Scope

- Vulnerabilities requiring physical access to a user's device.
- Social engineering targeting maintainers or users.
- Issues in third-party dependencies without a demonstrated, exploitable
  impact on this project specifically (report those upstream instead).
