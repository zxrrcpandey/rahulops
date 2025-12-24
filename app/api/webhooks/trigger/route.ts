import { NextResponse } from 'next/server'

// Webhook endpoint for Trigger.dev events
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, payload } = body

    // Verify webhook signature (in production)
    const signature = request.headers.get('x-trigger-signature')
    // TODO: Verify signature with TRIGGER_API_KEY

    console.log('Received Trigger.dev webhook:', event, payload)

    // Handle different event types
    switch (event) {
      case 'job.completed':
        // Handle job completion
        console.log('Job completed:', payload.jobId)
        break
      
      case 'job.failed':
        // Handle job failure
        console.error('Job failed:', payload.jobId, payload.error)
        break
      
      case 'run.started':
        // Handle run started
        console.log('Run started:', payload.runId)
        break
      
      default:
        console.log('Unknown event type:', event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'trigger-webhook' })
}
