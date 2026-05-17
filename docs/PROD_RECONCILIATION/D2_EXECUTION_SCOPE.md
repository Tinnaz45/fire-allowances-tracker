# D2 — DEV Alignment Execution Scope

> **Phase identifier:** D2 (DEV alignment execution).
> **Predecessors:** D0 (PROD reconciliation governance package), D1 (DEV
> alignment inventory + FAT resource ownership matrix + DEV alignment
> scope audit), and the B-1…B-4 resolutions in
> `BLOCKER_RESOLUTIONS.md`.
> **Successors:** D3 (rehearsal execution against a DEV snapshot) and
> D4 (PROD reconciliation). **D3 and D4 are explicitly outside D2.**
>
> **Operating posture:** D2 is a **bounded DEV alignment** scope. It
> exists to bring the DEV reference artefacts (the canonical schema
> file, repo hygiene, and accompanying governance docs) into agreement
> with the runtime state that is already aligned, and to retire two
> known dead artefacts (`fat.distance_cache`, the stale v4 SQL at the
> repo root). It does **not** rehearse, deploy, or touch PROD.

---

## 1. Safe actions (the only actions authorised under D2)

The following list is **exhaustive**. Anything not enumerated here is
out of scope.

### 1.1 Canonical schema edit (DEV reference only)

- **File:** `supabase/fat-schema.sql`
- **Allowed changes:**
  - Remove the three lines that define `fat.distance_cache`:
    - the `create table if not exists fat.distance_cache (...)` block,
    - the `alter table fat.distance_cache enable row level security;`
      line,
    - the `create policy users_manage_own on fat.distance_cache ...`
      line.
  - No other DDL change is authorised in D2.

### 1.2 Live DEV database action (executed against the DEV Supabase project only)

- One operation: drop the empty `fat.distance_cache` table in DEV.
- **Pre-conditions (all must hold and be evidenced):**
  - `select count(*) from fat.distance_cache;` returns `0`.
  - Snapshot of the DEV database taken via the Supabase backup
    mechanism within the preceding 24 hours.
  - Static grep evidence attached: no runtime caller in
    `app/`, `components/`, `lib/`.
- **Out of scope:** any other `DROP`, `ALTER`, `CREATE`, `INSERT`,
  `UPDATE`, `DELETE`, `GRANT`, `REVOKE`, `RENAME`, or schema-move
  statement on the DEV database.

### 1.3 Repo-hygiene file move (the stale v4 SQL)

- **Action:** `git mv supabase-migration-v4-distance-tables.sql
  docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql`
- **Accompanying doc:** create
  `docs/PROD_RECONCILIATION/archive/legacy-migrations/README.md` with a
  prominent `SUPERSEDED — DO NOT REPLAY` notice referencing
  `BLOCKER_RESOLUTIONS.md#B-3`.
- **Constraint:** the SQL body must be byte-identical to its current
  contents after the move. Do not edit the SQL itself.

### 1.4 Documentation alignment (markdown only)

- Update `docs/FAT_SCHEMA_ARCHITECTURE.md`:
  - Remove the `fat.distance_cache` row from the table list.
  - Adjust the "Migration notes" paragraph that mentions the
    superseded v1 cache to point to `BLOCKER_RESOLUTIONS.md#B-2`.
  - Note the codified `payment_components` deferral
    (`BLOCKER_RESOLUTIONS.md#B-1`) where the existing prose discusses
    the v3 ledger.
- Update `FAT_SCHEMA_AUDIT_REPORT.md` only if a reviewer determines a
  factual statement has become stale. Otherwise leave intact as
  historical record.
- Leave `DISTANCE-SYSTEM-DEPLOY-REPORT.md` intact as a historical
  record; do **not** edit the v4 deploy narrative.

### 1.5 Evidence-collection requirements (mandatory artefacts)

Attach to the D2 review packet:

| Evidence | Form |
| -------- | ---- |
| Grep proof: no runtime callers of `distance_cache` | command + output |
| Grep proof: no `from('fat_*')` residual in `app/`, `components/`, `lib/` | command + output |
| Grep proof: no `public.fat_*` residual in `app/`, `components/`, `lib/` | command + output |
| Row-count snapshot of `fat.distance_cache` in DEV | SQL + result |
| Supabase backup ID + timestamp for the DEV project | screenshot or API response |
| Diff of `supabase/fat-schema.sql` | unified diff |
| `git log --stat` showing only authorised file movements | command + output |
| `next build` success against the post-edit branch | build log tail |
| Confirmation that `node -e` / runtime smoke against the dropped table fails harmlessly (relation-not-found, no UI breakage) | manual note + screenshot, optional |

