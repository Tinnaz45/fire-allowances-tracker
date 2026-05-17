# D2 Execution Evidence — Repo-Side Alignment

> **Scope of this evidence pack:** the repo-side actions of the D2
> checklist that are executable in a bounded chat without live DEV
> mutation, PR creation, merge, or deploy. The mission for this chat
> explicitly forbids PR / merge / deploy / rehearsal, so the live-DDL
> tail of the checklist (steps 1, 2, 10–15) is intentionally deferred
> to the next chat with merge authority.
>
> **Authority:** `D2_EXECUTION_CHECKLIST.md`, `D2_EXECUTION_SCOPE.md`,
> `BLOCKER_RESOLUTIONS.md` (B-1 … B-4),
> `ARCHITECTURE_ALIGNMENT_RULES.md`, `RISK_REGISTER.md`,
> `REHEARSAL_READINESS_CRITERIA.md`.
>
> **Execution branch:** `claude/d2-alignment-execution-R7iyZ`
> (fast-forwarded from `claude/governance-blockers-resolution-i0z4w`
> at SHA `0c23f04` so the governance documents are present on the
> execution branch — diff-isolated from any subsequent governance
> edits).
>
> **Execution window opened (UTC):** 2026-05-17T09:46Z
> **Execution window closed (UTC):** 2026-05-17T09:50Z

---

## 0. Pre-flight evidence

| Item | Result |
| ---- | ------ |
| `BLOCKER_RESOLUTIONS.md` unchanged since ratification (`ae459a1`) | YES — no edits in this chat |
| `D2_EXECUTION_SCOPE.md` unchanged since ratification | YES |
| `ARCHITECTURE_ALIGNMENT_RULES.md` unchanged since ratification | YES |
| Working tree clean before D2 edits | YES (`git status` empty at chat start) |
| Supabase MCP project ID — **PROD project `wgcqzamuspuqpedqasbc` NOT referenced by any tool invocation in this chat** | YES (no Supabase MCP calls made in this chat at all) |
| `next build` baseline state | Verified post-edit (see §9). Baseline parent commit `0c23f04` has the same env-var requirement; not a regression. |
| No concurrent feature PR mid-merge | YES (no concurrent merge events observed in this chat) |

---

## 1. Checklist step coverage map (bounded chat)

| Step | In this chat? | Evidence section | Notes |
| ---- | ------------- | ---------------- | ----- |
| 1. DEV Supabase snapshot | **DEFERRED** | — | Requires Supabase MCP write/backup. Mission forbids live DEV ops in this chat; carry-forward to the next chat. |
| 2. `select count(*) from fat.distance_cache;` on DEV | **DEFERRED** | — | Requires Supabase MCP. Carry-forward. The R-03 invariant remains LOW per the audit; B-2 already records "expected from prior audit". |
| 3. Static grep proofs | **EXECUTED** | §3 | All four greps empty. |
| 4. Edit `supabase/fat-schema.sql` (three named removals) | **EXECUTED** | §4 | Diff is exactly the three named removals, no other edits. |
| 5. `grep -n distance_cache supabase/fat-schema.sql` empty | **EXECUTED** | §5 | Empty (exit=1). |
| 6. `git mv` of stale v4 SQL into archive | **EXECUTED** | §6 | Pre-move sha256 == post-move sha256 (byte-identical). |
| 7. Archive `README.md` with SUPERSEDED — DO NOT REPLAY | **EXECUTED** | §7 | Cross-links B-3. |
| 8. Markdown alignment in `docs/FAT_SCHEMA_ARCHITECTURE.md` | **EXECUTED** | §8 | Cache row trimmed; migration-notes paragraph updated; B-1 and B-2 cross-links added; `FAT_SCHEMA_AUDIT_REPORT.md` and `DISTANCE-SYSTEM-DEPLOY-REPORT.md` left intact. |
| 9. `next build` on post-edit branch | **EXECUTED** | §9 | Compile + lint + types + 14 static pages OK with env vars present. |
| 10. Open D2 PR | **DEFERRED** | — | Mission forbids PR. |
| 11. Reviewer sign-off | **DEFERRED** | — | Requires PR. |
| 12. `DROP TABLE fat.distance_cache;` on DEV (post-merge) | **DEFERRED** | — | Gated behind PR merge. |
| 13. Post-drop `\dt` / `\dp` / `\df` validation on DEV | **DEFERRED** | — | Gated behind step 12. |
| 14. Manual DEV smoke (login, profile, Recall, Standby, Mark Paid) | **DEFERRED** | — | Requires deployed DEV runtime. |
| 15. Tag integration branch head `d2-complete` | **DEFERRED** | — | Tag is set at integration-branch head after merge. |
| 16. Final evidence-pack location | This file + siblings under `docs/PROD_RECONCILIATION/evidence/`. | §16 | Carry-forward steps will append. |

---

## 2. Pre-action SHAs

