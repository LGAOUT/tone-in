import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { CreatePost } from '@/components/feed/CreatePost'
import { PostCard } from '@/components/feed/PostCard'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profil courant
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Posts avec profil auteur
  const { data: posts } = await supabase
    .from('posts')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, role)`)
    .order('created_at', { ascending: false })
    .limit(30)

  // Likes de l'utilisateur courant
  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)

  // Follows de l'utilisateur courant
  const { data: userFollows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const likedPostIds = new Set(userLikes?.map(l => l.post_id) ?? [])
  const followingIds = new Set(userFollows?.map(f => f.following_id) ?? [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">
            Tone <span className="text-violet-500">In</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/profile/${profile?.username}`}
              className="text-zinc-300 hover:text-white text-sm transition-colors"
            >
              @{profile?.username}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="bg-zinc-800 hover:bg-zinc-700 text-sm px-3 py-1.5 rounded-xl transition-colors"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <CreatePost
          username={profile?.username ?? ''}
          avatarUrl={profile?.avatar_url ?? null}
        />

        {posts && posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post as any}
              currentUserId={user.id}
              isLiked={likedPostIds.has(post.id)}
              isFollowing={followingIds.has(post.profiles?.id)}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-zinc-400">Aucun post pour l'instant.</p>
            <p className="text-zinc-500 text-sm mt-1">Sois le premier à publier !</p>
          </div>
        )}
      </main>
    </div>
  )
}