import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { AppNav } from '@/components/navigation/AppNav'
import { Badge } from '@/components/ui/Badge'

const CATEGORY_LABELS: Record<string, string> = {
  mixing: '🎚️ Mixage', mastering: '💿 Mastering',
  production: '🎛️ Production', beatmaking: '🥁 Beatmaking',
  songwriting: '✍️ Songwriting', theory: '📖 Théorie',
  instrument: '🎸 Instrument', business: '💼 Business', other: '💬 Autre',
}

export default async function MasterclassesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { category } = await searchParams

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('masterclasses')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level)`)
    .eq('published', true)
    .order('students_count', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data: masterclasses } = await query.limit(30)

  const { data: myEnrollments } = await supabase
    .from('masterclass_enrollments')
    .select('masterclass_id')
    .eq('student_id', user.id)

  const enrolledIds = new Set(myEnrollments?.map(e => e.masterclass_id) ?? [])

  return (
    <div className="min-h-screen bg-black text-white">
      <AppNav currentUserId={user.id} username={currentProfile?.username} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Masterclasses</h1>
          <Link href="/masterclasses/new"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            + Créer
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <Link href="/masterclasses"
            className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
              !category ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}>Toutes</Link>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <Link key={value} href={`/masterclasses?category=${value}`}
              className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
                category === value ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}>{label}</Link>
          ))}
        </div>

        {!masterclasses || masterclasses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-zinc-400">Aucune masterclass disponible.</p>
            <Link href="/masterclasses/new"
              className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">
              Crée la première →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {masterclasses.map((mc: any) => (
              <Link key={mc.id} href={`/masterclasses/${mc.id}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-colors block">
                {/* Thumbnail */}
                <div className="w-full h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {mc.thumbnail_url ? (
                    <img src={mc.thumbnail_url} alt={mc.title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap size={40} className="text-zinc-600" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-violet-400">{CATEGORY_LABELS[mc.category]}</span>
                    <Badge level={mc.level} size="sm" />
                    {enrolledIds.has(mc.id) && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Inscrit</span>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{mc.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-zinc-700 overflow-hidden">
                      {mc.profiles?.avatar_url ? (
                        <img src={mc.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-xs">🎵</div>}
                    </div>
                    <span className="text-zinc-400 text-xs">@{mc.profiles?.username}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span className="text-white font-bold">{mc.price} €</span>
                    <span className="text-zinc-500 text-xs">{mc.students_count} étudiant{mc.students_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
