'use client'
import { useEffect, useRef, useState } from 'react'
import { RefreshCw, ChevronRight, Cpu } from 'lucide-react'
import { parseGeneratedContent } from '@/lib/claude'
import type { ClaudeModel } from '@/lib/claude'
import { countChars } from '@/lib/utils'
import { LINKEDIN_CHAR_MIN, LINKEDIN_CHAR_MAX } from '@/lib/constants'
import type { GeneratePostRequest } from '@/types/post'
import { cn } from '@/lib/utils'

interface Step2PreviewProps {
  input: GeneratePostRequest
  onSave: (content: string, firstComment: string) => Promise<void>
  onBack: () => void
}

const MODEL_LABELS: Record<ClaudeModel, { short: string; badge: string; color: string }> = {
  sonnet: { short: 'Sonnet', badge: '기본', color: 'bg-blue-100 text-blue-700' },
  opus:   { short: 'Opus',   badge: '고품질', color: 'bg-purple-100 text-purple-700' },
  haiku:  { short: 'Haiku',  badge: '빠름', color: 'bg-gray-100 text-gray-600' },
}

export function Step2Preview({ input, onSave, onBack }: Step2PreviewProps) {
  const [streaming, setStreaming] = useState(true)
  const [rawText, setRawText] = useState('')
  const [content, setContent] = useState('')
  const [firstComment, setFirstComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [model, setModel] = useState<ClaudeModel>('sonnet')
  const [styleRefs, setStyleRefs] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // Load preferred model from settings
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.preferredModel) setModel(d.preferredModel) })
      .catch(() => {})
  }, [])

  const generate = async (overrideModel?: ClaudeModel) => {
    const useModel = overrideModel ?? model
    setStreaming(true)
    setRawText('')
    setContent('')
    setFirstComment('')
    setError('')

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, model: useModel }),
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '생성 실패')
      }

      const refs = parseInt(res.headers.get('X-Style-Refs') ?? '0', 10)
      setStyleRefs(refs)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (chunk.includes('[ERROR]')) {
          throw new Error(chunk.replace('[ERROR]', '').trim())
        }
        acc += chunk
        setRawText(acc)
      }

      const parsed = parseGeneratedContent(acc)
      setContent(parsed.content)
      setFirstComment(parsed.firstComment)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message)
      }
    } finally {
      setStreaming(false)
    }
  }

  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const charCount = countChars(content)
  const charOk = charCount >= LINKEDIN_CHAR_MIN && charCount <= LINKEDIN_CHAR_MAX

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(content, firstComment)
    } finally {
      setSaving(false)
    }
  }

  const m = MODEL_LABELS[model]

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Model selector + info bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Cpu className="w-3.5 h-3.5" />
          <span>모델:</span>
        </div>
        {(['sonnet', 'haiku', 'opus'] as ClaudeModel[]).map(m => (
          <button
            key={m}
            onClick={() => setModel(m)}
            disabled={streaming}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50',
              model === m ? MODEL_LABELS[m].color + ' ring-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {MODEL_LABELS[m].short}
            {model === m && <span className="ml-1 opacity-70">({MODEL_LABELS[m].badge})</span>}
          </button>
        ))}
        {styleRefs > 0 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            ⭐ 스타일 참조 {styleRefs}개 적용
          </span>
        )}
      </div>

      {/* Main content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">포스팅 본문</label>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium', charOk ? 'text-green-600' : charCount === 0 ? 'text-gray-400' : 'text-yellow-600')}>
              {charCount}자 ({LINKEDIN_CHAR_MIN}~{LINKEDIN_CHAR_MAX})
            </span>
          </div>
        </div>
        <textarea
          value={streaming ? rawText.split('---COMMENT---')[0] ?? rawText : content}
          onChange={e => !streaming && setContent(e.target.value)}
          rows={14}
          readOnly={streaming}
          className={cn(
            'w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue',
            streaming ? 'border-brand-blue/30 bg-gray-50 streaming-cursor' : 'border-gray-200 bg-white'
          )}
        />
      </div>

      {/* First comment */}
      {!streaming && firstComment && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">첫 댓글</label>
          <textarea
            value={firstComment}
            onChange={e => setFirstComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBack} className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          이전
        </button>
        <button
          onClick={() => generate()}
          disabled={streaming}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', streaming && 'animate-spin')} /> 재생성
          <span className={cn('text-xs px-1.5 py-0.5 rounded-full ml-0.5', m.color)}>{m.short}</span>
        </button>
        <button
          onClick={handleSave}
          disabled={streaming || saving || !content}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 disabled:opacity-50"
        >
          {saving ? '저장 중...' : <><ChevronRight className="w-4 h-4" /> 저장하고 계속</>}
        </button>
      </div>
    </div>
  )
}
