import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { testConnection } from '@/lib/ssh'
import { tasks } from '@trigger.dev/sdk/v3'
import type { setupServerTask } from '@/trigger/jobs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      location,
      ip_address,
      ssh_port,
      ssh_user,
      ssh_private_key,
      mariadb_root_password,
      total_ram_gb,
      total_cpu_cores,
      total_disk_gb,
      max_sites,
      bench_already_installed,
    } = body

    // Validate required fields
    if (!name || !ip_address || !ssh_private_key) {
      return NextResponse.json(
        { error: 'Missing required fields: name, ip_address, ssh_private_key' },
        { status: 400 }
      )
    }

    // Create server record
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .insert({
        name,
        location,
        ip_address,
        ssh_port: ssh_port || 22,
        ssh_user: ssh_user || 'root',
        ssh_private_key,
        mariadb_root_password,
        total_ram_gb: total_ram_gb ? parseInt(total_ram_gb) : null,
        total_cpu_cores: total_cpu_cores ? parseInt(total_cpu_cores) : null,
        total_disk_gb: total_disk_gb ? parseInt(total_disk_gb) : null,
        max_sites: max_sites ? parseInt(max_sites) : 10,
        status: bench_already_installed ? 'active' : 'pending',
        installed_apps: bench_already_installed 
          ? ['frappe', 'erpnext', 'hrms', 'payments', 'webshop', 'india_compliance']
          : [],
      })
      .select()
      .single()

    if (serverError) {
      return NextResponse.json(
        { error: `Failed to create server: ${serverError.message}` },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_log').insert({
      team_member_id: user.id,
      action: 'server_added',
      entity_type: 'server',
      entity_id: server.id,
      details: { name, ip_address, location },
    })

    return NextResponse.json({
      success: true,
      server,
    })

  } catch (error) {
    console.error('Create server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: servers, error } = await query

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch servers: ${error.message}` },
        { status: 500 }
      )
    }

    // Get site counts for each server
    const serversWithCounts = await Promise.all(
      servers.map(async (server) => {
        const { count } = await supabase
          .from('sites')
          .select('*', { count: 'exact', head: true })
          .eq('server_id', server.id)
          .neq('status', 'deleted')

        return {
          ...server,
          sites_count: count || 0,
        }
      })
    )

    return NextResponse.json({ servers: serversWithCounts })

  } catch (error) {
    console.error('Fetch servers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
