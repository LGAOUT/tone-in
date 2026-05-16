'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronDown, Check, Star } from 'lucide-react'

type Service = {
  id: string
  title: string
  description: string | null
  price: number
  delivery_days: number
  category: string
  rating?: number | null
  orders_count?: number | null
  profiles: {
    avatar_url: string | null
    username: string
  } | null
}

type Props = {
  services: Service[]
}

const CATEGORY_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  mixing:      { label: 'Mixage',      bg: '#1d9e7514', text: '#3dcca0', border: '#1d9e7528' },
  mastering:   { label: 'Mastering',  bg: '#378add14', text: '#7ab8ed', border: '#378add28' },
  production:  { label: 'Production', bg: '#7c6dfa14', text: '#9d91fb', border: '#7c6dfa28' },
  beatmaking:  { label: 'Beatmaking', bg: '#d4537e14', text: '#e87aaa', border: '#d4537e28' },
  songwriting: { label: 'Songwriting',bg: '#ef9f2714', text: '#f5c06a', border: '#ef9f2728' },
}
const FALLBACK_BADGE = { label: '', bg: '#1e1e1e', text: '#888', border: '#ffffff10' }

const SORT_OPTIONS = [
  { value: 'recent',    label: 'Récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc',label: 'Prix décroissant' },
  { value: 'top_rated', label: 'Mieux notés' },
]

function sortServices(services: Service[], sort: string): Service[] {
  const arr = [...services]
  if (sort === 'price_asc')  return arr.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return arr.sort((a, b) => b.price - a.price)
  if (sort === 'top_rated')  return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  return arr // 'recent' — server order
}

