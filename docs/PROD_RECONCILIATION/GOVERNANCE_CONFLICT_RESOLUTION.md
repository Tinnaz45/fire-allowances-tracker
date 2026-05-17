# Governance Conflict Resolution — D2 §5 vs §6 (R-01 Flip)

> **Authoring chat:** D3 readiness governance review.
> **Branch:** `claude/d3-governance-readiness-review-3Q9My`.
> **Date (UTC):** 2026-05-17.
> **Scope:** authoritative interpretation of the conflict between
> `D2_EXECUTION_CHECKLIST.md` §5 (prohibited-action list, which
> forbids execution-chat edits to ratified governance files including
> `RISK_REGISTER.md`) and §6 (success-criteria list, which **requires**
> R-01 to be flipped to `MITIGATED` in `RISK_REGISTER.md`).
> Documentation-only output; this document does **not** authorise
> rehearsal execution.

---

## 1. The conflict as surfaced

`D2_EXECUTION_CHECKLIST.md` contains two contradictory clauses:

- **§5 (prohibited actions, hard list):**
  > "Any edit to the ratified governance files themselves
  > (`BLOCKER_RESOLUTIONS.md`, `D2_EXECUTION_SCOPE.md`,
  > `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`,
  > `RISK_REGISTER.md`, `REHEARSAL_READINESS_CRITERIA.md`).
  > Updates to those files require a fresh governance round."

- **§6 (success criteria, binary — all must hold):**
  > "[ ] R-01 status moved to `MITIGATED` in `RISK_REGISTER.md`."

The live-DDL execution chat correctly identified this conflict, refused
to improvise, and recorded the conflict in
`evidence/D2_EXECUTION_EVIDENCE.md` §17.10, surfacing the R-01 flip as
a carry-forward governance item (§17.13 item 4).

`RISK_REGISTER.md` itself reinforces the conflict: the R-01 row states
"OPEN → MITIGATED on D2 archive", and the aggregate-gating section
states "Currently blocked by R-01 (clears on D2 archive) …". Both
imply the flip happens automatically on archive — but neither
identifies **who** writes the change.

## 2. Authoritative interpretation

The §5 clause and the §6 clause are not in genuine logical conflict
once each is read in the context of `ARCHITECTURE_ALIGNMENT_RULES.md`
§9 ("Change-control rules"). They operate on **different actors**:

- **§5 binds the execution chat** ("the executor", per the heading of
  §5: "Prohibited actions (hard list — re-stated for the executor)").
  The execution chat is the chat that runs the live DDL, opens the PR,
  and merges. It is **not** authorised to edit ratified governance
  files because doing so would couple execution and governance state,
  inviting the precise "while I'm here" scope creep that
  `ARCHITECTURE_ALIGNMENT_RULES.md` §6.5 forbids.

- **§6 binds the overall D2 outcome**, not the execution chat in
  isolation. "D2 is complete when and only when every item below is
  `YES`" is a **state requirement** on the union of the execution
  chat plus the supporting governance work. The success criterion is
  satisfied when `RISK_REGISTER.md` records R-01 as `MITIGATED`; it
  is **silent** on which chat writes the line.