---

## 2. Prohibited actions (hard stop list)

The following are **prohibited** under D2. Any reviewer encountering
one of these in a D2 change set must reject the change set.

### 2.1 Prohibited schema changes

- No `ALTER TABLE` of any FAT table (no new columns, no constraint
  changes, no rename, no `SET SCHEMA`).
- No introduction of `fat.payment_components` or any reintroduction of
  the v3 ledger (see B-1).
- No new tables, no new functions, no new views, no new triggers, no
  new RPC.
- No new RLS policies; no modification of existing policies.
- No grants/revokes beyond the existing ones in `fat-schema.sql`.
- No edits to `fat.stations` seed data.
- No schema work on `public.*` of any kind.

### 2.2 Prohibited runtime rewrites

- No edits to any file under `app/`, `components/`, or `lib/`.
- No removal of the defensive try/catch in
  `lib/claims/ClaimsContext.js#updatePaymentStatus` (B-1 deferral).
- No new dependency on the `payment_components` ledger.
- No changes to the distance system runtime (`lib/distance/*`).
- No changes to `lib/supabaseClient.js`.

### 2.3 Prohibited production actions

- No connection to the PROD Supabase project (`wgcqzamuspuqpedqasbc`).
- No reading of PROD data via any tool, including MCP.
- No PROD deploy via Vercel or any other channel.
- No PROD migration replay.
- No PROD RLS or grant change.
- No "preview against PROD" of any form.

### 2.4 Prohibited architectural drift

- No relocation of `fat.station_distances` to `public.*` or to a new
  schema. The B-4 ratification is binding.
- No introduction of cross-app shared distance state.
- No introduction of a "reference distance" table outside the
  bounded-FAT-domain rules.
- No re-introduction of `fat_*` table-name prefixes.

### 2.5 Prohibited "cleanup creep"

- No deletion of historical reports (`FAT_SCHEMA_AUDIT_REPORT.md`,
  `DISTANCE-SYSTEM-DEPLOY-REPORT.md`).
- No re-organisation of `docs/` beyond creating
  `docs/PROD_RECONCILIATION/` and its `archive/`.
- No re-formatting of `supabase/fat-schema.sql` beyond the exact lines
  required by B-2.
- No "while I'm here" fixes to unrelated code, JSX, or build config.
- No new ESLint, Prettier, TypeScript, or CI configuration.
- No deletion of `push-fix.bat` or any other operational helper script
  not explicitly named here.

---

## 3. Validation requirements

Each item below must be re-verified after the D2 changes are staged
and before the D2 PR is merged.

### 3.1 Runtime validation

- `next build` completes successfully on the D2 branch (Next.js 15.5.x).
- Manual smoke test against the DEV deployment after the schema edit:
  - Login round-trip (auth path unaffected).
  - Profile load + save (`fat.profile_ext`).
  - One Recall claim end-to-end (exercises
    `fat.home_address`, `fat.station_distances`,
    `fat.claim_groups`, `fat.recalls`).
  - One non-Recall claim (e.g. Standby) to confirm non-distance flows
    unaffected.
- The defensive `payment_components` try/catch must still log its
  warning and not break the Mark Paid toggle (B-1 deferral confirmed).

### 3.2 Grep validation

Run each of the following from the repo root; **all must return
empty**:

```
grep -rn "distance_cache"      app/ components/ lib/
grep -rn "fat_distance_cache"  app/ components/ lib/
grep -rn "from('fat_"          app/ components/ lib/
grep -rn "public\.fat_"        app/ components/ lib/
```

The first two should also be empty across the whole repository **except
for** `docs/PROD_RECONCILIATION/archive/`,
`docs/PROD_RECONCILIATION/BLOCKER_RESOLUTIONS.md`, and this file. The
archived v4 SQL is the only legitimate residual.

### 3.3 Dependency validation

- `package.json` and `package-lock.json` are unchanged.
- No new edge functions appear under `supabase/`.
- No new RPC names appear in any source file.

### 3.4 Schema-ownership validation

After the DEV `DROP TABLE`:

- `\dt fat.*` lists every table in `supabase/fat-schema.sql` **except**
  `fat.distance_cache`.
- `\dp fat.*` shows the expected RLS policies (no orphaned policy on a
  vanished table).
- `\df fat.*` shows `fat.set_updated_at` and
  `fat.increment_claim_sequence` only.
- `public.*` listing shows `profiles` (and any other sibling-app
  tables); no new `public.fat_*` entries created by this D2 action.

