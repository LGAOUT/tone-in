export type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'musician' | 'producer' | 'beatmaker' | 'songwriter' | 'teacher' | 'learner' | null
  badge_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  skills: string[]
  website_url: string | null
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
}

export const ROLE_LABELS: Record<string, string> = {
  musician: '🎸 Musicien',
  producer: '🎛️ Producteur',
  beatmaker: '🥁 Beatmaker',
  songwriter: '✍️ Songwriter',
  teacher: '🎓 Professeur',
  learner: '📚 Apprenant',
}

export const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  beginner:     { label: 'Débutant',      color: 'bg-zinc-500' },
  intermediate: { label: 'Intermédiaire', color: 'bg-blue-500' },
  advanced:     { label: 'Avancé',        color: 'bg-violet-500' },
  expert:       { label: 'Expert',        color: 'bg-amber-500' },
}