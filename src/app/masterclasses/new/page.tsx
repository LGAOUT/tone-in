'use client'

import { useState, useRef } from 'react'
import { createMasterclass } from '@/app/masterclasses/actions'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'mixing', label: '🎚️ Mixage' },
  { value: 'mastering', label: '💿 Mastering' },
  { value: 'production', label: '🎛️ Production' },
  { value: 'beatmaking', label: '🥁 Beatmaking' },
  { value: 'songwriting', label: '✍️ Songwriting' },
  { value: 'theory', label: '📖 Théorie' },
  { value: 'instrument', label: '🎸 Instrument' },
  { value: 'business', label: '💼 Business' },
  { value: 'other', label: '💬 Autre' },
]

const LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
]

export default function NewMasterclassPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setThumbnailUrl(data.secure_url)
    setUploading(false)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('thumbnail_url', thumbnailUrl)
    const result = await createMasterclass(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/masterclasses" className="text-zinc-400 hover:text-white text-sm">← Masterclasses</Link>
          <span className="text-white font-medium">Nouvelle masterclass</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <form action={handleSubmit} className="space-y-5">
          {/* Thumbnail */}
          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Image de couverture</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 bg-zinc-900 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-violet-500 transition-colors overflow-hidden"
            >
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <p className="text-zinc-500 text-sm">{uploading ? 'Upload...' : '+ Ajouter une image'}</p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Titre</label>
            <input name="title" type="text" required placeholder="Ex: Maîtriser le mixage en home studio"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Description</label>
            <textarea name="description" required rows={4}
              placeholder="Ce que les étudiants vont apprendre..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Catégorie</label>
              <select name="category" required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                <option value="">Choisir</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Niveau</label>
              <select name="level" required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1.5 block">Prix (€)</label>
            <input name="price" type="number" required min="1" step="0.01" placeholder="29"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
            {loading ? 'Création...' : 'Créer et ajouter les chapitres →'}
          </button>
        </form>
      </div>
    </div>
  )
}