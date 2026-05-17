# PROD Reconciliation — Blocker Resolutions (B-1 … B-4)

> Authoritative governance decisions for the four blockers that gated D2
> (DEV alignment execution). This document supersedes any prior informal
> notes on these items. Decisions here are binding for the D2 scope; any
> later reversal must be tracked as a new governance change.
>
> **Status of this document:** ratified for D2 scope. No code, schema,
> migration, or production action is authorised by this document — it is
> a governance instrument only.
>
> **Authoritative inputs consumed:**
> - `supabase/fat-schema.sql` (canonical DDL after the `fat.*` schema move)
> - `FAT_SCHEMA_AUDIT_REPORT.md` (runtime migration audit)
> - `docs/FAT_SCHEMA_ARCHITECTURE.md` (schema ownership map)
> - `DISTANCE-SYSTEM-DEPLOY-REPORT.md` (v4 distance deploy notes)
> - `lib/claims/ClaimsContext.js` (canonical payment-status truth source)
> - `lib/distance/*` (distance system runtime callers)
> - `supabase-migration-v4-distance-tables.sql` (stale repo-root SQL)
>
> **Already-accepted findings (carried forward, not re-litigated):**
> - DEV runtime is already fully aligned to `fat.*`.
> - Zero runtime `public.fat_*` references remain in `app/`, `components/`, `lib/`.
> - `public.profiles` is the only legitimate `public.*` runtime dependency
>   (cross-app shared profile — first/last name only).
> - PROD still contains the legacy `public.fat_*` structure; PROD is not
>   touched anywhere in D2.

---

## B-1 — Payment ledger direction (`fat.payment_components`)

### Decision: **DEFER — do not adopt and do not remove in D2.**

Classification: **post-launch, optional, opportunistic mirror.**

### Findings

