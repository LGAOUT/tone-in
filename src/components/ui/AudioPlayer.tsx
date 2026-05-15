'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Loader2 } from 'lucide-react'

type Props = {
  url: string
  trackName?: string
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function AudioPlayer({ url, trackName }: Props) {
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
      waveColor: '#2a2a2a',
      progressColor: 'rgba(124,109,250,0.5)',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 2,
      barRadius: 99,
      height: 36,
      normalize: true,
    })

    const unsubReady = ws.on('ready', () => {
      if (!isActive) return
      setLoading(false)
      setDuration(ws.getDuration())
    })

    const unsubProcess = ws.on('audioprocess', () => {
      if (!isActive) return
      setCurrentTime(ws.getCurrentTime())
    })

    const unsubSeek = ws.on('seeking', () => {
      if (!isActive) return
      setCurrentTime(ws.getCurrentTime())
    })

    const unsubFinish = ws.on('finish', () => {
      if (!isActive) return
      setPlaying(false)
      setCurrentTime(0)
    })

    ws.load(url).catch(error => {
      if (!isAbortError(error)) console.error('Failed to load audio:', error)
    })

    wavesurferRef.current = ws

    return () => {
      isActive = false
      wavesurferRef.current = null
      unsubReady()
      unsubProcess()
      unsubSeek()
      unsubFinish()
      ws.destroy()
    }
  }, [url])

  function togglePlay() {
    if (!wavesurferRef.current) return
    wavesurferRef.current.playPause().catch(error => {
      if (!isAbortError(error)) console.error('Failed to toggle audio:', error)
    })
    setPlaying(c => !c)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="rounded-[12px] p-3 flex items-center gap-3"
      style={{ background: '#0f0f0f', border: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      {/* Play / Pause button — 36px purple circle */}
      <button
        onClick={togglePlay}
        disabled={loading}
        className="flex-shrink-0 flex items-center justify-center transition-colors disabled:opacity-50"
        style={{ width: 36, height: 36, borderRadius: '50%', background: '#7c6dfa' }}
      >
        {loading
          ? <Loader2 size={15} className="text-white animate-spin" />
          : playing
            ? <Pause size={15} className="text-white" />
            : <Play size={15} className="text-white ml-0.5" />
        }
      </button>

      {/* Right side: track name + waveform + times */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] truncate font-medium" style={{ color: '#e8e4dc' }}>
            {trackName ?? 'Audio Track'}
          </span>
          <span
            className="text-[11px] flex-shrink-0 ml-2"
            style={{ color: '#888', fontFamily: 'var(--font-dm-mono)' }}
          >
            {loading ? '--:--' : formatTime(duration)}
          </span>
        </div>

        {/* Waveform — WaveSurfer renders here; click-to-seek is built-in */}
        <div ref={containerRef} className="w-full" />

        <div className="mt-1">
          <span
            className="text-[10px]"
            style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}
          >
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  )
}
