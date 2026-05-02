import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Search, Plus } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const CATEGORY_LABELS: Record<string, string> = {
  genre: '🎵 Genre',
  instrument: '🎸 Instrument',
  production: '🎛️ Production',
  theory: '📖 Théorie',
  business: '💼 Business',
  collaboration: '🤝 Collaboration',
  general: '💬 Général',
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

  // Tous les groupes
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('members_count', { ascending: false })

  // Groupes dont l'user est membre
  const { data: myMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const myGroupIds = new Set(myMemberships?.map(m => m.group_id) ?? [])

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="text-lg font-bold">
            Tone <span className="text-violet-500">In</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/explore"><Search size={20} className="text-zinc-400 hover:text-white transition-colors" /></Link>
            <Link href="/messages"><MessageCircle size={20} className="text-zinc-400 hover:text-white transition-colors" /></Link>
            <NotificationBell currentUserId={user.id} />
            <Link href={`/profile/${currentProfile?.username}`}
              className="text-zinc-300 hover:text-white text-sm transition-colors">
              @{currentProfile?.username}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Groupes</h1>
          <Link href="/groups/new"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} />
            Créer un groupe
          </Link>
        </div>

        {/* Mes groupes */}
        {myGroupIds.size > 0 && (
          <div className="mb-8">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Mes groupes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups?.filter(g => myGroupIds.has(g.id)).map(group => (
                <GroupCard key={group.id} group={group} isMember={true} />
              ))}
            </div>
          </div>
        )}

        {/* Tous les groupes */}
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Découvrir</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups?.filter(g => !myGroupIds.has(g.id)).map(group => (
              <GroupCard key={group.id} group={group} isMember={false} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function GroupCard({ group, isMember }: { group: any, isMember: boolean }) {
  return (
    <Link href={`/groups/${group.id}`}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-colors block">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-xl flex-shrink-0">
          {group.cover_url ? (
            <img src={group.cover_url} alt={group.name} className="w-full h-full object-cover rounded-xl" />
          ) : '🎵'}
        </div>
        {isMember && (
          <span className="text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full">Membre</span>
        )}
      </div>
      <p className="text-white font-medium text-sm mb-1">{group.name}</p>
      {group.description && (
        <p className="text-zinc-500 text-xs line-clamp-2 mb-2">{group.description}</p>
      )}
      <div className="flex items-center gap-3 text-zinc-600 text-xs">
        <span>{group.members_count} membre{group.members_count !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{CATEGORY_LABELS[group.category] ?? group.category}</span>
      </div>
    </Link>
  )
}