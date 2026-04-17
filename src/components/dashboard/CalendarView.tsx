'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PostWithTags } from '@/types/post'

interface CalendarViewProps {
  posts: PostWithTags[]
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { firstDay, daysInMonth }
}

export function CalendarView({ posts }: CalendarViewProps) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const { firstDay, daysInMonth } = getCalendarDays(current.year, current.month)

  // Build date → posts map
  const postsByDate: Record<string, PostWithTags[]> = {}
  posts.forEach(post => {
    const dateStr = post.scheduledFor
      ? new Date(post.scheduledFor).toISOString().split('T')[0]
      : null
    if (dateStr) {
      postsByDate[dateStr] = [...(postsByDate[dateStr] ?? []), post]
    }
  })

  const prev = () => {
    setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 })
  }
  const next = () => {
    setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 })
  }

  const monthLabel = new Date(current.year, current.month).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className={cn('text-center text-xs font-medium py-2', d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : 'text-gray-500')}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayPosts = postsByDate[dateStr] ?? []
          const isToday = today.getFullYear() === current.year && today.getMonth() === current.month && today.getDate() === day
          const dayOfWeek = (firstDay + day - 1) % 7

          return (
            <div
              key={day}
              className={cn(
                'h-20 border-b border-r border-gray-50 p-1 text-xs overflow-hidden',
                isToday && 'bg-brand-blue-light',
                dayOfWeek === 2 || dayOfWeek === 4 ? 'bg-gray-50/50' : ''
              )}
            >
              <span className={cn(
                'text-xs font-medium',
                isToday && 'bg-brand-navy text-white rounded-full w-5 h-5 flex items-center justify-center',
                dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-600'
              )}>
                {day}
              </span>
              {dayPosts.slice(0, 2).map(post => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}/edit`}
                  className="block mt-0.5 px-1 py-0.5 bg-brand-navy text-white rounded truncate hover:bg-brand-blue transition-colors"
                  title={post.title}
                >
                  {post.title}
                </Link>
              ))}
              {dayPosts.length > 2 && (
                <span className="text-gray-400">+{dayPosts.length - 2}개</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
        화/목 컬럼은 LinkedIn 권장 게시 요일
      </div>
    </div>
  )
}
