# Architecture Alignment Rules

> Authoritative repo-wide architecture rules derived from the PROD
> reconciliation governance package. These rules are **binding** during
> D2 and forward; deviations require an explicit governance change.
> They consolidate prior accepted findings, the B-1…B-4 resolutions,
> and the schema-ownership model already documented in
> `docs/FAT_SCHEMA_ARCHITECTURE.md`.

---

## 1. Schema ownership

1.1 **`fat` is the FAT application boundary.** Every FAT-owned table,
function, RPC, trigger, policy, and sequence lives under `fat.*`.

1.2 **`public.profiles` is the only legitimate `public.*` runtime
dependency** for FAT. Other apps (MICA, CAB, …) own their own schemas
or their own slice of `public.*`; FAT must not read or write them.

1.3 **`auth.*` is Supabase-managed.** FAT references `auth.users(id)`
via foreign keys only.

1.4 **No `fat_` table-name prefixes inside the `fat` schema.** Schema
namespacing replaces the prefix. New tables must follow this naming.

1.5 **No table or function in `fat.*` may carry per-app suffixes**
(`_fat`, `_mica`, …) — the schema already encodes ownership.

---

## 2. Cross-app and shared-state rules

2.1 **No shared user-data tables across apps.** If a sibling app needs
distance data, claim data, or any FAT-owned concept, it must own its
own copy in its own schema.

2.2 **Shared reference tables (if ever introduced) must live in
`public.*` with explicit governance approval** and be append-only from
the FAT side. FAT currently has none.

2.3 **No promotion of FAT-owned per-user state to `public.*`** under
any pretext. Specifically prohibited: relocating
`fat.station_distances`, `fat.home_address`, `fat.profile_ext`, or any
claim table to `public`.

2.4 **No service-role write paths** for per-user FAT tables outside of
the user's own context. The single exception is `fat.stations`
(seed/reference data) which has an explicit `service_role_manage`
policy.

---

## 3. Runtime client access

3.1 **All FAT queries go through the schema-scoped Supabase client**
(`fat = supabase.schema('fat')`) exported from
`lib/supabaseClient.js`.

3.2 **No `from('fat_*')` legacy-prefix references in runtime code.**
Verified by `grep -rn "from\('fat_" app/ components/ lib/` returning
empty.

3.3 **No `public.fat_*` string-concatenation references in runtime
code.** Verified by `grep -rn "public\.fat_" app/ components/ lib/`
returning empty.

3.4 **Auth-domain calls stay on the default `supabase` client** —
`supabase.auth.*` and `supabase.from('profiles')` only.

3.5 **RPCs are invoked via the schema-scoped client** — e.g.
`fat.rpc('increment_claim_sequence', { ... })`.

---

## 4. Distance system rules

4.1 **`fat.station_distances` is per-user and stays per-user.**
Bounded-domain rationale ratified in
`BLOCKER_RESOLUTIONS.md#B-4`.

4.2 **Shared-reference logic for distances is prohibited** (no
"canonical distance between stations" rows). A future station-pair
reference, if approved, requires its own table with its own ownership
model.

4.3 **Distances are snapshotted onto the claim row at write time**
(`dist_home_km`, `dist_stn_km`, `home_address_snap`). The cache is a UX
device, not a reporting source.

4.4 **`fat.distance_cache` (v1) is retired.** No new code may reference
it (see `BLOCKER_RESOLUTIONS.md#B-2`).

---

## 5. Payment / ledger rules

5.1 **`subclaim.payment_status` is the canonical truth source** for
payment state. `parent_status` on `fat.claim_groups` is a cached
projection.

5.2 **`fat.payment_components` is deferred** (see
`BLOCKER_RESOLUTIONS.md#B-1`). The existing defensive try/catch in
`lib/claims/ClaimsContext.js#updatePaymentStatus` is the intentional,
inert mirror pattern for the deferral window. Removing or rewiring
this requires a separate governance decision.

5.3 **No new reports may depend on the ledger** while B-1 is deferred.
Reports must read claim rows directly.

5.4 **No backfill of the ledger** in D2.

---

## 6. Repo hygiene

6.1 **No `*.sql` files at the repository root.** All replayable DDL
lives under `supabase/`. Archived legacy SQL lives only under
`docs/PROD_RECONCILIATION/archive/`.

6.2 **`supabase/fat-schema.sql` is the single source of truth** for the
FAT schema. The Supabase MCP migration history is the audit log; the
schema file is the desired state.

6.3 **No new ad-hoc migration files.** Schema evolution happens by
editing `supabase/fat-schema.sql` (for the canonical reference) and by
applying a named Supabase MCP migration (for the live database).

6.4 **Archived migrations are immutable.** Files under
`docs/PROD_RECONCILIATION/archive/` may be added but must not be edited
or removed once added (historical fidelity).

6.5 **No "while I'm here" cross-domain edits.** A PR that resolves a
governance blocker must touch only the files enumerated in the
relevant scope document.

---

## 7. RLS and grants

7.1 **RLS is enabled on every per-user FAT table** with the uniform
`users_manage_own FOR ALL USING (auth.uid() = user_id) WITH CHECK
(auth.uid() = user_id)` policy.

7.2 **`fat.stations` is the only FAT table with non-uniform policies**
(`authenticated_read` + `service_role_manage`).

7.3 **Grants follow the pattern in `supabase/fat-schema.sql`**: schema
usage to `anon, authenticated, service_role`; table-level CRUD to
`authenticated` and full access to `service_role`; function execute
where appropriate.

7.4 **PostgREST exposed-schemas list must include `fat`.** This is a
manual project-settings precondition; no code or migration owns it.

---

## 8. Production isolation

8.1 **PROD is not touched outside an explicit, scoped, approved PROD
operation.** D2 has no PROD scope.

8.2 **MCP project selection must be explicit.** Tools that accept a
project ID must be invoked with the DEV project ID only during D2.

8.3 **No "preview against PROD"**, no read-only PROD queries "to
check", no PROD backup restore into DEV during D2. PROD inspection is
a D4 concern.

---

## 9. Change-control rules

9.1 **Governance blockers** (`B-1` … `B-N`) are tracked in
`BLOCKER_RESOLUTIONS.md`. Reopening a ratified blocker requires a new
governance round and explicit reference in the relevant scope
document.

9.2 **Scope documents** (`D2_EXECUTION_SCOPE.md`, future
`D3_REHEARSAL_SCOPE.md`, `D4_PROD_RECONCILIATION_SCOPE.md`) enumerate
**allowed** and **prohibited** actions. Anything not enumerated as
allowed is prohibited.

9.3 **Risk register** (`RISK_REGISTER.md`) is updated whenever a new
risk is identified or an existing risk changes status.

9.4 **Readiness criteria** (`REHEARSAL_READINESS_CRITERIA.md`) is a
binary checklist. No "mostly ready" promotion.
