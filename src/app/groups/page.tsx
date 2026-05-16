import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AppNav } from '@/components/navigation/AppNav'

const CATEGORY_LABELS: Record<string, string> = {
  genre:         'Genre',
  instrument:    'Instrument',
  production:    'Production',
  theory:        'Théorie',
  business:      'Business',
  collaboration: 'Collaboration',
  general:       'Général',
}

type Group = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  members_count: number
  posts_count: number
  category: string
}

function GroupCard({ group, isMember }: { group: Group; isMember: boolean }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="hover-card flex flex-col rounded-[14px] block"
      style={{ background: '#141414', border: '0.5px solid #ffffff0e', padding: 15 }}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Cover icon */}
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center overflow-hidden flex-shrink-0 text-lg font-bold"
          style={{ background: '#7c6dfa18', border: '0.5px solid #7c6dfa20', color: '#9d91fb' }}
        >
          {group.cover_url ? (
            <img src={group.cover_url} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            (group.name).charAt(0).toUpperCase()
          )}
        </div>

        {isMember && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: '#7c6dfa18', color: '#9d91fb', border: '0.5px solid #7c6dfa30' }}
          >
            Membre
          </span>
        )}
      </div>

      <p className="text-[14px] font-medium mb-1" style={{ color: '#e8e4dc' }}>
        {group.name}
      </p>

      {group.description && (
        <p className="text-[11px] leading-[1.55] line-clamp-2 mb-3" style={{ color: '#444' }}>
          {group.description}
        </p>
      )}

      <div
        className="flex items-center gap-2 mt-auto pt-3"
        style={{ borderTop: '0.5px solid #ffffff06' }}
      >
        <span
          className="text-[10px]"
          style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
        >
          {group.members_count} membre{group.members_count !== 1 ? 's' : ''}
        </span>
        <span style={{ color: '#2e2e2e', fontSize: 10 }}>·</span>
        <span
          className="text-[10px]"
          style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
        >
          {CATEGORY_LABELS[group.category] ?? group.category}
        </span>
      </div>
    </Link>
  )
}

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('members_count', { ascending: false })

  const { data: myMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const myGroupIds = new Set(myMemberships?.map(m => m.group_id) ?? [])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <AppNav currentUserId={user.id} username={currentProfile?.username} avatarUrl={currentProfile?.avatar_url ?? null} />

      <main className="max-w-3xl mx-auto px-4 py-6 pb-[76px] md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[22px] font-medium" style={{ color: '#e8e4dc' }}>Groupes</h1>
          <Link
            href="/groups/new"
            className="flex items-center gap-1.5 text-sm font-medium px-3 rounded-[9px] text-white transition-opacity hover:opacity-85"
            style={{ height: 34, background: '#7c6dfa' }}
          >
            <Plus size={14} />
            Créer un groupe
          </Link>
        </div>

        {/* Mes groupes */}
        {myGroupIds.size > 0 && (
          <div className="mb-8">
            <p
              className="text-[11px] uppercase tracking-widest mb-3"
              style={{ color: '#333', fontFamily: 'var(--font-dm-mono)' }}
            >
              Mes groupes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {groups?.filter(g => myGroupIds.has(g.id)).map(group => (
                <GroupCard key={group.id} group={group} isMember={true} />
              ))}
            </div>
          </div>
        )}

        {/* Découvrir */}
        <div>
          <p
            className="text-[11px] uppercase tracking-widest mb-3"
            style={{ color: '#333', fontFamily: 'var(--font-dm-mono)' }}
          >
            Découvrir
          </p>
          {groups?.filter(g => !myGroupIds.has(g.id)).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: '#888' }}>Aucun groupe à découvrir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {groups?.filter(g => !myGroupIds.has(g.id)).map(group => (
                <GroupCard key={group.id} group={group} isMember={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
