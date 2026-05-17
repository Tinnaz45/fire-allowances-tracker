# PROD Reconciliation — Governance Package

This directory holds the authoritative governance instruments for the
multi-phase PROD reconciliation effort. **All files here are governance
artefacts**: they describe decisions, scopes, rules, risks, and
readiness criteria. None of them authorise schema changes, migrations,
or production actions by themselves.

## Phases

| Phase | Scope | Status |
| ----- | ----- | ------ |
| D0 | PROD reconciliation governance package | complete |
| D1 | DEV alignment inventory, ownership matrix, scope audit | complete (carried forward in `DEV_ALIGNMENT_SCOPE.md`) |
| D2 | DEV alignment execution (bounded) | scope ratified here; execution pending |
| D3 | Rehearsal against a DEV snapshot | gated by `REHEARSAL_READINESS_CRITERIA.md` |
| D4 | PROD reconciliation | future; not authored in this package |

## Files

| File | Purpose |
| ---- | ------- |
| `BLOCKER_RESOLUTIONS.md` | Ratified decisions for blockers B-1 … B-4. |
| `D2_EXECUTION_SCOPE.md` | Exact safe / prohibited / validation / rollback scope for D2. |
| `ARCHITECTURE_ALIGNMENT_RULES.md` | Binding repo-wide architecture rules. |
| `DEV_ALIGNMENT_SCOPE.md` | DEV alignment inventory + the D2 delta against DEV. |
| `RISK_REGISTER.md` | Risk register with phase-gating effects. |
| `REHEARSAL_READINESS_CRITERIA.md` | Binary D2 → D3 readiness checklist. |
| `archive/` | Future home for archived legacy migrations (not yet populated). |

## Reading order for a new contributor

1. `BLOCKER_RESOLUTIONS.md` — what was decided and why.
2. `ARCHITECTURE_ALIGNMENT_RULES.md` — the rules now in force.
3. `DEV_ALIGNMENT_SCOPE.md` — what changes between DEV today and DEV
   after D2.
4. `D2_EXECUTION_SCOPE.md` — what the next execution PR is allowed to
   do.
5. `RISK_REGISTER.md` — open risks and their phase impact.
6. `REHEARSAL_READINESS_CRITERIA.md` — the binary gate to D3.

## Governance scope

- Documentation-only. No SQL, migration, schema, deploy, push, or
  merge action is performed by the contents of this directory.
- All authoritative decisions reference one another by file path and
  section. Reopening a ratified decision requires a new governance
  round.
