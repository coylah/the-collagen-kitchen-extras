## Problem

The previous migration granted `EXECUTE` on `public.has_role(uuid, app_role)` to `anon`, which lets unauthenticated callers invoke a `SECURITY DEFINER` function through the Data API. The scanner flagged it. `anon` was never needed — RLS policies run as `authenticated`, and admin actions require a signed-in user.

## Fix

One migration:

```sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
```

`authenticated` and `service_role` keep `EXECUTE`, so RLS policies on `recipes` still evaluate and the importer keeps working.

## Out of scope

No policy changes, no code changes.