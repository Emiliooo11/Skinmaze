'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice } from '@/lib/utils'

export function Header() {
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-gradient">Skinmaze</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/cases">Cases</NavLink>
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/provably-fair">Provably Fair</NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoading ? (
            <div className="h-8 w-32 bg-surface-2 rounded-lg animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted">Balance</span>
                <span className="text-sm font-bold text-primary">
                  {formatPrice(user.balance)}
                </span>
              </div>
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border group-hover:border-primary/60 transition-colors">
                  <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                </div>
                <span className="text-sm text-white/80 hidden md:block">{user.username}</span>
              </Link>
            </>
          ) : (
            <a
              href="/api/auth/steam"
              className="flex items-center gap-2 btn-primary text-sm"
            >
              <SteamIcon />
              Sign in with Steam
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-muted hover:text-white rounded-lg hover:bg-surface-2 transition-colors"
    >
      {children}
    </Link>
  )
}

function SteamIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  )
}
