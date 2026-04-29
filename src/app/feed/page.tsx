import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl font-bold mb-2">Feed — bientôt disponible</h1>
        <p className="text-zinc-400 mb-6">Connecté en tant que {user?.email}</p>
        <form action={logout}>
          <button
            type="submit"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}