'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, PlusCircle, Settings } from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: '대시보드' },
  { href: '/posts/new', icon: PlusCircle, label: '새 포스팅' },
  { href: '/settings', icon: Settings, label: '설정' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors',
                active ? 'text-brand-navy font-semibold' : 'text-gray-500'
              )}
            >
              <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
