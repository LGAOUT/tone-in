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

export const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  beginner:     { label: 'Débutant',      bg: 'rgba(124,109,250,0.09)', text: '#9d91fb', border: 'rgba(124,109,250,0.19)' },
  intermediate: { label: 'Intermédiaire', bg: 'rgba(29,158,117,0.09)',  text: '#3dcca0', border: 'rgba(29,158,117,0.25)' },
  advanced:     { label: 'Pro',           bg: 'rgba(212,83,126,0.09)',  text: '#e87aaa', border: 'rgba(212,83,126,0.25)' },
  expert:       { label: 'Expert',        bg: 'rgba(212,83,126,0.09)',  text: '#e87aaa', border: 'rgba(212,83,126,0.25)' },
}