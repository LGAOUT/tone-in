'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/explore/ProfileCard'
import { Search, X } from 'lucide-react'

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
  initialProfiles: Profile[]
  currentUserId: string
  initialQ: string
  initialRole: string
  initialBadge: string
}

const ROLES = [
  { value: '', label: 'Tous' },
  { value: 'musician', label: 'Musicien' },
  { value: 'producer', label: 'Producteur' },
  { value: 'beatmaker', label: 'Beatmaker' },
  { value: 'songwriter', label: 'Songwriter' },
  { value: 'teacher', label: 'Professeur' },
  { value: 'learner', label: 'Apprenant' },
]

const BADGES = [
  { value: '', label: 'Tous niveaux' },
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
]

const pillBase: React.CSSProperties = {
  height: 30,
  border: '0.5px solid #ffffff10',
  borderRadius: 9,
  padding: '0 12px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all .15s ease',
  background: 'transparent',
}

const pillActive: React.CSSProperties = {
  ...pillBase,
  background: '#7c6dfa18',
  border: '0.5px solid #7c6dfa30',
  color: '#9d91fb',
}

const pillInactive: React.CSSProperties = {
  ...pillBase,
  color: '#444',
}

export function ExploreClient({
  initialProfiles,
  currentUserId,
  initialQ,
  initialRole,
  initialBadge,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)
  const [role, setRole] = useState(initialRole)
  const [badge, setBadge] = useState(initialBadge)

  function buildUrl(newQ: string, newRole: string, newBadge: string) {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newRole) params.set('role', newRole)
    if (newBadge) params.set('badge', newBadge)
    return `/explore?${params.toString()}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => router.push(buildUrl(q, role, badge)))
  }

  function handleRole(value: string) {
    setRole(value)
    startTransition(() => router.push(buildUrl(q, value, badge)))
  }

  function handleBadge(value: string) {
    setBadge(value)
    startTransition(() => router.push(buildUrl(q, role, value)))
  }

  function handleClear() {
    setQ('')
    setRole('')
    setBadge('')
    startTransition(() => router.push('/explore'))
  }

  const hasFilters = q || role || badge

  return (
    <div>
      {/* Title */}
      <h1 className="text-[22px] font-medium mb-5" style={{ color: '#e8e4dc' }}>Découvrir</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: '#555' }}
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un musicien, beatmaker, producteur..."
          className="w-full pl-10 pr-10 text-sm focus:outline-none transition-all"
          style={{
            background: '#141414',
            border: '0.5px solid #ffffff10',
            borderRadius: 16,
            padding: '11px 40px',
            color: '#e8e4dc',
            height: 44,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#7c6dfa40')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ffffff10')}
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(''); startTransition(() => router.push(buildUrl('', role, badge))) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: '#555' }}
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Role filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
        {ROLES.map(r => (
          <button
            key={r.value}
            onClick={() => handleRole(r.value)}
            style={role === r.value ? pillActive : pillInactive}
            onMouseEnter={e => {
              if (role !== r.value) {
                e.currentTarget.style.color = '#888'
                e.currentTarget.style.borderColor = '#ffffff1e'
                e.currentTarget.style.background = '#ffffff0a'
              }
            }}
            onMouseLeave={e => {
              if (role !== r.value) {
                e.currentTarget.style.color = '#444'
                e.currentTarget.style.borderColor = '#ffffff10'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Badge filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5" style={{ scrollbarWidth: 'none' }}>
        {BADGES.map(b => (
          <button
            key={b.value}
            onClick={() => handleBadge(b.value)}
            style={badge === b.value ? pillActive : pillInactive}
            onMouseEnter={e => {
              if (badge !== b.value) {
                e.currentTarget.style.color = '#888'
                e.currentTarget.style.borderColor = '#ffffff1e'
                e.currentTarget.style.background = '#ffffff0a'
              }
            }}
            onMouseLeave={e => {
              if (badge !== b.value) {
                e.currentTarget.style.color = '#444'
                e.currentTarget.style.borderColor = '#ffffff10'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className={`transition-opacity duration-150 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
        {hasFilters && (
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[11px]"
              style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
            >
              {initialProfiles.length} résultat{initialProfiles.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClear}
              className="text-[12px] transition-colors"
              style={{ color: '#9d91fb' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e8e4dc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9d91fb')}
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {initialProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm mb-1" style={{ color: '#888' }}>Aucun profil trouvé.</p>
            <p className="text-[12px]" style={{ color: '#555' }}>Essaie d&apos;autres mots-clés ou filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialProfiles.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
