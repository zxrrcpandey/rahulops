import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Runs daily at midnight to auto-suspend overdue sites
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Get auto-suspension settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'auto_suspension')
      .single()

    const autoSuspendEnabled = settings?.value?.enabled ?? true
    const gracePeriodDays = settings?.value?.grace_period ?? 3

    if (!autoSuspendEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Auto-suspension is disabled',
        suspended: 0
      })
    }

    // Calculate the cutoff date (expiry + grace period)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays)

    // Get all active subscriptions that are past the grace period
    const { data: overdueSubscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        sites (id, site_name, status, server_id),
        clients (id, name, email)
      `)
      .eq('status', 'active')
      .lt('expires_at', cutoffDate.toISOString())

    if (error) throw error

    const suspendedSites = []

    for (const subscription of overdueSubscriptions || []) {
      const site = subscription.sites
      if (!site || site.status === 'suspended') continue

      // Update site status to suspended
      await supabase
        .from('sites')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspension_reason: 'Payment overdue - auto-suspended'
        })
        .eq('id', site.id)

      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: 'suspended' })
        .eq('id', subscription.id)

      // Log activity
      await supabase.from('activity_log').insert({
        entity_type: 'site',
        entity_id: site.id,
        action: 'site_auto_suspended',
        details: {
          reason: 'Payment overdue',
          subscription_id: subscription.id,
          expired_at: subscription.expires_at,
          grace_period_days: gracePeriodDays
        }
      })

      // Send notification email (via Resend)
      if (process.env.RESEND_API_KEY && subscription.clients?.email) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'noreply@rahulops.com',
              to: subscription.clients.email,
              subject: `🔴 Site Suspended - ${site.site_name}`,
              html: `
                <h2>Your site has been suspended</h2>
                <p>Dear ${subscription.clients.name},</p>
                <p>Your site <strong>${site.site_name}</strong> has been suspended due to an overdue payment.</p>
                <p>To reactivate your site, please complete your payment as soon as possible.</p>
                <p>If you believe this is an error, please contact support.</p>
                <br>
                <p>Best regards,<br>RahulOps Team</p>
              `
            })
          })
        } catch (emailError) {
          console.error('Failed to send suspension email:', emailError)
        }
      }

      suspendedSites.push({
        siteId: site.id,
        siteName: site.site_name,
        clientEmail: subscription.clients?.email
      })
    }

    // Notify admin
    if (suspendedSites.length > 0 && process.env.NOTIFICATION_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'noreply@rahulops.com',
            to: process.env.NOTIFICATION_EMAIL,
            subject: `⚠️ Auto-Suspension Report: ${suspendedSites.length} sites suspended`,
            html: `
              <h2>Auto-Suspension Report</h2>
              <p>The following sites were automatically suspended due to overdue payments:</p>
              <ul>
                ${suspendedSites.map(s => `<li>${s.siteName} (${s.clientEmail})</li>`).join('')}
              </ul>
              <p>Grace period: ${gracePeriodDays} days</p>
            `
          })
        })
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      suspended: suspendedSites.length,
      sites: suspendedSites,
      gracePeriodDays,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Auto-suspend error:', error)
    return NextResponse.json(
      { error: 'Auto-suspend failed', details: String(error) },
      { status: 500 }
    )
  }
}
