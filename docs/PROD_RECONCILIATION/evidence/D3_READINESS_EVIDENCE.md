# D3 Rehearsal Entry Readiness — Evaluation

> Strict evaluation of `D3_REHEARSAL_ENTRY_CHECKLIST.md` and
> `REHEARSAL_READINESS_CRITERIA.md` against the post-D2 state produced
> in this chat.
>
> **Date (UTC):** 2026-05-17T09:50Z
> **Branch:** `claude/d2-alignment-execution-R7iyZ`
> **Pre-D2 SHA:** `0c23f04` (parent of D2 commit)
> **D2 SHA (this chat):** (recorded by the D2 commit on this branch)

---

## Headline determination

**D3 readiness:** **NOT READY.**

D3 entry requires the **full** D2 checklist (steps 1–16) to be
complete and `d2-complete`-tagged. This chat is bounded — by mission —
to the **repo-side** portion (checklist steps 3–9). The live-DDL
portion (steps 1, 2, 10–15) is intentionally deferred to the next
chat with merge/MCP authority. Until that chat runs, D3 entry is
blocked on the items listed in §"Outstanding blockers" below.

This determination is **not** a failure of D2 — it is the expected
state after a single-chat repo-side D2 pass. Nothing in this chat
created a new D3 blocker.

---

## A. Governance state — `REHEARSAL_READINESS_CRITERIA.md` §A

| Item | Status | Evidence |
| ---- | ------ | -------- |
| `BLOCKER_RESOLUTIONS.md` exists and unchanged since ratification (`ae459a1`) | **YES** | `git log -1 --format=%H docs/PROD_RECONCILIATION/BLOCKER_RESOLUTIONS.md` → `ae459a1` (file not touched on this branch). |
| B-1 = `DEFER`, not reopened | **YES** | `BLOCKER_RESOLUTIONS.md#B-1` unchanged. |
| B-2 = `REMOVE`, applied | **PARTIAL** | Schema-file removal applied in this chat. Live DEV `DROP TABLE` deferred to next chat. |
| B-3 = `ARCHIVE`, applied | **YES** | File archived; sha256 byte-match captured in `D2_EXECUTION_EVIDENCE.md` §6. |
| B-4 = `RATIFY fat.station_distances`, unchanged | **YES** | No edits to `fat.station_distances`. |

## B. Documentation state — §B

| Item | Status | Evidence |
| ---- | ------ | -------- |
| `D2_EXECUTION_SCOPE.md` present and matches executed work | **YES (within bounded chat)** | All actions taken are enumerated under §1.1–§1.5 of the scope doc. |
| `ARCHITECTURE_ALIGNMENT_RULES.md` present and current | **YES** | Unchanged this chat. |
| `DEV_ALIGNMENT_SCOPE.md` present and reflects executed delta | **YES** | Unchanged this chat. |
| `RISK_REGISTER.md` has no `OPEN` risk at severity `MED+` | **NO — R-01 is still `OPEN` until the archived state is reviewed and the register is updated; R-07 (`MED`, `OPEN`) and R-13 (`MED`, `OPEN`) remain by design until D3 entry brief is authored.** | `docs/PROD_RECONCILIATION/RISK_REGISTER.md` aggregate gating section. |
| `docs/FAT_SCHEMA_ARCHITECTURE.md` no longer lists `fat.distance_cache`; B-1 + B-2 cross-links present | **YES** | `D2_EXECUTION_EVIDENCE.md` §8. |

## C. D2 actions completed — §C

| Item | Status |
| ---- | ------ |
| `supabase/fat-schema.sql` contains zero `distance_cache` refs | **YES** |
| DEV Supabase: `fat.distance_cache` does not exist | **NOT YET** (deferred to live-DDL chat) |
| `supabase-migration-v4-distance-tables.sql` not at repo root | **YES** |
| Archived copy present, byte-identical | **YES** (sha256 match) |
| Archive `README.md` with `SUPERSEDED — DO NOT REPLAY` and B-3 link | **YES** |

## D. Static evidence — §D

All six grep / `ls` checks pass — see `D2_EXECUTION_EVIDENCE.md` §10.

## E. Runtime evidence — §E

