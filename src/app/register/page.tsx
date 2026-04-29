'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/app/auth/actions'

const ROLES = [
  { value: 'musician', label: '🎸 Musicien' },
  { value: 'producer', label: '🎛️ Producteur' },
  { value: 'beatmaker', label: '🥁 Beatmaker' },
  { value: 'songwriter', label: '✍️ Songwriter' },
  { value: 'teacher', label: '🎓 Professeur' },
  { value: 'learner', label: '📚 Apprenant' },
]

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tone <span className="text-violet-500">In</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Rejoins la communauté</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-white font-semibold text-lg mb-6">Créer un compte</h2>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Nom complet</label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Yassin Lgaout"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Nom d'utilisateur</label>
              <input
                name="username"
                type="text"
                required
                placeholder="yassinbeats"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="ton@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Mot de passe</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Tu es...</label>
              <select
                name="role"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">Choisis ton rôle</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}