import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppNav } from '@/components/navigation/AppNav'

const CATEGORY_LABELS: Record<string, string> = {
  mixing: '🎚️ Mixage',
  mastering: '💿 Mastering',
  production: '🎛️ Production',
  beatmaking: '🥁 Beatmaking',
  songwriting: '✍️ Songwriting',
  recording: '🎙️ Recording',
  lessons: '🎓 Cours',
  arrangement: '🎼 Arrangement',
  graphic: '🎨 Graphisme',
  other: '💼 Autre',
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; max_price?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { category, max_price } = await searchParams

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('services')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, role)`)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (max_price) query = query.lte('price', parseFloat(max_price))

  const { data: services } = await query.limit(30)

  return (
    <div className="min-h-screen bg-black text-white">
      <AppNav currentUserId={user.id} username={currentProfile?.username} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <Link href="/services/manage"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Mes services
          </Link>
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <Link href="/marketplace"
            className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
              !category ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}>
            Tous
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <Link key={value} href={`/marketplace?category=${value}`}
              className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
                category === value ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Grille services */}
        {!services || services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-zinc-400">Aucun service disponible.</p>
            <Link href="/services/manage"
              className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">
              Propose le tien →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service: any) => (
              <Link key={service.id} href={`/marketplace/${service.id}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-colors block">

                {/* Vendeur */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                    {service.profiles?.avatar_url ? (
                      <img src={service.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>
                    )}
                  </div>
                  <span className="text-zinc-400 text-xs">@{service.profiles?.username}</span>
                  <span className="text-zinc-600 text-xs ml-auto">
                    {CATEGORY_LABELS[service.category]}
                  </span>
                </div>

                {/* Titre */}
                <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{service.title}</h3>
                <p className="text-zinc-500 text-xs line-clamp-2 mb-4">{service.description}</p>

                {/* Prix et délai */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <span className="text-white font-bold">{service.price} €</span>
                  <span className="text-zinc-500 text-xs">⏱ {service.delivery_days}j</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
