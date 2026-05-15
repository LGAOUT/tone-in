import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConversationList } from '@/components/messages/ConversationList'
import { AppNav } from '@/components/navigation/AppNav'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <AppNav currentUserId={user.id} username={currentProfile?.username} avatarUrl={currentProfile?.avatar_url ?? null} maxWidth="2xl" />

      <div className="max-w-2xl mx-auto pb-[76px] md:pb-0">
        <ConversationList currentUserId={user.id} />
      </div>
    </div>
  )
}
