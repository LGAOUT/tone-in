'use client'

import { useState, useRef } from 'react'
import { createService, updateService } from '@/app/services/actions'
import { ImageIcon, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'mixing', label: '🎚️ Mixage' },
  { value: 'mastering', label: '💿 Mastering' },
  { value: 'production', label: '🎛️ Production' },
  { value: 'beatmaking', label: '🥁 Beatmaking' },
  { value: 'songwriting', label: '✍️ Songwriting' },
  { value: 'recording', label: '🎙️ Recording' },
  { value: 'lessons', label: '🎓 Cours' },
  { value: 'arrangement', label: '🎼 Arrangement' },
  { value: 'graphic', label: '🎨 Graphisme' },
  { value: 'other', label: '💼 Autre' },
]

type Service = {
  id: string
  title: string
  description: string
  category: string
  price: number
  delivery_days: number
  examples: string[]
}

type Props = {
  service?: Service
}

export function ServiceForm({ service }: Props) {
  const isEdit = !!service
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [examples, setExamples] = useState<string[]>(service?.examples ?? [])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExampleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || examples.length >= 4) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setExamples(prev => [...prev, data.secure_url])
    setUploading(false)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('examples', examples.join(','))
    const result = isEdit
      ? await updateService(formData)
      : await createService(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={service.id} />}

      <div>
        <label className="text-zinc-400 text-sm mb-1.5 block">Titre du service</label>
        <input name="title" type="text" required
          defaultValue={service?.title ?? ''}
          placeholder="Ex: Je mixe ta track en 48h"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
      </div>

      <div>
        <label className="text-zinc-400 text-sm mb-1.5 block">Description</label>
        <textarea name="description" required rows={5}
          defaultValue={service?.description ?? ''}
          placeholder="Décris ton service, ton expérience, ce que tu livres..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
      </div>

      <div>
        <label className="text-zinc-400 text-sm mb-1.5 block">Catégorie</label>
        <select name="category" required defaultValue={service?.category ?? ''}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
          <option value="">Choisis une catégorie</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-zinc-400 text-sm mb-1.5 block">Prix (€)</label>
          <input name="price" type="number" required min="1" step="0.01"
            defaultValue={service?.price ?? ''}
            placeholder="50"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
        <div>
          <label className="text-zinc-400 text-sm mb-1.5 block">Délai (jours)</label>
          <input name="delivery_days" type="number" required min="1"
            defaultValue={service?.delivery_days ?? ''}
            placeholder="3"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
      </div>

      {/* Exemples de travaux */}
      <div>
        <label className="text-zinc-400 text-sm mb-1.5 block">
          Exemples de travaux <span className="text-zinc-600">(max 4 images)</span>
        </label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {examples.map((url, i) => (
            <div key={i} className="relative aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
              <button type="button"
                onClick={() => setExamples(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
          {examples.length < 4 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="aspect-square border border-dashed border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 hover:border-violet-500 hover:text-violet-400 transition-colors">
              {uploading ? '...' : <ImageIcon size={20} />}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={handleExampleUpload} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors">
        {loading ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Publier le service'}
      </button>
    </form>
  )
}
