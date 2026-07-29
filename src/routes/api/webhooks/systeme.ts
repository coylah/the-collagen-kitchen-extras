// api/webhooks/systeme.ts — The Collagen Kitchen
//
// Receives purchase and cancellation events from Systeme.io.
// New sale → creates Supabase account + sends magic link email.
// Sale canceled → disables account so they lose access immediately.
//
// SETUP IN SYSTEME.IO (Evita):
// Settings → Webhooks → Create
// URL: https://YOUR-COOKBOOK-URL/api/webhooks/systeme?secret=YOUR_SECRET
// Events: "New sale" + "Sale canceled"
// Secret: matches SYSTEME_WEBHOOK_SECRET environment variable in Lovable

import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

export const Route = createFileRoute('/api/webhooks/systeme')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const SUPABASE_URL = process.env.SUPABASE_URL!
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
        const WEBHOOK_SECRET = process.env.SYSTEME_WEBHOOK_SECRET!

        // Verify request is genuinely from Systeme.io
        const secret = new URL(request.url).searchParams.get('secret')
          || request.headers.get('x-systeme-secret')
        if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
          console.error('[CK Webhook] Invalid secret')
          return new Response('Unauthorized', { status: 401 })
        }

        let body: any
        try { body = await request.json() }
        catch { return new Response('Bad request', { status: 400 }) }

        const event = body.event
        const email = body.contact?.email || body.email
        if (!email) {
          console.error('[CK Webhook] No email in payload')
          return new Response('No email', { status: 400 })
        }

        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false }
        })

        if (event === 'new_sale' || event === 'contact.sale.created') {
          console.log(`[CK Webhook] New sale for ${email}`)
          const { data: list } = await admin.auth.admin.listUsers()
          const existing = list?.users?.find((u: any) => u.email === email)

          if (existing) {
            await admin.auth.admin.updateUserById(existing.id, { ban_duration: 'none' })
            console.log(`[CK Webhook] Re-enabled ${email}`)
          } else {
            const { error } = await admin.auth.admin.createUser({ email, email_confirm: true })
            if (error) {
              console.error(`[CK Webhook] Failed to create ${email}:`, error.message)
              return new Response('Error', { status: 500 })
            }
            console.log(`[CK Webhook] Created ${email}`)
          }

          const appUrl = process.env.PUBLIC_APP_URL || 'https://your-cookbook.lovable.app'
          const { error: linkError } = await admin.auth.admin.generateLink({
            type: 'magiclink', email, options: { redirectTo: appUrl }
          })
          if (linkError) console.error(`[CK Webhook] Magic link failed:`, linkError.message)

        } else if (event === 'sale_canceled' || event === 'contact.sale.refunded') {
          console.log(`[CK Webhook] Cancellation for ${email}`)
          const { data: list } = await admin.auth.admin.listUsers()
          const existing = list?.users?.find((u: any) => u.email === email)
          if (existing) {
            await admin.auth.admin.updateUserById(existing.id, { ban_duration: '87600h' })
            console.log(`[CK Webhook] Banned ${email}`)
          }
        } else {
          console.log(`[CK Webhook] Ignoring event: ${event}`)
        }

        return new Response('OK', { status: 200 })
      }
    }
  }
})
