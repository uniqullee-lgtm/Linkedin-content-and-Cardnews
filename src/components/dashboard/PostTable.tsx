'use client'
import Link from 'next/link'
import { Edit, Layers, Trash2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { CONTENT_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { PostWithTags } from '@/types/post'

interface PostTableProps {
  posts: PostWithTags[]
  onDelete: (id: string) => void
}

export function PostTable({ posts, onDelete }: PostTableProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <div className="text-4xl mb-3">✍️</div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">아직 포스팅이 없어요</h3>
        <p className="text-sm text-gray-400 mb-4">첫 번째 LinkedIn 포스팅을 작성해보세요.</p>
        <Link href="/posts/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy/90">
          첫 포스팅 작성하기
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">제목 / 주제</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">유형</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">상태</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">수정일</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">글자수</th>
            <th className="px-4 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {posts.map(post => (
            <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/posts/${post.id}/edit`} className="font-medium text-gray-900 hover:text-brand-navy line-clamp-1">
                  {post.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.topic}</p>
              </td>
              <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                {CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS] ?? post.contentType}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                {formatDate(post.updatedAt)}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 hidden xl:table-cell">
                {post.characterCount ? `${post.characterCount.toLocaleString()}자` : '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link href={`/posts/${post.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="편집">
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <Link href={`/posts/${post.id}/cardnews`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="카드뉴스">
                    <Layers className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
