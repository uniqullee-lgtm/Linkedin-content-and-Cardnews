'use client'
import { Plus, Minus } from 'lucide-react'
import type { SlideContent } from '@/types/cardnews'

interface SlideEditPanelProps {
  slide: SlideContent
  onChange: (slide: SlideContent) => void
}

export function SlideEditPanel({ slide, onChange }: SlideEditPanelProps) {
  const update = (updates: Partial<SlideContent>) => onChange({ ...slide, ...updates })

  const inputCls = 'w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

  const addBullet = () => update({ bulletPoints: [...(slide.bulletPoints ?? []), ''] })
  const updateBullet = (i: number, val: string) => {
    const bp = [...(slide.bulletPoints ?? [])]
    bp[i] = val
    update({ bulletPoints: bp })
  }
  const removeBullet = (i: number) => update({ bulletPoints: (slide.bulletPoints ?? []).filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      {/* Slide type badge */}
      <div>
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          slide.type === 'cover' ? 'bg-brand-navy text-white' :
          slide.type === 'closing' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {slide.type === 'cover' ? '커버' : slide.type === 'closing' ? '클로징' : `내용 ${slide.slideNumber}`}
        </span>
      </div>

      {/* Title */}
      <div>
        <label className={labelCls}>제목</label>
        <input
          type="text"
          value={slide.title}
          onChange={e => update({ title: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Body (for cover/closing) */}
      {(slide.type === 'cover' || slide.type === 'closing') && (
        <div>
          <label className={labelCls}>부제목 / 내용</label>
          <textarea
            value={slide.body ?? ''}
            onChange={e => update({ body: e.target.value })}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
      )}

      {/* Bullet points (for content slides) */}
      {slide.type === 'content' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls}>불릿포인트</label>
            <button
              onClick={addBullet}
              className="flex items-center gap-1 text-xs text-brand-navy hover:text-brand-blue"
            >
              <Plus className="w-3.5 h-3.5" /> 추가
            </button>
          </div>
          <div className="space-y-2">
            {(slide.bulletPoints ?? []).map((bp, i) => (
              <div key={i} className="flex gap-2 items-start">
                <textarea
                  value={bp}
                  onChange={e => updateBullet(i, e.target.value)}
                  rows={2}
                  className={`flex-1 ${inputCls} resize-none`}
                />
                <button
                  onClick={() => removeBullet(i)}
                  className="mt-1 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(!slide.bulletPoints || slide.bulletPoints.length === 0) && (
              <button onClick={addBullet} className="w-full py-3 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-brand-blue hover:text-brand-navy">
                + 불릿포인트 추가
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
