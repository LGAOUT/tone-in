'use client'

import { useState } from 'react'
import { createGroup } from '@/app/groups/actions'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'genre', label: '🎵 Genre musical' },
  { value: 'instrument', label: '🎸 Instrument' },
  { value: 'production', label: '🎛️ Production' },
  { value: 'theory', label: '📖 Théorie musicale' },
  { value: 'business', label: '💼 Business musical' },
  { value: 'collaboration', label: '🤝 Collaboration' },
  { value: 'general', label: '💬 Général' },
]

export default function NewGroupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createGroup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/groups" className="text-zinc-400 hover:text-white transition-colors text-sm">← Groupes</Link>
          <span className="text-white font-medium">Créer un groupe</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Nom du groupe</label>
            <input name="name" type="text" required placeholder="Ex: Beatmakers FR"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Description</label>
            <textarea name="description" rows={3} placeholder="De quoi parle ce groupe ?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Catégorie</label>
            <select name="category" required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
              <option value="">Choisis une catégorie</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
            {loading ? 'Création...' : 'Créer le groupe'}
          </button>
        </form>
      </div>
    </div>
  )
}