### 3.5 Deployment validation

- The DEV Vercel deployment continues to serve.
- No PROD deployment was triggered (verified via Vercel deployment
  history: only DEV alias activity in the D2 window).

### 3.6 Rollback validation

- The pre-D2 commit of `supabase/fat-schema.sql` is preserved in git
  history and can be checked out and replayed against any project to
  reinstate `fat.distance_cache` structurally.
- The archived `supabase-migration-v4-distance-tables.sql` is preserved
  byte-identical under `docs/PROD_RECONCILIATION/archive/`.

---

## 4. Rollback posture

### 4.1 What must remain recoverable

- The exact pre-D2 state of `supabase/fat-schema.sql`.
- The exact byte sequence of `supabase-migration-v4-distance-tables.sql`
  (now under `archive/`).
- The DEV Supabase database state — recoverable from the daily backup
  taken before the drop.
- The runtime behaviour of `lib/claims/ClaimsContext.js#updatePaymentStatus`
  (unchanged in D2 by design).

### 4.2 Evidence required before any action

For each authorised action in §1, the corresponding evidence in §1.5
must exist **before** the action is performed, **not** as a
post-hoc artefact.

### 4.3 What invalidates rollback confidence

- Any uncaptured DEV write between snapshot and action.
- A failed `next build` after the schema-file edit.
- Discovery of a runtime caller for `distance_cache` that the
  pre-action grep missed (rollback path: revert the schema-file edit,
  do not yet run the `DROP` in DEV).
- Discovery that the archive move broke a tool reference (no tool
  references it today; if one appears mid-D2, rollback is to `git
  revert` the move and re-evaluate).
- Any accidental connection to the PROD Supabase project — automatic
  invalidation; pause D2 and convene governance review.

---

## 5. Rehearsal prerequisites (D3 entry gate)

D3 (rehearsal execution against a DEV snapshot of the PROD
reconciliation script) **must not begin** until **all** of the
following are simultaneously true:

### 5.1 Exact conditions required

1. The D2 PR is merged into the integration branch and tagged with the
   `d2-complete` marker.
2. `supabase/fat-schema.sql` no longer contains any reference to
   `fat.distance_cache`.
3. The DEV Supabase project no longer contains `fat.distance_cache`.
4. `supabase-migration-v4-distance-tables.sql` no longer exists at the
   repo root; the archived copy is present at the path defined in §1.3
   with the `DO NOT REPLAY` README alongside.
5. `BLOCKER_RESOLUTIONS.md` is unchanged from the ratified version
   (B-1…B-4 decisions intact).
6. `ARCHITECTURE_ALIGNMENT_RULES.md`, `DEV_ALIGNMENT_SCOPE.md`,
   `RISK_REGISTER.md`, and `REHEARSAL_READINESS_CRITERIA.md` are
   present and reviewed.

### 5.2 Exact evidence required

- The full evidence pack from §1.5, attached to the D2 PR.
- A separate D3 entry brief that names the DEV snapshot identifier, the
  PROD-reconciliation script to be rehearsed, and the rollback
  procedure for the rehearsal.
- A signed-off `REHEARSAL_READINESS_CRITERIA.md` (see that file for the
  binary checklist).

### 5.3 Approval expectations

- D2 → D3 transition requires explicit approval from the governance
  owner. Implicit promotion (e.g. "the build is green so we can start
  rehearsal") is **not** permitted.
- The approval must reference the evidence pack and the readiness
  checklist by commit SHA.

### 5.4 Blockers that invalidate readiness

- Any unresolved item in `RISK_REGISTER.md` whose status is `OPEN` and
  whose severity is `MED` or higher.
- Any reopening of B-1…B-4 since ratification.
- Any uncoordinated change to `supabase/fat-schema.sql` between D2
  completion and D3 entry.
- Any drift in the DEV runtime (e.g. a new `from('fat_*')` reference
  re-introduced).
- Any indication that PROD has been touched by any tool, person, or
  process during the D2 window.

---

## 6. Scope guardrail summary

| Question | Answer |
| -------- | ------ |
| Are new tables created in D2? | No. |
| Are existing tables altered in D2? | One drop only: `fat.distance_cache`. No alters. |
| Is PROD touched in D2? | No. |
| Is runtime code edited in D2? | No. |
| Are markdown files edited in D2? | Yes — see §1.4. |
| Is a file moved in D2? | Yes — the stale v4 SQL only. See §1.3. |
| Is rehearsal performed in D2? | No. Rehearsal is D3. |
| Is the payment ledger adopted in D2? | No. Deferred (B-1). |