| Item | Status |
| ---- | ------ |
| `next build` succeeds on post-D2 branch | **YES** (env vars present) — `D2_EXECUTION_EVIDENCE.md` §9. |
| Manual smoke (login / profile / Recall / Standby) | **NOT YET** (requires deployed DEV runtime — deferred to live chat) |
| Mark Paid toggle works; ledger-sync warning behaviour preserved | **NOT YET** (deferred) |

## F. Database evidence — §F

| Item | Status |
| ---- | ------ |
| Pre-action `select count(*) from fat.distance_cache;` = 0 | **DEFERRED** (no MCP in this chat) |
| Supabase backup ID + timestamp captured | **DEFERRED** |
| Post-action `\dt fat.*` | **DEFERRED** |
| Post-action `\dp fat.*` | **DEFERRED** |

## G. Production isolation evidence — §G

| Item | Status |
| ---- | ------ |
| No MCP call targeted PROD project ID `wgcqzamuspuqpedqasbc` | **YES** — **no Supabase MCP call of any kind was issued in this chat.** |
| No Vercel PROD deployment triggered in D2 window | **YES** — no deploys issued from this chat. |
| No PROD backup / restore / schema diff | **YES** |
| No PROD read query | **YES** |

## H. Rehearsal-specific prerequisites — §H

| Item | Status |
| ---- | ------ |
| D3 entry brief authored (snapshot ID, script, rollback, success criteria, time-box, out-of-scope reminder) | **NO** — out of D2 scope; the brief is authored per D3 attempt in a separate chat. |
| DEV snapshot taken **after** D2 completion | **NO** — D2 not yet `d2-complete`-tagged. |
| Rehearsal runs on a snapshot, not on live DEV | **NO** — pre-condition not yet met. |
| R-07 reaffirmed | **NO** — must be reaffirmed at D3 entry; not in this chat's authority. |
| R-13 closed | **NO** — closes only when the snapshot ID is recorded. |

## I. Approval — §I

| Item | Status |
| ---- | ------ |
| Governance owner sign-off by commit SHA | **NO** |
| Approval references evidence pack location | **NO** |
| Approval not older than 72h at D3 entry | **N/A** (not yet signed) |

---

## D3 entry checklist (`D3_REHEARSAL_ENTRY_CHECKLIST.md`)

| Section | Pass? | Notes |
| ------- | ----- | ----- |
| §1 Required approvals | **NO** | D2 completion sign-off awaits `d2-complete` tag + integration-branch merge. |
| §2 Required evidence pack | **PARTIAL** | Carry-forward items 1–6 require live-DDL outputs (deferred). Item 8 (R-01 = `MITIGATED`) awaits register update on archive review. Items 7, 9, 10 (D3 entry brief, snapshot ID, ticked readiness criteria) are out of D2 scope. |
| §3 Required snapshots / backups | **NO** | No DEV snapshot taken from this chat. |
| §4 D3 entry brief | **NO** | Not authored. |
| §5 Rollback-readiness | **NO** | Brief required first. |
| §6 Entry blockers | **MULTIPLE OPEN** — see below. |
| §7 Approval block | **NO** | Cannot sign before §1–§5 pass. |

---

## Outstanding blockers (must close before D3 entry)

1. **Live `DROP TABLE fat.distance_cache;` on DEV** (checklist step 12)
   has not been executed — requires PR merge in a subsequent chat.
2. **DEV Supabase snapshot** (checklist step 1) has not been taken —
   requires Supabase MCP write access.
3. **`select count(*) from fat.distance_cache;` evidence** (step 2)
   has not been captured live — the B-2 audit predicate stands but
   the value has not been recorded for this D2 window.
4. **D2 PR not opened** (step 10) — mission constraint of this chat.
5. **`d2-complete` tag not placed** on integration-branch head
   (step 15) — gated behind PR merge.
6. **Post-drop `\dt`/`\dp`/`\df`** outputs not captured (step 13).
7. **Manual DEV smoke notes** not captured (step 14).
8. **`RISK_REGISTER.md` R-01** still `OPEN` — moves to `MITIGATED` on
   D2 archive review per the register's own mitigation column. The
   register edit itself is governance — a fresh governance pass per
   `ARCHITECTURE_ALIGNMENT_RULES.md` §9.3 is the correct vehicle.
