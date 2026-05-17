# Rehearsal Execution Boundary (D3)

> **Authoring chat:** D3 readiness governance review.
> **Branch:** `claude/d3-governance-readiness-review-3Q9My`.
> **Date (UTC):** 2026-05-17.
> **Authority:** composes `D3_REHEARSAL_ENTRY_CHECKLIST.md`,
> `REHEARSAL_READINESS_CRITERIA.md`,
> `ARCHITECTURE_ALIGNMENT_RULES.md`, and the disposition of
> `SCHEMA_DRIFT_ASSESSMENT.md` into one binding boundary for the
> chat that will eventually execute D3.
>
> This document is **input** to the future D3 rehearsal-execution
> chat. It does **not** authorise that chat to begin — the §6/§7
> machinery of `D3_REHEARSAL_ENTRY_CHECKLIST.md` continues to gate
> that.

---

## 1. What D3 rehearsal IS allowed to do

The D3 rehearsal chat, **once readiness has been declared and the §7
approval block in `D3_REHEARSAL_ENTRY_CHECKLIST.md` is signed**, is
permitted to:

1. Read the DEV Supabase project `kctctvpobbizhkiqkgqw` **only to
   create or identify a snapshot** as defined in
   `D3_REHEARSAL_ENTRY_CHECKLIST.md` §3. Concretely: take a fresh
   snapshot **after** the `d2-complete` tag SHA, record its ID,
   creation timestamp, and underlying commit SHA in the D3 entry
   brief.
2. **Restore that snapshot into an isolated rehearsal context** —
   either a Supabase branch / clone primitive supported by the
   platform, or a separate ephemeral project. The rehearsal **must
   not** run against the live DEV project.
3. Replay a pre-authored PROD-reconciliation script **against the
   isolated snapshot** and capture, per statement:
   - SQL text;
   - timestamp;
   - row-count / status / error.
4. Capture before-vs-after diffs of `\dt fat.*`, `\dp fat.*`,
   `\df fat.*` on the snapshot.
5. Capture before-vs-after row counts for every `fat.*` table
   present in the snapshot (canonical + drift).
6. Walk through the rollback procedure named in the D3 entry brief
   on a throwaway slice (no live mutation required if the snapshot
   primitive supports clone/discard semantics).
7. Run repo-side validations (`grep`, `next build`, `sha256sum`)
   that the integration branch HEAD at `d2-complete` continues to
   pass.
8. Write the post-rehearsal evidence pack into
   `docs/PROD_RECONCILIATION/evidence/D3_REHEARSAL_EVIDENCE.md`
   (new file, governance-permitted output).
9. Commit and push the evidence pack to the rehearsal-execution
   branch named by the governance owner at execution time.

## 2. What D3 rehearsal IS NOT allowed to do

The D3 rehearsal chat **must not**:

