import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { AppNav } from '@/components/navigation/AppNav'
import { Badge } from '@/components/ui/Badge'

type Masterclass = {
  id: string
  title: string
  price: number
  students_count: number
  category: string
  level: string
  thumbnail_url: string | null
  profiles: { avatar_url: string | null; username: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  mixing:      'Mixage',
  mastering:   'Mastering',
  production:  'Production',
  beatmaking:  'Beatmaking',
  songwriting: 'Songwriting',
  theory:      'Théorie',
  instrument:  'Instrument',
  business:    'Business',
  other:       'Autre',
}

const CATEGORY_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  mixing:      { bg: '#1d9e7514', text: '#3dcca0', border: '#1d9e7528' },
  mastering:   { bg: '#378add14', text: '#7ab8ed', border: '#378add28' },
  production:  { bg: '#7c6dfa14', text: '#9d91fb', border: '#7c6dfa28' },
  beatmaking:  { bg: '#d4537e14', text: '#e87aaa', border: '#d4537e28' },
  songwriting: { bg: '#ef9f2714', text: '#f5c06a', border: '#ef9f2728' },
}
const FALLBACK_BADGE = { bg: '#1e1e1e', text: '#888', border: '#ffffff10' }

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
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <AppNav currentUserId={user.id} username={currentProfile?.username} avatarUrl={currentProfile?.avatar_url ?? null} />

      <main className="max-w-3xl mx-auto px-4 py-6 pb-[76px] md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-medium" style={{ color: '#e8e4dc' }}>Masterclasses</h1>
          <Link
            href="/masterclasses/new"
            className="flex items-center text-sm font-medium px-3 rounded-[9px] text-white transition-opacity hover:opacity-85"
            style={{ height: 34, background: '#7c6dfa' }}
          >
            + Créer
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'none' }}>
          {[{ value: '', label: 'Toutes' }, ...Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))].map(item => (
            <Link
              key={item.value}
              href={item.value ? `/masterclasses?category=${item.value}` : '/masterclasses'}
              className="flex-shrink-0 text-[12px] font-medium px-3 rounded-[9px] transition-all"
              style={{
                height: 30,
                display: 'inline-flex',
                alignItems: 'center',
                background: category === item.value || (!category && item.value === '') ? '#7c6dfa18' : 'transparent',
                border: `0.5px solid ${category === item.value || (!category && item.value === '') ? '#7c6dfa30' : '#ffffff10'}`,
                color: category === item.value || (!category && item.value === '') ? '#9d91fb' : '#444',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {!masterclasses || masterclasses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-sm mb-2" style={{ color: '#888' }}>Aucune masterclass disponible.</p>
            <Link
              href="/masterclasses/new"
              className="text-[13px] transition-colors"
              style={{ color: '#9d91fb' }}
            >
              Crée la première →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            {(masterclasses as Masterclass[]).map((mc) => {
              const catBadge = CATEGORY_BADGE[mc.category] ?? FALLBACK_BADGE
              return (
                <Link
                  key={mc.id}
                  href={`/masterclasses/${mc.id}`}
                  className="hover-card rounded-2xl overflow-hidden block"
                  style={{ background: '#141414', border: '0.5px solid #ffffff0e' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-full h-36 flex items-center justify-center overflow-hidden"
                    style={{ background: '#0f0f0f' }}
                  >
                    {mc.thumbnail_url ? (
                      <img src={mc.thumbnail_url} alt={mc.title} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap size={36} style={{ color: '#2a2a2a' }} />
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: 15 }}>
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: catBadge.bg, color: catBadge.text, border: `0.5px solid ${catBadge.border}` }}
                      >
                        {CATEGORY_LABELS[mc.category] ?? mc.category}
                      </span>
                      <Badge level={mc.level} size="sm" />
                      {enrolledIds.has(mc.id) && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(29,158,117,0.1)', color: '#3dcca0', border: '0.5px solid rgba(29,158,117,0.2)' }}
                        >
                          Inscrit
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-[14px] font-medium leading-snug line-clamp-2 mb-3" style={{ color: '#ddd' }}>
                      {mc.title}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                        style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
                      >
                        {mc.profiles?.avatar_url ? (
                          <img src={mc.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (mc.profiles?.username ?? '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span
                        className="text-[11px]"
                        style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}
                      >
                        @{mc.profiles?.username}
                      </span>
                    </div>

                    {/* Price + students */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: '0.5px solid #ffffff08' }}
                    >
                      <span className="text-[16px] font-medium" style={{ color: '#e8e4dc' }}>
                        {mc.price} €
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
                      >
                        {mc.students_count} étudiant{mc.students_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
