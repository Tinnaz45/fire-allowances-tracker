# Legacy migrations — archive

> **SUPERSEDED — DO NOT REPLAY.**
>
> The SQL files under this directory are retained for **historical
> traceability only**. They are **not** part of the canonical schema and
> **must not** be applied to any Supabase project (DEV or PROD).

The single source of truth for the FAT schema is
`supabase/fat-schema.sql`. Live schema state is governed by the Supabase
MCP migration log (see `docs/FAT_SCHEMA_ARCHITECTURE.md`).

## Files

| File | Status | Cross-reference |
| ---- | ------ | --------------- |
| `supabase-migration-v4-distance-tables.sql` | **SUPERSEDED — DO NOT REPLAY** | `../../BLOCKER_RESOLUTIONS.md#B-3` |

### `supabase-migration-v4-distance-tables.sql`

- Targets the legacy `public.fat_*` layout (the PROD layout pre-schema
  move). It predates the `fat.*` schema migration in commit `8efce33`
  and was inadvertently left at the repository root after the schema
  move.
- Replaying it against a DEV project would silently create a parallel
  set of `public.fat_*` tables, reintroducing duplicate RLS policies
  and the schema-confusion state that D2 is meant to clean up.
- Authoritative decision: archive under this path; do **not** edit the
  SQL body; do **not** restore the file to the repo root.

See `../../BLOCKER_RESOLUTIONS.md#B-3` for the full rationale, the
prevention strategy, and the repo-hygiene rule that codifies "no `*.sql`
at the repo root" in `../../ARCHITECTURE_ALIGNMENT_RULES.md` §6.1.

## Replay prevention

- The repo-hygiene rule in `ARCHITECTURE_ALIGNMENT_RULES.md` §6.1
  prohibits `*.sql` at the repo root. Any reviewer who sees such a file
  proposed in a PR must block the PR pending governance review.
- Archived migrations are immutable
  (`ARCHITECTURE_ALIGNMENT_RULES.md` §6.4). Do not edit, delete, or
  re-format files under this directory.
- If a future operation needs to re-establish the legacy `public.fat_*`
  layout for any reason, it must do so via a fresh, scoped, governance-
  approved artefact — **not** by replaying this file.
