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

    const { data: servers, error } = await supabase
      .from('servers')
      .select('*')
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const checkedCount = servers?.length || 0

    // Update last health check timestamp
    if (servers) {
      for (const server of servers) {
        await supabase
          .from('servers')
          .update({ last_health_check: new Date().toISOString() })
          .eq('id', server.id)
      }
    }

    return NextResponse.json({ success: true, checkedCount })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
