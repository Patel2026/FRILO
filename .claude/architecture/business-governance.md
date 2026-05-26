# Business Governance Architecture

## Purpose
Describe how FRILO business strategy and execution docs influence implementation.

## Current Implementation
- Business execution docs live under `rules/BUSINESS_EXECUTION/`.
- Product backlog lives under `rules/BACKLOG/`.
- Project charter lives under `rules/STRATEGY_FOUNDATION/01_PROJECT_CHARTER_FRILO.md`.
- ADRs live under `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`.

## Dependencies And Integration Points
- Technical invariants override business roadmap conflicts unless a new ADR changes them.
- Business changes can affect pricing, SLA, support, roadmap, expansion, and FRILO Suite plans.

## Known Risks
- Business docs can be aspirational while code is V1 production.
- Roadmap language must not silently override security, order, or payment invariants.

## Change Impact
Business governance changes can create downstream code, product, QA, and operations work.

## Environment-Specific Behavior
None directly; release and expansion docs can imply environment changes.
