import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GroupClient } from '@/components/groups/GroupClient'

import Link from 'next/link'

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) notFound()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('group_posts')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level)`)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: members } = await supabase
    .from('group_members')
    .select(`profiles(id, username, avatar_url)`)
    .eq('group_id', groupId)
    .limit(10)

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/groups" className="text-zinc-400 hover:text-white text-sm transition-colors">← Groupes</Link>
          <span className="text-white font-medium truncate">{group.name}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <GroupClient
          group={group}
          isMember={!!membership}
          isAdmin={membership?.role === 'admin'}
          initialPosts={posts ?? []}
          members={members ?? []}
        />
      </div>
    </div>
  )
}