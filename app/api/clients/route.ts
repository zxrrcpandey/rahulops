import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase.from('clients').select('*, sites (id, site_name, status)', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      clients: data,
      pagination: { page, limit, total: count, totalPages: Math.ceil((count || 0) / limit) }
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { name, email, company, phone, address, notes } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const { data: existing } = await supabase.from('clients').select('id').eq('email', email).single()

    if (existing) {
      return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 })
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({ name, email, company, phone, address, notes, status: 'active' })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_log').insert({
      entity_type: 'client',
      entity_id: client.id,
      action: 'client_created',
      details: { name, email, company }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