export function MarketplaceClient({ services }: Props) {
  const [sort, setSort] = useState('recent')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const sorted = sortServices(services, sort)
  const selectedLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Récents'

  function toggleBookmark(id: string) {
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <>
      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-medium" style={{ color: '#e8e4dc' }}>Marketplace</h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-sm px-3 h-[34px] rounded-[9px] transition-all"
            style={{ color: '#888', border: '0.5px solid #ffffff10' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#ffffff1e')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#ffffff10')}
          >
            Filtres
          </button>
          <Link
            href="/services/manage"
            className="flex items-center gap-1.5 text-sm font-medium px-3 h-[34px] rounded-[9px] text-white transition-opacity hover:opacity-85"
            style={{ background: '#7c6dfa' }}
          >
            + Mes services
          </Link>
        </div>
      </div>

      {/* ── Toolbar row ── */}
      <div className="flex items-center justify-between mb-5">
        {/* Service count */}
        <span
          className="text-[11px]"
          style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
        >
          {sorted.length} service{sorted.length !== 1 ? 's' : ''}
        </span>

        {/* Custom sort dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-3 text-[11px] rounded-[7px] transition-all"
            style={{
              height: 28,
              background: '#141414',
              border: `0.5px solid ${dropdownOpen ? '#7c6dfa40' : '#ffffff10'}`,
              color: dropdownOpen ? '#9d91fb' : '#666',
              fontFamily: 'var(--font-dm-mono)',
            }}
          >
            {selectedLabel}
            <ChevronDown
              size={11}
              style={{
                transition: 'transform 0.15s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                color: dropdownOpen ? '#9d91fb' : '#555',
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 py-1 rounded-[9px] z-20 shadow-xl"
              style={{
                background: '#1a1a1a',
                border: '0.5px solid #ffffff10',
                animation: 'dropIn 0.15s ease',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setDropdownOpen(false) }}
                  className="flex items-center justify-between w-full px-3 py-2 text-[12px] transition-colors text-left"
                  style={{
                    color: sort === opt.value ? '#9d91fb' : '#888',
                    fontFamily: 'var(--font-dm-mono)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#ffffff08')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {opt.label}
                  {sort === opt.value && <Check size={11} style={{ color: '#9d91fb' }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎵</p>
          <p className="text-sm mb-2" style={{ color: '#888' }}>Aucun service disponible.</p>
          <Link href="/services/manage" className="text-sm transition-colors" style={{ color: '#9d91fb' }}>
            Propose le tien →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
          {sorted.map(service => {
            const badge = CATEGORY_BADGE[service.category] ?? FALLBACK_BADGE
            const bkmk = bookmarked.has(service.id)

            return (
              <div
                key={service.id}
                className="flex flex-col rounded-[14px] transition-all"
                style={{
                  background: '#141414',
                  border: '0.5px solid #ffffff0e',
                  padding: 15,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ffffff1e'
                  e.currentTarget.style.background = '#181818'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#ffffff0e'
                  e.currentTarget.style.background = '#141414'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Top row: avatar + handle | category badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: '#2a1f5a', border: '0.5px solid #7c6dfa40', color: '#9d91fb' }}
                    >
                      {service.profiles?.avatar_url ? (
                        <img src={service.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (service.profiles?.username ?? '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span
                      className="text-[11px] truncate"
                      style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}
                    >
                      @{service.profiles?.username}
                    </span>
                  </div>

                  {badge.label && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: badge.bg, color: badge.text, border: `0.5px solid ${badge.border}` }}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p
                  className="text-[14px] font-medium leading-snug mb-2 line-clamp-2"
                  style={{ color: '#ddd' }}
                >
                  {service.title}
                </p>

                {/* Description */}
                <p
                  className="text-[11px] leading-[1.55] line-clamp-2 mb-3"
                  style={{ color: '#444' }}
                >
                  {service.description}
                </p>

                {/* Separator */}
                <div className="mb-3" style={{ height: '0.5px', background: '#ffffff08' }} />

                {/* Price row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[17px] font-medium" style={{ color: '#e8e4dc' }}>
                      {service.price} €
                    </span>
                    <div
                      className="text-[10px] mt-0.5"
                      style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
                    >
                      prix fixe
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(service.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-[7px] transition-all"
                      style={{
                        color: bkmk ? '#9d91fb' : '#555',
                        border: '0.5px solid #ffffff10',
                        background: bkmk ? '#7c6dfa14' : 'transparent',
                      }}
                    >
                      <Bookmark size={13} fill={bkmk ? 'currentColor' : 'none'} />
                    </button>

                    <Link
                      href={`/marketplace/${service.id}`}
                      className="flex items-center text-[12px] font-medium px-3 rounded-[7px] text-white transition-opacity hover:opacity-85"
                      style={{ background: '#7c6dfa', height: 28 }}
                    >
                      Contacter
                    </Link>
                  </div>
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center gap-3 pt-2.5"
                  style={{ borderTop: '0.5px solid #ffffff06' }}
                >
                  <span
                    className="text-[10px]"
                    style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {service.delivery_days}j livraison
                  </span>

                  {service.rating != null && (
                    <>
                      <span style={{ color: '#2e2e2e', fontSize: 10 }}>·</span>
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: '#3dcca060', fontFamily: 'var(--font-dm-mono)' }}
                      >
                        <Star size={9} fill="currentColor" />
                        {service.rating.toFixed(1)}
                      </span>
                    </>
                  )}

                  {service.orders_count != null && (
                    <>
                      <span style={{ color: '#2e2e2e', fontSize: 10 }}>·</span>
                      <span
                        className="text-[10px]"
                        style={{ color: '#2e2e2e', fontFamily: 'var(--font-dm-mono)' }}
                      >
                        {service.orders_count} cmd
                      </span>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── Last slot: Proposer un service ── */}
          <Link
            href="/services/manage"
            className="flex flex-col items-center justify-center gap-2 rounded-[14px] transition-all group"
            style={{
              minHeight: 180,
              border: '0.5px dashed #ffffff0a',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#7c6dfa30'
              e.currentTarget.style.background = '#7c6dfa06'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#ffffff0a'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span
              className="text-2xl transition-opacity group-hover:opacity-80"
              style={{ color: '#2e2e2e' }}
            >
              +
            </span>
            <span
              className="text-[12px] transition-colors"
              style={{ color: '#2e2e2e' }}
            >
              Proposer un service
            </span>
          </Link>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
