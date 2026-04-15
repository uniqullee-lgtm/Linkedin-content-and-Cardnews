'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  FileText,
} from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '대시보드' },
  { href: '/posts/new', icon: PlusCircle, label: '새 포스팅' },
  { href: '/settings', icon: Settings, label: '설정' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-brand-navy text-white min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-blue" />
          <div>
            <p className="text-xs text-white/60 leading-none">타피루즈그룹</p>
            <p className="text-sm font-bold leading-snug">LinkedIn 메이커</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/40">v1.0.0</p>
      </div>
    </aside>
  )
}
