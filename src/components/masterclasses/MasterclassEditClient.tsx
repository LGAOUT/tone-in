'use client'

import { useState, useRef } from 'react'
import { addChapter, deleteChapter, togglePublish } from '@/app/masterclasses/actions'
import { Trash2, Eye, EyeOff, Plus } from 'lucide-react'

type Chapter = {
  id: string
  title: string
  duration_minutes: number
  free_preview: boolean
  video_url: string | null
}

type MC = {
  id: string
  title: string
  published: boolean
}

type Props = {
  mc: MC
  initialChapters: Chapter[]
}

export function MasterclassEditClient({ mc, initialChapters }: Props) {
  const [chapters, setChapters] = useState(initialChapters)
  const [published, setPublished] = useState(mc.published)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLInputElement>(null)

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_PRESET!)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setVideoUrl(data.secure_url)
    setUploading(false)
  }

  async function handleAddChapter(formData: FormData) {
    setLoading(true)
    formData.set('masterclass_id', mc.id)
    formData.set('video_url', videoUrl)
    await addChapter(formData)
    setVideoUrl('')
    setShowForm(false)
    setLoading(false)
  }

  async function handleDeleteChapter(chapterId: string) {
    if (!confirm('Supprimer ce chapitre ?')) return
    await deleteChapter(chapterId, mc.id)
    setChapters((prev) => prev.filter((c) => c.id !== chapterId))
  }

  async function handleTogglePublish() {
    setPublished(!published)
    await togglePublish(mc.id, published)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1">{mc.title}</h1>
          <p className="text-zinc-500 text-sm">{chapters.length} chapitre{chapters.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleTogglePublish}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors ${
            published
              ? 'border-green-500 text-green-400 hover:bg-green-500/10'
              : 'border-zinc-700 text-zinc-400 hover:border-violet-500 hover:text-violet-400'
          }`}>
          {published ? <><Eye size={15} /> Publié</> : <><EyeOff size={15} /> Brouillon</>}
        </button>
      </div>

      {/* Liste chapitres */}
      <div className="space-y-3 mb-6">
        {chapters.length === 0 && (
          <div className="text-center py-10 bg-zinc-900 rounded-2xl border border-zinc-800">
            <p className="text-zinc-500 text-sm">Aucun chapitre. Ajoute le premier !</p>
          </div>
        )}
        {chapters.map((chapter, i) => (
          <div key={chapter.id}
            className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-violet-400 text-xs font-bold">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{chapter.title}</p>
              <div className="flex items-center gap-2">
                {chapter.duration_minutes > 0 && (
                  <span className="text-zinc-500 text-xs">{chapter.duration_minutes} min</span>
                )}
                {chapter.free_preview && (
                  <span className="text-green-400 text-xs">Aperçu gratuit</span>
                )}
                {chapter.video_url && (
                  <span className="text-violet-400 text-xs">✓ Vidéo</span>
                )}
              </div>
            </div>
            <button onClick={() => handleDeleteChapter(chapter.id)}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Formulaire ajout chapitre */}
      {showForm ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-medium mb-4">Nouveau chapitre</h3>
          <form action={handleAddChapter} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Titre</label>
              <input name="title" type="text" required placeholder="Ex: Introduction au mixage"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Description</label>
              <textarea name="description" rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1.5 block">Vidéo</label>
              {videoUrl ? (
                <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">
                  <span className="text-green-400 text-sm flex-1">✓ Vidéo uploadée</span>
                  <button type="button" onClick={() => setVideoUrl('')}
                    className="text-zinc-500 hover:text-white text-xs">Changer</button>
                </div>
              ) : (
                <button type="button" onClick={() => videoRef.current?.click()}
                  className="w-full bg-zinc-800 border border-dashed border-zinc-700 rounded-xl px-4 py-3 text-zinc-400 hover:border-violet-500 hover:text-violet-400 transition-colors text-sm">
                  {uploading ? 'Upload en cours...' : '+ Uploader une vidéo (MP4, MOV)'}
                </button>
              )}
              <input ref={videoRef} type="file" accept="video/*" className="hidden"
                onChange={handleVideoUpload} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-sm mb-1.5 block">Durée (min)</label>
                <input name="duration_minutes" type="number" min="0" placeholder="10"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input name="free_preview" type="checkbox" value="true"
                    className="w-4 h-4 accent-violet-500" />
                  <span className="text-zinc-400 text-sm">Aperçu gratuit</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-zinc-700 text-zinc-400 py-2.5 rounded-xl text-sm transition-colors hover:border-zinc-500">
                Annuler
              </button>
              <button type="submit" disabled={loading || uploading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm transition-colors">
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full border border-dashed border-zinc-700 hover:border-violet-500 text-zinc-400 hover:text-violet-400 py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
          <Plus size={16} />
          Ajouter un chapitre
        </button>
      )}
    </div>
  )
}