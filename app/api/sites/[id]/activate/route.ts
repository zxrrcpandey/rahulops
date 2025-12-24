import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// POST /api/sites/[id]/activate - Activate/reactivate a site
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const siteId = params.id
    const body = await request.json().catch(() => ({}))
    const { 
      new_expiry_date,
      extend_days = 30 
    } = body

    const supabase = createServerSupabaseClient()

    // Get site details
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select(`
        *,
        servers (*),
        clients (id, name, email)
      `)
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    if (site.status === 'active') {
      return NextResponse.json(
        { error: 'Site is already active' },
        { status: 400 }
      )
    }

    // Calculate new expiry date
    let newExpiryDate: string
    if (new_expiry_date) {
      newExpiryDate = new Date(new_expiry_date).toISOString()
    } else {
      // Extend from today by specified days
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + extend_days)
      newExpiryDate = expiryDate.toISOString()
    }

    // Update site status in database
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
        subscription_expires_at: newExpiryDate,
        reminder_sent_at: null // Reset reminder flag
      })
      .eq('id', siteId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update site status', details: updateError.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        entity_type: 'site',
        entity_id: siteId,
        action: 'site_activated',
        details: { 
          previous_status: site.status,
          new_expiry_date: newExpiryDate
        }
      })

    // Trigger server-side activation (disable maintenance mode)
    try {
      await fetch(`${process.env.TRIGGER_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/trigger'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TRIGGER_API_KEY}`
        },
        body: JSON.stringify({
          event: 'site.reactivate',
          payload: {
            siteId,
            siteName: site.site_name,
            newExpiryDate,
            serverDetails: site.servers ? {
              ip: site.servers.ip_address,
              sshUser: site.servers.ssh_user,
              sshPort: site.servers.ssh_port,
              benchPath: site.servers.bench_path
            } : null
          }
        })
      })
    } catch (triggerError) {
      console.error('Failed to trigger activation job:', triggerError)
    }

    // Send notification to client
    if (site.clients?.email) {
      try {
        await fetch(`${process.env.TRIGGER_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/trigger'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TRIGGER_API_KEY}`
          },
          body: JSON.stringify({
            event: 'notification.send',
            payload: {
              type: 'site_reactivated',
              to: site.clients.email,
              siteName: site.site_name,
              clientName: site.clients.name
            }
          })
        })
      } catch (notifyError) {
        console.error('Failed to send activation notification:', notifyError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Site activated successfully',
      site: {
        id: siteId,
        status: 'active',
        subscription_expires_at: newExpiryDate
      }
    })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
