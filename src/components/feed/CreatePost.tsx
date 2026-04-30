'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/app/posts/actions'
import { ImageIcon, X } from 'lucide-react'

type Props = {
  username: string
  avatarUrl: string | null
}

export function CreatePost({ username, avatarUrl }: Props) {
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
    setMediaUrl(data.secure_url)
    setUploading(false)
  }

  async function handleSubmit(formData: FormData) {
    if (!content.trim() && !mediaUrl) return
    setLoading(true)
    formData.set('media_url', mediaUrl)
    formData.set('media_type', mediaUrl ? 'image' : '')
    await createPost(formData)
    setContent('')
    setMediaUrl('')
    setLoading(false)
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
          )}
        </div>

        <form action={handleSubmit} className="flex-1">
          <textarea
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partage quelque chose avec la communauté..."
            rows={3}
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm resize-none focus:outline-none mb-3"
          />

          {mediaUrl && (
            <div className="relative mb-3 inline-block">
              <img src={mediaUrl} alt="preview" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-zinc-400 hover:text-violet-400 transition-colors"
            >
              {uploading ? (
                <span className="text-xs text-zinc-500">Upload...</span>
              ) : (
                <ImageIcon size={20} />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <button
              type="submit"
              disabled={loading || (!content.trim() && !mediaUrl)}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}