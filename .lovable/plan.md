## Why sign-in fails

Auth logs show repeated `invalid_credentials` on `/token` for `hello@lovecoylah.com`. On Lovable Cloud, new email/password signups require email confirmation by default. Until the confirmation link is clicked, the account exists but cannot sign in — Supabase returns `invalid_credentials` (not a clearer "email not confirmed" message) for unconfirmed accounts on password grant.

The current auth page also doesn't tell the user this — it just says "Check your email to confirm" once, then silently fails on later sign-in attempts.

## Fix (two parts)

**1. Enable auto-confirm for email signups** via `supabase--configure_auth` with `auto_confirm_email: true`. This lets new signups sign in immediately without clicking a confirmation link — appropriate for a single-admin importer tool. Existing unconfirmed account (`hello@lovecoylah.com`) will need to be re-signed-up OR I'll confirm it via a one-off admin action (see step 3).

**2. Improve auth page feedback** in `src/routes/auth.tsx`:
- After successful signup, if a session is returned (auto-confirm on), navigate straight to `/admin/import` instead of asking to check email.
- Surface clearer error text when sign-in fails.

**3. Unblock the existing account**: since the current `hello@lovecoylah.com` was created before auto-confirm, I'll either (a) ask you to sign up again with any email after step 1, or (b) mark that specific user confirmed via a one-off SQL update on `auth.users.email_confirmed_at`. Option (a) is simpler; option (b) is one migration.

## Then: grant admin role

Once you can sign in, I'll insert a `user_roles` row (`role='admin'`) for your user id so the importer works.

## Out of scope

No changes to the DB schema, RLS, or other routes.
