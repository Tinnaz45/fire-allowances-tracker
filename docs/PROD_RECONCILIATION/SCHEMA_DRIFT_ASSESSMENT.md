# DEV Schema Drift Assessment — Pre-Existing `fat.*` Surface

> **Authoring chat:** D3 readiness governance review.
> **Branch:** `claude/d3-governance-readiness-review-3Q9My`.
> **Date (UTC):** 2026-05-17.
> **Scope:** governance assessment of the pre-existing DEV-vs-canonical
> drift surfaced (not caused) by the D2 live-DDL execution. Classify,
> disposition, and gate; **no schema modification is authorised by
> this document**.

---

## 1. Drift inventory (DEV vs `supabase/fat-schema.sql`)

The canonical schema file (`supabase/fat-schema.sql`, post-D2 SHA
`4aed08d`) declares:

- **12 tables:** `fat.financial_years`, `fat.claim_sequences`,
  `fat.claim_groups`, `fat.stations`, `fat.profile_ext`,
  `fat.home_address`, `fat.station_distances`, `fat.recalls`,
  `fat.retain`, `fat.standby`, `fat.spoilt_meals`, `fat.user_rates`.
- **2 functions:** `fat.set_updated_at`,
  `fat.increment_claim_sequence`.

The DEV Supabase project `kctctvpobbizhkiqkgqw` (post-DROP, per
`evidence/D2_EXECUTION_EVIDENCE.md` §17.6) carries:

- **15 tables** — the 12 canonical tables **plus** three drift tables:
  - `fat.friend_requests`
  - `fat.friendships`
  - `fat.claim_replication_events`
- **12 functions** — the 2 canonical functions **plus** ten drift
  functions:
  - `fat.accept_friend_request`
  - `fat.cancel_friend_request`
  - `fat.list_friend_requests_with_profile`
  - `fat.list_friends_with_profile`
  - `fat.mark_replication_events_seen`
  - `fat.reject_friend_request`
  - `fat.remove_friend`
  - `fat.replicate_claim_to_friends`
  - `fat.search_user_by_email`
  - `fat.send_friend_request`

These objects are the friend-system + claim-replication surface. They
were applied to DEV by a prior MCP migration window outside the
PROD-reconciliation governance package. They were **already in DEV**
on `0c23f04` (pre-D2 parent) and on `4aed08d` (post-D2 repo-side
commit) and remain there after the `DROP TABLE fat.distance_cache`
executed at `2026-05-17T10:00:11Z`. **D2 did not create, alter, or
remove any of them.**

## 2. Provenance and intent

- **Not in canonical schema file.** The drift objects are not present
  in `supabase/fat-schema.sql` at any reviewed commit on the
  integration branch.
- **No reference in `BLOCKER_RESOLUTIONS.md`.** B-1 … B-4 say nothing
  about the friend system or replication helpers.
- **Not enumerated in `docs/FAT_SCHEMA_ARCHITECTURE.md`.** The tables
  list there is silent on friend-system tables.
- **Runtime callers:** unknown to this governance chat. This chat
  performed no code-side exploration of `lib/`, `app/`, or
  `components/` for friend-system callers — that would exceed
  documentation-only scope. Provenance is therefore "DEV state at the
  time of D2; intent undocumented in the PROD-reconciliation package".

The drift is **legitimate** in the sense that no governance decision
in this package prohibits it; it is **undocumented** in the sense
that the canonical schema-of-record does not enumerate it.

## 3. Compatibility with rehearsal (D3)

The rehearsal under D3 is bounded by:

- It targets an **isolated DEV snapshot**, not the live DEV project
  (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §3).
- It rehearses a **separate PROD-reconciliation script**
  (authored elsewhere) by replay against that snapshot
  (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §4 item 2).
- It must not modify `lib/distance/*`,
  `lib/claims/ClaimsContext.js`, or `supabase/fat-schema.sql`
  (`D3_REHEARSAL_ENTRY_CHECKLIST.md` §5 bullet 4).

The friend-system + replication drift is therefore **compatible with
rehearsal entry** provided the D3 entry brief explicitly:

1. Names the drift objects as **expected** in the snapshot
   (so they do not trip the rehearsal's "unexpected object" stop
   condition).
2. Confirms the rehearsal script under test **does not target** any
   `fat.friend_*`, `fat.friendships`, `fat.claim_replication_events`,
   or `fat.{accept|cancel|list|mark|reject|remove|replicate|search|send}_*`
   object.
3. Declares the post-rehearsal `\dt fat.*` / `\df fat.*` predicate as
   "**canonical FAT objects PLUS the drift objects enumerated in
   `SCHEMA_DRIFT_ASSESSMENT.md` §1**, unchanged", not the literal
   wording in `D2_EXECUTION_CHECKLIST.md` §4 / `REHEARSAL_READINESS_CRITERIA.md`
   §F.

## 4. Bounded-domain compliance

`ARCHITECTURE_ALIGNMENT_RULES.md` §1 and §2 prohibit:

- per-app suffixes inside `fat.*` (§1.5) → drift objects do **not**
  carry `_fat`, `_mica`, … suffixes. **OK.**
- legacy `fat_` table-name prefixes (§1.4) → drift objects use
  unprefixed names (`friend_requests`, `friendships`,
  `claim_replication_events`). **OK.**
- promotion of FAT state to `public.*` (§2.3) → drift objects live
  under `fat.*`. **OK.**
- shared user-data tables across apps (§2.1) → drift objects are
  per-user (`friend_requests.requester_id`, etc.). **Cannot be
  audited from documentation alone**, but no §2.1 violation is
  visible from naming.

