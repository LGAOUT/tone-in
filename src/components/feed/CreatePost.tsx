'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/app/posts/actions'
import { ImageIcon, Music, X } from 'lucide-react'

type Props = {
  username: string
  avatarUrl: string | null
}

export function CreatePost({ username, avatarUrl }: Props) {
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [mediaName, setMediaName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File, type: 'image' | 'audio') {
    setUploading(true)
    const preset = type === 'image'
      ? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      : process.env.NEXT_PUBLIC_CLOUDINARY_AUDIO_PRESET!

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    setMediaUrl(data.secure_url)
    setMediaType(type)
    setMediaName(file.name)
    setUploading(false)
  }

  function clearMedia() {
    setMediaUrl('')
    setMediaType('')
    setMediaName('')
  }

  async function handleSubmit(formData: FormData) {
    if (!content.trim() && !mediaUrl) return
    setLoading(true)
    formData.set('media_url', mediaUrl)
    formData.set('media_type', mediaType)
    await createPost(formData)
    setContent('')
    clearMedia()
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

          {/* Preview image */}
          {mediaUrl && mediaType === 'image' && (
            <div className="relative mb-3 inline-block">
              <img src={mediaUrl} alt="preview" className="max-h-48 rounded-xl object-cover" />
              <button type="button" onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          {/* Preview audio */}
          {mediaUrl && mediaType === 'audio' && (
            <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3 mb-3">
              <Music size={18} className="text-violet-400 flex-shrink-0" />
              <span className="text-zinc-300 text-sm truncate flex-1">{mediaName}</span>
              <button type="button" onClick={clearMedia}>
                <X size={16} className="text-zinc-500 hover:text-white transition-colors" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              {/* Upload image */}
              <button type="button" onClick={() => imageRef.current?.click()}
                className="text-zinc-400 hover:text-violet-400 transition-colors">
                <ImageIcon size={20} />
              </button>
              <input ref={imageRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')} />

              {/* Upload audio */}
              <button type="button" onClick={() => audioRef.current?.click()}
                className="text-zinc-400 hover:text-violet-400 transition-colors">
                <Music size={20} />
              </button>
              <input ref={audioRef} type="file" accept="audio/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'audio')} />

              {uploading && <span className="text-zinc-500 text-xs">Upload...</span>}
            </div>

            <button type="submit"
              disabled={loading || uploading || (!content.trim() && !mediaUrl)}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}