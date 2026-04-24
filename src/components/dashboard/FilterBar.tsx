'use client'
import { Search, X } from 'lucide-react'
import { CONTENT_TYPES, CONTENT_TYPE_LABELS, POST_STATUSES, POST_STATUS_LABELS } from '@/lib/constants'
import type { ContentType, PostStatus } from '@/lib/constants'

interface FilterState {
  search: string
  contentType: ContentType | ''
  status: PostStatus | ''
}

interface FilterBarProps {
  value: FilterState
  onChange: (v: FilterState) => void
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  const hasFilters = value.search || value.contentType || value.status

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="제목, 주제 검색..."
          value={value.search}
          onChange={e => onChange({ ...value, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        />
      </div>

      {/* Content type */}
      <select
        value={value.contentType}
        onChange={e => onChange({ ...value, contentType: e.target.value as ContentType | '' })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
      >
        <option value="">전체 유형</option>
        {CONTENT_TYPES.map(ct => (
          <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={value.status}
        onChange={e => onChange({ ...value, status: e.target.value as PostStatus | '' })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
      >
        <option value="">전체 상태</option>
        {POST_STATUSES.map(s => (
          <option key={s} value={s}>{POST_STATUS_LABELS[s]}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => onChange({ search: '', contentType: '', status: '' })}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-2"
        >
          <X className="w-3.5 h-3.5" /> 초기화
        </button>
      )}
    </div>
  )
}

export type { FilterState }
