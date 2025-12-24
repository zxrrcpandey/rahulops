import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// POST /api/sites/[id]/suspend - Suspend a site
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const siteId = params.id
    const body = await request.json().catch(() => ({}))
    const { reason = 'Manual suspension' } = body

    const supabase = createServerSupabaseClient()

    // Get site details
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select(`
        *,
        servers (*)
      `)
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    if (site.status === 'suspended') {
      return NextResponse.json(
        { error: 'Site is already suspended' },
        { status: 400 }
      )
    }

    // Update site status in database
    const { error: updateError } = await supabase
      .from('sites')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: reason
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
        action: 'site_suspended',
        details: { reason, manual: true }
      })

    // Trigger server-side suspension (put site in maintenance mode)
    // This would typically trigger a background job
    try {
      await fetch(`${process.env.TRIGGER_WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL + '/api/webhooks/trigger'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TRIGGER_API_KEY}`
        },
        body: JSON.stringify({
          event: 'site.suspend',
          payload: {
            siteId,
            siteName: site.site_name,
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
      console.error('Failed to trigger suspension job:', triggerError)
      // Don't fail the request, the database is already updated
    }

    return NextResponse.json({
      success: true,
      message: 'Site suspended successfully',
      site: {
        id: siteId,
        status: 'suspended',
        suspended_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Suspension error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
