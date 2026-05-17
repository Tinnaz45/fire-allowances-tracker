# D2 — Execution Checklist (Bounded)

> **Authority:** This checklist operationalises `D2_EXECUTION_SCOPE.md`
> and `BLOCKER_RESOLUTIONS.md` (B-1 … B-4). It does **not** widen
> scope. Anything not enumerated below is **prohibited**.
>
> **Status:** authored under governance review. The checklist is
> ready to be followed in the next chat that is explicitly authorised
> to execute D2. **This document does not itself authorise D2
> execution.**
>
> **Branch convention:** D2 work lands on the integration branch the
> governance owner names at execution time. Do **not** reuse this
> governance branch (`claude/governance-blockers-resolution-i0z4w`)
> for execution — keep governance and execution diff-isolated.

---

## 0. Pre-flight (must hold before any step in §1)

- [ ] `BLOCKER_RESOLUTIONS.md` is unchanged since ratification
      (commit SHA `ae459a1` or any later commit that does not modify
      that file).
- [ ] `D2_EXECUTION_SCOPE.md` is unchanged since ratification.
- [ ] `ARCHITECTURE_ALIGNMENT_RULES.md` is unchanged since
      ratification.
- [ ] Current working tree is clean (`git status` empty) on the
      designated D2 execution branch.
- [ ] Supabase MCP project ID currently selected is the **DEV**
      project (`kctctvpobbizhkiqkgqw`). The PROD project ID
      (`wgcqzamuspuqpedqasbc`) is **not** referenced by any tool
      invocation in this chat.
- [ ] Latest `next build` from the parent branch succeeded (baseline
      green).
- [ ] No concurrent feature PR is mid-merge into the integration
      branch in the D2 window (R-14).

If any pre-flight item is `NO`, **stop**. Do not proceed.

---

## 1. Ordered execution sequence

Execute **in order**. Do not parallelise. Capture the evidence column
inline before moving to the next step.

