# Rehearsal Readiness Criteria (D2 → D3 gate)

> Binary checklist. Each item is YES or NO. Rehearsal (D3) does not
> begin until **every** item is YES, evidenced, and approved.
> "Mostly ready" is not a valid state.

---

## A. Governance state

- [ ] `BLOCKER_RESOLUTIONS.md` exists and is unchanged since
      ratification.
- [ ] B-1 decision in the document reads `DEFER` and has not been
      reopened.
- [ ] B-2 decision reads `REMOVE` and has been applied (see §C).
- [ ] B-3 decision reads `ARCHIVE` and has been applied (see §C).
- [ ] B-4 decision reads `RATIFY fat.station_distances` and is
      unchanged.

## B. Documentation state

- [ ] `D2_EXECUTION_SCOPE.md` is present and matches the executed work.
- [ ] `ARCHITECTURE_ALIGNMENT_RULES.md` is present and current.
- [ ] `DEV_ALIGNMENT_SCOPE.md` is present and reflects the executed
      delta.
- [ ] `RISK_REGISTER.md` has no `OPEN` risk at severity `MED` or
      higher.
- [ ] `docs/FAT_SCHEMA_ARCHITECTURE.md` no longer lists
      `fat.distance_cache` as an active table; cross-links to the B-1
      and B-2 resolutions are present.

## C. D2 actions completed

- [ ] `supabase/fat-schema.sql` contains zero references to
      `distance_cache` (table, RLS, policy).
- [ ] DEV Supabase project: `fat.distance_cache` does not exist.
- [ ] `supabase-migration-v4-distance-tables.sql` does not exist at the
      repository root.
- [ ] `docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql`
      exists and is byte-identical to the prior repo-root copy.
- [ ] `docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md`
      exists and contains the `SUPERSEDED — DO NOT REPLAY` notice
      referencing `BLOCKER_RESOLUTIONS.md#B-3`.

## D. Static evidence

- [ ] `grep -rn "distance_cache" app/ components/ lib/` → empty.
- [ ] `grep -rn "fat_distance_cache" app/ components/ lib/` → empty.
- [ ] `grep -rn "from('fat_" app/ components/ lib/` → empty.
- [ ] `grep -rn "public\.fat_" app/ components/ lib/` → empty.
- [ ] `grep -rn "distance_cache" supabase/` → empty.
- [ ] `ls supabase-migration-*.sql` → "No such file or directory".

## E. Runtime evidence

- [ ] `next build` completes successfully on the post-D2 branch.
- [ ] Manual smoke against DEV deployment passes for: login, profile
      load/save, one Recall claim end-to-end, one non-Recall claim.
- [ ] The Mark Paid toggle in the claim list works and the
      `[Claims] Payment component ledger sync warning` is logged (or
      not, if the ledger table is absent) without breaking the UI.

## F. Database evidence

- [ ] Pre-action row-count snapshot of `fat.distance_cache` is in the
      evidence pack and reads `0`.
- [ ] Supabase backup ID + timestamp (taken within 24h before the
      drop) is in the evidence pack.
- [ ] Post-action `\dt fat.*` lists the expected set with
      `fat.distance_cache` absent.
- [ ] Post-action `\dp fat.*` shows no orphaned policy.

## G. Production isolation evidence

- [ ] No MCP call targeted the PROD project (`wgcqzamuspuqpedqasbc`)
      during the D2 window.
- [ ] No Vercel PROD deployment was triggered during the D2 window.
- [ ] No PROD backup, restore, or schema diff was executed.
- [ ] No PROD read query was executed via any tool.

## H. Rehearsal-specific prerequisites

- [ ] D3 entry brief is authored and names: the DEV snapshot ID, the
      PROD-reconciliation script under test, the rollback procedure
      for the rehearsal, and the success criteria for the rehearsal.
- [ ] DEV snapshot used for rehearsal was taken **after** D2
      completion (commit SHA of the snapshot post-dates the D2 merge
      commit).
- [ ] Rehearsal will run on a DEV snapshot, not on the live DEV
      project (snapshot isolation confirmed).
- [ ] R-07 reaffirmed: no new reporting code began depending on
      `fat.payment_components` since D2.
- [ ] R-13 closed: snapshot ID recorded.

## I. Approval

- [ ] Governance owner has signed off on this checklist by commit SHA
      reference.
- [ ] Approval references the evidence pack location.
- [ ] Approval is dated and is not older than 72 hours at D3 entry
      time.

---

## Failure modes that immediately invalidate readiness

If **any** of the following becomes true after the checklist is
ticked but before D3 begins, readiness is revoked and the checklist
must be re-run:

- A new commit lands on the integration branch that edits
  `supabase/fat-schema.sql`, `lib/distance/*`, or
  `lib/claims/ClaimsContext.js`.
- A new risk is opened at severity `MED` or higher.
- Any reopening of B-1…B-4.
- Any indication of PROD touch.
- Any failed `next build`.
- The DEV snapshot expires, is deleted, or is replaced.
