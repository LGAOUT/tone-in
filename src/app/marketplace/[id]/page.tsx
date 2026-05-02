import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABELS } from '@/types'

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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: service } = await supabase
    .from('services')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, role, bio, followers_count)`)
    .eq('id', id)
    .single()

  if (!service) notFound()

  const isOwner = user.id === service.provider_id

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Marketplace
          </Link>
          <span className="text-white font-medium truncate">{service.title}</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">

          {/* Détail service */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-violet-400 mb-2 block">
                  {CATEGORY_LABELS[service.category]}
                </span>
                <h1 className="text-xl font-bold">{service.title}</h1>
              </div>
              {isOwner && (
                <Link href={`/services/edit/${service.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 text-sm px-3 py-1.5 rounded-xl transition-colors flex-shrink-0">
                  Modifier
                </Link>
              )}
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed mb-6">{service.description}</p>

            {/* Exemples */}
            {service.examples?.length > 0 && (
              <div className="mb-6">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Exemples de travaux</p>
                <div className="grid grid-cols-2 gap-2">
                  {service.examples.map((url: string, i: number) => (
                    <img key={i} src={url} alt={`exemple ${i + 1}`}
                      className="w-full h-32 object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Prix et délai */}
            <div className="flex items-center justify-between py-4 border-t border-zinc-800 border-b mb-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Prix</p>
                <p className="text-white text-2xl font-bold">{service.price} €</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs mb-1">Délai</p>
                <p className="text-white font-bold">{service.delivery_days} jour{service.delivery_days > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* CTA */}
            {!isOwner && (
              <Link href={`/messages/${service.provider_id}`}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors text-center block">
                💬 Contacter le vendeur
              </Link>
            )}
          </div>

          {/* Profil vendeur */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Vendeur</p>
            <Link href={`/profile/${service.profiles?.username}`} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                {service.profiles?.avatar_url ? (
                  <img src={service.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">
                    {service.profiles?.full_name || service.profiles?.username}
                  </span>
                  <Badge level={service.profiles?.badge_level} size="sm" />
                </div>
                <p className="text-zinc-500 text-xs">@{service.profiles?.username}</p>
                {service.profiles?.role && (
                  <p className="text-zinc-400 text-xs mt-0.5">{ROLE_LABELS[service.profiles.role]}</p>
                )}
              </div>
            </Link>
            {service.profiles?.bio && (
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed line-clamp-3">
                {service.profiles.bio}
              </p>
            )}
            <p className="text-zinc-600 text-xs mt-3">
              {service.profiles?.followers_count} abonné{service.profiles?.followers_count !== 1 ? 's' : ''}
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}