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
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white">
      <AppNav currentUserId={user.id} username={currentProfile?.username} maxWidth="2xl" />

      <div className="max-w-2xl mx-auto">
        <ConversationList currentUserId={user.id} />
      </div>
    </div>
  )
}
