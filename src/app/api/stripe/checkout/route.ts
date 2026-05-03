import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { serviceId } = await request.json()

  // Récupère le service
  const { data: service } = await supabase
    .from('services')
    .select(`*, profiles(id, username, full_name)`)
    .eq('id', serviceId)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
  }

  if (service.provider_id === user.id) {
    return NextResponse.json({ error: 'Tu ne peux pas acheter ton propre service' }, { status: 400 })
  }

  const amountCents = Math.round(service.price * 100)
  const feeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100)

  // Crée la session Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: service.title,
            description: `Par @${service.profiles?.username} — Livraison en ${service.delivery_days}j`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      service_id: serviceId,
      buyer_id: user.id,
      seller_id: service.provider_id,
      platform_fee: feeCents,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${serviceId}`,
  })

  // Crée la commande en pending
  await supabase.from('orders').insert({
    service_id: serviceId,
    buyer_id: user.id,
    seller_id: service.provider_id,
    stripe_session_id: session.id,
    amount: service.price,
    platform_fee: feeCents / 100,
    currency: 'EUR',
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}