§4 (distance system) and §5 (payment/ledger) are untouched by drift.
§6 (repo hygiene) does **not** mandate enumeration of every DEV
object in `fat-schema.sql` — it mandates that
`supabase/fat-schema.sql` is the source of truth for what is
**re-replayable**. Drift objects are not in the replayable surface,
which is a separate problem (see §5 below).

**Conclusion:** the drift does **not** violate any binding rule in
`ARCHITECTURE_ALIGNMENT_RULES.md` on its face. It violates the
**implicit completeness** of the canonical schema file — i.e. a
fresh replay of `supabase/fat-schema.sql` against an empty project
would **not** reproduce the DEV state.

## 5. Risk classification

| Risk vector | Severity | Notes |
| ----------- | -------- | ----- |
| Rehearsal trips a "literal wording" stop condition in `D2_EXECUTION_CHECKLIST.md` §4 / `REHEARSAL_READINESS_CRITERIA.md` §F when comparing `\dt` / `\df` against canonical | MED at D3 entry | Resolvable by explicit drift enumeration in the D3 entry brief. |
| Rehearsal script (D3) accidentally touches a drift object | MED | Resolvable by an explicit "drift objects are out of scope" clause in the rehearsal script under test. |
| Drift carries an undocumented RLS policy that conflicts with `users_manage_own` invariant | LOW (unverified) | Out-of-scope to audit from documentation alone. Flagged for D4. |
| Drift carries a `service_role` write path | LOW (unverified) | Out-of-scope to audit. Flagged for D4. |
| PROD does **not** carry the drift, so a future D4 reconciliation that "mirrors PROD into DEV" would silently drop the drift | MED | A D4-scope concern, not a D3 concern. Flagged. |

The drift is **not** a HIGH or CRIT severity item by itself.

## 6. Disposition

**Decision: ACCEPT-WITH-QUARANTINE for the D3 window.**

| Disposition | Adopted? | Justification |
| ----------- | -------- | ------------- |
| **Accept** (recognise the drift exists, allow rehearsal to proceed) | YES | The drift pre-exists D2; D2 is forbidden from touching it; D3 is rehearsal-only on a snapshot. Bringing the rehearsal to a halt over a state that has existed since before this governance package began would be disproportionate. |
| **Quarantine** (rehearsal script must not target drift objects; drift objects must not be silently "reconciled" by the rehearsal) | YES | Required to preserve the rehearsal's bounded-domain promise. Encoded as a hard rule in `REHEARSAL_EXECUTION_BOUNDARY.md` §"Out of scope". |
| **Deferred remediation** (governance round to either canonicalise the drift into `supabase/fat-schema.sql` or remove it from DEV) | YES, for D4 | The decision "promote drift to canonical vs remove from DEV" is a separate governance question and must be made before D4 PROD reconciliation. Not a D3 blocker. |
| **Immediate reconciliation** (this chat, or D3, modifies the drift) | NO | Explicitly forbidden — see §7. |
| **Automatic reconciliation by rehearsal** | NO | Explicitly forbidden — see §7. |

## 7. Non-modification covenants

This governance chat affirms:

- No `CREATE`, `ALTER`, `DROP`, `GRANT`, `REVOKE`, or `RENAME` was
  executed against any drift object in this chat.
- No edit was made to `supabase/fat-schema.sql` to enumerate the
  drift objects.
- No edit was made to `lib/`, `app/`, `components/` to expose or
  hide the drift.
- The drift objects must not be modified by the D3 rehearsal
  execution chat. The rehearsal is read-and-replay against a
  snapshot of a script under test, not a drift-cleanup vehicle.
- Any future modification of the drift objects (canonicalise or
  remove) requires a fresh governance round per
  `ARCHITECTURE_ALIGNMENT_RULES.md` §9.1 and §9.2 producing a
  scope document with allowed/prohibited actions.

## 8. Carry-forward governance items

1. **Pre-D4 governance round:** decide between
   (a) canonicalising the drift into `supabase/fat-schema.sql`
   with full RLS / grants / policies, or
   (b) removing the drift from DEV. Either path requires its own
   scope document and risk-register entry.
2. **D4 entry brief** must take a stance on whether the drift is
   reconciled to PROD or PROD is reconciled to the drift (or
   neither — the drift remains DEV-only).
3. **`REHEARSAL_READINESS_CRITERIA.md` §F** wording ("Post-action
   `\dt fat.*` lists the expected set with `fat.distance_cache`
   absent") and `D2_EXECUTION_CHECKLIST.md` §4 wording (canonical
   `\df fat.*` = exactly the two named functions) need a future
   governance update to either (i) reference the drift list
   explicitly or (ii) be superseded by a post-drift canonical
   inventory once item 1 is resolved. The D3 entry brief carries
   the workaround for the current rehearsal window; the long-term
   fix is a documentation update under a fresh governance round.

## 9. Cross-references

- `evidence/D2_EXECUTION_EVIDENCE.md` §17.3, §17.6, §17.13 (item 6) —
  raw inventory and surfacing of the drift.
- `evidence/D3_READINESS_EVIDENCE.md` §"Items NOT closable by this
  chat" item 5 — drift recorded as a D3 governance follow-up.
- `ARCHITECTURE_ALIGNMENT_RULES.md` §1, §2, §6, §9 — bounded-domain
  and change-control rules consulted in §4 above.
- `REHEARSAL_EXECUTION_BOUNDARY.md` — codifies the rehearsal-side
  consequences of this disposition.