| # | Step | Authorising clause | Mandatory evidence |
| - | ---- | ------------------ | ------------------ |
| 1 | Snapshot the DEV Supabase project via the platform backup mechanism (point-in-time or scheduled backup ≤ 24h old is acceptable). | `D2_EXECUTION_SCOPE.md` §1.2 pre-conditions; §1.5 | Backup ID + timestamp recorded in the evidence pack. |
| 2 | Run `select count(*) from fat.distance_cache;` against DEV. **Must return `0`.** If non-zero, STOP and escalate (R-03 invariant broken). | `D2_EXECUTION_SCOPE.md` §1.2 | SQL text + result captured. |
| 3 | Re-run static grep proofs from the repo root: `grep -rn "distance_cache" app/ components/ lib/`, `grep -rn "fat_distance_cache" app/ components/ lib/`, `grep -rn "from('fat_" app/ components/ lib/`, `grep -rn "public\.fat_" app/ components/ lib/`. **All four must be empty.** | `D2_EXECUTION_SCOPE.md` §3.2 | Command + (empty) output captured. |
| 4 | Edit `supabase/fat-schema.sql` to remove exactly three lines: the `create table … fat.distance_cache (…)` block (currently line 143), the `alter table fat.distance_cache enable row level security;` line (currently line 372), and the `create policy users_manage_own on fat.distance_cache …` line (currently line 386). No other edits. | `D2_EXECUTION_SCOPE.md` §1.1; `BLOCKER_RESOLUTIONS.md#B-2` | Unified diff of `supabase/fat-schema.sql`. |
| 5 | Confirm `grep -n "distance_cache" supabase/fat-schema.sql` returns empty. | `DEV_ALIGNMENT_SCOPE.md` §5 | Command + (empty) output. |
| 6 | `git mv supabase-migration-v4-distance-tables.sql docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql`. Do **not** edit the SQL body. | `D2_EXECUTION_SCOPE.md` §1.3; `BLOCKER_RESOLUTIONS.md#B-3` | `git diff --stat` showing only a rename; `sha256sum` of the file before and after the move (must match). |
| 7 | Create `docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md` containing a `SUPERSEDED — DO NOT REPLAY` notice cross-referencing `BLOCKER_RESOLUTIONS.md#B-3`. No additional files, no edits to other archive contents. | `D2_EXECUTION_SCOPE.md` §1.3 | File diff. |
| 8 | Markdown alignment edits permitted by `D2_EXECUTION_SCOPE.md` §1.4 only: trim the `fat.distance_cache` row from `docs/FAT_SCHEMA_ARCHITECTURE.md` table, adjust the "Migration notes" paragraph that mentions the superseded v1 cache to point at `BLOCKER_RESOLUTIONS.md#B-2`, and note the `payment_components` deferral cross-link `BLOCKER_RESOLUTIONS.md#B-1`. No other docs edited. `FAT_SCHEMA_AUDIT_REPORT.md` and `DISTANCE-SYSTEM-DEPLOY-REPORT.md` remain intact. | `D2_EXECUTION_SCOPE.md` §1.4 | File diff. |
| 9 | Run `next build` on the post-edit branch. **Must succeed.** | `D2_EXECUTION_SCOPE.md` §3.1 | Tail of build log + exit code. |
| 10 | Open the D2 PR. The PR body must enumerate the §1 evidence and reference `D2_EXECUTION_SCOPE.md` + `BLOCKER_RESOLUTIONS.md` by SHA. **Do not merge yet.** | `D2_EXECUTION_SCOPE.md` §5.1 | PR URL. |
| 11 | Reviewer confirms the diff is identical to the union of: three-line removal from `fat-schema.sql`, one rename, one new archive README, and the §1.4 markdown alignment. **No other files changed.** | `ARCHITECTURE_ALIGNMENT_RULES.md` §9.2; §6.5 | Reviewer sign-off comment on PR. |
| 12 | After PR merge into the integration branch, against the **DEV** Supabase project only, execute `DROP TABLE fat.distance_cache;`. | `D2_EXECUTION_SCOPE.md` §1.2 | SQL text + result. |
| 13 | Post-drop validation queries on DEV: `select 1 from information_schema.tables where table_schema='fat' and table_name='distance_cache';` (zero rows), `\dt fat.*` (expected set minus `distance_cache`), `\dp fat.*` (no orphaned policy), `\df fat.*` (`fat.set_updated_at`, `fat.increment_claim_sequence` only). | `D2_EXECUTION_SCOPE.md` §3.4 | Each query + result captured. |
| 14 | Manual smoke against DEV deployment: login round-trip; profile load + save; one Recall claim end-to-end (exercises `fat.home_address`, `fat.station_distances`, `fat.claim_groups`, `fat.recalls`); one non-Recall claim (e.g. Standby); Mark Paid toggle. **All must succeed.** The `[Claims] Payment component ledger sync warning` may or may not log — neither outcome blocks the UI. | `D2_EXECUTION_SCOPE.md` §3.1 | Manual note (and optional screenshot per check). |
| 15 | Tag the integration branch head with `d2-complete`. | `D2_EXECUTION_SCOPE.md` §5.1.1 | Tag SHA captured. |
| 16 | Assemble the final evidence pack (all artefacts from steps 1–14 plus the tag SHA from step 15) at a stable URL or path. | `D2_EXECUTION_SCOPE.md` §1.5; §5.2 | Evidence-pack location string. |

---

## 2. Stop conditions (hard halt — pause D2, escalate)

Halt immediately and convene governance review if **any** of the
following occurs at any step:

- Step 2 returns a non-zero row count.
- Step 3 returns a non-empty result for any of the four greps.
- Step 4 requires touching any line outside the three named lines.
- Step 5 returns any non-empty match.
- Step 6 produces any diff hunk beyond a pure rename.
- Step 9 build fails.
- Step 12 errors with anything other than a clean `DROP`.
- Step 13 shows an orphaned policy or an unexpected function/table.
- Step 14 surfaces a runtime regression in any of the smoke paths.
- An MCP call is observed against the PROD project ID
  (`wgcqzamuspuqpedqasbc`) at any moment in the D2 window
  (R-04 — automatic invalidation).
- Any uncoordinated edit lands on `supabase/fat-schema.sql`,
  `lib/distance/*`, or `lib/claims/ClaimsContext.js` from a
  concurrent PR (`REHEARSAL_READINESS_CRITERIA.md` §"Failure modes").
