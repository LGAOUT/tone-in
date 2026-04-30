'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react'
import { toggleLike, addComment, toggleFollow } from '@/app/posts/actions'
import { Badge } from '@/components/ui/Badge'

type Post = {
  id: string
  content: string | null
  media_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    badge_level: string
    role: string | null
  }
}

type Props = {
  post: Post
  currentUserId: string
  isLiked: boolean
  isFollowing: boolean
}

export function PostCard({ post, currentUserId, isLiked, isFollowing }: Props) {
  const [liked, setLiked] = useState(isLiked)
  const [likes, setLikes] = useState(post.likes_count)
  const [following, setFollowing] = useState(isFollowing)
  const [showComments, setShowComments] = useState(false)
  const [commenting, setCommenting] = useState(false)

  const isOwner = post.profiles.id === currentUserId

  async function handleLike() {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    await toggleLike(post.id)
  }

  async function handleFollow() {
    setFollowing(!following)
    await toggleFollow(post.profiles.id)
  }

  async function handleComment(formData: FormData) {
    setCommenting(true)
    formData.set('post_id', post.id)
    await addComment(formData)
    setCommenting(false)
    setShowComments(true)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}j`
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
            {post.profiles.avatar_url ? (
              <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">
                {post.profiles.full_name || post.profiles.username}
              </span>
              <Badge level={post.profiles.badge_level} size="sm" />
            </div>
            <span className="text-zinc-500 text-xs">@{post.profiles.username} · {timeAgo(post.created_at)}</span>
          </div>
        </Link>

        {!isOwner && (
          <button onClick={handleFollow} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors
            border-zinc-700 text-zinc-400 hover:border-violet-500 hover:text-violet-400">
            {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
            {following ? 'Abonné' : 'Suivre'}
          </button>
        )}
      </div>

      {/* Contenu */}
      {post.content && (
        <p className="text-zinc-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.media_url && (
        <img src={post.media_url} alt="media" className="w-full rounded-xl object-cover max-h-96 mb-3" />
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-zinc-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-zinc-400 hover:text-red-400'}`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
        >
          <MessageCircle size={18} />
          <span>{post.comments_count}</span>
        </button>
      </div>

      {/* Zone commentaire */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <form action={handleComment} className="flex gap-2">
            <input
              name="content"
              type="text"
              placeholder="Ajoute un commentaire..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              disabled={commenting}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors"
            >
              {commenting ? '...' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}