9. **D3 entry brief** (§4 of D3 checklist) not authored — by
   construction; D3 entry is a separate attempt.

None of these blockers is a *D2 regression*. All are expected for a
bounded repo-side D2 pass.

---

## Permanent posture statements

- **R-04** (project-ID confusion): **MITIGATED** — this chat made
  **zero** Supabase MCP calls. The PROD project ID
  `wgcqzamuspuqpedqasbc` was not referenced by any tool invocation.
- **R-05** (cleanup creep): **MITIGATED** — diff is exactly the union
  of the four authorised file changes.
- **R-09 / R-10**: unchanged (live-DDL deferred; orphan-policy check
  remains gated on step 13).
- **R-14** (concurrent merge): no concurrent merge events into the
  integration branch observed during the chat window.

---

## What the next chat must do (carry-forward)

In order, with evidence captured at each step into this directory:

1. Verify governance docs unchanged since `ae459a1`.
2. Confirm Supabase MCP target = DEV project `kctctvpobbizhkiqkgqw`;
   PROD ID `wgcqzamuspuqpedqasbc` MUST NOT appear in any call.
3. Step 1 — take DEV Supabase backup; record ID + timestamp.
4. Step 2 — `select count(*) from fat.distance_cache;` on DEV
   (expected `0`).
5. Open the D2 PR with this evidence pack referenced; do **not** widen
   scope.
6. After PR merge: step 12 — `DROP TABLE fat.distance_cache;` on DEV
   only.
7. Step 13 — `\dt fat.*`, `\dp fat.*`, `\df fat.*` outputs captured.
8. Step 14 — manual DEV smoke; capture notes.
9. Step 15 — tag integration-branch head `d2-complete`; record tag
   SHA.
10. Update `RISK_REGISTER.md`: R-01 → `MITIGATED` with the dated
    archive-review note (per §9.3 of `ARCHITECTURE_ALIGNMENT_RULES.md`).
11. Append all captured outputs to `D2_EXECUTION_EVIDENCE.md` §16 and
    re-evaluate this readiness document.

Only after step 11 may a *separate* chat author the D3 entry brief and
attempt the §7 approval block.

---

## Appendix — Re-evaluation after live-DDL chat (2026-05-17T10:00Z)

> Update authored at the close of the live DEV-side D2 execution chat
> (branch `claude/d2-alignment-execution-R7iyZ`, parent SHA `4aed08d`).
> Full execution evidence is in `D2_EXECUTION_EVIDENCE.md` §17.

**Headline determination is unchanged: D3 readiness = NOT READY.**
The live-DDL chat closed the largest deferred item (the `DROP TABLE`
itself plus row-count and post-drop validation) but **cannot** close
the items it is mission-forbidden from touching (PR / merge /
`d2-complete` tag / deployed-runtime manual smoke / governance edits).

### Delta vs the §"D3 entry checklist" table above

| Section | Previous status | New status (post-live-DDL chat) | Reason |
| ------- | --------------- | -------------------------------- | ------ |
| C. "DEV Supabase: `fat.distance_cache` does not exist" | NOT YET | **YES** | `DROP TABLE` executed against DEV `kctctvpobbizhkiqkgqw`; post-drop information_schema query returns 0 rows. See `D2_EXECUTION_EVIDENCE.md` §17.5–§17.6. |
| E. Manual smoke (login / profile / Recall / Standby / Mark Paid) | NOT YET | **STILL NOT YET** | Requires deployed DEV runtime; bounded smoke (`next build`) green only. |
| F. Pre-action row count = 0 | DEFERRED | **YES** | `select count(*) from fat.distance_cache` = 0 captured. |
| F. Supabase backup ID + timestamp | DEFERRED | **PARTIAL** | No MCP `create_backup` primitive exists; PITR anchor timestamp recorded (`2026-05-17T09:59:07Z`) as the rollback target. See `D2_EXECUTION_EVIDENCE.md` §17.1. |
| F. Post-action `\dt fat.*` / `\dp fat.*` | DEFERRED | **YES** | Captured (`\dt` returns canonical set minus `distance_cache`; `\dp` shows zero policies on the dropped table). |
| G. No PROD MCP call | YES | **YES (reconfirmed)** | Zero references to PROD project ID `wgcqzamuspuqpedqasbc` in the live-DDL chat. |
| G. No Vercel PROD deploy | YES | **YES (reconfirmed)** | Zero Vercel calls in the live-DDL chat. |
| H. DEV snapshot taken **after** D2 completion | NO | **NO — STILL** | D2 not yet `d2-complete`-tagged. The PITR anchor at §17.1 is a pre-DROP anchor, not a "post-D2 rehearsal snapshot". |

