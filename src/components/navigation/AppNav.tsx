'use client'

import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Home, Users, ShoppingBag, GraduationCap, Search, Plus, MessageCircle, User, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  currentUserId: string
  username?: string | null
  avatarUrl?: string | null
  maxWidth?: '2xl' | '3xl'
}

const desktopNavItems = [
  { href: '/feed',          label: 'Feed',        icon: Home },
  { href: '/explore',       label: 'Artistes',    icon: Users },
  { href: '/marketplace',   label: 'Marketplace', icon: ShoppingBag },
  { href: '/masterclasses', label: 'Learn',       icon: GraduationCap },
]

export function AppNav({ currentUserId, username, avatarUrl, maxWidth = '3xl' }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerClass = maxWidth === '2xl' ? 'max-w-2xl' : 'max-w-3xl'

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery('')
    }
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchOpen(false)
    router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  function active(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* ── Desktop navbar ── */}
      <nav
        className="hidden md:block sticky top-0 z-20"
        style={{ height: 52, background: '#0d0d0d', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
      >
        <div className={`${containerClass} mx-auto px-4 h-full flex items-center justify-between gap-6`}>

          {/* Zone 1 — Logo */}
          <Link href="/feed" className="text-sm font-bold shrink-0 tracking-tight" style={{ color: '#e8e4dc' }}>
            Tone <span style={{ color: '#7c6dfa' }}>In</span>
          </Link>

          {/* Zone 2 — Nav */}
          <div className="flex items-center gap-0.5">
            {desktopNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors',
                  active(href)
                    ? 'text-[#9d91fb]'
                    : 'text-[#888] hover:text-[#e8e4dc] hover:bg-white/[0.04]'
                )}
                style={active(href) ? { background: 'rgba(124,109,250,0.094)' } : undefined}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* Zone 3 — Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                color: '#888',
              }}
            >
              <Search size={13} />
              <span className="hidden lg:inline text-[13px]">Rechercher...</span>
              <kbd className="hidden lg:inline ml-1 text-[11px]" style={{ color: '#444', fontFamily: 'var(--font-dm-mono)' }}>⌘K</kbd>
            </button>

            {/* Notification bell */}
            <div className="w-8 h-8 flex items-center justify-center">
              <NotificationBell currentUserId={currentUserId} />
            </div>

            {/* Avatar + handle dropdown */}
            {username && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[10px] transition-colors hover:bg-white/[0.04]"
                >
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: 'rgba(124,109,250,0.15)',
                      border: '0.5px solid rgba(124,109,250,0.3)',
                      color: '#9d91fb',
                    }}
                  >
                    {avatarUrl
                      ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                      : username.charAt(0).toUpperCase()
                    }
                  </div>
                  <span className="hidden lg:inline text-[13px]" style={{ color: '#888' }}>@{username}</span>
                  <ChevronDown size={11} className="hidden lg:block" style={{ color: '#444' }} />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 py-1 rounded-2xl shadow-2xl z-30"
                    style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)' }}
                  >
                    <Link
                      href={`/profile/${username}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04]"
                      style={{ color: '#e8e4dc' }}
                    >
                      <User size={13} style={{ color: '#888' }} />
                      Mon profil
                    </Link>
                    <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <form action={logout}>
                      <button
                        type="submit"
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] text-red-400"
                      >
                        Déconnexion
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-2"
        style={{ height: 60, background: '#0d0d0d', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}
      >
        <Link
          href="/feed"
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
          style={{ color: active('/feed') ? '#9d91fb' : '#888' }}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Feed</span>
        </Link>

        <Link
          href="/explore"
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
          style={{ color: active('/explore') ? '#9d91fb' : '#888' }}
        >
          <Users size={20} />
          <span className="text-[10px] font-medium">Artistes</span>
        </Link>

        {/* Create button — center */}
        <button
          className="flex items-center justify-center flex-shrink-0 rounded-[12px] transition-colors"
          style={{ width: 44, height: 44, background: '#7c6dfa', color: 'white' }}
        >
          <Plus size={22} />
        </button>

        <Link
          href="/messages"
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
          style={{ color: active('/messages') ? '#9d91fb' : '#888' }}
        >
          <MessageCircle size={20} />
          <span className="text-[10px] font-medium">Chat</span>
        </Link>

        <Link
          href={username ? `/profile/${username}` : '/feed'}
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
          style={{ color: username && active(`/profile/${username}`) ? '#9d91fb' : '#888' }}
        >
          <User size={20} />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <Search size={16} style={{ color: '#666', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un artiste, producteur..."
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-zinc-600"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X size={14} style={{ color: '#555' }} />
                </button>
              )}
              <kbd className="text-[11px] px-1.5 py-0.5 rounded" style={{ color: '#444', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>Esc</kbd>
            </form>
            <div className="px-4 py-3">
              <p className="text-[11px]" style={{ color: '#444' }}>Appuie sur Entrée pour rechercher dans Artistes</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
