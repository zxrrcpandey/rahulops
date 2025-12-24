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

    const today = new Date()
    const reminderDays = [7, 3, 1]
    let remindersSent = 0

    for (const days of reminderDays) {
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() + days)

      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data: expiringSites } = await supabase
        .from('sites')
        .select('*, clients(id, name, email)')
        .eq('status', 'active')
        .gte('subscription_expires_at', startOfDay.toISOString())
        .lte('subscription_expires_at', endOfDay.toISOString())

      if (expiringSites) {
        for (const site of expiringSites) {
          await supabase.from('activity_log').insert({
            entity_type: 'site',
            entity_id: site.id,
            action: 'reminder_sent',
            details: { days_until_expiry: days }
          })
          remindersSent++
        }
      }
    }

    return NextResponse.json({ success: true, remindersSent })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
