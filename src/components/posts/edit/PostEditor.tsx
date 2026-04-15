'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff, Layers, Star } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { CharCounter } from './CharCounter'
import { LinkedInPreview } from './LinkedInPreview'
import { MetadataPanel } from './MetadataPanel'
import { showToast } from '@/components/shared/Toast'
import { cn, countChars } from '@/lib/utils'
import type { PostWithTags } from '@/types/post'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PostEditorProps {
  postId: string
}

export function PostEditor({ postId }: PostEditorProps) {
  const { data: initial, isLoading } = useSWR<PostWithTags>(`/api/posts/${postId}`, fetcher)
  const [post, setPost] = useState<PostWithTags | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [previewVisible, setPreviewVisible] = useState(true)
  const [metaVisible, setMetaVisible] = useState(true)
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedComment, setCopiedComment] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regenInstructions, setRegenInstructions] = useState('')
  const [togglingStyle, setTogglingStyle] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (initial && !post) setPost(initial)
  }, [initial]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(async (data: PostWithTags) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: data.tags.map(t => t.tag.name),
          characterCount: countChars(data.finalContent ?? data.draft ?? ''),
        }),
      })
      if (!res.ok) throw new Error('저장 실패')
      setSavedAt(new Date())
    } catch {
      showToast('저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }, [postId])

  const handleChange = (updates: Partial<PostWithTags>) => {
    setPost(prev => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      // Debounced auto-save
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(next), 2000)
      return next
    })
  }

  const copy = async (text: string, which: 'body' | 'comment') => {
    await navigator.clipboard.writeText(text)
    if (which === 'body') { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000) }
    else { setCopiedComment(true); setTimeout(() => setCopiedComment(false), 2000) }
    showToast('클립보드에 복사되었습니다.', 'success')
  }

  const toggleStyleRef = async () => {
    if (!post) return
    setTogglingStyle(true)
    const newVal = !post.isStyleReference
    try {
      await fetch(`/api/posts/${postId}/style-reference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStyleReference: newVal }),
      })
      setPost(p => p ? { ...p, isStyleReference: newVal } : p)
      showToast(newVal ? '스타일 참조 포스팅으로 설정했습니다. AI가 이 스타일을 학습합니다.' : '스타일 참조를 해제했습니다.', newVal ? 'success' : 'info')
    } catch {
      showToast('설정 변경에 실패했습니다.', 'error')
    } finally {
      setTogglingStyle(false)
    }
  }

  const regenerate = async () => {
    if (!post) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          topic: post.topic,
          context: post.context,
          contentType: post.contentType,
          additionalInstructions: regenInstructions,
        }),
      })
      if (!res.ok) throw new Error('재생성 실패')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
      }

      const [body, comment] = acc.split('---COMMENT---')
      handleChange({ finalContent: (body ?? '').trim(), firstComment: (comment ?? '').trim() })
      showToast('포스팅이 재생성되었습니다.', 'success')
    } catch {
      showToast('재생성에 실패했습니다.', 'error')
    } finally {
      setRegenerating(false)
    }
  }

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">불러오는 중...</div>
      </div>
    )
  }

  const bodyContent = post.finalContent ?? post.draft ?? ''
  const charCount = countChars(bodyContent)

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] overflow-hidden">
      {/* Left: LinkedIn Preview */}
      <div className={cn('hidden lg:flex flex-col w-80 xl:w-96 shrink-0 overflow-y-auto', !previewVisible && 'lg:hidden')}>
        <div className="sticky top-0 bg-gray-50 pb-2 z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LinkedIn 미리보기</p>
            <button onClick={() => setPreviewVisible(false)} className="text-gray-400 hover:text-gray-600">
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>
        <LinkedInPreview content={bodyContent} />
      </div>

      {/* Center: Editor */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {!previewVisible && (
            <button onClick={() => setPreviewVisible(true)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy border border-gray-200 rounded-lg px-3 py-1.5">
              <Eye className="w-3.5 h-3.5" /> 미리보기
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {saving ? '저장 중...' : savedAt ? `${savedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 저장됨` : ''}
            </span>
            <button
              onClick={toggleStyleRef}
              disabled={togglingStyle}
              title={post.isStyleReference ? 'AI 스타일 참조 해제' : 'AI 스타일 참조로 설정'}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
                post.isStyleReference
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                  : 'border-gray-200 text-gray-500 hover:text-yellow-600 hover:border-yellow-200'
              )}
            >
              <Star className={cn('w-3.5 h-3.5', post.isStyleReference && 'fill-yellow-500')} />
              {post.isStyleReference ? '스타일 참조 중' : '스타일 참조'}
            </button>
            <Link href={`/posts/${postId}/cardnews`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy/90">
              <Layers className="w-3.5 h-3.5" /> 카드뉴스
            </Link>
          </div>
        </div>

        {/* Body editor */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">포스팅 본문</label>
            <button
              onClick={() => copy(bodyContent, 'body')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              {copiedBody ? <><Check className="w-3.5 h-3.5 text-green-500" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
            </button>
          </div>
          <textarea
            value={bodyContent}
            onChange={e => handleChange({ finalContent: e.target.value })}
            rows={16}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue leading-relaxed"
          />
          <div className="mt-2">
            <CharCounter count={charCount} />
          </div>
        </div>

        {/* First comment */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">첫 댓글</label>
            <button
              onClick={() => copy(post.firstComment ?? '', 'comment')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              {copiedComment ? <><Check className="w-3.5 h-3.5 text-green-500" /> 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
            </button>
          </div>
          <textarea
            value={post.firstComment ?? ''}
            onChange={e => handleChange({ firstComment: e.target.value })}
            rows={4}
            placeholder="첫 댓글 내용을 입력하거나 AI가 자동 생성합니다..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
          />
        </div>

        {/* Re-generate */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">AI 재생성</p>
          <input
            value={regenInstructions}
            onChange={e => setRegenInstructions(e.target.value)}
            placeholder="수정 지시사항 (예: 더 간결하게, 사례 추가 등)"
            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue mb-2"
          />
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', regenerating && 'animate-spin')} />
            {regenerating ? '재생성 중...' : '재생성'}
          </button>
        </div>
      </div>

      {/* Right: Metadata */}
      {metaVisible && (
        <div className="hidden xl:flex flex-col w-64 shrink-0 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 pb-2 z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">메타데이터</p>
              <button onClick={() => setMetaVisible(false)} className="text-gray-400 hover:text-gray-600">
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <MetadataPanel post={post} onUpdate={handleChange} />
          </div>
        </div>
      )}
    </div>
  )
}
