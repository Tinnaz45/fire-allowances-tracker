# PROD Reconciliation — Risk Register

> Risks identified during D0/D1 and the B-1…B-4 resolutions. Each entry
> records ownership, current status, mitigation, and the gating effect
> on D2 / D3 entry. Severity: `LOW` / `MED` / `HIGH` / `CRIT`. Status:
> `OPEN`, `MITIGATED`, `ACCEPTED`, `CLOSED`.

| ID | Risk | Severity | Status | Phase gated | Mitigation / Notes |
| -- | ---- | -------- | ------ | ----------- | ------------------ |
| R-01 | Stale `supabase-migration-v4-distance-tables.sql` at repo root replayed by a contributor, recreating legacy `public.fat_*` tables and duplicating RLS policies. | MED | OPEN → MITIGATED on D2 archive | D2 entry: tolerable; D3 entry: must be `MITIGATED`. | Archive under `docs/PROD_RECONCILIATION/archive/legacy-migrations/` with `DO NOT REPLAY` README (B-3). After archive, residual replay risk depends only on someone fetching the file out of archive deliberately. |
| R-02 | `fat.payment_components` ledger write path silently masks a future schema mismatch (e.g. if the table is added with a different column shape). | LOW | ACCEPTED | None | B-1 deferral: try/catch warns to console. Future adoption decision will replace try/catch with hard write path. |
| R-03 | Removing `fat.distance_cache` while a forgotten caller still exists. | LOW | MITIGATED | D2 entry. | Grep evidence captured (B-2). Pre-drop precondition: row count = 0; backup taken. Rollback: revert `fat-schema.sql`; do not re-execute drop. |
| R-04 | DEV Supabase project accidentally targeted as PROD (or vice versa). | HIGH | MITIGATED | All phases. | Explicit project ID in every MCP call. PROD project ID `wgcqzamuspuqpedqasbc` is on the prohibited-target list for D2/D3. |
| R-05 | "Cleanup creep" in D2 (unrelated code or doc edits sneaking into the alignment PR). | MED | MITIGATED | D2 review. | `D2_EXECUTION_SCOPE.md` enumerates allowed actions; anything else rejected. |
| R-06 | `station_distances` relocated or shared in a future feature, violating B-4. | MED | MITIGATED | Future feature reviews. | `ARCHITECTURE_ALIGNMENT_RULES.md` §2.3 prohibits promotion to `public.*`; §4.2 prohibits shared-reference logic. |
| R-07 | A new reporting feature begins depending on `fat.payment_components` while B-1 is deferred, embedding the ledger in the truth path without a governance decision. | MED | OPEN | D3 entry: must be re-verified. | `ARCHITECTURE_ALIGNMENT_RULES.md` §5.3 prohibits new ledger-dependent reports. Reviewers must enforce. |
| R-08 | PostgREST `Exposed schemas` setting loses `fat` (e.g. project recreated, env mismatch). | HIGH | ACCEPTED | Runtime. | Manual project-settings precondition. Symptom is immediate runtime error ("The schema must be one of the following …") — fail-loud. |
| R-09 | Future contributor reintroduces an `fat_`-prefixed name inside `fat.*`. | LOW | MITIGATED | Code review. | Naming rule documented in `docs/FAT_SCHEMA_ARCHITECTURE.md` and `ARCHITECTURE_ALIGNMENT_RULES.md` §1.4. |
| R-10 | RLS policy left orphaned after `DROP TABLE fat.distance_cache`. | LOW | MITIGATED | D2 schema-ownership validation §3.4. | `\dp fat.*` check post-drop; PostgreSQL drops policies with the table automatically — orphan only possible if policy exists on a different table by mistake (not the case). |
| R-11 | Defensive try/catch in `updatePaymentStatus` swallows an unrelated network or auth error, masking a real failure. | LOW | ACCEPTED | None (B-1 deferral window). | Catch is scoped to the second `from('payment_components')` block only. The primary update at line 651 is unguarded; its failure throws. Acceptable until B-1 final decision. |
| R-12 | Documentation drift: `BLOCKER_RESOLUTIONS.md` reopened or edited mid-D2, invalidating the ratified state. | MED | MITIGATED | D3 entry gate §5.4. | Any reopening requires a new governance round and is gated on rehearsal readiness. |
| R-13 | DEV snapshot used for rehearsal (D3) is older than the post-D2 schema state, so the rehearsal exercises a different schema than the post-D2 reference. | MED | OPEN | D3 entry. | D3 entry brief must name the snapshot ID and confirm it was taken **after** D2 completion (see `REHEARSAL_READINESS_CRITERIA.md`). |
| R-14 | Vercel auto-deploy triggered by an unrelated merge into the integration branch during the D2 window, causing user-visible drift while alignment is in flight. | LOW | ACCEPTED | D2 window. | Coordinate D2 PR landing with no concurrent feature PRs. If concurrent merge occurs, re-validate §3 of `D2_EXECUTION_SCOPE.md`. |
| R-15 | The B-2 `DROP` is performed in DEV but the schema-file edit is forgotten, causing the next replay against a fresh project to recreate the dropped table. | LOW | MITIGATED | D2 review. | Both actions are in the §1 list of `D2_EXECUTION_SCOPE.md`; reviewer must confirm both landed. |

## Aggregate gating

- **D2 entry gate:** no `OPEN` risk with severity `HIGH` or `CRIT`. Met
  today.
- **D3 entry gate:** no `OPEN` risk with severity `MED` or higher.
  Currently blocked by R-01 (clears on D2 archive), R-07 (requires
  reviewer reaffirmation at D3 entry), R-13 (requires snapshot
  identification at D3 entry).
- **D4 entry gate** (PROD reconciliation): defined in a future
  `D4_PROD_RECONCILIATION_SCOPE.md` — not authored here.

## Updating this register

- Add new risks as `R-NN` with a complete row.
- Move resolved risks from `OPEN` to `MITIGATED` / `ACCEPTED` /
  `CLOSED` with a dated note in the mitigation column.
- Do not delete rows — history is preserved.
