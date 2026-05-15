import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Client admin Supabase (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session

  if (session.metadata.type === 'masterclass') {
    // Confirme l'enrollment
    await supabaseAdmin
      .from('masterclass_enrollments')
      .update({ stripe_session_id: session.id })
      .eq('masterclass_id', session.metadata.masterclass_id)
      .eq('student_id', session.metadata.student_id)

    await supabaseAdmin.rpc('increment_students_count', {
      mc_id: session.metadata.masterclass_id,
    })

    // Notif à l'instructeur
    await supabaseAdmin.from('notifications').insert({
      user_id: session.metadata.instructor_id,
      type: 'message',
      from_user_id: session.metadata.student_id,
    })
  }

  if (session.metadata.type === 'service') {
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)

    await supabaseAdmin.rpc('increment_orders_count', {
      service_id: session.metadata.service_id,
    })
  }
}

  return NextResponse.json({ received: true })
}