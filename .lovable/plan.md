## Context

`public.has_role(uuid, app_role)` is `SECURITY DEFINER` by design — it's the standard Supabase pattern for role checks inside RLS policies without recursing back into `user_roles`. The `recipes` table's admin INSERT/UPDATE/DELETE policies call it via `has_role(auth.uid(), 'admin')`, so the `authenticated` role MUST have `EXECUTE` or those policies fail (that's the exact "permission denied" bug we just fixed).

The function body only checks `user_id = _user_id` for a row in `user_roles`. A signed-in user calling it directly can only learn their own role, which they can already read via the `user_roles` SELECT policy. No privilege escalation.

## Fix

Mark the finding `SUPA_authenticated_security_definer_function_executable` as ignored with that explanation, and update the security memory so future scans don't re-flag the canonical `has_role` pattern.

## Out of scope

No SQL, code, or policy changes.