<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.1
Modified principles: none
Added sections: Project Standards (design tokens, responsive/PWA targets)
Removed sections: none
Templates reviewed:
  ✅ .specify/templates/plan-template.md — "Technical Context" Target Platform and Constraints fields now carry these standards; no template change needed
  ✅ .specify/templates/spec-template.md — FR and SC sections can reference these standards by citation; no template change needed
  ✅ .specify/templates/tasks-template.md — no changes needed; task content derives from spec/plan
  ✅ .specify/templates/checklist-template.md — no changes needed
Follow-up TODOs:
  - specs/001-login-page/plan.md Constitution Check: add row for new Project Standards (IX, X) — mark PASS
-->

# Smart Workout Tracker Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

The specification is the authoritative source of truth for every feature. Implementation MUST
satisfy the spec as written — it MUST NOT reinterpret, extend, or narrow scope without first
amending the spec. Every feature MUST specify the **what** and **why** before the **how**.

Any change to observable behavior MUST begin with a spec update. If the code and spec disagree,
the conflict MUST be resolved — either fix the code or amend the spec — before development
continues. Stale or misleading specs MUST be updated or archived; they MUST NOT be left in place.

### II. Clarify Before Planning

All critical open questions MUST be resolved before planning begins. Use `/speckit.clarify` to
surface and answer ambiguities in requirements. No implementation work MAY begin while unresolved
questions remain that could materially affect architecture, data model, or user behavior.

Ambiguity discovered during planning or implementation MUST be escalated back to the spec before
proceeding. Assumptions that fill in missing requirements MUST be documented explicitly in the
spec as `[NEEDS CLARIFICATION]` entries or resolved immediately.

### III. Stable Requirements Before Architecture

Use `/speckit.plan` only after requirements are stable enough to guide architectural decisions.
A plan produced against a moving spec wastes effort and creates drift. If requirements shift
materially after a plan exists, the plan MUST be revised before tasks are generated or
implementation continues.

### IV. Traceability (NON-NEGOTIABLE)

Every task MUST trace back to at least one functional requirement and one acceptance criterion
in the spec. Tasks without clear traceability MUST NOT be implemented. The tasks file MUST
be organized by user story to enable independent delivery and verification of each story.

### V. Behavior-Driven Testing

Tests MUST be derived from the spec's acceptance criteria and MUST validate user-visible
behavior — not internal implementation details. A feature is complete only when all tests
pass **and** the spec's acceptance criteria are demonstrably satisfied. Tests that do not
map to a user story or acceptance criterion provide no governance value.

### VI. Simplicity Over Cleverness

Prefer the simplest solution that satisfies the spec's requirements. Clever abstractions,
premature generalization, and over-engineering MUST be justified against a concrete current
need. YAGNI applies: do not build for hypothetical future requirements not present in the spec.
Complexity MUST be documented in the plan's Complexity Tracking section with explicit rationale.

### VII. Holistic Quality During Planning

Security, accessibility, performance, and error handling are not afterthoughts. These MUST be
considered and documented during `/speckit.plan`, not retrofitted after implementation.
The plan MUST include: threat/risk assessment, accessibility requirements, performance goals
and constraints, and error handling strategy. Features that omit these are incomplete plans.

### VIII. Spec-Gated Review

Generated or AI-assisted code MUST be reviewed against the spec before acceptance. The review
MUST confirm that: (a) all acceptance criteria are satisfied, (b) no undocumented behavior was
introduced, and (c) the implementation does not exceed the scope defined in the spec. Code that
passes tests but fails the spec review MUST be revised.

## Project Standards

These are app-wide technical constraints that apply to every feature. Plans and specs MUST
reference them rather than redefining them per feature.

### IX. Global Design Tokens (NON-NEGOTIABLE)

`src/app/globals.css` is the single source of truth for the application's color palette and
theme tokens. The file `docs/styles.css` is reference material used to seed it — it is NOT
the canonical source. Once the tokens are established in `globals.css`, all features MUST
reference that file exclusively. No feature MAY redefine, duplicate, or override these tokens
in a feature-scoped stylesheet. Dark mode and light mode MUST be implemented exclusively via
the `prefers-color-scheme` media query using these tokens.

### X. Responsive Design & PWA Targets (NON-NEGOTIABLE)

The application MUST be adaptive across two required viewport sizes:
- **Mobile portrait**: 390px width (iPhone 14/15 baseline)
- **Desktop**: 1280px width (standard baseline)

Layouts MUST reflow gracefully between these sizes with no horizontal scrolling. Landscape
orientation on mobile is explicitly out of scope until otherwise amended.

The app MUST be installable as a Progressive Web App (PWA) on iOS Safari via "Add to Home
Screen". To achieve a native feel:
- `display: standalone` MUST be set in the web app manifest to remove browser chrome
- Touch targets MUST be ≥ 44×44pt for all interactive elements
- No interaction MAY rely solely on hover state; all affordances MUST work on tap/focus
- `theme_color` in the manifest MUST reference the `--primary` design token
- The root layout MUST include `<meta name="viewport" content="width=device-width, initial-scale=1">`

Every plan MUST include a Responsive Design & PWA section in its Quality Plan confirming
compliance with these targets. Deviations require explicit justification in Complexity Tracking.

## Quality Gates

Every feature MUST clear the following gates before the corresponding phase proceeds:

**Before Planning** (`/speckit.plan`):
- Spec defines goals, non-goals, acceptance criteria, edge cases, and success criteria
- All critical open questions are resolved or documented with explicit assumptions
- User stories are prioritized and independently testable

**Before Task Generation** (`/speckit.tasks`):
- Plan documents architecture rationale, tradeoffs, risks, and dependencies
- Plan includes test strategy and quality requirements (security, a11y, performance, error handling)
- Plan's Constitution Check passes with no unresolved violations

**Before Implementation** (`/speckit.implement`):
- Every task is small, actionable, and traced to a requirement and acceptance criterion
- Tasks are grouped by user story and ordered by dependency
- Foundational tasks are separated from story tasks with explicit checkpoints

**Before Acceptance**:
- All tests derived from spec acceptance criteria pass
- No spec acceptance criterion is left unverified
- Spec-gated review confirms no scope creep or undocumented behavior
- If tests were not requested, manual verification against each acceptance criterion is documented

## Governance

This constitution supersedes all informal practices and takes precedence over individual
preference in AI-assisted development sessions.

**Amendments**:
- MUST update the spec before changing behavior, scope, or requirements
- MUST increment the constitution version following semantic versioning:
  - MAJOR: principle removal, redefinition, or backward-incompatible governance change
  - MINOR: new principle, new section, or materially expanded guidance
  - PATCH: clarifications, wording improvements, or non-semantic refinements
- MUST update the Sync Impact Report (HTML comment at top of this file) on every amendment
- MUST propagate relevant changes to plan, spec, and tasks templates

**Compliance**:
- All pull requests and AI-assisted implementation sessions MUST verify constitution compliance
- Violations MUST be documented in the plan's Complexity Tracking section with justification
- Unjustified violations are grounds to reject generated output and restart the affected phase

**Spec Lifecycle**:
- Scope changes MUST revise the spec before revising the plan or tasks
- Stale specs MUST be archived or updated — they MUST NOT remain as misleading active documents
- Specs for abandoned features MUST be moved to an `archive/` subdirectory with a note explaining
  why the feature was not completed

**Version**: 1.1.1 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