### Items now closable / closed

- **B-2 = REMOVE, applied** moves from PARTIAL to **YES (DDL applied
  against DEV)**.
- **R-03 invariant** ("forgotten runtime caller") remains LOW;
  re-confirmed via five static greps immediately before the DROP, all
  empty.
- **R-09 / R-10** (orphan policies, dependency surprises):
  **MITIGATED** for the dropped object — zero policies remain
  referencing `fat.distance_cache`, zero dependent views, zero
  inbound FK references.

### Items NOT closable by this chat (carry-forward to subsequent chats)

1. **D2 PR open / reviewer sign-off / merge** — mission-forbidden in
   the live-DDL chat (no PR/merge/deploy authority).
2. **`d2-complete` tag on integration-branch head** — gated on PR
   merge.
3. **Manual UI smoke against deployed DEV runtime** — no runtime
   provisioned by the live-DDL chat.
4. **`RISK_REGISTER.md` R-01 → `MITIGATED`** — requires a fresh
   governance round per `ARCHITECTURE_ALIGNMENT_RULES.md` §9.3.
   `D2_EXECUTION_CHECKLIST.md` §5 prohibits direct edits to
   `RISK_REGISTER.md` from execution chats while §6 requires the
   flip; the conflict is recorded in `D2_EXECUTION_EVIDENCE.md`
   §17.10.
5. **DEV-vs-canonical `\df fat.*` / extra `fat.*` table drift** —
   pre-existing DEV state (friend system + replication helpers)
   surfaces against the §4 canonical expectation; **not** introduced
   by D2; needs governance ratification of an updated canonical list
   (or removal) before §4 `\df` / `\dt` can declare a fully canonical
   match on its current wording. See `D2_EXECUTION_EVIDENCE.md`
   §17.6.
6. **D3 entry brief** — separate-chat artefact by construction.

### Updated outstanding-blockers list (supersedes §"Outstanding blockers" above)

1. D2 PR open / merge / sign-off (steps 10, 11).
2. `d2-complete` tag on integration-branch head (step 15).
3. Manual DEV smoke (step 14) on deployed runtime.
4. `RISK_REGISTER.md` R-01 → `MITIGATED` via governance pass.
5. Governance ratification of `\df fat.*` / extra `fat.*` table drift
   (or its remediation) so §4 of the D2 checklist passes verbatim.
6. D3 entry brief authored in a separate chat
   (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §4).

**None of these is a D2 regression.** Items 1–3 and 6 were already
expected; items 4 and 5 are governance items surfaced (not caused) by
the live-DDL chat.

### Permanent posture statements (refresh)

- **R-04** (project-ID confusion): **MITIGATED (reconfirmed in
  live-DDL chat)** — every MCP call in the chat targeted DEV
  `kctctvpobbizhkiqkgqw`; zero references to PROD
  `wgcqzamuspuqpedqasbc`.
- **R-05** (cleanup creep): **MITIGATED (reconfirmed)** — exactly one
  DDL statement executed: `DROP TABLE fat.distance_cache;`.
- **R-09 / R-10**: **MITIGATED for the dropped object** (no orphans,
  no surprise dependencies).
- **R-14** (concurrent merge): no concurrent merges observed in the
  live-DDL chat window.

### Conclusion

The bounded live DEV-side D2 mission completed successfully:
`fat.distance_cache` is dropped from DEV; the rollback posture is
documented; no PROD touched; no schema expansion; no runtime
regression detected in bounded smoke. **D3 readiness remains NOT
READY** until the carry-forward items above are closed in their
respective chats.
