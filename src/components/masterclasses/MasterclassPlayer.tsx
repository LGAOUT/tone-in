'use client'

import { useState } from 'react'
import { Play, ChevronDown, ChevronUp } from 'lucide-react'

type Chapter = {
  id: string
  title: string
  description: string | null
  video_url: string | null
  duration_minutes: number
  free_preview: boolean
  position: number
}

type Props = {
  chapter: Chapter
  index: number
}

export function MasterclassPlayer({ chapter, index }: Props) {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
          <span className="text-violet-400 text-xs font-bold">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{chapter.title}</p>
          <div className="flex items-center gap-2">
            {chapter.duration_minutes > 0 && (
              <span className="text-zinc-500 text-xs">{chapter.duration_minutes} min</span>
            )}
            {chapter.free_preview && (
              <span className="text-green-400 text-xs">Aperçu gratuit</span>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
          {chapter.description && (
            <p className="text-zinc-400 text-sm mb-3">{chapter.description}</p>
          )}
          {chapter.video_url ? (
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                controls
                className="w-full"
                src={chapter.video_url}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              >
                Votre navigateur ne supporte pas la vidéo.
              </video>
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-xl h-32 flex items-center justify-center">
              <p className="text-zinc-500 text-sm">Vidéo pas encore disponible</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}