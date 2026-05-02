'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABELS } from '@/types'
import { toggleFollow } from '@/app/posts/actions'
import { UserPlus, UserCheck } from 'lucide-react'

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  badge_level: string
  skills: string[]
  bio: string | null
  followers_count: number
}

type Props = {
  profile: Profile
  currentUserId: string
  isFollowing?: boolean
}

export function ProfileCard({ profile, currentUserId, isFollowing: init = false }: Props) {
  const [following, setFollowing] = useState(init)
  const [followersCount, setFollowersCount] = useState(profile.followers_count)

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault()
    setFollowing(!following)
    setFollowersCount(following ? followersCount - 1 : followersCount + 1)
    await toggleFollow(profile.id)
  }

  return (
    <Link
      href={`/profile/${profile.username}`}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-colors block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
            )}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{profile.full_name || profile.username}</p>
            <p className="text-zinc-500 text-xs">@{profile.username}</p>
          </div>
        </div>

        {profile.id !== currentUserId && (
          <button
            onClick={handleFollow}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors flex-shrink-0 ${
              following
                ? 'border-zinc-600 text-zinc-400'
                : 'border-violet-500 text-violet-400 hover:bg-violet-500/10'
            }`}
          >
            {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
            {following ? 'Abonné' : 'Suivre'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Badge level={profile.badge_level} size="sm" />
        {profile.role && (
          <span className="text-zinc-400 text-xs">{ROLE_LABELS[profile.role]}</span>
        )}
      </div>

      {profile.bio && (
        <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">{profile.bio}</p>
      )}

      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.skills.slice(0, 3).map(skill => (
            <span key={skill} className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-zinc-600 text-xs px-1">+{profile.skills.length - 3}</span>
          )}
        </div>
      )}

      <p className="text-zinc-600 text-xs">{followersCount} abonné{followersCount !== 1 ? 's' : ''}</p>
    </Link>
  )
}