'use client'
import Link from 'next/link'
import { Edit, Layers, Trash2, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { CONTENT_TYPE_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { PostWithTags } from '@/types/post'

interface PostCardProps {
  post: PostWithTags
  onDelete: (id: string) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{post.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{CONTENT_TYPE_LABELS[post.contentType as keyof typeof CONTENT_TYPE_LABELS] ?? post.contentType}</p>
        </div>
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-32" onMouseLeave={() => setMenuOpen(false)}>
              <Link href={`/posts/${post.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Edit className="w-3.5 h-3.5" /> 편집
              </Link>
              <Link href={`/posts/${post.id}/cardnews`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Layers className="w-3.5 h-3.5" /> 카드뉴스
              </Link>
              <button
                onClick={() => { setMenuOpen(false); onDelete(post.id) }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <Trash2 className="w-3.5 h-3.5" /> 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic */}
      {post.topic && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.topic}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <StatusBadge status={post.status as Parameters<typeof StatusBadge>[0]['status']} />
        <span className="text-xs text-gray-400">{formatDate(post.updatedAt)}</span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.slice(0, 3).map(({ tag }) => (
            <span key={tag.id} className="text-xs bg-brand-blue-light text-brand-navy px-1.5 py-0.5 rounded">
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
