import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get active backup schedules
    const { data: schedules, error } = await supabase
      .from('backup_schedules')
      .select('*, sites(id, site_name, server_id)')
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let backupsTriggered = 0

    if (schedules) {
      for (const schedule of schedules) {
        if (schedule.sites) {
          await supabase.from('backups').insert({
            site_id: schedule.sites.id,
            type: schedule.backup_type || 'full',
            status: 'pending',
            triggered_by: 'scheduled'
          })

          await supabase
            .from('backup_schedules')
            .update({ last_run_at: new Date().toISOString() })
            .eq('id', schedule.id)

          backupsTriggered++
        }
      }
    }

    return NextResponse.json({ success: true, backupsTriggered })
  } catch (error) {
    console.error('Backup scheduler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
