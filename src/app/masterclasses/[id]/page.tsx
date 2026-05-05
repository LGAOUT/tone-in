import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { MasterclassPlayer } from '@/components/masterclasses/MasterclassPlayer'
import { EnrollButton } from '@/components/masterclasses/EnrollButton'
import { GraduationCap, Clock, Users, Lock } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  mixing: '🎚️ Mixage', mastering: '💿 Mastering',
  production: '🎛️ Production', beatmaking: '🥁 Beatmaking',
  songwriting: '✍️ Songwriting', theory: '📖 Théorie',
  instrument: '🎸 Instrument', business: '💼 Business', other: '💬 Autre',
}

export default async function MasterclassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ enrolled?: string }>
}) {
  const { id } = await params
  const { enrolled } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mc } = await supabase
    .from('masterclasses')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, bio)`)
    .eq('id', id)
    .single()

  if (!mc) notFound()

  const { data: chapters } = await supabase
    .from('masterclass_chapters')
    .select('*')
    .eq('masterclass_id', id)
    .order('position', { ascending: true })

  const { data: enrollment } = await supabase
    .from('masterclass_enrollments')
    .select('id')
    .eq('masterclass_id', id)
    .eq('student_id', user.id)
    .single()

  const isInstructor = user.id === mc.instructor_id
  const isEnrolled = !!enrollment || isInstructor
  const totalDuration = chapters?.reduce((acc, c) => acc + (c.duration_minutes ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/masterclasses" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Masterclasses
          </Link>
          {isInstructor && (
            <Link href={`/masterclasses/${id}/edit`}
              className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-sm px-3 py-1.5 rounded-xl transition-colors">
              Gérer
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {enrolled === 'true' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-6">
            <p className="text-green-400 text-sm">🎉 Inscription confirmée ! Tu as accès à tous les chapitres.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="w-full h-56 bg-zinc-900 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
              {mc.thumbnail_url ? (
                <img src={mc.thumbnail_url} alt={mc.title} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap size={60} className="text-zinc-700" />
              )}
            </div>

            {/* Infos */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-violet-400 text-sm">{CATEGORY_LABELS[mc.category]}</span>
              <Badge level={mc.level} size="sm" />
            </div>
            <h1 className="text-2xl font-bold mb-3">{mc.title}</h1>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">{mc.description}</p>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Users size={16} />
                <span>{mc.students_count} étudiant{mc.students_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Clock size={16} />
                <span>{totalDuration} min</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <GraduationCap size={16} />
                <span>{chapters?.length ?? 0} chapitres</span>
              </div>
            </div>

            {/* Chapitres */}
            <div>
              <h2 className="text-lg font-bold mb-4">Chapitres</h2>
              {!chapters || chapters.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucun chapitre pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter, i) => (
                    <div key={chapter.id}>
                      {(isEnrolled || chapter.free_preview) ? (
                        <MasterclassPlayer chapter={chapter} index={i} />
                      ) : (
                        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Lock size={14} className="text-zinc-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-zinc-400 text-sm">{chapter.title}</p>
                            {chapter.duration_minutes > 0 && (
                              <p className="text-zinc-600 text-xs">{chapter.duration_minutes} min</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-20">
              <p className="text-3xl font-bold text-white mb-1">{mc.price} €</p>
              <p className="text-zinc-500 text-xs mb-4">Accès à vie · {chapters?.length ?? 0} chapitres</p>

              {isInstructor ? (
                <div className="bg-zinc-800 rounded-xl px-4 py-3 text-center">
                  <p className="text-zinc-400 text-sm">Tu es l'instructeur</p>
                </div>
              ) : isEnrolled ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-green-400 text-sm">✅ Accès complet</p>
                </div>
              ) : (
                <EnrollButton masterclassId={mc.id} />
              )}

              {/* Instructeur */}
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Instructeur</p>
                <Link href={`/profile/${mc.profiles?.username}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                    {mc.profiles?.avatar_url ? (
                      <img src={mc.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center">🎵</div>}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {mc.profiles?.full_name || mc.profiles?.username}
                    </p>
                    <Badge level={mc.profiles?.badge_level} size="sm" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
