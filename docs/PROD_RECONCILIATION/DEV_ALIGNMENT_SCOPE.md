# DEV Alignment Scope (D1 → D2 bridge)

> Records the DEV alignment inventory accepted during D1 and the
> bounded set of actions that D2 will execute against DEV. This
> document does not authorise any of the D2 actions; it scopes them.
> Authorisation lives in `D2_EXECUTION_SCOPE.md`.

---

## 1. Already-aligned state (D1 findings, ratified)

The following are pre-existing facts about DEV; D2 does not change
them and any later document that contradicts them is wrong.

| # | Finding | Evidence |
| - | ------- | -------- |
| 1 | DEV runtime fully aligned to `fat.*` | `FAT_SCHEMA_AUDIT_REPORT.md` §"Per-domain client routing" |
| 2 | Zero runtime `from('fat_*')` references in `app/`, `components/`, `lib/` | grep verification documented in audit report |
| 3 | Zero runtime `public.fat_*` references in `app/`, `components/`, `lib/` | grep verification documented in audit report |
| 4 | `public.profiles` is the only legitimate `public.*` runtime dependency | `docs/FAT_SCHEMA_ARCHITECTURE.md` §"Public / shared resources used by FAT" |
| 5 | DEV Supabase project schema move applied via MCP migrations `fat_schema_migration` + `fat_function_bodies_fix` | `docs/FAT_SCHEMA_ARCHITECTURE.md` §"Migration notes" |
| 6 | `next build` succeeds against the current DEV branch | `FAT_SCHEMA_AUDIT_REPORT.md` §"Build status" |
| 7 | PROD still contains the legacy `public.fat_*` layout (untouched by D2) | `docs/FAT_SCHEMA_ARCHITECTURE.md` §"Migration notes" |
| 8 | `station_distances` recommendation stands as `fat.station_distances` | `BLOCKER_RESOLUTIONS.md#B-4` |

---

## 2. FAT resource ownership matrix (carried forward from D1)

| Resource | Schema | Notes |
| -------- | ------ | ----- |
| `auth.users` | `auth` | Supabase-managed; FK source for `user_id`. |
| `profiles` | `public` | Shared cross-app (first/last name only). |
| `profile_ext` | `fat` | FAT-specific extension (station, platoon, home). |
| `stations` | `fat` | FAT seed reference data; `authenticated_read` + `service_role_manage`. |
| `home_address` | `fat` | v4 geocoded home (one row per user). |
| `station_distances` | `fat` | v4 per-user per-station cache. B-4 ratified. |
| `distance_cache` | `fat` | v1 superseded; **dropped in D2** (B-2). |
| `financial_years` | `fat` | Per-user FY workspaces. |
| `claim_sequences` | `fat` | Atomic per-FY counters. |
| `claim_groups` | `fat` | Parent claim group rows. |
| `recalls` / `retain` / `standby` / `spoilt_meals` | `fat` | Claim tables. |
| `user_rates` | `fat` | Per-user allowance overrides. |
| `payment_components` | `fat` | **Not in canonical schema**; deferred (B-1). |
| RPC `increment_claim_sequence` | `fat` | Atomic claim-number issuer. |
| Trigger fn `set_updated_at` | `fat` | Maintains `updated_at`. |

---

## 3. D2 alignment delta (only these items change in DEV)

| Item | Action | Target |
| ---- | ------ | ------ |
| `fat.distance_cache` DDL block | Remove from `supabase/fat-schema.sql` | DEV reference file |
| `fat.distance_cache` RLS enable | Remove from `supabase/fat-schema.sql` | DEV reference file |
| `fat.distance_cache` policy | Remove from `supabase/fat-schema.sql` | DEV reference file |
| `fat.distance_cache` table | `DROP TABLE` once preconditions met | DEV Supabase project |
| `supabase-migration-v4-distance-tables.sql` | `git mv` to archive path | Repo only |
| Archive `README.md` | Create with `DO NOT REPLAY` notice | Repo only |
| `docs/FAT_SCHEMA_ARCHITECTURE.md` | Trim `distance_cache` mention; cross-link B-1, B-2 resolutions | Repo only |

Anything not listed here is **outside D2**.

---

## 4. Explicitly non-aligning items in D2 (carried as-is)

| Item | Reason for non-change |
| ---- | --------------------- |
| `fat.payment_components` defensive try/catch in `ClaimsContext.updatePaymentStatus` | B-1 defers the adopt/remove decision. |
| `payment_status`/`payment_date`/`parent_claim_id`/`payment_method`/`component_type`/`component_amount` columns on the four claim tables | Already live in DEV; canonical `fat-schema.sql` carries the two that are RLS-relevant. No new column work. |
| `fat.stations` seed data | Reference data, no change. |
| Cross-app `public.profiles` usage | Already correct. |
| All MCP migration history | Append-only audit log; not edited. |

---

## 5. DEV alignment validation gate

Before D2 is declared complete, run and capture (all must be true):

- `grep -rn "distance_cache" app/ components/ lib/` → empty.
- `grep -rn "from('fat_" app/ components/ lib/` → empty.
- `grep -rn "public\.fat_" app/ components/ lib/` → empty.
- `grep -rn "distance_cache" supabase/` → empty (after schema-file edit).
- `ls supabase-migration-*.sql` → no such file at repo root.
- `ls docs/PROD_RECONCILIATION/archive/legacy-migrations/supabase-migration-v4-distance-tables.sql` → present.
- `next build` → success.
- DEV Supabase: `select * from information_schema.tables where
  table_schema = 'fat' and table_name = 'distance_cache'` → 0 rows.

---

## 6. Out-of-scope items (D3 / D4 only)

- Rehearsing the PROD reconciliation script against a DEV snapshot.
- Any PROD inspection, backup, restore, or schema diff.
- Designing the PROD reconciliation script itself.
- Backfilling `payment_components` (B-1 future decision).
- Introducing any new feature, table, or function.
