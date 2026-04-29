import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import  Link  from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user!.id)
    .single()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8 text-white">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Tone <span className="text-violet-500">In</span></h1>
          <div className="flex items-center gap-4">
            <Link href={`/profile/${profile?.username}`}
              className="text-zinc-300 hover:text-white text-sm transition-colors">
              @{profile?.username}
            </Link>
            <form action={logout}>
              <button type="submit"
                className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-xl transition-colors">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
        <p className="text-zinc-500 text-center py-20">Le feed arrive à l'étape 5 👀</p>
      </div>
    </div>
  )
}