- Any reopening of B-1 … B-4 occurs in flight.

On halt: do **not** attempt to "patch through". Revert any partial
edit (see §3) and surface to governance with the captured evidence.

---

## 3. Rollback checkpoints

Each authorised action has an explicit rollback path. Rollback is
**reverse order** of execution.

| If failure after step … | Rollback action | Verification |
| ----------------------- | --------------- | ------------ |
| 4 (schema-file edit) | `git checkout -- supabase/fat-schema.sql` (pre-D2 state). No DB action taken yet. | `grep -n "distance_cache" supabase/fat-schema.sql` shows the three lines restored. |
| 6 (archive move) | `git mv` the file back to the repo root. SQL body is byte-identical (sha256 verified). | `ls supabase-migration-v4-distance-tables.sql` succeeds. |
| 7 (archive README) | `git rm` the new README. | File absent. |
| 8 (markdown alignment) | `git checkout -- docs/FAT_SCHEMA_ARCHITECTURE.md` (and any other markdown touched). | Diff against pre-D2 SHA empty. |
| 9 (build failure) | Revert all edits via `git reset --hard <pre-D2-SHA>` on the D2 branch (governance owner confirms SHA). | `git diff <pre-D2-SHA> HEAD` empty. |
| 12 (live DROP) | Restore `fat.distance_cache` structurally from the canonical pre-D2 commit of `supabase/fat-schema.sql` replayed against the DEV project; **and** restore from the snapshot taken at step 1 if the DROP is suspected to have been preceded by any write (effectively impossible per R-03 invariant). | Post-restore `select count(*) from fat.distance_cache;` returns `0`; `\dp fat.*` shows the `users_manage_own` policy restored. |
| 13–14 (validation regressions) | Investigate without further DDL action. If a runtime caller is discovered (R-03 invariant broken in retrospect), restore the table per row above and reopen B-2. | Caller catalogued in `RISK_REGISTER.md`; B-2 reopened via new governance round. |

**Invalidates rollback confidence** (see `D2_EXECUTION_SCOPE.md`
§4.3):

- Any uncaptured DEV write between step 1 (snapshot) and step 12
  (drop).
- A failed `next build` after step 4 that is "fixed" by editing
  anything outside `supabase/fat-schema.sql`.
- Any accidental connection to PROD at any moment.

---

## 4. Validation commands / processes (canonical)

Reviewers MUST run and capture the output of every command below
after step 13. **Each must produce the result column.** No
interpretation is required; the output is binary.

| Command | Expected result |
| ------- | --------------- |
| `grep -rn "distance_cache" app/ components/ lib/` | empty |
| `grep -rn "fat_distance_cache" app/ components/ lib/` | empty |
| `grep -rn "from('fat_" app/ components/ lib/` | empty |
| `grep -rn "public\.fat_" app/ components/ lib/` | empty |
| `grep -rn "distance_cache" supabase/` | empty |
| `ls supabase-migration-*.sql` 2>&1` | `No such file or directory` |
| `ls docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql` | path printed |
| `ls docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md` | path printed |
| `sha256sum docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql` | matches pre-move sha256 captured at step 6 |
| `next build` on the post-merge integration branch | exits 0 |
| Supabase: `select 1 from information_schema.tables where table_schema='fat' and table_name='distance_cache';` | 0 rows |
| Supabase: `\dt fat.*` | all canonical FAT tables, **without** `distance_cache` |
| Supabase: `\dp fat.*` | RLS policies present for each remaining FAT table; no policy referencing `distance_cache` |
| Supabase: `\df fat.*` | exactly `fat.set_updated_at`, `fat.increment_claim_sequence` |
| Vercel deployment history during the D2 window | no PROD alias activity |

---

## 5. Prohibited actions (hard list — re-stated for the executor)

Any of the following in a D2 changeset is grounds for **immediate
rejection** and rollback:

- Any `ALTER TABLE`, `CREATE TABLE`, `CREATE VIEW`, `CREATE
  FUNCTION`, `CREATE TRIGGER`, `CREATE POLICY`, `GRANT`, `REVOKE`,
  `RENAME`, or `SET SCHEMA` statement in DEV or PROD.
- Any `DROP` other than the single `DROP TABLE fat.distance_cache`
  in DEV.
- Any edit under `app/`, `components/`, `lib/`, `pages/`,
  `supabase/` (other than the three-line removal in
  `fat-schema.sql`), `package.json`, `package-lock.json`,
  `next.config.*`, `.eslintrc*`, `.prettierrc*`,
  `tsconfig.json`, `.github/`, or any CI configuration.
- Any modification of the defensive try/catch in
  `lib/claims/ClaimsContext.js#updatePaymentStatus`
  (`BLOCKER_RESOLUTIONS.md#B-1`).
