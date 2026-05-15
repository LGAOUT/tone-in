'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/app/posts/actions'
import { ImageIcon, Music, Tag, X } from 'lucide-react'

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
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(124,109,250,0.12)', border: '1.5px solid rgba(124,109,250,0.2)', color: '#9d91fb' }}
        >
          {avatarUrl
            ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            : username.charAt(0).toUpperCase()
          }
        </div>

        <form action={handleSubmit} className="flex-1 min-w-0">
          <textarea
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partage quelque chose avec la communauté..."
            rows={3}
            className="w-full bg-transparent text-sm resize-none focus:outline-none"
            style={{ color: '#e8e4dc' }}
          />

          {/* Image preview */}
          {mediaUrl && mediaType === 'image' && (
            <div className="relative mb-3 inline-block">
              <img src={mediaUrl} alt="preview" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 rounded-full p-1"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                <X size={13} className="text-white" />
              </button>
            </div>
          )}

          {/* Audio preview */}
          {mediaUrl && mediaType === 'audio' && (
            <div
              className="flex items-center gap-3 px-4 py-3 mb-3 rounded-[12px]"
              style={{ background: '#0f0f0f', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <Music size={15} style={{ color: '#9d91fb', flexShrink: 0 }} />
              <span className="text-sm truncate flex-1" style={{ color: '#e8e4dc' }}>{mediaName}</span>
              <button type="button" onClick={clearMedia}>
                <X size={14} style={{ color: '#888' }} />
              </button>
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-1.5">
              {/* Photo */}
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-medium transition-all hover:bg-white/[0.04]"
                style={{ color: '#888', border: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                <ImageIcon size={13} />
                Photo
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image')}
              />

              {/* Track */}
              <button
                type="button"
                onClick={() => audioRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-medium transition-all hover:bg-white/[0.04]"
                style={{ color: '#888', border: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                <Music size={13} />
                Track
              </button>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'audio')}
              />

              {/* Tag */}
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-medium transition-all hover:bg-white/[0.04]"
                style={{ color: '#888', border: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                <Tag size={13} />
                Tag
              </button>

              {uploading && (
                <span className="text-xs ml-1" style={{ color: '#888' }}>Envoi...</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || uploading || (!content.trim() && !mediaUrl)}
              className="text-sm font-medium px-5 py-2 transition-colors disabled:opacity-40 text-white"
              style={{ background: '#7c6dfa', borderRadius: 9 }}
            >
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