- `fat.payment_components` is **not present** in the canonical schema
  (`supabase/fat-schema.sql`). It was introduced by the deleted
  `supabase-migration-v3-payment-components.sql` migration which was
  removed from the tree in commit `8efce33` ("refactor(db): move
  FAT-owned resources to dedicated `fat` schema").
- The columns the v3 migration added to the four claim tables
  (`payment_status`, `payment_date`, `parent_claim_id`, `payment_method`,
  `component_type`, `component_amount`) **are** present in the live DEV
  schema and the canonical DDL (`payment_status`, `payment_date` are
  explicit in `fat-schema.sql`; the others were applied directly in DEV
  during v3 and survived the schema move).
- Runtime writes against the ledger live only in
  `lib/claims/ClaimsContext.js#updatePaymentStatus` (lines 661–678).
  They are wrapped in a defensive `try { … } catch (ledgerErr) { warn }`
  and only mirror the canonical write. The catch is reachable when the
  table is absent (PostgREST returns a relation-not-found error) and
  logs `[Claims] Payment component ledger sync warning`. The UI write
  always succeeds independently.
- The **canonical truth source** for payment status is the per-row
  `payment_status` column on each claim table (see ClaimsContext
  comments at lines 435–438, 723–730). `parent_status` on
  `fat.claim_groups` is explicitly documented as a **cached projection**,
  not authoritative. The ledger is therefore **not** in the truth path
  for any reporting, reconciliation, dashboard, or export code today —
  `lib/reconciliation/*` reads the claim rows directly.

### Rationale

Adopting the ledger now would require: (a) re-introducing a DDL artefact
either via a new authored migration or by extending
`supabase/fat-schema.sql`, (b) re-establishing the v3 RLS/triggers, (c)
introducing seed/back-fill logic for existing claims, and (d) deciding
whether `fat_derive_parent_payment_status` and `fat_payment_summary`
(the v3 function/view) are reintroduced or replaced. None of these are
in D2 scope. Removing the ledger writes now would be wasted churn: the
calls are inert when the table is absent and harmless when it is
present.

### Impact / risk

- **Operational risk:** none today. Defensive try/catch absorbs the
  absence.
- **Reporting implications:** nil. No report reads from the ledger.
- **Architecture impact:** keeps a small dead-but-inert code path in
  `ClaimsContext.updatePaymentStatus`. Acceptable until a deliberate
  post-launch decision.
- **Launch-blocking:** **no.** Launch can proceed without the ledger.

### Future governance rule (post-D2)

A separate, scoped initiative ("Payment Ledger Direction") must
explicitly decide one of:

1. **Adopt** — add `fat.payment_components` to `supabase/fat-schema.sql`
   with full RLS, back-fill plan, and a hard write path (no silent
   try/catch). Replace `parent_status` cache with a view or computed
   field driven by the ledger.
2. **Remove** — delete the ledger try/catch block from
   `ClaimsContext.updatePaymentStatus`, delete any related references in
   audit docs, and treat `subclaim.payment_status` as the only truth
   source forever.
3. **Defer indefinitely** — codify the current behaviour in
   `docs/FAT_SCHEMA_ARCHITECTURE.md` as an explicit "intentionally
   inert" pattern.

D2 takes **option 3 implicitly for the rehearsal window only**, and the
above choice must be made before any subsequent migration that touches
payment data.

---

## B-2 — `fat.distance_cache` removal decision

### Decision: **REMOVE from the canonical DEV reference (DDL + RLS + policy) — D2 scope.**

Classification: **fully obsolete v1 artefact, safe to drop in DEV.**

### Findings

- Zero runtime callers across `app/`, `components/`, `lib/`. Verified by
  `grep -rn 'distance_cache' --include='*.js' --include='*.jsx'
  --include='*.ts' --include='*.tsx' --include='*.mjs'` → no matches.
- The only references are in:
  - `supabase/fat-schema.sql` (DDL + `enable row level security` +
    `users_manage_own` policy, lines 143, 372, 386)
  - `docs/FAT_SCHEMA_ARCHITECTURE.md` (table-list and migration-notes
    descriptive prose)
  - `supabase-migration-v4-distance-tables.sql` (commentary only — also
    stale, handled by B-3)
- It is functionally superseded by `fat.home_address` +
  `fat.station_distances` (v4 schema), both of which are the actual
  runtime cache and confirmation surface (see
  `lib/distance/addressCache.js`, `lib/distance/stationDistance.js`,
  `lib/distance/nominatim.js`).
- PROD does not have `fat.distance_cache` at all — PROD still holds the
  legacy `public.fat_distance_cache` (v2). PROD reconciliation is **not**
  part of D2, so PROD is untouched by this decision.

### Rationale

The table is dead code at the database level. Carrying it in the
canonical schema invites future contributors to wire something against
it and introduces a needless RLS surface and seed cost when the schema
is replayed into a fresh project. Removing it from DEV (after a backup
and a zero-rows assertion) consolidates the distance cache on the v4
surface, which is the only one the runtime reads/writes.

### Safety assessment

- **Pre-removal evidence required:** confirm `select count(*) from
  fat.distance_cache` is 0 in DEV (expected from prior audit).
- **Static safety:** grep proves no runtime callers; no `from('distance_cache')`,
  no `fat.distance_cache` string references in JS.
- **Test dependency:** none — repo has no test suite that touches it.
- **RPC / edge function dependency:** none — the only fat-schema RPC is
  `fat.increment_claim_sequence` and it does not reference
  `distance_cache`.
- **Edge function dependency:** none — `supabase/` contains no edge
  functions.

### Rollback posture

- **What must remain recoverable:** the DDL itself. Removal is performed
  by deleting the `create table … fat.distance_cache`, the
  `alter table … enable row level security`, and the
  `create policy users_manage_own on fat.distance_cache` lines from
  `supabase/fat-schema.sql`, **and** documenting the row count snapshot
  taken before the drop.
- **Rollback path:** restore the three lines from the previous commit of
  `supabase/fat-schema.sql` and replay against the project. Because the
  table was empty, restoration is structural only.
- **Invalidates rollback:** any DEV write into the table between
  snapshot and drop (effectively impossible — no code path writes to
  it).

### Validation requirements

- Grep-clean: `grep -rn 'distance_cache' app/ components/ lib/` returns
  empty.
- DEV row-count snapshot captured and attached to D2 evidence pack.
- `supabase/fat-schema.sql` diff reviewed and approved as part of the
  D2 PR.

### Note on **execution mechanics** (not authorised by this document)

This document records the **decision**. The actual `DROP TABLE` /
schema-file edit is governed by `D2_EXECUTION_SCOPE.md` and remains
prohibited until D2 is formally entered. This document does not
authorise SQL, migrations, or deploy.

---

## B-3 — Stale repo-root migration handling
### File: `supabase-migration-v4-distance-tables.sql`

### Decision: **ARCHIVE under `docs/PROD_RECONCILIATION/archive/`, REMOVE from the repo root, in D2 scope.**

Classification: **stale, superseded, non-zero replay risk.**

### Findings

- The file lives at the repository root (`/supabase-migration-v4-distance-tables.sql`).
- It targets the **legacy** `public.fat_*` layout (`create table if not
  exists public.fat_home_address`, `public.fat_station_distances`),
  which is the **PROD layout**, not the DEV layout.
- It predates the schema move in commit `8efce33`. In that commit, the
  related v3 migration (`supabase-migration-v3-payment-components.sql`),
  v2 migration, rates migration, and `supabase-schema.sql` were all
  deleted; v4 was **inadvertently left behind**.
- The canonical reference is now `supabase/fat-schema.sql`. The DEV
  database has been migrated via the Supabase MCP migrations
  `fat_schema_migration` and `fat_function_bodies_fix` (per
  `docs/FAT_SCHEMA_ARCHITECTURE.md` lines 130–134), neither of which is
  this file.
- `DISTANCE-SYSTEM-DEPLOY-REPORT.md` explicitly notes the file caused
  duplicate RLS policies on first apply ("Both tables have duplicate
  RLS policies (from migration + pre-existing)"). That duplication risk
  resurfaces every time someone replays the file.

### Replay-risk severity: **MEDIUM-HIGH.**

Why not LOW: the file uses `if not exists` guards, so re-running it
against a DEV project where the `fat.*` tables already exist will not
overwrite them — but it **will** create a **parallel set of
`public.fat_*` tables**, recreating the legacy layout that was
intentionally drained. This silently re-establishes the
schema-confusion state that D2 is meant to clean up, and reintroduces
RLS policies in the wrong schema.

Why not CRITICAL: it is `IF NOT EXISTS`/idempotent and additive; it
cannot drop data, and PROD already has the legacy structure (so against
PROD it is a no-op for the existing tables).

### Prevention strategy

1. **Archive, do not delete.** Move
   `supabase-migration-v4-distance-tables.sql` from the repo root into
   `docs/PROD_RECONCILIATION/archive/legacy-migrations/` and prepend a
   `SUPERSEDED — DO NOT REPLAY` header in a sibling `README.md` (not in
   the SQL itself; the SQL body must remain byte-identical for
   historical fidelity).
2. **Single source of truth.** `supabase/fat-schema.sql` is the **only**
   replayable DDL artefact in the repository going forward.
3. **Repo-hygiene rule (codified in `ARCHITECTURE_ALIGNMENT_RULES.md`):**
   no `*.sql` files at the repository root. All DDL lives under
   `supabase/`. Archived legacy SQL lives only under
   `docs/PROD_RECONCILIATION/archive/`.

### Governance controls

- Any reviewer who sees a `*.sql` file proposed at the repo root must
  block the PR pending governance review.
- The CI/PR template should remind contributors that the canonical
  schema is `supabase/fat-schema.sql`.
- Future migration practice: use the Supabase MCP migration log as the
  authoritative migration history; treat replayable DDL as a snapshot
  artefact, not an append-only series.

### Impact / risk

- **Operational risk if replayed:** medium — recreates legacy `public.fat_*`
  tables, reintroduces RLS-policy duplication, reverts schema-alignment work.
- **Operational risk after archive:** negligible — file is moved out of
  the root, header warns against replay, no automation references it.
- **Governance implications:** establishes "no SQL at repo root" as a
  repo-hygiene rule and the schema-alignment principle codified in
  `ARCHITECTURE_ALIGNMENT_RULES.md`.

---

## B-4 — Formal `station_distances` placement acceptance

### Decision: **RATIFY `fat.station_distances` as the authoritative location. No alternative considered viable.**

Classification: **bounded-domain, FAT-owned, per-user state.**

### Findings

- `fat.station_distances` is per-user (`user_id uuid not null references
  auth.users(id) on delete cascade`) and per-FAT-station (`station_id
  integer`, referencing `fat.stations`).
- RLS is enabled with `users_manage_own` (`auth.uid() = user_id`) — see
  `supabase/fat-schema.sql` lines 374, 388.
- Schema includes per-user staleness fields
  (`is_stale`, `stale_reason`), per-user confirmation fields
  (`confirmed_distance_km`, `confirmation_source`, `confirmed_at`), and
  per-user address-version linkage (`home_address_hash`,
  `home_address_version`).
- All runtime callers use the `fat` schema-scoped client:
  `lib/distance/addressCache.js` (lines 100, 154, 204, 222) and
  `lib/distance/stationDistance.js` (read-only via
  `getStationDistance`).
- Stations themselves (`fat.stations`) are FAT-owned reference data
  (seed of 48 rows, see `docs/FAT_SCHEMA_ARCHITECTURE.md` line 30).
  There is no cross-app station resource.

### Ownership model

- **Authoritative owner:** the Fire Allowance Tracker (`fat` schema).
- **Per-row owner:** the authenticated user identified by `user_id`.
- **No shared rows.** A row in `fat.station_distances` represents one
  user's confirmed/estimated distance to one station. There is no
  cross-user aggregation, no admin override, no service-role write
  outside the user's own context.

### RLS expectations

- `enable row level security` is mandatory and must remain on.
- Single policy: `users_manage_own FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id)` is the only policy permitted.
- No `service_role_manage` policy is added — there is no operational
  need for service-role writes outside the user context (contrast with
  `fat.stations`, which has both `authenticated_read` and
  `service_role_manage`).
- The "Exposed schemas" PostgREST setting must include `fat` (already a
  precondition of the schema move; no D2 change).

### Future governance rules for `fat.station_distances`

1. **Shared-reference logic is prohibited.** The table must never store
   rows that are shared across users (e.g. "the canonical distance from
   Sunshine to Brooklyn"). If a future feature wants a station-pair
   reference distance, it must be modelled as a separate table
   (`fat.station_pair_distances` or similar) with its own ownership
   model — *not* by adding nullable user_id or removing RLS on this
   table.
2. **Cross-app sharing is prohibited.** Even though stations exist in
   the database, no other application may read or write
   `fat.station_distances`. If a sibling app (MICA, CAB, …) needs
   distance data, it owns its own table in its own schema.
3. **Bounded-domain rationale.** The table is a per-user cache derived
   from the user's home address. The address is in `fat.home_address`
   (private to FAT). The confirmation step is a FAT-specific workflow.
   Therefore the data has no meaningful existence outside FAT.
4. **No promotion to `public.*` under any pretext.** Any proposal to
   move this table to `public` for "shared reference" or "cross-app
   reuse" is automatically rejected as architectural drift.
5. **In-place evolution only.** Schema changes (new columns, new
   indexes) are applied in place under `fat.*`. There is no "v5"
   parallel table.

### Operational implications

- Reconciliation reports do **not** read this table — distances are
  snapshotted onto the claim row at write time (`dist_home_km`,
  `dist_stn_km`, `home_address_snap` on `fat.recalls`). The cache is
  purely a UX-quality device; loss of the cache degrades performance,
  not correctness.
- Backups: routine Supabase backups cover it; no special handling.
- Cache rebuild cost on full wipe: bounded by Nominatim/OSRM rate
  limits per user (see `lib/distance/osrm.js`, `nominatim.js`).

### Impact / risk

- **Operational risk:** none — codifies the existing structure.
- **Governance implications:** closes the placement question
  permanently and preempts future proposals to relocate or share the
  table.
- **Architecture impact:** strengthens the bounded-domain principle for
  FAT-owned per-user state.

---

## Summary table

| Blocker | Decision | D2 action | Launch-blocking |
| ------- | -------- | --------- | --------------- |
| B-1 payment ledger | DEFER | none (codify) | no |
| B-2 `fat.distance_cache` | REMOVE from canonical DEV reference | edit `supabase/fat-schema.sql`; capture row-count evidence | no |
| B-3 stale v4 migration | ARCHIVE | move file under `docs/PROD_RECONCILIATION/archive/` with `DO NOT REPLAY` README | no |
| B-4 `fat.station_distances` placement | RATIFY `fat.*` | none (codify) | no |

All four resolutions are documentation-and-DEV-only. None authorise any
PROD-side action.
