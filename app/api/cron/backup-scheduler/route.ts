import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Runs daily at 2 AM to execute scheduled backups
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday
    const dayOfMonth = today.getDate()

    // Get all backup schedules
    const { data: schedules, error } = await supabase
      .from('backup_schedules')
      .select(`
        *,
        sites (id, site_name, server_id, status)
      `)
      .eq('enabled', true)

    if (error) throw error

    const backupsTriggered = []

    for (const schedule of schedules || []) {
      const site = schedule.sites
      if (!site || site.status !== 'active') continue

      // Check if backup should run today
      let shouldRun = false

      switch (schedule.frequency) {
        case 'daily':
          shouldRun = true
          break
        case 'weekly':
          shouldRun = dayOfWeek === 0 // Sunday
          break
        case 'monthly':
          shouldRun = dayOfMonth === 1 // First of month
          break
      }

      if (!shouldRun) continue

      // Create backup record
      const { data: backup, error: backupError } = await supabase
        .from('backups')
        .insert({
          site_id: site.id,
          type: schedule.backup_type || 'full',
          status: 'pending',
          triggered_by: 'scheduler',
          schedule_id: schedule.id
        })
        .select()
        .single()

      if (backupError) {
        console.error(`Failed to create backup for ${site.site_name}:`, backupError)
        continue
      }

      // Log activity
      await supabase.from('activity_log').insert({
        entity_type: 'backup',
        entity_id: backup.id,
        action: 'backup_scheduled',
        details: {
          site_name: site.site_name,
          frequency: schedule.frequency,
          type: schedule.backup_type
        }
      })

      // In production, trigger the actual backup via Trigger.dev or SSH
      // For now, we'll mark it as in progress
      await supabase
        .from('backups')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', backup.id)

      backupsTriggered.push({
        backupId: backup.id,
        siteId: site.id,
        siteName: site.site_name,
        type: schedule.backup_type,
        frequency: schedule.frequency
      })
    }

    return NextResponse.json({
      success: true,
      triggered: backupsTriggered.length,
      backups: backupsTriggered,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Backup scheduler error:', error)
    return NextResponse.json(
      { error: 'Backup scheduler failed', details: String(error) },
      { status: 500 }
    )
  }
}
