## What's going on

Lovable Cloud is our managed backend (built on Supabase's open-source stack). It was wired in automatically when the project was created — that's why you see `SUPABASE_*` names in the code even though you never set up an account. On Lovable Cloud, the **service role key is intentionally not exposed** to app code. It's a god-mode key that bypasses all security rules, so the platform blocks it by design.

Your `/admin/import` page currently uses `supabaseAdmin` (service role) to upsert recipes. That worked earlier only by accident — now the guard is enforced and it throws `Missing SUPABASE_SERVICE_ROLE_KEY`. Nothing is broken with the connection; the regular (publishable) client and auth still work fine.

## Fix

Stop using the admin client for imports. Do the write as the signed-in user, protected by a proper admin role check in the database.

### Steps

1. **Add a roles system** (migration)
   - `app_role` enum (`admin`, `user`)
   - `user_roles` table (`user_id`, `role`) with RLS + grants
   - `has_role(_user_id, _role)` security-definer function
   - RLS policy on `recipes`: allow `INSERT`/`UPDATE` when `has_role(auth.uid(), 'admin')`
   - Grant yourself the `admin` role (I'll ask for your user id / email after the migration)

2. **Rewrite `importRecipes`** in `src/lib/recipes.functions.ts`
   - Drop `supabaseAdmin` import
   - Use `.middleware([requireSupabaseAuth])` so the call runs as the logged-in user
   - The DB policy enforces admin-only; no service role needed

3. **Gate `/admin/import`**
   - Move file to `src/routes/_authenticated/admin.import.tsx` so unauthenticated users are redirected to `/auth`
   - Show a friendly "you need admin role" message if the insert is rejected

4. **Ensure auth exists**
   - If there's no `/auth` route yet, add a minimal email/password (+ Google) sign-in page so you can log in and use the importer

### Not doing
- Not reconnecting or recreating the backend — the existing connection is fine.
- Not touching any other page; regular read queries continue to use the publishable client.

After you approve, I'll run the migration first (you'll see it for review), then update the code.
