import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/ssh'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { name, ip_address, ssh_user, ssh_port, ssh_key, bench_path, mariadb_password } = body

    // Test SSH connection first
    const connectionTest = await testConnection({
      host: ip_address,
      username: ssh_user,
      port: ssh_port || 22,
      privateKey: ssh_key,
    })

    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `SSH connection failed: ${connectionTest.error}` },
        { status: 400 }
      )
    }

    // Create server record
    const { data: server, error } = await supabase
      .from('servers')
      .insert({
        name,
        ip_address,
        ssh_user,
        ssh_port: ssh_port || 22,
        ssh_key_encrypted: ssh_key, // In production, encrypt this
        bench_path: bench_path || '/home/frappe/frappe-bench',
        mariadb_root_password_encrypted: mariadb_password,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ server })
  } catch (error) {
    console.error('Server creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: servers, error } = await supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ servers })
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    )
  }
}
