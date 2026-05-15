import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { AppNav } from '@/components/navigation/AppNav'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ partnerId: string }>
}) {
  const { partnerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: partner } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', partnerId)
    .single()

  if (!partner) notFound()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a', color: '#e8e4dc' }}>
      <AppNav currentUserId={user.id} username={currentProfile?.username} avatarUrl={currentProfile?.avatar_url ?? null} maxWidth="2xl" />

      <div className="border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <span className="text-white font-medium">@{partner.username}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1">
        <ChatWindow
          currentUserId={user.id}
          partnerId={partner.id}
          partnerUsername={partner.username}
          partnerAvatar={partner.avatar_url}
        />
      </div>
    </div>
  )
}
