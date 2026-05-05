import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    const { serviceId, masterclassId } = await request.json()

    // === MASTERCLASS ===
    if (masterclassId) {
      const { data: mc } = await supabase
        .from('masterclasses')
        .select(`*, profiles(username)`)
        .eq('id', masterclassId)
        .single()

      if (!mc) return NextResponse.json({ error: 'Masterclass introuvable' }, { status: 404 })
      if (mc.instructor_id === user.id) return NextResponse.json({ error: 'Tu ne peux pas acheter ta propre masterclass' }, { status: 400 })

      const { data: alreadyEnrolled } = await supabase
        .from('masterclass_enrollments')
        .select('id')
        .eq('masterclass_id', masterclassId)
        .eq('student_id', user.id)
        .single()

      if (alreadyEnrolled) return NextResponse.json({ error: 'Déjà inscrit' }, { status: 400 })

      const amountCents = Math.round(mc.price * 100)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: mc.title,
              description: `Masterclass par @${mc.profiles?.username}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        metadata: {
          type: 'masterclass',
          masterclass_id: masterclassId,
          student_id: user.id,
          instructor_id: mc.instructor_id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/masterclasses/${masterclassId}?enrolled=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/masterclasses/${masterclassId}`,
      })

      await supabase.from('masterclass_enrollments').insert({
        masterclass_id: masterclassId,
        student_id: user.id,
        stripe_session_id: session.id,
      })

      return NextResponse.json({ url: session.url })
    }

    // === SERVICE ===
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select(`*, profiles(id, username, full_name)`)
        .eq('id', serviceId)
        .single()

      if (!service) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 })
      if (service.provider_id === user.id) return NextResponse.json({ error: 'Tu ne peux pas acheter ton propre service' }, { status: 400 })

      const amountCents = Math.round(service.price * 100)
      const feeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.title,
              description: `Par @${service.profiles?.username} — Livraison en ${service.delivery_days}j`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        metadata: {
          type: 'service',
          service_id: serviceId,
          buyer_id: user.id,
          seller_id: service.provider_id,
          platform_fee: feeCents,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${serviceId}`,
      })

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

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  } catch (error: any) {
    console.error('STRIPE CHECKOUT ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}