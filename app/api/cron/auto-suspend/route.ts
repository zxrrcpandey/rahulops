import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get sites with expired subscriptions
    const today = new Date()
    const gracePeriodDays = 3
    const gracePeriodDate = new Date(today)
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays)

    const { data: expiredSites, error } = await supabase
      .from('sites')
      .select('*, clients(id, name, email)')
      .eq('status', 'active')
      .lt('subscription_expires_at', gracePeriodDate.toISOString())

    if (error) {
      console.error('Error fetching expired sites:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let suspendedCount = 0

    if (expiredSites) {
      for (const site of expiredSites) {
        await supabase
          .from('sites')
          .update({
            status: 'suspended',
            suspended_at: new Date().toISOString(),
            suspension_reason: 'Subscription expired'
          })
          .eq('id', site.id)

        await supabase.from('activity_log').insert({
          entity_type: 'site',
          entity_id: site.id,
          action: 'site_suspended',
          details: { reason: 'Subscription expired', auto: true }
        })

        suspendedCount++
      }
    }

    return NextResponse.json({ success: true, suspendedCount })
  } catch (error) {
    console.error('Auto-suspend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