The reconciliation: **the R-01 flip is a governance-chat action,
not an execution-chat action.** It is performed by a fresh
governance pass per `ARCHITECTURE_ALIGNMENT_RULES.md` §9.3
("Risk register is updated whenever a new risk is identified or an
existing risk changes status") — exactly the pass this chat is
authorised to perform.

## 3. Authority for this chat to flip R-01

This chat's mission ("D3 rehearsal-entry governance and readiness
review") explicitly carries the authority:

- "Updates to `RISK_REGISTER.md` ONLY if governance explicitly
  permits it." — mission §E.
- Mission §B requires "explicit governance clarification" of the
  conflict and a "future process rule to prevent recurrence" — both
  delivered in this document (§2 above; §6 below).
- Mission §A authorises classification, assessment, disposition of
  the schema drift but **not** modification — by parallel construction,
  this chat is a governance chat in the sense of §9 of
  `ARCHITECTURE_ALIGNMENT_RULES.md`, and §9.3 explicitly assigns
  risk-register updates to such a pass.

The R-01 flip is therefore **explicitly permitted in this chat**
once the preconditions are met. The preconditions are:

1. D2 archive actions complete in the repo (B-3 applied) — **YES**,
   committed at `4aed08d` (archive move) and `0d9dc83` (live DROP
   evidence).
2. Live `DROP TABLE fat.distance_cache` executed against DEV — **YES**,
   at `2026-05-17T10:00:11Z`, per
   `evidence/D2_EXECUTION_EVIDENCE.md` §17.5.
3. Post-DROP validation confirms zero replay risk surfaces — **YES**,
   per `evidence/D2_EXECUTION_EVIDENCE.md` §17.6 (file archived;
   sha256 byte-match maintained; no caller surfaced).

All three preconditions hold. R-01 is therefore eligible for
`MITIGATED` status today, in this chat, by this governance pass.

## 4. R-01 disposition

`RISK_REGISTER.md` row R-01 is updated by this chat to:

- **Status:** `MITIGATED` (was `OPEN`).
- **Mitigation column** appends a dated note referencing the archive
  commit SHA and the live-DROP evidence section.

The other gating risks for D3 entry are addressed in §5 below.

## 5. Adjacent risks at D3 entry

- **R-07 ("new reporting feature begins depending on
  `fat.payment_components` while B-1 is deferred"):** must be
  **reaffirmed** at D3 entry per `RISK_REGISTER.md` aggregate-gating
  text and `D3_REHEARSAL_ENTRY_CHECKLIST.md` §6 bullet 3. This chat
  does not have visibility into a deployed runtime or an open PR
  surface to confirm reaffirmation — it remains `OPEN` pending the
  D3 entry chat's reviewer reaffirmation. **Not flipped by this
  chat.**
- **R-13 ("DEV snapshot used for rehearsal is older than the post-D2
  schema state"):** closes only when the snapshot ID is recorded in
  the D3 entry brief (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §3). No
  snapshot has been taken; **not flipped by this chat.**
- **R-NN candidate from the drift assessment:** the schema drift
  surfaced in `SCHEMA_DRIFT_ASSESSMENT.md` is **not** added as a new
  risk by this chat because the existing `R-NN` mechanism is reserved
  for risks identified by a governance round with an entry-level
  severity assessment; the drift is dispositioned via
  `SCHEMA_DRIFT_ASSESSMENT.md` and carried forward to D4 governance.
  If the D3 rehearsal chat (or any subsequent governance round)
  determines the drift requires risk-register tracking, it may open
  a new `R-NN` row at that time. This chat declines to do so to
  remain bounded.

## 6. Future process rule (prevent recurrence)

To prevent the §5-vs-§6 ambiguity from re-emerging at D3, D4, or
later phases, the following process rule is adopted by this
governance pass and codified here:

> **Rule G-1 (execution-chat / governance-chat separation):**
>
> 1. Execution chats (chats with PR/merge/deploy/DDL authority)
>    **must not** edit ratified governance files
>    (`BLOCKER_RESOLUTIONS.md`, `D2_EXECUTION_SCOPE.md`,
>    `D3_REHEARSAL_ENTRY_CHECKLIST.md`,
>    `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`,
>    `RISK_REGISTER.md`, `REHEARSAL_READINESS_CRITERIA.md`).
> 2. Governance chats (chats explicitly chartered with "governance"
>    or "readiness" in their mission) **may** edit those files,
>    subject to the bounded-scope rules of their own mission.
> 3. A success criterion in any phase checklist that requires a
>    governance-file change is satisfied **across the pair** of
>    execution chat + governance chat. The execution chat captures
>    evidence; the governance chat writes the line. Neither chat
>    needs to do both.
> 4. Any future phase checklist that contains a §5-style prohibited
>    action that overlaps with a §6-style success criterion must
>    name the governance chat that is authorised to perform the
>    edit. Absent such a name, this rule G-1 supplies the default:
>    the next governance/readiness chat performs the edit.

Rule G-1 is added to the canonical governance vocabulary by this
document. It does not override
`ARCHITECTURE_ALIGNMENT_RULES.md` §9; it operationalises §9.3.

## 7. What this chat does **not** do

- Does **not** edit `D2_EXECUTION_CHECKLIST.md` §5 or §6. Either
  edit would constitute revising a ratified governance file mid-flight
  and would itself trigger §5. The conflict is **interpreted** here,
  not **resolved by document rewrite**.
- Does **not** flip R-07 or R-13.
- Does **not** add new `R-NN` rows.
- Does **not** modify `BLOCKER_RESOLUTIONS.md`,
  `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`,
  `D2_EXECUTION_CHECKLIST.md`, `D2_EXECUTION_SCOPE.md`,
  `REHEARSAL_READINESS_CRITERIA.md`, or
  `D3_REHEARSAL_ENTRY_CHECKLIST.md` — all remain at their
  ratification SHAs.
- Does **not** open a PR or trigger any deploy.

## 8. Cross-references

- `evidence/D2_EXECUTION_EVIDENCE.md` §17.10 — original surfacing.
- `evidence/D3_READINESS_EVIDENCE.md` "Outstanding blockers" item 8
  and §"Items NOT closable by this chat" item 4 — carry-forward
  recording.
- `ARCHITECTURE_ALIGNMENT_RULES.md` §6.5, §9.1, §9.2, §9.3 — the
  binding rules consulted.
- `RISK_REGISTER.md` — site of the R-01 status flip executed by
  this chat.
- `D3_ENTRY_BRIEF.md` — uses the R-01 = `MITIGATED` state as a
  precondition.
