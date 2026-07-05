## Problem

Import fails with `permission denied for function has_role`. The RLS policies on `recipes` (INSERT/UPDATE/DELETE) call `public.has_role(auth.uid(), 'admin')`, but the `authenticated` role doesn't have `EXECUTE` on that function. On Lovable Cloud, `EXECUTE` on functions in `public` is not granted by default — same story as table GRANTs. So even though the row-level check would pass (you have the admin role), Postgres rejects the policy evaluation before it gets that far.

## Fix

One migration:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
```

That's it. No schema changes, no policy changes, no code changes. After it runs, reload `/admin/import` and the import will go through.

## Out of scope

No auth changes, no RLS rewrites, no frontend edits.
