import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, newClient, serverId, siteName, domainType, apps, setupSsl, sslEmail } = body

    if (!serverId || !siteName || !apps || apps.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let finalClientId = clientId
    if (newClient) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({ name: newClient.name, email: newClient.email, company: newClient.company })
        .select()
        .single()

      if (clientError) {
        return NextResponse.json({ error: clientError.message }, { status: 500 })
      }
      finalClientId = client.id
    }

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        client_id: finalClientId,
        server_id: serverId,
        site_name: siteName,
        domain_type: domainType,
        apps: apps,
        status: 'pending',
        ssl_enabled: false,
        deployment_started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (siteError) {
      return NextResponse.json({ error: siteError.message }, { status: 500 })
    }

    const { data: job } = await supabase
      .from('deployment_jobs')
      .insert({ site_id: site.id, server_id: serverId, job_type: 'site_creation', status: 'queued', progress: 0 })
      .select()
      .single()

    await supabase.from('activity_log').insert({
      team_member_id: user.id,
      action: 'site_created',
      entity_type: 'site',
      entity_id: site.id,
      details: { site_name: siteName, server_id: serverId, apps: apps },
    })

    return NextResponse.json({ success: true, site: site, jobId: job?.id })
  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serverId = searchParams.get('serverId')
    const clientId = searchParams.get('clientId')

    let query = supabase
      .from('sites')
      .select('*, server:servers(id, name, ip_address, location), client:clients(id, name, company, email)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (serverId) query = query.eq('server_id', serverId)
    if (clientId) query = query.eq('client_id', clientId)

    const { data: sites, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Fetch sites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