1. **Touch PROD.** No MCP call referencing
   `wgcqzamuspuqpedqasbc`. No Vercel call against the PROD
   project, alias, or environment. No PROD backup, restore, snapshot,
   schema diff, or read query. Any single one of these voids
   readiness immediately
   (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §6 bullet "Any MCP call against
   the PROD project ID …").
2. **Mutate the live DEV project.** Rehearsal runs on the snapshot
   only. The live DEV project is untouchable for the duration of the
   window (no `apply_migration`, no `execute_sql` that writes, no
   policy edit, no grant). The only DEV interaction permitted is
   read-only operations strictly required to **identify** the
   snapshot, per §1 item 1.
3. **Modify the drift objects** enumerated in
   `SCHEMA_DRIFT_ASSESSMENT.md` §1 — `fat.friend_requests`,
   `fat.friendships`, `fat.claim_replication_events`, and the ten
   `fat.{accept|cancel|list_friend|list_friends|mark|reject|remove|replicate|search|send}_*`
   functions. They are quarantined for the rehearsal window.
4. **Edit `supabase/fat-schema.sql`.** Any commit on the
   rehearsal-execution branch that touches this file voids readiness
   (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §6 bullet "Any commit after
   `d2-complete` modifies …").
5. **Edit `lib/distance/*` or `lib/claims/ClaimsContext.js`.** Same
   gate as item 4.
6. **Edit any file under `docs/PROD_RECONCILIATION/`** except the
   new `D3_REHEARSAL_EVIDENCE.md` evidence file. Specifically not
   ratified governance files — Rule G-1 in
   `GOVERNANCE_CONFLICT_RESOLUTION.md` §6 binds the rehearsal chat
   as an execution chat.
7. **Edit the rehearsal script under test mid-rehearsal.** The
   script's SHA is recorded in the D3 entry brief; any edit revokes
   readiness (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §8 bullet "The
   rehearsal script under test is edited mid-rehearsal").
8. **Open a PR, merge, or deploy.** The rehearsal is a read-and-replay
   exercise, not a delivery vehicle.
9. **"Reconcile drift automatically."** Even if the rehearsal
   script's behaviour suggests a clean way to canonicalise or remove
   the drift objects, the rehearsal chat must record the observation
   and stop. Drift remediation is a separate governance round
   (`SCHEMA_DRIFT_ASSESSMENT.md` §8).
10. **Touch `RISK_REGISTER.md`, `BLOCKER_RESOLUTIONS.md`, or any
    other ratified governance file.** The execution chat captures
    evidence; a follow-up governance chat performs any required
    register updates (Rule G-1).
11. **Run "preview" or "speculative" PROD inspection** under any
    pretext — no `select count(*) from <PROD>.…` "just to check".

## 3. Rollback expectations

`D3_REHEARSAL_ENTRY_CHECKLIST.md` §5 requires the D3 entry brief to
name a rollback procedure **for the rehearsal**, not for D2 (D2 has
its own rollback posture per `D2_EXECUTION_CHECKLIST.md` §3).

The rehearsal rollback procedure must:

- Identify the snapshot primitive (e.g. Supabase branch, project
  clone, PITR target) sufficient to discard mutations applied during
  the rehearsal without affecting the live DEV project.
- Name the **halt-and-revert** decision threshold (any SQL step in
  the rehearsal script that errors → halt; any mutation outside the
  script's declared schema → halt;
  `D3_REHEARSAL_ENTRY_CHECKLIST.md` §5 bullet 3).
- Provide the contact path for "rollback fails" (escalation to the
  governance owner).
- Confirm walk-through validation has been completed prior to D3
  approval signing.
- Confirm the snapshot retention window covers the rehearsal window
  plus 7 days (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §3 bullet 4).

## 4. Evidence expectations (D3 exit pack, feeds D4)

Per `D3_REHEARSAL_ENTRY_CHECKLIST.md` §9, the rehearsal chat must
capture:

1. Time-stamped log of every SQL statement executed against the
   snapshot.
2. Per-statement result row counts / status (success / error /
   skipped).
3. Diff of `\dt`, `\dp`, `\df` before vs after the rehearsal.
4. Reconciliation of pre-rehearsal vs post-rehearsal row counts for
   every `fat.*` table (canonical + drift).
5. Explicit confirmation that the rehearsal script behaved within
   its declared scope — no unexpected schema or row mutations; the
   drift objects unchanged.
6. End-to-end timing (for D4 maintenance-window planning).
7. Any anomaly classified as a `R-NN` candidate, with proposed row
   text (added to `RISK_REGISTER.md` in a follow-up governance
   chat, not in the rehearsal chat).
8. Snapshot disposition (kept / archived / destroyed) recorded.
9. Explicit confirmation that no PROD action was triggered (Vercel
   history slice; MCP project-ID audit; deploy log).
10. Governance owner counter-sign on the D3 exit pack before D4
    scoping begins.

The evidence pack is committed at
`docs/PROD_RECONCILIATION/evidence/D3_REHEARSAL_EVIDENCE.md`. No
other write is permitted from the rehearsal chat (except the
optional commit-message / branch-state housekeeping needed to push
that file).

## 5. Stop conditions (during rehearsal)

If any of the following becomes true during D3 execution, the chat
must **halt** the rehearsal and capture state per
`D3_REHEARSAL_ENTRY_CHECKLIST.md` §8:

- A SQL statement in the rehearsal script errors.
- The script produces a mutation outside its declared schema scope
  (e.g. touches `public.*`, `auth.*`, or a `fat.*` object not in the
  declared scope).
- The rehearsal touches a drift object enumerated in
  `SCHEMA_DRIFT_ASSESSMENT.md` §1.
- The rehearsal exceeds its declared time-box
  (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §4 item 5).
- The snapshot is mutated outside the rehearsal script.
- Any indication of PROD touch surfaces (MCP project-ID misroute,
  Vercel command issued, third-party tool engaged with PROD).
- The integration-branch `next build` starts failing for any
  reason.
- A new commit lands on the integration branch that touches
  `supabase/fat-schema.sql`, `lib/distance/*`,
  `lib/claims/ClaimsContext.js`, or any file under
  `docs/PROD_RECONCILIATION/`.
- A new `OPEN` risk at severity `MED` or higher is added to
  `RISK_REGISTER.md` (by any concurrent governance pass).
- B-1, B-2, B-3, or B-4 is reopened.

## 6. Abort conditions (terminate the rehearsal attempt)

If any stop condition fires and cannot be cleanly remediated within
the time-box, the rehearsal **aborts** and the chat re-enters
`D3_REHEARSAL_ENTRY_CHECKLIST.md` §1 for a fresh attempt. "Patch
through" is explicitly forbidden
(`D3_REHEARSAL_ENTRY_CHECKLIST.md` §8 closing paragraph).

Specific abort triggers (in addition to §5 stop conditions):

- The §7 approval block in `D3_REHEARSAL_ENTRY_CHECKLIST.md` was
  signed >72 hours before the rehearsal begins (stale approval).
- The DEV snapshot has been deleted, expired, or replaced.
- The reviewer who authored the rehearsal script also signs the §7
  approval block (segregation-of-duties violation per
  `D3_REHEARSAL_ENTRY_CHECKLIST.md` §1 bullet 2).

On abort: snapshot is held until disposition is decided; evidence
pack is committed in partial form, clearly marked
`STATUS = ABORTED`; the chat ends; the next governance round
decides next steps.

## 7. Success criteria (binary — all must hold)

D3 rehearsal is **successful** when and only when **every** item
below is `YES` and captured in the evidence pack:

- [ ] §3 rollback procedure walked through pre-rehearsal.
- [ ] Rehearsal ran exclusively against the named snapshot.
- [ ] Every SQL statement in the rehearsal script returned
      success-or-expected-error per the script's own success
      predicates.
- [ ] No mutation observed outside the script's declared schema
      scope.
- [ ] Drift objects (`SCHEMA_DRIFT_ASSESSMENT.md` §1) unchanged
      pre vs post.
- [ ] Pre-rehearsal vs post-rehearsal row counts reconcile per the
      D3 entry brief's success predicates.
- [ ] No PROD project ID referenced by any tool in the rehearsal
      window.
- [ ] No Vercel PROD deploy triggered in the rehearsal window.
- [ ] Rehearsal completed inside its declared time-box.
- [ ] D3 exit evidence pack committed to
      `docs/PROD_RECONCILIATION/evidence/D3_REHEARSAL_EVIDENCE.md`.
- [ ] Governance owner counter-sign recorded.

Only after **all** of the above are `YES` may the D3 rehearsal
chat declare success and hand off to D4 scoping.

## 8. Cross-references

- `D3_ENTRY_BRIEF.md` — per-attempt brief (authored under the same
  governance pass).
- `D3_REHEARSAL_ENTRY_CHECKLIST.md` §3, §4, §5, §6, §7, §8, §9 —
  binding entry/exit machinery.
- `REHEARSAL_READINESS_CRITERIA.md` §A – §I — per-area criteria.
- `SCHEMA_DRIFT_ASSESSMENT.md` — drift inventory and quarantine.
- `GOVERNANCE_CONFLICT_RESOLUTION.md` — execution-chat /
  governance-chat separation rule (Rule G-1).
- `ARCHITECTURE_ALIGNMENT_RULES.md` §6.5, §8, §9 — binding
  architecture invariants throughout.
