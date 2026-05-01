import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatWindow } from '@/components/messages/ChatWindow'
import Link from 'next/link'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ partnerId: string }>
}) {
  const { partnerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: partner } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('id', partnerId)
    .single()

  if (!partner) notFound()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/messages" className="text-zinc-400 hover:text-white transition-colors text-sm">
            ←
          </Link>
          <span className="text-white font-medium">@{partner.username}</span>
        </div>
      </nav>
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