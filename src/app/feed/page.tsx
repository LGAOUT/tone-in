import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePost } from '@/components/feed/CreatePost'
import { PostCard } from '@/components/feed/PostCard'
import { AppNav } from '@/components/navigation/AppNav'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select(`*, profiles(id, username, full_name, avatar_url, badge_level, role)`)
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)

  const { data: userFollows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const likedPostIds = new Set(userLikes?.map(l => l.post_id) ?? [])
  const followingIds = new Set(userFollows?.map(f => f.following_id) ?? [])

  return (
    <div className="min-h-screen bg-black text-white">
      <AppNav currentUserId={user.id} username={profile?.username} maxWidth="2xl" />

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
              isFollowing={followingIds.has((post.profiles as any)?.id)}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">♪</p>
            <p className="text-zinc-400">Aucun post pour l&apos;instant.</p>
            <p className="text-zinc-500 text-sm mt-1">Sois le premier à publier !</p>
          </div>
        )}
      </main>
    </div>
  )
}
