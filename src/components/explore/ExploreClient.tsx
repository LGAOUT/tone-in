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
  { value: 'musician', label: '🎸 Musicien' },
  { value: 'producer', label: '🎛️ Producteur' },
  { value: 'beatmaker', label: '🥁 Beatmaker' },
  { value: 'songwriter', label: '✍️ Songwriter' },
  { value: 'teacher', label: '🎓 Professeur' },
  { value: 'learner', label: '📚 Apprenant' },
]

const BADGES = [
  { value: '', label: 'Tous niveaux' },
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
]

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
      <h1 className="text-2xl font-bold mb-6">Découvrir</h1>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un musicien, beatmaker, producteur..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-11 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(''); startTransition(() => router.push(buildUrl('', role, badge))) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Filtres rôle */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {ROLES.map(r => (
          <button
            key={r.value}
            onClick={() => handleRole(r.value)}
            className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
              role === r.value
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Filtres niveau */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {BADGES.map(b => (
          <button
            key={b.value}
            onClick={() => handleBadge(b.value)}
            className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border transition-colors ${
              badge === b.value
                ? 'bg-zinc-100 border-zinc-100 text-black'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {hasFilters && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-400 text-sm">
              {initialProfiles.length} résultat{initialProfiles.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleClear}
              className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {initialProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-zinc-400">Aucun profil trouvé.</p>
            <p className="text-zinc-500 text-sm mt-1">Essaie d'autres mots-clés ou filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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