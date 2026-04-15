'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { PlusCircle, LayoutList, Calendar } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'
import { FilterBar, type FilterState } from '@/components/dashboard/FilterBar'
import { PostTable } from '@/components/dashboard/PostTable'
import { PostCard } from '@/components/dashboard/PostCard'
import { CalendarView } from '@/components/dashboard/CalendarView'
import { ToastContainer, showToast } from '@/components/shared/Toast'
import { cn } from '@/lib/utils'
import type { PostWithTags } from '@/types/post'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({ search: '', contentType: '', status: '' })
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.contentType) params.set('contentType', filters.contentType)
  if (filters.status) params.set('status', filters.status)

  const { data: posts = [], mutate } = useSWR<PostWithTags[]>(
    `/api/posts?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    showToast('삭제되었습니다.', 'success')
    mutate()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl">
        <Header
          title="대시보드"
          description={`총 ${posts.length}개의 포스팅`}
          actions={
            <Link
              href="/posts/new"
              className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> 새 포스팅
            </Link>
          }
        />

        {/* View toggle + filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('list')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors', view === 'list' ? 'bg-brand-navy text-white' : 'text-gray-500 hover:text-gray-700')}
            >
              <LayoutList className="w-3.5 h-3.5" /> 목록
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors', view === 'calendar' ? 'bg-brand-navy text-white' : 'text-gray-500 hover:text-gray-700')}
            >
              <Calendar className="w-3.5 h-3.5" /> 캘린더
            </button>
          </div>
        </div>

        {view === 'list' && (
          <>
            <FilterBar value={filters} onChange={setFilters} />
            {/* Desktop table / Mobile cards */}
            <div className="hidden md:block">
              <PostTable posts={posts} onDelete={handleDelete} />
            </div>
            <div className="md:hidden grid grid-cols-1 gap-3">
              {posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">포스팅이 없어요</h3>
                  <p className="text-sm text-gray-400 mb-4">첫 번째 LinkedIn 포스팅을 작성해보세요.</p>
                  <Link href="/posts/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg">
                    시작하기
                  </Link>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} onDelete={handleDelete} />
                ))
              )}
            </div>
          </>
        )}

        {view === 'calendar' && <CalendarView posts={posts} />}
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  )
}
