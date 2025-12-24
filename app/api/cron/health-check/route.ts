import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Runs every 5 minutes to check server health
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Get all active servers
    const { data: servers, error } = await supabase
      .from('servers')
      .select('*')
      .eq('status', 'active')

    if (error) throw error

    const results = []

    for (const server of servers || []) {
      // In production, this would SSH to check server health
      // For now, we'll simulate the check
      const health = {
        serverId: server.id,
        serverName: server.name,
        status: 'healthy',
        cpu: Math.floor(Math.random() * 60) + 10,
        ram: Math.floor(Math.random() * 50) + 20,
        disk: Math.floor(Math.random() * 40) + 30,
        checkedAt: new Date().toISOString()
      }

      // Update server health in database
      await supabase
        .from('servers')
        .update({
          last_health_check: health.checkedAt,
          health_status: health.status,
          cpu_usage: health.cpu,
          ram_usage: health.ram,
          disk_usage: health.disk
        })
        .eq('id', server.id)

      results.push(health)

      // Alert if server is unhealthy
      if (health.cpu > 90 || health.ram > 90 || health.disk > 90) {
        await supabase.from('activity_log').insert({
          entity_type: 'server',
          entity_id: server.id,
          action: 'server_alert',
          details: health
        })
      }
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { error: 'Health check failed', details: String(error) },
      { status: 500 }
    )
  }
}
