'use client'
import { useState } from 'react'
import { LINKEDIN_PREVIEW_CUTOFF } from '@/lib/constants'
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react'

interface LinkedInPreviewProps {
  content: string
  companyName?: string
}

export function LinkedInPreview({ content, companyName = '타피루즈그룹' }: LinkedInPreviewProps) {
  const [expanded, setExpanded] = useState(false)

  const isTruncatable = content.length > LINKEDIN_PREVIEW_CUTOFF
  const displayText = (!isTruncatable || expanded) ? content : content.slice(0, LINKEDIN_PREVIEW_CUTOFF) + '...'

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Profile header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
          {companyName.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{companyName}</p>
          <p className="text-xs text-gray-500">HRD 컨설팅 · 방금</p>
          <p className="text-xs text-gray-400 mt-0.5">🌐</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {content ? (
          <>
            <div
              className="text-sm text-gray-900 whitespace-pre-line leading-relaxed"
              style={{ fontSize: '14px', lineHeight: '1.6' }}
            >
              {displayText}
            </div>
            {isTruncatable && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1 font-medium"
              >
                {expanded ? '접기' : '더 보기'}
              </button>
            )}
            {!expanded && isTruncatable && (
              <div className="mt-2 py-1 border-t border-dashed border-gray-200">
                <p className="text-xs text-gray-400 italic">&ldquo;더 보기&rdquo; 기준선 (~{LINKEDIN_PREVIEW_CUTOFF}자)</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 italic">포스팅 내용을 입력하면 미리보기가 나타납니다.</p>
        )}
      </div>

      {/* Reactions bar */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy py-1 px-2 rounded hover:bg-gray-50">
          <ThumbsUp className="w-4 h-4" /> 좋아요
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy py-1 px-2 rounded hover:bg-gray-50">
          <MessageCircle className="w-4 h-4" /> 댓글
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy py-1 px-2 rounded hover:bg-gray-50">
          <Share2 className="w-4 h-4" /> 공유
        </button>
      </div>
    </div>
  )
}
