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
