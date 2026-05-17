# D3 — Rehearsal Entry Checklist

> **Purpose:** the binary gate that authorises a chat to begin D3
> (rehearsal of the PROD reconciliation script against a DEV
> snapshot). It composes `REHEARSAL_READINESS_CRITERIA.md` and the
> §5 prerequisites from `D2_EXECUTION_SCOPE.md` into a single, dated,
> signed instrument.
>
> **D3 does not begin until every item below is `YES`, evidenced, and
> the §6 approval block is signed by the governance owner.** "Mostly
> ready" is invalid. Any later `NO` revokes readiness and forces a
> re-run (`REHEARSAL_READINESS_CRITERIA.md` §"Failure modes").
>
> **D3 itself is out of scope of this document.** This checklist
> only governs the **transition** into D3.

---

## 1. Required approvals

| Approval | Holder | Form |
| -------- | ------ | ---- |
| D2 completion sign-off | governance owner | written sign-off on the D2 PR referencing the `d2-complete` tag SHA |
| D3 entry sign-off | governance owner | dated signature block in §6 of this document, referencing the evidence-pack location by SHA |
| Snapshot identification sign-off | governance owner | named DEV snapshot ID + creation timestamp recorded in §3 |

- The two sign-offs may be combined into a single message, but each
  must be explicit.
- A reviewer who has authored D2 execution code may **not** sign D3
  entry — at least one independent reviewer is required for the D3
  sign-off (segregation of execution and approval).
- D3 entry sign-off becomes **stale at 72 hours**
  (`REHEARSAL_READINESS_CRITERIA.md` §I bullet 3). Past 72 hours, the
  checklist must be re-run.

---

## 2. Required evidence pack (D2 carry-forward + D3-specific)

The D3 entry brief must include, in one bundle:

| # | Artefact | Source |
| - | -------- | ------ |
| 1 | Full D2 evidence pack | `D2_EXECUTION_CHECKLIST.md` §1.5 |
| 2 | Diff of `supabase/fat-schema.sql` between pre-D2 SHA and `d2-complete` SHA | git |
| 3 | sha256sum verification of the archived v4 SQL (pre-move = post-move) | step 6 of `D2_EXECUTION_CHECKLIST.md` |
| 4 | Post-D2 `next build` log tail | `D2_EXECUTION_CHECKLIST.md` step 9 |
| 5 | Post-D2 manual smoke notes | `D2_EXECUTION_CHECKLIST.md` step 14 |
| 6 | DEV Supabase post-drop `\dt fat.*`, `\dp fat.*`, `\df fat.*` outputs | `D2_EXECUTION_CHECKLIST.md` step 13 |
| 7 | D3 entry brief (see §4) | authored fresh per D3 attempt |
| 8 | Updated `RISK_REGISTER.md` showing R-01 = `MITIGATED` | git |
| 9 | DEV snapshot identifier used for the rehearsal (see §3) | Supabase project console / MCP backup metadata |
| 10 | `REHEARSAL_READINESS_CRITERIA.md` ticked + linked to evidence | this repo |

---

## 3. Required snapshots / backups

- [ ] **A** DEV snapshot of the **DEV Supabase project**
      (`kctctvpobbizhkiqkgqw`) was taken **after** the `d2-complete`
      tag commit SHA. Recorded fields:
  - Snapshot ID: ______________________________________________
  - Snapshot creation timestamp (UTC): _______________________
  - Underlying commit SHA at snapshot time: __________________
  - Verified `commit SHA at snapshot time` >= `d2-complete` SHA
        (`REHEARSAL_READINESS_CRITERIA.md` §H bullet 2;
        `RISK_REGISTER.md` R-13).
- [ ] Snapshot includes the post-drop `fat.*` table set
      (`distance_cache` absent).
- [ ] Snapshot is **isolated** — rehearsal will run against the
      snapshot, **not** the live DEV project
      (`REHEARSAL_READINESS_CRITERIA.md` §H bullet 3).
- [ ] Snapshot retention is at least until the rehearsal window
      ends + 7 days (so rollback evidence stays referenceable).
- [ ] **No** PROD snapshot, PROD backup, or PROD restore is part of
      the D3 entry artefacts. PROD inspection is a D4 concern only.

---

## 4. Required D3 entry brief (authored per attempt)

A standalone document — separate from this checklist — must exist
and name **all** of the following before D3 begins
(`D2_EXECUTION_SCOPE.md` §5.2):

1. **DEV snapshot identifier** (matches §3 above).
2. **PROD-reconciliation script under test** — file path or URL,
   SHA, author, intent statement. The script itself is **not**
   authored by D3 entry; D3 only rehearses an already-drafted
   script.
3. **Rollback procedure for the rehearsal** — exact steps to
   restore the snapshot if the rehearsal mutates it, and the
   contact path if rollback fails.
