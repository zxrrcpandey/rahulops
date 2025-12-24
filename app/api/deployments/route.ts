import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      server_id,
      site_name,
      domain_type,
      apps,
      setup_ssl,
      enable_scheduler
    } = body

    // Validate required fields
    if (!server_id || !site_name) {
      return NextResponse.json(
        { error: 'server_id and site_name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if site name already exists
    const { data: existingSite } = await supabase
      .from('sites')
      .select('id')
      .eq('site_name', site_name)
      .single()

    if (existingSite) {
      return NextResponse.json(
        { error: 'Site name already exists' },
        { status: 409 }
      )
    }

    // Get server details
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .select('*')
      .eq('id', server_id)
      .single()

    if (serverError || !server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Check if server is active
    if (server.status !== 'active') {
      return NextResponse.json(
        { error: 'Server is not active' },
        { status: 400 }
      )
    }

    // Generate admin password
    const admin_password = generateSecurePassword()

    // Create site record
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        client_id,
        server_id,
        site_name,
        domain_type: domain_type || 'custom',
        apps: apps || ['erpnext'],
        admin_password, // Will be encrypted by Supabase
        status: 'pending',
        ssl_enabled: false,
        scheduler_enabled: enable_scheduler !== false,
        deployment_started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (siteError) {
      return NextResponse.json(
        { error: 'Failed to create site record', details: siteError.message },
        { status: 500 }
      )
    }

    // Create deployment job
    const { data: job, error: jobError } = await supabase
      .from('deployment_jobs')
      .insert({
        site_id: site.id,
        server_id,
        job_type: 'site_creation',
        status: 'queued',
        current_step: 'Queued for deployment',
        progress: 0
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json(
        { error: 'Failed to create deployment job', details: jobError.message },
        { status: 500 }
      )
    }

    // Trigger the deployment job via Trigger.dev
    // This will be handled asynchronously
    try {
      await triggerDeployment({
        jobId: job.id,
        siteId: site.id,
        serverId: server_id,
        siteName: site_name,
        apps: apps || ['erpnext'],
        adminPassword: admin_password,
        setupSsl: setup_ssl !== false,
        serverDetails: {
          ip: server.ip_address,
          sshUser: server.ssh_user,
          sshPort: server.ssh_port,
          benchPath: server.bench_path,
          mariadbRootPassword: server.mariadb_root_password
        }
      })
    } catch (triggerError) {
      console.error('Failed to trigger deployment:', triggerError)
      // Update job status to failed
      await supabase
        .from('deployment_jobs')
        .update({ status: 'failed', error_message: 'Failed to trigger deployment' })
        .eq('id', job.id)
    }

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        site_name: site.site_name,
        status: site.status
      },
      job: {
        id: job.id,
        status: job.status
      },
      message: 'Deployment queued successfully'
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

async function triggerDeployment(params: {
  jobId: string
  siteId: string
  serverId: string
  siteName: string
  apps: string[]
  adminPassword: string
  setupSsl: boolean
  serverDetails: {
    ip: string
    sshUser: string
    sshPort: number
    benchPath: string
    mariadbRootPassword: string
  }
}) {
  // In production, this would call Trigger.dev
  // For now, we'll make a webhook call to our own endpoint
  const webhookUrl = process.env.TRIGGER_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/trigger`
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TRIGGER_API_KEY}`
    },
    body: JSON.stringify({
      event: 'deployment.start',
      payload: params
    })
  })

  if (!response.ok) {
    throw new Error('Failed to trigger deployment webhook')
  }
}
