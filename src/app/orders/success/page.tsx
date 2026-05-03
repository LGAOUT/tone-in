import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`*, services(title, delivery_days), profiles!orders_seller_id_fkey(username)`)
    .eq('stripe_session_id', session_id ?? '')
    .single()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Commande confirmée !</h1>

        {order && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 my-6 text-left">
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Détails</p>
            <p className="text-white font-medium mb-1">{order.services?.title}</p>
            <p className="text-zinc-400 text-sm mb-3">
              Par @{order.profiles?.username}
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Montant payé</span>
              <span className="text-white font-bold">{order.amount} €</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-zinc-500">Délai de livraison</span>
              <span className="text-white">{order.services?.delivery_days}j</span>
            </div>
          </div>
        )}

        <p className="text-zinc-400 text-sm mb-6">
          Envoie un message au vendeur pour démarrer ta commande.
        </p>

        <div className="space-y-3">
          {order && (
            <Link
              href={`/messages/${order.seller_id}`}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors block"
            >
              💬 Contacter le vendeur
            </Link>
          )}
          <Link
            href="/marketplace"
            className="w-full border border-zinc-700 text-zinc-300 hover:text-white py-3 rounded-xl transition-colors block"
          >
            Retour à la marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}