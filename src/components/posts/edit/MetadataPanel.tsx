'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CONTENT_TYPES, CONTENT_TYPE_LABELS, POST_STATUSES, POST_STATUS_LABELS, HASHTAG_PRESETS } from '@/lib/constants'
import type { PostWithTags } from '@/types/post'

interface MetadataPanelProps {
  post: PostWithTags
  onUpdate: (data: Partial<PostWithTags>) => void
}

export function MetadataPanel({ post, onUpdate }: MetadataPanelProps) {
  const [tagInput, setTagInput] = useState('')
  const tags = post.tags.map(t => t.tag.name)
  const presetHashtags = HASHTAG_PRESETS[post.contentType as keyof typeof HASHTAG_PRESETS] ?? []

  const addTag = (name: string) => {
    const trimmed = name.trim().replace(/^#/, '')
    if (!trimmed || tags.includes(trimmed)) return
    onUpdate({
      tags: [...post.tags, { tag: { id: `tmp-${trimmed}`, name: trimmed } }],
    })
    setTagInput('')
  }

  const removeTag = (name: string) => {
    onUpdate({ tags: post.tags.filter(t => t.tag.name !== name) })
  }

  return (
    <div className="space-y-5">
      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">상태</label>
        <select
          value={post.status}
          onChange={e => onUpdate({ status: e.target.value as typeof post.status })}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        >
          {POST_STATUSES.map(s => (
            <option key={s} value={s}>{POST_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Content type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">콘텐츠 유형</label>
        <select
          value={post.contentType}
          onChange={e => onUpdate({ contentType: e.target.value as typeof post.contentType })}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        >
          {CONTENT_TYPES.map(ct => (
            <option key={ct} value={ct}>{CONTENT_TYPE_LABELS[ct]}</option>
          ))}
        </select>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">예약 일시</label>
        <input
          type="datetime-local"
          value={post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : ''}
          onChange={e => onUpdate({ scheduledFor: e.target.value || null })}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">태그</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-blue-light text-brand-navy text-xs rounded">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
            placeholder="태그 입력 후 Enter"
            className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
          <button onClick={() => addTag(tagInput)} className="px-2 py-1.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hashtag presets */}
      {presetHashtags.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">해시태그 추천</label>
          <div className="flex flex-wrap gap-1.5">
            {presetHashtags.map(ht => {
              const name = ht.replace(/^#/, '')
              const active = tags.includes(name)
              return (
                <button
                  key={ht}
                  onClick={() => active ? removeTag(name) : addTag(name)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${active ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'}`}
                >
                  {ht}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