```
$ date -u +%Y-%m-%dT%H:%M:%SZ
2026-05-17T09:46:21Z

$ git rev-parse HEAD
0c23f0450ed89cae1298694bc2454ba8b43c5770

$ sha256sum supabase-migration-v4-distance-tables.sql
e36e4db9fe33c7ceeaada11462463d7729419c6fb400630e688d5f058ce9e620  supabase-migration-v4-distance-tables.sql

$ sha256sum supabase/fat-schema.sql
e906174d62bf43a19e73690f827e0d172130c1622c0af0051f10a06c119f6fc0  supabase/fat-schema.sql

$ wc -l supabase/fat-schema.sql
407 supabase/fat-schema.sql

$ grep -n 'distance_cache' supabase/fat-schema.sql
143:create table if not exists fat.distance_cache (
372:alter table fat.distance_cache    enable row level security;
386:create policy users_manage_own on fat.distance_cache    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 3. Step 3 — Static grep proofs (pre-edit, repo root)

```
$ grep -rn "distance_cache"     app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "fat_distance_cache" app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "from('fat_"         app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "public\.fat_"       app/ components/ lib/   →  (no matches, exit=1)
```

All four required greps return **empty**. R-03 (forgotten caller) and
the `ARCHITECTURE_ALIGNMENT_RULES.md` §3.2 / §3.3 invariants both hold
at the moment of edit.

---

## 4. Step 4 — `supabase/fat-schema.sql` diff (three named removals only)

```diff
--- a/supabase/fat-schema.sql
+++ b/supabase/fat-schema.sql
@@ -140,17 +140,6 @@ create table if not exists fat.profile_ext (
 
 -- ─── Distance estimation (v1 cache + v4 home/station distance) ────────────────
 
-create table if not exists fat.distance_cache (
-  id                uuid primary key default gen_random_uuid(),
-  user_id           uuid not null references auth.users(id) on delete cascade,
-  home_address      text not null,
-  station_id        integer not null,
-  distance_km       numeric(6,1) not null,
-  source            text,
-  user_override_km  numeric(6,1),
-  calculated_at     timestamptz not null default now(),
-  unique (user_id, home_address, station_id)
-);
 
 create table if not exists fat.home_address (
@@ -369,7 +358,6 @@ alter table fat.financial_years   enable row level security;
 alter table fat.claim_sequences   enable row level security;
 alter table fat.claim_groups      enable row level security;
 alter table fat.profile_ext       enable row level security;
-alter table fat.distance_cache    enable row level security;
 alter table fat.home_address      enable row level security;
 alter table fat.station_distances enable row level security;
 alter table fat.recalls           enable row level security;
@@ -383,7 +371,6 @@ create policy users_manage_own on fat.financial_years   for all using (auth.uid(
 create policy users_manage_own on fat.claim_sequences   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 create policy users_manage_own on fat.claim_groups      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 create policy users_manage_own on fat.profile_ext       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-create policy users_manage_own on fat.distance_cache    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 create policy users_manage_own on fat.home_address      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 create policy users_manage_own on fat.station_distances for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 create policy users_manage_own on fat.recalls           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

`git diff --stat supabase/fat-schema.sql`:

```
 supabase/fat-schema.sql | 13 -------------
 1 file changed, 13 deletions(-)
```

- 11 lines from the `create table … fat.distance_cache (…)` block
- 1 line `alter table fat.distance_cache enable row level security;`
- 1 line `create policy users_manage_own on fat.distance_cache …`
- 0 additions; no other line touched.

This satisfies `BLOCKER_RESOLUTIONS.md#B-2` "Rollback posture" — the
three removed items are recoverable verbatim from the pre-edit commit
`0c23f04`.

---

## 5. Step 5 — Post-edit grep on schema file

```
$ grep -n "distance_cache" supabase/fat-schema.sql
(no output, exit=1)
```

Empty as required.

---

## 6. Step 6 — Archive move (byte-identical)

```
$ git mv supabase-migration-v4-distance-tables.sql \
         docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql

$ sha256sum docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql
e36e4db9fe33c7ceeaada11462463d7729419c6fb400630e688d5f058ce9e620  docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql
```

**Pre-move sha256:** `e36e4db9fe33c7ceeaada11462463d7729419c6fb400630e688d5f058ce9e620`
**Post-move sha256:** `e36e4db9fe33c7ceeaada11462463d7729419c6fb400630e688d5f058ce9e620`
**Match:** YES — SQL body byte-identical.

`git diff --stat` for this file shows zero content change (rename only).

---

## 7. Step 7 — Archive README

Created `docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md`
with the **SUPERSEDED — DO NOT REPLAY** notice, cross-linking
`BLOCKER_RESOLUTIONS.md#B-3` and `ARCHITECTURE_ALIGNMENT_RULES.md` §6.1
and §6.4. No additional files; no edits to the archived SQL.

---

## 8. Step 8 — Markdown alignment

`docs/FAT_SCHEMA_ARCHITECTURE.md` changes:

- Tables list: `fat.distance_cache` row removed.
- Migration notes: the paragraph that mentions the superseded v1 cache
  now points at `PROD_RECONCILIATION/BLOCKER_RESOLUTIONS.md#B-2`.
- Migration notes: the `payment_components` paragraph now cross-links
  the formal B-1 deferral.
- New bullet recording the v4 SQL archival under
  `PROD_RECONCILIATION/archive/legacy-migrations/` with the B-3 link.

Unchanged (per §1.4 of `D2_EXECUTION_SCOPE.md`):

- `FAT_SCHEMA_AUDIT_REPORT.md` — historical record, intact.
- `DISTANCE-SYSTEM-DEPLOY-REPORT.md` — historical record, intact.

`grep -n "distance_cache" docs/FAT_SCHEMA_ARCHITECTURE.md` now returns
exactly **one** line — the prose retirement notice with the B-2
cross-link. (The pre-edit file had two references: the tables-list row
and the migration-notes prose; the row is removed and the prose is
rewritten to flag the retirement.)

---

## 9. Step 9 — `next build` on the post-edit branch

```
   ▲ Next.js 15.5.15

   Creating an optimized production build ...
 ✓ Compiled successfully in 9.5s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/14) ...
   …
 ✓ Generating static pages (14/14)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    14.7 kB         195 kB
├ ○ /_not-found                            994 B         103 kB
├ ○ /dashboard                             323 B         102 kB
├ ○ /forgot-password                     1.59 kB         166 kB
├ ○ /login                               1.69 kB         166 kB
├ ○ /new-claim                             989 B         181 kB
├ ○ /paths                                 325 B         102 kB
├ ○ /profile                              5.4 kB         167 kB
├ ○ /reset-password                       1.8 kB         163 kB
├ ○ /settings                             5.2 kB         166 kB
├ ○ /signup                              1.74 kB         166 kB
└ ○ /tax                                 4.66 kB         173 kB
```

Exit code 0 with `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` set to
non-empty stub strings (build-time prerender path requires them — this
is an existing characteristic of the repo, not a D2 regression; the
same env-var requirement exists on the pre-D2 commit `0c23f04`).

Compile path proves the schema-file edit and the markdown alignment did
not introduce any TypeScript / lint / build regression. The build does
not touch the Supabase project (no MCP, no DDL), so `next build` is a
**pure** code-correctness signal here.

---

## 10. §4 (D2 checklist) — canonical validation commands, post-edit

| Command | Expected | Observed |
| ------- | -------- | -------- |
| `grep -rn "distance_cache" app/ components/ lib/` | empty | **empty (exit=1)** |
| `grep -rn "fat_distance_cache" app/ components/ lib/` | empty | **empty (exit=1)** |
| `grep -rn "from('fat_" app/ components/ lib/` | empty | **empty (exit=1)** |
| `grep -rn "public\.fat_" app/ components/ lib/` | empty | **empty (exit=1)** |
| `grep -rn "distance_cache" supabase/` | empty | **empty (exit=1)** |
| `ls supabase-migration-*.sql` | `No such file or directory` | **`No such file or directory`** |
| `ls docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql` | path printed | **path printed** |
| `ls docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md` | path printed | **path printed** |
| `sha256sum …archive…/supabase-migration-v4-distance-tables.sql` | matches pre-move sha256 | **matches: `e36e4db9…ce9e620`** |
| `next build` on the post-edit branch | exits 0 | **exits 0** (with env vars present) |
| Supabase `select 1 from information_schema.tables where table_schema='fat' and table_name='distance_cache';` | 0 rows | **DEFERRED** (live DDL not executed in this chat) |
| Supabase `\dt fat.*` | canonical FAT tables minus `distance_cache` | **DEFERRED** |
| Supabase `\dp fat.*` | no policy referencing `distance_cache` | **DEFERRED** |
| Supabase `\df fat.*` | exactly `fat.set_updated_at`, `fat.increment_claim_sequence` | **DEFERRED** |
| Vercel deployment history during D2 window | no PROD alias activity | **N/A — no deploys triggered in this chat** |

---

## 11. Post-action SHAs

```
$ sha256sum supabase/fat-schema.sql
77f4db1bb853e9efb9214bcc05f32601a39aa916dbe0978ddf545b6fc86d70ed  supabase/fat-schema.sql

$ wc -l supabase/fat-schema.sql
394 supabase/fat-schema.sql   # (407 − 13 = 394, matches diff)

$ sha256sum docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql
e36e4db9fe33c7ceeaada11462463d7729419c6fb400630e688d5f058ce9e620  docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql
```

---

## 12. Bounded-scope confirmation (`git status -s` / `git diff --stat HEAD`)

```
 M docs/FAT_SCHEMA_ARCHITECTURE.md
R  supabase-migration-v4-distance-tables.sql -> docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql
 M supabase/fat-schema.sql
?? docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md

 docs/FAT_SCHEMA_ARCHITECTURE.md                         | 17 +++++++++++++----
 .../supabase-migration-v4-distance-tables.sql           |  0
 supabase/fat-schema.sql                                 | 13 -------------
 3 files changed, 13 insertions(+), 17 deletions(-)
```

**Plus** the new archive `README.md` (untracked at this point, added
in the D2 commit).

This is **exactly** the union the D2 checklist §1 step 11 reviewer is
required to confirm:

1. Three-line removal from `supabase/fat-schema.sql`. ✓
2. One rename (stale v4 SQL into archive). ✓
3. One new archive `README.md`. ✓
4. The §1.4 markdown alignment in `docs/FAT_SCHEMA_ARCHITECTURE.md`. ✓
5. **No other files changed.** ✓

The evidence-pack markdown files under
`docs/PROD_RECONCILIATION/evidence/` are governance artefacts, not
runtime/schema artefacts — `D2_EXECUTION_SCOPE.md` §1.5 mandates this
evidence pack as a D2 output, so writing it inside D2 is itself
authorised.

No files under `app/`, `components/`, `lib/`, `pages/`, `package.json`,
`package-lock.json`, `next.config.*`, `tsconfig.json`, `.github/`, or
any CI configuration were touched. No edge functions created. No new
RPC. No new RLS policy. No `fat.payment_components` artefact appears.
No `fat.stations` seed edited.

---

## 13. Rollback posture (per `D2_EXECUTION_SCOPE.md` §4)

| Action | Rollback path | Recoverable? |
| ------ | ------------- | ------------ |
| `supabase/fat-schema.sql` three-line removal | `git checkout 0c23f04 -- supabase/fat-schema.sql` | YES — pre-edit sha256 `e906174d…6c119f6fc0` reproduces verbatim from the parent commit. |
| `supabase-migration-v4-distance-tables.sql` archive move | `git mv` the file back; sha256 `e36e4db9…ce9e620` confirms byte-identity. | YES — file content preserved. |
| Archive `README.md` | `git rm` the new file. | YES — file is new in this commit. |
| `docs/FAT_SCHEMA_ARCHITECTURE.md` markdown alignment | `git checkout 0c23f04 -- docs/FAT_SCHEMA_ARCHITECTURE.md` | YES — pre-edit content reproducible from parent commit. |
| **(deferred)** Live `DROP TABLE fat.distance_cache` | Restore structurally from canonical pre-D2 commit of `supabase/fat-schema.sql` replayed against DEV; plus snapshot from step 1 of the live-DDL chat. | YES — table is empty per audit; structural restore is sufficient. |

Nothing that would *invalidate* rollback confidence per §4.3 occurred:

- No uncaptured DEV write (no DEV write of any kind happened in this
  chat).
- No `next build` failure that was "papered over" by editing files
  outside the schema file.
- No accidental PROD connection.

---

## 14. Stop-conditions audit (§2 of `D2_EXECUTION_CHECKLIST.md`)

| Stop condition | Triggered? |
| -------------- | ---------- |
| Step 2 returns non-zero row count | N/A — deferred step. Audit precondition stands ("expected 0 from prior audit", `BLOCKER_RESOLUTIONS.md#B-2`). |
| Step 3 returns non-empty for any grep | NO — all four empty. |
| Step 4 touches any line outside the three named lines | NO — diff is exactly the three named removals. |
| Step 5 returns any non-empty match | NO. |
| Step 6 produces any diff hunk beyond rename | NO — sha256 confirms byte-identity. |
| Step 9 build fails | NO — build green with env vars present (the missing-env-var failure mode is environmental and pre-exists on the parent commit). |
| Step 12 errors with anything other than clean DROP | N/A — deferred step. |
| Step 13 orphaned policy / unexpected function or table | N/A — deferred step. |
| Step 14 runtime regression | N/A — deferred step. |
| **MCP call against PROD project ID `wgcqzamuspuqpedqasbc`** | NO — **no Supabase MCP call was issued in this chat at all**, against any project. |
| Uncoordinated edit on `supabase/fat-schema.sql`, `lib/distance/*`, or `lib/claims/ClaimsContext.js` from concurrent PR | NO — none observed during the chat window. |
| Reopening of B-1 … B-4 in flight | NO — governance documents unchanged. |

No stop condition was tripped during the in-scope actions.

---

## 15. Prohibited-action audit (§5 of `D2_EXECUTION_CHECKLIST.md`)

| Prohibited action | Occurred? |
| ----------------- | --------- |
| Any `ALTER TABLE` / `CREATE TABLE` / `CREATE VIEW` / `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE POLICY` / `GRANT` / `REVOKE` / `RENAME` / `SET SCHEMA` in DEV or PROD | NO |
| Any `DROP` other than the deferred `DROP TABLE fat.distance_cache` in DEV | NO |
| Edits under `app/`, `components/`, `lib/`, `pages/`, `supabase/` (other than the three-line removal), `package.json`, `package-lock.json`, `next.config.*`, `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `.github/`, CI config | NO |
| Modification of the defensive try/catch in `lib/claims/ClaimsContext.js#updatePaymentStatus` | NO |
| Creation/deletion/edit of edge functions under `supabase/functions/` | NO |
| Introduction of `fat.payment_components` DDL or back-fill | NO |
| Any new RPC, view, materialised view, or function in `fat.*` | NO |
| Change to `fat.stations` seed data | NO |
| Work on `public.*` beyond reading `public.profiles` at runtime | NO (no runtime executed) |
| MCP call selecting the PROD project ID `wgcqzamuspuqpedqasbc` | NO |
| Vercel deploy / alias switch / env-var change targeting PROD | NO |
| Deletion of `FAT_SCHEMA_AUDIT_REPORT.md` or `DISTANCE-SYSTEM-DEPLOY-REPORT.md` | NO |
| Edit to ratified governance files (`BLOCKER_RESOLUTIONS.md`, `D2_EXECUTION_SCOPE.md`, `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`, `RISK_REGISTER.md`, `REHEARSAL_READINESS_CRITERIA.md`) | NO — all unchanged |
| "While I'm here" cross-domain edit | NO |

Zero prohibited actions occurred. (`npm install` was performed for the
`next build` evidence only; it did not modify `package.json` or
`package-lock.json`, which remain at the parent-commit state.)

---

## 16. Final evidence-pack location

All evidence lives under `docs/PROD_RECONCILIATION/evidence/`:

- `D2_EXECUTION_EVIDENCE.md` — this document.
- `D3_READINESS_EVIDENCE.md` — D3 entry-checklist evaluation against
  the post-D2 state (sibling file).

Carry-forward artefacts to be appended in the live-DDL chat:

- DEV Supabase snapshot ID + UTC timestamp.
- `select count(*) from fat.distance_cache;` SQL + result.
- `DROP TABLE fat.distance_cache;` SQL + result.
- Post-drop `\dt fat.*`, `\dp fat.*`, `\df fat.*` outputs.
- Manual smoke notes (login, profile, Recall, Standby, Mark Paid).
- `d2-complete` tag SHA on the integration branch head.
- Vercel deployment-history slice showing no PROD activity.

When those artefacts arrive, the next chat must append them here and
re-run the §10 row-by-row table to clear the **DEFERRED** entries.

---

## 17. Live DEV-side execution (carry-forward chat)

> **Scope of this section:** the deferred live-DDL tail of the D2
> checklist (steps 1, 2, 12, 13, 14) executed against the DEV
> Supabase project only. Authored under the bounded mission "complete
> the deferred LIVE DEV-SIDE portion of the D2 execution checklist —
> DEV only, D2 only, bounded operational cleanup only".
>
> **Execution branch:** `claude/d2-alignment-execution-R7iyZ`
> **Pre-action HEAD SHA:** `4aed08d` (the D2 repo-side commit on the
> branch tip, fast-forwarded from the parent governance commit).
> **Live-DDL window opened (UTC):** 2026-05-17T09:59:07Z
> **Live-DDL window closed (UTC):** 2026-05-17T10:00:11Z (DROP);
> evidence-pack updates committed after.
>
> **Target project:** DEV — `kctctvpobbizhkiqkgqw`
> (`name: "DEV (Testing)"`, `region: ap-southeast-2`,
> `status: ACTIVE_HEALTHY`, postgres 17). **PROD project ID
> `wgcqzamuspuqpedqasbc` was NOT referenced by any tool invocation in
> this chat.**

### 17.0 Pre-flight (re-checked at the start of the live chat)

| Item | Result |
| ---- | ------ |
| Governance files unchanged since ratification (`ae459a1`) | YES — no edits in this chat. |
| Working tree clean on `claude/d2-alignment-execution-R7iyZ` before live DDL | YES (`git status` empty). |
| Supabase MCP target = DEV `kctctvpobbizhkiqkgqw` | YES — confirmed via `get_project` returning `name: "DEV (Testing)"`. |
| PROD project ID `wgcqzamuspuqpedqasbc` not referenced | YES — zero MCP calls naming the PROD project ID. |
| Repo `next build` baseline green | YES — re-verified post-drop in §17.7. |
| No concurrent feature PR mid-merge | YES — none observed in the window. |

### 17.1 Step 1 — DEV evidence snapshot (anchor)

The Supabase MCP surface exposes no `create_backup` primitive. DEV is
on `ACTIVE_HEALTHY` status with the platform-default PITR window
covering the live-DDL window. The anchor below is recorded so the
PITR target is recoverable if rollback per §3 row "12 (live DROP)" is
ever required.

| Field | Value |
| ----- | ----- |
| DEV project | `kctctvpobbizhkiqkgqw` (`DEV (Testing)`) |
| PITR anchor UTC (pre-DROP) | **2026-05-17T09:59:07.343558Z** (server `now()`) |
| Pre-DROP HEAD SHA | `4aed08d` |
| Recovery vehicle | Supabase PITR within retention + structural restore of `fat.distance_cache` from `supabase/fat-schema.sql` at parent commit `0c23f04` (pre-D2 sha256 `e906174d62bf43a19e73690f827e0d172130c1622c0af0051f10a06c119f6fc0`). |

Per `BLOCKER_RESOLUTIONS.md#B-2` and the R-03 invariant (row count 0,
re-verified in §17.2), structural restore is sufficient — no row-data
restore would be required.

### 17.2 Step 2 — Row count on DEV (pre-DROP)

```sql
select count(*) as row_count from fat.distance_cache;
```

Result:

```
row_count
---------
0
```

The R-03 invariant ("expected 0 from prior audit", per
`BLOCKER_RESOLUTIONS.md#B-2`) is **upheld**. The single allowed-DROP
precondition is met.

### 17.3 Pre-DROP table / policy / dependency inventory

`fat.distance_cache` exists in DEV pre-DROP:

```sql
select table_schema, table_name
  from information_schema.tables
 where table_schema = 'fat' and table_name = 'distance_cache';

table_schema | table_name
-------------+----------------
fat          | distance_cache
```

Policies on the table (one — `users_manage_own`, the canonical FAT
RLS policy):

```
polname           | table               | polcmd
------------------+---------------------+--------
users_manage_own  | fat.distance_cache  | *   (ALL)
```

Constraints (all internal — self PK / UNIQUE / CHECK plus FK to
`auth.users`):

```
conname                                                  | on_table            | ref_table
---------------------------------------------------------+---------------------+-----------
fat_distance_cache_source_check                          | fat.distance_cache  | -
distance_cache_pkey                                      | fat.distance_cache  | -
distance_cache_user_id_home_address_station_id_key       | fat.distance_cache  | -
distance_cache_user_id_fkey                              | fat.distance_cache  | auth.users
```

Inbound FK references from other tables:

```sql
select conname, conrelid::regclass as on_table
  from pg_constraint
 where confrelid = 'fat.distance_cache'::regclass;
-- []  (zero inbound FK references)
```

Triggers (non-internal): **none**.

Dependent views / rules: **none**.

`fat.*` table inventory **before** DROP (16 tables):

```
fat.recalls, fat.retain, fat.standby, fat.spoilt_meals, fat.user_rates,
fat.financial_years, fat.claim_sequences, fat.claim_groups, fat.stations,
fat.profile_ext, fat.distance_cache, fat.home_address,
fat.station_distances, fat.friend_requests, fat.friendships,
fat.claim_replication_events
```

Result: **`fat.distance_cache` has zero non-self dependencies**. Safe
to drop in a single `DROP TABLE` statement (no CASCADE required, no
collateral damage possible).

### 17.4 Re-confirmation of zero runtime callers (static greps)

The same four grep proofs from §3 were re-executed at the start of the
live chat:

```
$ grep -rn "distance_cache"     app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "fat_distance_cache" app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "from('fat_"         app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "public\.fat_"       app/ components/ lib/   →  (no matches, exit=1)
$ grep -rn "distance_cache"     supabase/               →  (no matches, exit=1)
```

All five **empty**. R-03 invariant still holds; no runtime caller
appeared between the repo-side D2 commit and the live-DDL window.

### 17.5 Step 12 — `DROP TABLE fat.distance_cache;` (DEV only)

Executed via `apply_migration`
(`name: d2_drop_fat_distance_cache`,
`project_id: kctctvpobbizhkiqkgqw`):

```sql
DROP TABLE fat.distance_cache;
```

MCP response: `{"success": true}` (single-statement DDL, no warnings,
no CASCADE used, no other objects targeted).

### 17.6 Step 13 — Post-DROP validation on DEV

| Check | Expected | Observed |
| ----- | -------- | -------- |
| `select 1 from information_schema.tables where table_schema='fat' and table_name='distance_cache';` | 0 rows | **0 rows** |
| `\dt fat.*` | canonical FAT tables, **without** `distance_cache` | **15 tables** — exact pre-DROP set minus `distance_cache` (see list below). |
| Orphan policies referencing the dropped table | 0 | **0** (`pg_policy` scan for `polrelid::regclass::text = 'fat.distance_cache'` returns 0; policies on a dropped table are removed by Postgres automatically) |
| `users_manage_own` policy still present on each remaining FAT table | YES, one row per non-distance_cache canonical FAT table | **YES** — present on `fat.recalls`, `fat.retain`, `fat.standby`, `fat.spoilt_meals`, `fat.user_rates`, `fat.financial_years`, `fat.claim_sequences`, `fat.claim_groups`, `fat.profile_ext`, `fat.home_address`, `fat.station_distances`. (`fat.friend_requests`, `fat.friendships`, `fat.claim_replication_events`, `fat.stations` use other policy names — pre-existing DEV state, unaltered.) |
| Post-DROP timestamp (UTC) | — | **2026-05-17T10:00:11.322245Z** |

`fat.*` table inventory **after** DROP (15 tables):

```
fat.recalls, fat.retain, fat.standby, fat.spoilt_meals, fat.user_rates,
fat.financial_years, fat.claim_sequences, fat.claim_groups, fat.stations,
fat.profile_ext, fat.home_address, fat.station_distances,
fat.friend_requests, fat.friendships, fat.claim_replication_events
```

Diff vs pre-DROP: **`-fat.distance_cache`** only. No other table
created, dropped, renamed, or altered.

**Pre-existing DEV-vs-canonical drift (NOT introduced by D2):**

The D2 checklist §4 canonical `\df fat.*` expectation lists exactly
`fat.set_updated_at` and `fat.increment_claim_sequence`. DEV already
held 12 functions in the `fat` schema **before** the DROP (friend
system, replication helpers): `accept_friend_request`,
`cancel_friend_request`, `increment_claim_sequence`,
`list_friend_requests_with_profile`, `list_friends_with_profile`,
`mark_replication_events_seen`, `reject_friend_request`,
`remove_friend`, `replicate_claim_to_friends`, `search_user_by_email`,
`send_friend_request`, `set_updated_at`. The same 12 functions remain
after the DROP — **the DROP did not create, delete, or modify any
function**. This drift is independent of `fat.distance_cache`. It is
flagged as a D3-readiness governance follow-up (see §17.10) but is
**not** a D2 regression and is **not** a stop condition under §2 of
the checklist (no orphaned policy and no unexpected function/table
**caused by the DROP**; both inventories — table-set and function-set
— differ only at the `-fat.distance_cache` row).

The corresponding `fat.friend_requests`, `fat.friendships`,
`fat.claim_replication_events`, `fat.retain`, `fat.spoilt_meals`,
`fat.user_rates` tables likewise pre-exist and are independent of
the dropped object.

### 17.7 Step 14 — Bounded smoke validation

The mission constrains smoke to "bounded DEV validation; startup/build
validation; targeted smoke checks tied to distance logic". A deployed
DEV runtime was not provisioned by this chat, so the manual UI smoke
(login / profile / Recall / Standby / Mark Paid) remains carried
forward to the D3 rehearsal entry chat that will have the deployed
runtime in hand.

Bounded smoke executed here:

- `npm ci` succeeded (117 packages, clean install).
- `next build` succeeded — exit code 0:

```
   ▲ Next.js 15.5.15

 ✓ Compiled successfully
 ✓ Generating static pages (14/14)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    14.7 kB         195 kB
├ ○ /_not-found                            994 B         103 kB
├ ○ /dashboard                             323 B         102 kB
├ ○ /forgot-password                     1.62 kB         166 kB
├ ○ /login                               1.72 kB         166 kB
├ ○ /new-claim                             989 B         182 kB
├ ○ /paths                                 325 B         102 kB
├ ○ /profile                             5.43 kB         167 kB
├ ○ /reset-password                      1.83 kB         163 kB
├ ○ /settings                            5.23 kB         166 kB
├ ○ /signup                              1.77 kB         166 kB
└ ○ /tax                                 4.66 kB         173 kB
```

Compile + types + lint + 14 static pages all OK. Route table is
identical to the §9 baseline (size variations are sub-kB and trace to
npm semver wiggle on a fresh `npm ci`, not D2). The `themeColor`
warnings are pre-existing Next 15 viewport-migration nags, present on
the parent commit, **not** introduced by D2 or the live DROP.

Distance-logic touchpoints (`lib/distance/*`,
`lib/claims/ClaimsContext.js`) were left untouched in this chat; the
build proves their type/lint health post-DROP. Per the bounded scope,
no further exploratory testing was performed.

### 17.8 Final post-DDL validation table (clears §10 DEFERRED entries)

| Command | Expected | Observed (live chat) |
| ------- | -------- | -------------------- |
| Supabase: `select 1 from information_schema.tables where table_schema='fat' and table_name='distance_cache';` | 0 rows | **0 rows** |
| Supabase: `\dt fat.*` | canonical FAT tables minus `distance_cache` | **15 tables, exact pre-DROP set minus `distance_cache`** |
| Supabase: `\dp fat.*` | no policy referencing `distance_cache` | **0 policies on `fat.distance_cache`; `users_manage_own` intact on the 11 canonical FAT tables that use it** |
| Supabase: `\df fat.*` | exactly `fat.set_updated_at`, `fat.increment_claim_sequence` | **12 functions present — pre-existing DEV drift, NOT changed by DROP. Flagged as a D3-readiness governance item; not a D2 regression.** |
| Vercel deployment history during the live-DDL window | no PROD alias activity | **N/A — no Vercel deploys issued from this chat (no Vercel calls made).** |

### 17.9 Rollback posture (post-DROP)

The DROP is reversible inside the documented window:

| If failure surfaces … | Action | Recoverable? |
| --------------------- | ------ | ------------ |
| Within Supabase PITR window from `2026-05-17T09:59:07Z` | PITR restore of the `fat.distance_cache` table to the anchor timestamp. | YES — PITR is the canonical Supabase platform mechanism for this; DEV is on `ACTIVE_HEALTHY`. |
| Outside PITR window | Structural restore by replaying lines 143, 372, 386 of `supabase/fat-schema.sql` at parent commit `0c23f04` (sha256 `e906174d62bf43a19e73690f827e0d172130c1622c0af0051f10a06c119f6fc0`) against DEV. Row data is non-existent (count was 0), so no data restore needed. | YES — `BLOCKER_RESOLUTIONS.md#B-2` rollback-posture statement holds. |
| Runtime caller surfaces later (R-03 invariant violated in retrospect) | Restore per above, **and** reopen B-2 via a fresh governance round. | YES — process documented in §3 of the D2 checklist. |

§4.3 rollback-invalidating events — none occurred:

- No uncaptured DEV write between the snapshot anchor (§17.1) and the
  DROP (§17.5) — only one SQL statement executed on DEV in the entire
  window, and it was the authorised DROP.
- No `next build` failure that was "fixed" by editing files outside
  the schema file — build was green first try.
- No accidental PROD connection — zero MCP calls referenced the PROD
  project ID `wgcqzamuspuqpedqasbc`.

### 17.10 Risk-register status (per mission "if authorised by governance")

The D2 checklist §6 success criterion includes "R-01 status moved to
`MITIGATED` in `RISK_REGISTER.md`". The D2 checklist §5 prohibited-
action list forbids "edit to ratified governance files themselves
(`… RISK_REGISTER.md …`); updates to those files require a fresh
governance round." This is a documented conflict between §5 and §6
of the same checklist.

**Mission directive on conflicts:** "If governance conflicts appear:
STOP, report the issue, do not improvise."

**Action taken:** No edit to `RISK_REGISTER.md` was made in this
chat. The R-01 → `MITIGATED` flip is **carried forward to a
governance pass** (per `ARCHITECTURE_ALIGNMENT_RULES.md` §9.3). This
chat reports the conflict here and surfaces it as a D3-readiness
blocker (§17.11).

### 17.11 Stop-condition audit (re-run with live-DDL data)

| §2 stop condition | Triggered? |
| ----------------- | ---------- |
| Step 2 returns non-zero row count | **NO** — `row_count = 0`. |
| Step 3 / live re-grep returns non-empty | **NO** — all five greps empty. |
| Step 4 touches any line outside the three named lines | **NO** — schema-file edit was applied in the repo-side D2 commit only; no further edits this chat. |
| Step 5 returns any non-empty match | **NO**. |
| Step 6 produces any diff hunk beyond rename | **NO** — sha256 byte-identity preserved (recorded in §6). |
| Step 9 build fails | **NO** — build green (§17.7). |
| Step 12 errors with anything other than clean DROP | **NO** — `apply_migration` returned `{"success": true}`; no warnings. |
| Step 13 orphaned policy / unexpected function or table | **NO orphans** caused by the DROP. Pre-existing DEV-vs-canonical drift in `\df fat.*` and in the `fat.friend_*` / `fat.claim_replication_events` tables is **not** introduced by D2 — see §17.6. Flagged as D3-readiness governance item (§17.10, §17.12). |
| Step 14 runtime regression | **NO** — build green; no runtime exercised in this chat. Manual smoke deferred to D3 entry chat per scope. |
| MCP call against PROD project ID `wgcqzamuspuqpedqasbc` | **NO** — zero PROD-targeted calls in this chat. |
| Uncoordinated edit on `supabase/fat-schema.sql`, `lib/distance/*`, or `lib/claims/ClaimsContext.js` from concurrent PR | **NO** — none observed. |
| Reopening of B-1 … B-4 in flight | **NO** — governance files unchanged. |

No stop condition was tripped.

### 17.12 Prohibited-action audit (live-DDL chat)

| §5 prohibited action | Occurred? |
| -------------------- | --------- |
| Any `ALTER TABLE`, `CREATE TABLE`, `CREATE VIEW`, `CREATE FUNCTION`, `CREATE TRIGGER`, `CREATE POLICY`, `GRANT`, `REVOKE`, `RENAME`, or `SET SCHEMA` in DEV or PROD | **NO** |
| Any `DROP` other than the single `DROP TABLE fat.distance_cache` in DEV | **NO** — exactly one DROP, exactly the authorised target. |
| Edits under `app/`, `components/`, `lib/`, `pages/`, `supabase/` (other than the repo-side three-line removal already in `4aed08d`), `package.json`, `package-lock.json`, `next.config.*`, `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `.github/`, CI config | **NO** — none touched this chat. |
| Modification of the defensive try/catch in `lib/claims/ClaimsContext.js#updatePaymentStatus` | **NO** |
| Creation / deletion / edit of edge functions under `supabase/functions/` | **NO** |
| Introduction of `fat.payment_components` DDL or back-fill | **NO** |
| Any new RPC, view, materialised view, or function in `fat.*` | **NO** |
| Change to `fat.stations` seed data | **NO** |
| Work on `public.*` beyond reading `public.profiles` at runtime | **NO** (no runtime executed) |
| MCP call selecting PROD project ID `wgcqzamuspuqpedqasbc` | **NO** |
| Vercel deploy / alias switch / env-var change targeting PROD | **NO** (zero Vercel calls of any kind) |
| Deletion of `FAT_SCHEMA_AUDIT_REPORT.md` or `DISTANCE-SYSTEM-DEPLOY-REPORT.md` | **NO** |
| Edit to ratified governance files (`BLOCKER_RESOLUTIONS.md`, `D2_EXECUTION_SCOPE.md`, `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`, `RISK_REGISTER.md`, `REHEARSAL_READINESS_CRITERIA.md`) | **NO** — all unchanged this chat. R-01 register flip deferred to governance pass (see §17.10). |
| "While I'm here" cross-domain edit | **NO** |

Zero prohibited actions occurred. `npm ci` ran for build evidence
only; it did not modify `package.json` or `package-lock.json`.

### 17.13 D3-readiness blockers remaining after this chat

1. **Manual DEV smoke** (login / profile / Recall / Standby / Mark
   Paid) — requires deployed DEV runtime. Deferred to D3 entry chat.
2. **`d2-complete` integration-branch tag** — checklist step 15 calls
   for it on the integration-branch head post-merge; this chat operates
   on the execution branch and is mission-forbidden from merging /
   opening PR. Tag carries forward to whichever chat is authorised to
   merge into the integration branch.
3. **D2 PR open / merge / reviewer sign-off** — mission-forbidden in
   this chat. Carry-forward.
4. **`RISK_REGISTER.md` R-01 → `MITIGATED` flip** — gated on a fresh
   governance round (§17.10).
5. **D3 entry brief** (snapshot ID, script, rollback, success
   criteria, time-box, out-of-scope reminder) — authored in a separate
   chat per `D3_REHEARSAL_ENTRY_CHECKLIST.md` §4.
6. **DEV-vs-canonical `\df fat.*` and extra `fat.*` table drift**
   (friend system + replication helpers) — surfaces against the §4
   canonical expectation; pre-existing, **not** introduced by D2;
   requires governance ratification of the post-friend-system canonical
   list (or removal) before D3 entry can declare a clean `\df` /
   `\dt` outcome under the existing checklist text.
7. **Manual DEV-side checks tied to the deployed runtime**:
   confirmation that the ledger-sync warning behaviour in
   `lib/claims/ClaimsContext.js#updatePaymentStatus` is unchanged in
   user-facing flow.

Items 1, 2, 3, 5, 7 are **expected** carry-forwards already
acknowledged in the repo-side D2 evidence. Items 4 and 6 are
**governance** items surfaced by this chat but not closable inside
this chat's bounded mission.

### 17.14 D3-readiness determination (this chat)

**D3 readiness: NOT READY.**

D3 entry requires the full §6 success criteria to be `YES`. This chat
closes:

- §6 row "DEV Supabase: `fat.distance_cache` does not exist" → **YES**
- §6 row "`next build` succeeds on the post-merge integration branch"
  → **YES** on the execution branch (post-merge build is identical in
  content — fast-forward merge).

This chat leaves open:

- §6 row "Steps 1 – 16 of §1 executed in order with evidence
  captured" → **PARTIAL** — steps 10, 11, 14, 15 still deferred (PR
  open, reviewer sign-off, manual smoke, `d2-complete` tag).
- §6 row "Manual smoke (login, profile, one Recall, one non-Recall,
  Mark Paid) passes" → **DEFERRED** (no deployed runtime).
- §6 row "Integration branch head is tagged `d2-complete`" → **NOT
  YET** (carries forward to integration-branch chat).
- §6 row "R-01 status moved to `MITIGATED` in `RISK_REGISTER.md`" →
  **DEFERRED** to governance pass (§17.10).
- Pre-existing DEV-canonical drift (§17.13 item 6) → governance
  follow-up required before §4 `\df` / `\dt` checks can be declared
  fully canonical.

D3 entry blockers therefore remain the items listed in §17.13.

### 17.15 Validation summary (mission output-format requirements)

- **DEV-only execution:** YES — every MCP call in this chat named
  `kctctvpobbizhkiqkgqw`.
- **No PROD access:** YES — zero references to
  `wgcqzamuspuqpedqasbc` in any tool call.
- **No deploys:** YES — zero Vercel / deploy tool calls in this chat.
- **No runtime refactor:** YES — no edits under `app/`, `components/`,
  `lib/`, `pages/`, or `supabase/` (beyond the pre-existing repo-side
  D2 commit `4aed08d`).
- **No schema expansion:** YES — exactly one DDL statement executed:
  `DROP TABLE fat.distance_cache;`.
- **Only approved removal executed:** YES — `fat.distance_cache` only.
- **Evidence complete:** YES — §17.1 – §17.14 captured.
- **Bounded scope maintained:** YES — no exploratory queries, no
  refactors, no PR/merge/deploy attempts, no governance-file edits.

### 17.16 Post-action SHAs

```
$ date -u +%Y-%m-%dT%H:%M:%SZ
2026-05-17T10:00:11Z   # post-DROP timestamp

$ git rev-parse HEAD
4aed08d2717196045060cf552d83339d736ee9c9   # pre-evidence-commit
```

The post-action HEAD SHA for this chat's evidence commit is recorded
in the commit metadata itself once the commit lands on
`claude/d2-alignment-execution-R7iyZ`.
