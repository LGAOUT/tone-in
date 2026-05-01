import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConversationList } from '@/components/messages/ConversationList'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">Messages</h1>
          <Link href="/feed" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Feed
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto">
        <ConversationList currentUserId={user.id} />
      </div>
    </div>
  )
}