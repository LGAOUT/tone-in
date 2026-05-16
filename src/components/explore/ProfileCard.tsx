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

const MUSIC_ROLES = ['musician', 'producer', 'beatmaker', 'songwriter']

export function ProfileCard({ profile, currentUserId, isFollowing: init = false }: Props) {
  const [following, setFollowing] = useState(init)
  const [followersCount, setFollowersCount] = useState(profile.followers_count)
  const [cardHover, setCardHover] = useState(false)

  const isMusicRole = MUSIC_ROLES.includes(profile.role ?? '')

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault()
    setFollowing(!following)
    setFollowersCount(following ? followersCount - 1 : followersCount + 1)
    await toggleFollow(profile.id)
  }

  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex flex-col rounded-[14px] transition-all block"
      style={{
        background: cardHover ? '#181818' : '#141414',
        border: `0.5px solid ${cardHover ? '#ffffff1e' : '#ffffff0e'}`,
        padding: 15,
        transform: cardHover ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
            style={isMusicRole
              ? { background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }
              : { background: '#1e1e1e', border: '0.5px solid #ffffff10', color: '#888' }
            }
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              (profile.full_name || profile.username).charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[14px] font-medium truncate" style={{ color: '#e8e4dc' }}>
              {profile.full_name || profile.username}
            </p>
            <p
              className="text-[11px] truncate"
              style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}
            >
              @{profile.username}
            </p>
          </div>
        </div>

        {profile.id !== currentUserId && (
          <button
            onClick={handleFollow}
            className="flex items-center gap-1.5 text-[12px] px-3 rounded-[9px] flex-shrink-0 transition-all"
            style={{
              height: 30,
              border: `0.5px solid ${following ? '#7c6dfa40' : '#ffffff10'}`,
              color: following ? '#9d91fb' : '#888',
              background: following ? '#7c6dfa14' : 'transparent',
            }}
          >
            {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
            {following ? 'Abonné' : 'Suivre'}
          </button>
        )}
      </div>

      {/* Badge + role */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge level={profile.badge_level} size="sm" />
        {profile.role && (
          <span className="text-[11px]" style={{ color: '#555' }}>
            {ROLE_LABELS[profile.role]?.replace(/^.\s/, '') ?? profile.role}
          </span>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-[11px] leading-[1.55] line-clamp-2 mb-3" style={{ color: '#444' }}>
          {profile.bio}
        </p>
      )}

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.skills.slice(0, 3).map(skill => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: '#1e1e1e', color: '#555', border: '0.5px solid #ffffff10' }}
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-[10px] px-1" style={{ color: '#444' }}>
              +{profile.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Followers */}
      <p
        className="text-[10px] mt-auto"
        style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
      >
        {followersCount} abonné{followersCount !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}