4. **Success criteria for the rehearsal** — explicit predicates
   (e.g. "post-rehearsal `\dt public.fat_*` is empty",
   "post-rehearsal `select count(*) from fat.recalls` matches
   pre-rehearsal count"), not subjective judgements.
5. **Time-boxing** — the rehearsal window opens at X UTC and
   automatically closes at Y UTC; any rehearsal exceeding the
   window is halted and re-scoped.
6. **Out-of-scope reminder** — explicit re-statement that D3 does
   not touch PROD under any circumstance.

---

## 5. Rollback-readiness requirements

Before the §6 approval can be signed, the executor must demonstrate:

- [ ] The snapshot can be cloned / restored into an isolated
      rehearsal project (or equivalent isolation primitive supported
      by Supabase) without affecting the live DEV project.
- [ ] The rollback procedure named in the brief has been
      walk-through-validated on a throwaway slice (not necessarily
      executed; at minimum, the steps map to real tooling and
      privileges).
- [ ] A "halt and revert" decision threshold is named (e.g. any SQL
      step in the rehearsal script that errors → halt; any mutation
      outside the script's declared schema → halt).
- [ ] No D3 step depends on editing `lib/distance/*`,
      `lib/claims/ClaimsContext.js`, or `supabase/fat-schema.sql` —
      rehearsal is read-and-replay against a snapshot, **not** a
      runtime change.

---

## 6. Rehearsal entry blockers (any one = `NO`)

D3 **must not begin** if any of the following is true. This list is
exhaustive and binding.

- [ ] `BLOCKER_RESOLUTIONS.md` has been edited since ratification.
      (Tolerable edits: typo-only with explicit governance note. Any
      decision change = re-ratify.)
- [ ] Any of B-1 … B-4 has been reopened.
- [ ] `RISK_REGISTER.md` has an `OPEN` risk at severity `MED` or
      higher.
  - Specifically check: R-01 = `MITIGATED` (clears on D2 archive);
    R-07 = re-affirmed at D3 entry; R-13 = closed by §3 snapshot
    ID.
- [ ] `next build` does **not** pass on the post-D2 integration
      branch HEAD.
- [ ] Any commit after `d2-complete` modifies any of:
      `supabase/fat-schema.sql`, `lib/distance/*`,
      `lib/claims/ClaimsContext.js`,
      `docs/PROD_RECONCILIATION/*`.
- [ ] `docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql`
      is missing or its sha256 differs from the recorded value.
- [ ] `ls supabase-migration-*.sql` returns a file (the stale v4
      SQL must remain archived, never reintroduced).
- [ ] Any MCP call against the PROD project ID
      (`wgcqzamuspuqpedqasbc`) has occurred since `d2-complete`.
- [ ] Any Vercel PROD deploy has occurred since `d2-complete`
      without prior governance approval.
- [ ] The DEV snapshot named in §3 was taken **before**
      `d2-complete` (snapshot must be strictly after).
- [ ] The D3 entry brief (§4) is missing any of items 1 – 6.
- [ ] Governance owner approval (§7) is older than 72 hours.

If any blocker is `YES`, **stop**. Remediate, then re-run from §1.

---

## 7. Approval block (signed at entry time)

```
D3 entry approval

Governance owner: _________________________________________
Date / time (UTC): ________________________________________
Approves rehearsal of script: ____________________________
Against snapshot ID: _____________________________________
Evidence pack location: __________________________________
D2 tag SHA: ______________________________________________
Snapshot post-dates D2 tag: [YES / NO] ___________________
RISK_REGISTER.md aggregate gate met: [YES / NO] __________
Approval valid until (UTC, +72h): ________________________
```

Approval is **void** the moment any §8 invalidation condition
fires.

---

## 8. Rehearsal-invalidation conditions (during D3 window)

If **any** of the following becomes true after §7 is signed but
before or during D3 execution, readiness is **revoked**:

- A new commit lands on the integration branch that edits
  `supabase/fat-schema.sql`, `lib/distance/*`,
  `lib/claims/ClaimsContext.js`, or
  `docs/PROD_RECONCILIATION/*`.
- A new risk is opened at severity `MED` or higher in
  `RISK_REGISTER.md`.
- Any reopening of B-1 … B-4.
- Any indication of PROD touch
  (MCP, Vercel, manual psql, third-party tool).
- The DEV snapshot is deleted, expires, is mutated outside the
  rehearsal script, or is replaced.
- The rehearsal script under test is edited mid-rehearsal.
- The rehearsal exceeds its declared time-box (§4 item 5).
- `next build` against the integration branch starts failing for
  any reason.

Revocation forces: stop D3, capture state, return to §1 of this
checklist for a fresh run. **Never** "patch through" a revoked
state.

---

## 9. Post-rehearsal evidence expectations (D3 exit, recorded for D4)

After the rehearsal completes (success or halt), the following must
be captured. The D3 exit pack feeds the D4 governance round.

- [ ] Time-stamped log of every SQL statement executed against the
      snapshot.
- [ ] Per-statement result row counts / status (success / error /
      skipped).
- [ ] Diff of `\dt`, `\dp`, `\df` before vs after the rehearsal.
- [ ] Reconciliation of pre-rehearsal vs post-rehearsal row counts
      for every FAT table (`fat.*`).
- [ ] Confirmation that the PROD-reconciliation script behaved
      within its declared scope — no unexpected schema or row
      mutations.
- [ ] Time taken end-to-end (for D4 timing/maintenance-window
      planning).
- [ ] Any anomaly classified as `RISK_REGISTER.md` candidate with a
      proposed `R-NN` entry.
- [ ] Snapshot disposition (kept, archived, destroyed) recorded.
- [ ] Confirmation that no PROD action was triggered (Vercel
      history, MCP project ID audit, deploy log).
- [ ] Governance owner counter-sign on the D3 exit pack before D4
      is scoped.

---

## 10. Cross-references

- `D2_EXECUTION_CHECKLIST.md` — produces the carry-forward
  evidence required at §2.
- `D2_EXECUTION_SCOPE.md` §5 — original D3 entry prerequisites
  (consolidated here).
- `REHEARSAL_READINESS_CRITERIA.md` — granular per-area criteria
  this checklist composes.
- `RISK_REGISTER.md` — aggregate D3 gating (R-01, R-07, R-13
  specifically).
- `BLOCKER_RESOLUTIONS.md` — must remain ratified at D3 entry.
- `ARCHITECTURE_ALIGNMENT_RULES.md` — binding throughout.
- `GOVERNANCE_VALIDATION_REPORT.md` — current governance posture
  and breach record.
