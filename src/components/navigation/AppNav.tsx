
'use client'

import { usePathname } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GraduationCap, Home, LogOut, MessageCircle, Search, ShoppingBag, User, Users } from 'lucide-react'
import Link from 'next/link'

type Props = {
  currentUserId: string
  username?: string | null
  maxWidth?: '2xl' | '3xl'
}

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/groups', label: 'Groupes', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/masterclasses', label: 'Masterclasses', icon: GraduationCap },
  { href: '/explore', label: 'Explorer', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
]

export function AppNav({ currentUserId, username, maxWidth = '3xl' }: Props) {
  const pathname = usePathname()
  const containerWidth = maxWidth === '2xl' ? 'max-w-2xl' : 'max-w-3xl'

  return (
    <nav className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
      <div className={`${containerWidth} mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3`}>
        <Link href="/feed" className="hidden shrink-0 text-lg font-bold sm:block">
          Tone <span className="text-violet-500">In</span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:flex-none sm:gap-2">
          <div className="flex min-w-0 items-center gap-0.5 sm:gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  title={label}
                  className={`grid h-9 w-8 shrink-0 place-items-center rounded-lg transition-colors sm:w-9 ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-400'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                </Link>
              )
            })}
          </div>

          <div className="h-6 w-px shrink-0 bg-zinc-800" />
          <div className="grid h-9 w-8 shrink-0 place-items-center sm:w-9">
            <NotificationBell currentUserId={currentUserId} />
          </div>

          {username && (
            <>
              <Link
                href={`/profile/${username}`}
                className="hidden shrink-0 text-sm text-zinc-300 transition-colors hover:text-white md:block"
              >
                @{username}
              </Link>
              <Link
                href={`/profile/${username}`}
                aria-label="Mon profil"
                title="Mon profil"
                className="grid h-9 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white md:hidden"
              >
                <User size={18} />
              </Link>
            </>
          )}

          <form action={logout} className="shrink-0">
            <button
              type="submit"
              aria-label="Deconnexion"
              title="Deconnexion"
              className="grid h-9 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white sm:w-9"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
