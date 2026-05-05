'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Loader2 } from 'lucide-react'

type Props = {
  url: string
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function AudioPlayer({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    let isActive = true

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#52525b',
      progressColor: '#7c3aed',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 2,
      barRadius: 99,
      height: 48,
      normalize: true,
    })

    const unsubscribeReady = ws.on('ready', () => {
      if (!isActive) return
      setLoading(false)
      setDuration(ws.getDuration())
    })

    const unsubscribeAudioProcess = ws.on('audioprocess', () => {
      if (!isActive) return
      setCurrentTime(ws.getCurrentTime())
    })

    const unsubscribeFinish = ws.on('finish', () => {
      if (!isActive) return
      setPlaying(false)
      setCurrentTime(0)
    })

    ws.load(url).catch(error => {
      if (!isAbortError(error)) {
        console.error('Failed to load audio:', error)
      }
    })

    wavesurferRef.current = ws

    return () => {
      isActive = false
      wavesurferRef.current = null
      unsubscribeReady()
      unsubscribeAudioProcess()
      unsubscribeFinish()
      ws.destroy()
    }
  }, [url])

  function togglePlay() {
    if (!wavesurferRef.current) return
    wavesurferRef.current.playPause().catch(error => {
      if (!isAbortError(error)) {
        console.error('Failed to toggle audio playback:', error)
      }
    })
    setPlaying(current => !current)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 flex items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={loading}
        className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {loading ? (
          <Loader2 size={18} className="text-white animate-spin" />
        ) : playing ? (
          <Pause size={18} className="text-white" />
        ) : (
          <Play size={18} className="text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="w-full" />
        <div className="flex justify-between mt-1">
          <span className="text-zinc-500 text-xs">{formatTime(currentTime)}</span>
          <span className="text-zinc-500 text-xs">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
