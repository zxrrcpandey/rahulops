import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/backups - List all backups
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    const searchParams = request.nextUrl.searchParams
    const siteId = searchParams.get('site_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('backups')
      .select(`
        *,
        sites (id, site_name, server_id)
      `, { count: 'exact' })

    if (siteId) {
      query = query.eq('site_id', siteId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      backups: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching backups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}

// POST /api/backups - Create new backup
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { site_id, type = 'full' } = body

    // Validate required fields
    if (!site_id) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    // Get site details
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*, servers(*)')
      .eq('id', site_id)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    // Create backup record
    const { data: backup, error } = await supabase
      .from('backups')
      .insert({
        site_id,
        type,
        status: 'pending',
        triggered_by: 'manual'
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_log').insert({
      entity_type: 'backup',
      entity_id: backup.id,
      action: 'backup_initiated',
      details: { site_name: site.site_name, type }
    })

    // In production, trigger the backup via Trigger.dev or SSH
    // For now, simulate backup completion after a delay
    setTimeout(async () => {
      const fileSize = Math.floor(Math.random() * 500) + 100 // 100-600 MB
      
      await supabase
        .from('backups')
        .update({
          status: 'completed',
          started_at: new Date(Date.now() - 120000).toISOString(),
          completed_at: new Date().toISOString(),
          file_size: fileSize * 1024 * 1024, // Convert to bytes
          file_path: `/backups/${site.site_name}/${backup.id}.tar.gz`
        })
        .eq('id', backup.id)

      await supabase.from('activity_log').insert({
        entity_type: 'backup',
        entity_id: backup.id,
        action: 'backup_completed',
        details: { site_name: site.site_name, size: `${fileSize} MB` }
      })
    }, 5000)

    return NextResponse.json({
      ...backup,
      message: 'Backup initiated successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}
