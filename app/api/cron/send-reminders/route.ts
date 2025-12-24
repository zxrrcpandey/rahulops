import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Runs daily at 9 AM to send payment reminders
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Get reminder settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'reminder_settings')
      .single()

    const reminderEnabled = settings?.value?.enabled ?? true
    const reminderDays = settings?.value?.days ?? [14, 7, 3, 1] // Days before expiry

    if (!reminderEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Reminders are disabled',
        sent: 0
      })
    }

    const today = new Date()
    const remindersSent = []

    // For each reminder day threshold
    for (const daysBeforeExpiry of reminderDays) {
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() + daysBeforeExpiry)
      
      // Format as YYYY-MM-DD for comparison
      const targetDateStr = targetDate.toISOString().split('T')[0]

      // Get subscriptions expiring on this exact date
      const { data: expiringSubscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          sites (id, site_name),
          clients (id, name, email, company)
        `)
        .eq('status', 'active')
        .gte('expires_at', `${targetDateStr}T00:00:00Z`)
        .lt('expires_at', `${targetDateStr}T23:59:59Z`)

      if (error) {
        console.error(`Error fetching subscriptions for ${daysBeforeExpiry} days:`, error)
        continue
      }

      for (const subscription of expiringSubscriptions || []) {
        const client = subscription.clients
        const site = subscription.sites

        if (!client?.email || !site) continue

        // Check if we already sent a reminder today
        const { data: existingReminder } = await supabase
          .from('activity_log')
          .select('id')
          .eq('entity_id', subscription.id)
          .eq('action', 'reminder_sent')
          .gte('created_at', `${today.toISOString().split('T')[0]}T00:00:00Z`)
          .limit(1)

        if (existingReminder && existingReminder.length > 0) continue

        // Send reminder email
        if (process.env.RESEND_API_KEY) {
          try {
            const urgency = daysBeforeExpiry <= 3 ? '🔴 URGENT' : daysBeforeExpiry <= 7 ? '🟡 Reminder' : '📅 Upcoming'
            
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'noreply@rahulops.com',
                to: client.email,
                subject: `${urgency}: Your subscription expires in ${daysBeforeExpiry} day${daysBeforeExpiry > 1 ? 's' : ''} - ${site.site_name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: ${daysBeforeExpiry <= 3 ? '#DC2626' : '#4F46E5'}">
                      ${urgency}: Subscription Expiring Soon
                    </h2>
                    
                    <p>Dear ${client.name},</p>
                    
                    <p>Your subscription for <strong>${site.site_name}</strong> will expire in 
                    <strong>${daysBeforeExpiry} day${daysBeforeExpiry > 1 ? 's' : ''}</strong> 
                    on <strong>${new Date(subscription.expires_at).toLocaleDateString()}</strong>.</p>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0;"><strong>Site:</strong> ${site.site_name}</p>
                      <p style="margin: 8px 0 0;"><strong>Plan:</strong> ${subscription.plan || 'Standard'}</p>
                      <p style="margin: 8px 0 0;"><strong>Amount:</strong> ₹${subscription.amount?.toLocaleString() || 'N/A'}</p>
                      <p style="margin: 8px 0 0;"><strong>Expires:</strong> ${new Date(subscription.expires_at).toLocaleDateString()}</p>
                    </div>
                    
                    ${daysBeforeExpiry <= 3 ? `
                      <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #DC2626;">
                          ⚠️ <strong>Important:</strong> Your site will be suspended if payment is not received by the expiry date.
                        </p>
                      </div>
                    ` : ''}
                    
                    <p>Please renew your subscription to avoid any interruption in service.</p>
                    
                    <p>If you have already made the payment, please ignore this email or contact us with the payment details.</p>
                    
                    <br>
                    <p>Best regards,<br><strong>RahulOps Team</strong></p>
                  </div>
                `
              })
            })

            // Log the reminder
            await supabase.from('activity_log').insert({
              entity_type: 'subscription',
              entity_id: subscription.id,
              action: 'reminder_sent',
              details: {
                days_before_expiry: daysBeforeExpiry,
                client_email: client.email,
                site_name: site.site_name
              }
            })

            remindersSent.push({
              subscriptionId: subscription.id,
              siteName: site.site_name,
              clientEmail: client.email,
              daysBeforeExpiry
            })

          } catch (emailError) {
            console.error('Failed to send reminder email:', emailError)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: remindersSent.length,
      reminders: remindersSent,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json(
      { error: 'Send reminders failed', details: String(error) },
      { status: 500 }
    )
  }
}