- Any creation, deletion, or edit of an edge function under
  `supabase/functions/` (none exist today; none must appear).
- Any introduction of `fat.payment_components` DDL or back-fill in
  any form (`BLOCKER_RESOLUTIONS.md#B-1`).
- Any new RPC, view, materialised view, or function in `fat.*`.
- Any change to `fat.stations` seed data.
- Any work on `public.*` other than reading `public.profiles` at
  runtime.
- Any MCP call selecting the PROD project ID
  (`wgcqzamuspuqpedqasbc`).
- Any Vercel deploy command, alias switch, or environment-variable
  change targeting the PROD project.
- Any deletion of historical reports
  (`FAT_SCHEMA_AUDIT_REPORT.md`, `DISTANCE-SYSTEM-DEPLOY-REPORT.md`).
- Any edit to the ratified governance files themselves
  (`BLOCKER_RESOLUTIONS.md`, `D2_EXECUTION_SCOPE.md`,
  `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`,
  `RISK_REGISTER.md`, `REHEARSAL_READINESS_CRITERIA.md`).
  Updates to those files require a fresh governance round.
- Any "while I'm here" cross-domain edit
  (`ARCHITECTURE_ALIGNMENT_RULES.md` §6.5).

---

## 6. Success criteria (binary — all must hold)

D2 is **complete** when and only when **every** item below is `YES`,
evidenced in the §1.5 pack, and reviewed by the governance owner.

- [ ] Steps 1 – 16 of §1 executed in order with evidence captured.
- [ ] All §2 stop conditions absent.
- [ ] All §4 validation commands produced the expected results.
- [ ] No §5 prohibited action occurred.
- [ ] `supabase/fat-schema.sql` contains zero matches for
      `distance_cache`.
- [ ] DEV Supabase: `fat.distance_cache` does not exist.
- [ ] `supabase-migration-v4-distance-tables.sql` does not exist at
      the repo root; archived copy is present and byte-identical.
- [ ] Archive `README.md` exists with the `SUPERSEDED — DO NOT
      REPLAY` notice referencing `BLOCKER_RESOLUTIONS.md#B-3`.
- [ ] `docs/FAT_SCHEMA_ARCHITECTURE.md` no longer lists
      `fat.distance_cache` as an active table; cross-links to
      `BLOCKER_RESOLUTIONS.md#B-1` and `#B-2` are present.
- [ ] `next build` succeeds on the post-merge integration branch.
- [ ] Manual smoke (login, profile, one Recall, one non-Recall,
      Mark Paid) passes.
- [ ] Integration branch head is tagged `d2-complete`.
- [ ] No PROD project ID was referenced by any tool in the D2
      window.
- [ ] No Vercel PROD deployment was triggered in the D2 window.
- [ ] R-01 status moved to `MITIGATED` in `RISK_REGISTER.md`.

Only after **all** of the above are `YES` may the executor declare
D2 complete and hand off to D3 entry review per
`D3_REHEARSAL_ENTRY_CHECKLIST.md`.

---

## 7. Cross-references

- Authorising scope: `D2_EXECUTION_SCOPE.md`
- Blocker decisions: `BLOCKER_RESOLUTIONS.md` (B-1, B-2, B-3, B-4)
- Binding rules: `ARCHITECTURE_ALIGNMENT_RULES.md`
- DEV delta inventory: `DEV_ALIGNMENT_SCOPE.md`
- Risks and gating: `RISK_REGISTER.md`
- D2 → D3 gate: `REHEARSAL_READINESS_CRITERIA.md` and
  `D3_REHEARSAL_ENTRY_CHECKLIST.md`
- Governance posture: `GOVERNANCE_VALIDATION_REPORT.md`
