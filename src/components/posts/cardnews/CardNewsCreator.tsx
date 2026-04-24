'use client'
import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { RefreshCw } from 'lucide-react'
import { TemplateGrid } from './TemplateGrid'
import { SlideList } from './SlideList'
import { SlidePreview } from './SlidePreview'
import { SlideEditPanel } from './SlideEditPanel'
import { DownloadButton } from './DownloadButton'
import { parsePostToSlides } from '@/lib/pptx/slide-builder'
import { showToast } from '@/components/shared/Toast'
import { SLIDE_COUNT_OPTIONS, recommendSlideCount } from '@/lib/constants'
import type { CardTemplateId } from '@/lib/constants'
import type { PostWithTags } from '@/types/post'
import type { SlideContent } from '@/types/cardnews'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(async r => {
  if (!r.ok) throw new Error(await r.text())
  return r.json()
})

interface CardNewsCreatorProps {
  postId: string
}

export function CardNewsCreator({ postId }: CardNewsCreatorProps) {
  const { data: post } = useSWR<PostWithTags>(`/api/posts/${postId}`, fetcher)
  const { data: existingCardNews } = useSWR(`/api/posts/${postId}/cardnews`, fetcher)

  const [templateId, setTemplateId] = useState<CardTemplateId>('professional-blue')
  const [slideCount, setSlideCount] = useState<number>(7)
  const [slides, setSlides] = useState<SlideContent[]>([])
  const [selectedSlideId, setSelectedSlideId] = useState('')
  const [saving, setSaving] = useState(false)
  const [cardNewsId, setCardNewsId] = useState<string | null>(null)
  const [settingsData, setSettingsData] = useState({ companyName: '타피루즈그룹' })
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setSettingsData(d)).catch(() => {})
  }, [])

  // Initialize slides from DB or parse post
  useEffect(() => {
    if (!post || initialized) return

    const postContent = post.finalContent ?? post.draft ?? ''

    if (existingCardNews && Array.isArray(existingCardNews) && existingCardNews.length > 0) {
      const latest = existingCardNews[0]
      setTemplateId(latest.templateId as CardTemplateId)
      setSlideCount(Number(latest.slideCount))
      setSlides(latest.slides)
      setSelectedSlideId(latest.slides[0]?.id ?? '')
      setCardNewsId(latest.id)
    } else if (postContent) {
      // 포스팅 길이에 따른 자동 추천 슬라이드 수 적용
      const contentLength = postContent.replace(/#\S+/g, '').trim().length
      const recommended = recommendSlideCount(contentLength)
      setSlideCount(recommended)
      const parsed = parsePostToSlides(postContent, recommended)
      setSlides(parsed)
      setSelectedSlideId(parsed[0]?.id ?? '')
    }

    setInitialized(true)
  }, [post, existingCardNews, initialized])

  const handleSlideCountChange = (count: number) => {
    setSlideCount(count)
    const postContent = post?.finalContent ?? post?.draft ?? ''
    if (postContent) {
      const parsed = parsePostToSlides(postContent, count)
      setSlides(parsed)
      setSelectedSlideId(parsed[0]?.id ?? '')
    }
  }

  const resetSlides = () => {
    const postContent = post?.finalContent ?? post?.draft ?? ''
    if (!postContent) return showToast('포스팅 내용이 없습니다.', 'error')
    const parsed = parsePostToSlides(postContent, slideCount)
    setSlides(parsed)
    setSelectedSlideId(parsed[0]?.id ?? '')
    showToast('슬라이드가 초기화되었습니다.', 'info')
  }

  const saveSlides = useCallback(async (currentSlides: SlideContent[]) => {
    setSaving(true)
    try {
      const url = `/api/posts/${postId}/cardnews`
      const method = cardNewsId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, slideCount, slides: currentSlides }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!cardNewsId) setCardNewsId(data.id)
    } catch {
      showToast('저장 실패', 'error')
    } finally {
      setSaving(false)
    }
  }, [postId, cardNewsId, templateId, slideCount])

  const updateSlide = (updated: SlideContent) => {
    setSlides(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s)
      // Auto-save after 1.5s
      clearTimeout((window as unknown as Record<string, unknown>).__slideTimer as ReturnType<typeof setTimeout> | undefined)
      ;(window as unknown as Record<string, unknown>).__slideTimer = setTimeout(() => saveSlides(next), 1500)
      return next
    })
  }

  const addSlide = () => {
    const contentSlides = slides.filter(s => s.type === 'content')
    const newSlide: SlideContent = {
      id: `slide-content-${Date.now()}`,
      type: 'content',
      title: `슬라이드 ${contentSlides.length + 1}`,
      bulletPoints: ['내용을 입력해주세요.'],
      slideNumber: contentSlides.length + 1,
    }
    // Insert before closing slide
    const closingIdx = slides.findIndex(s => s.type === 'closing')
    const next = closingIdx >= 0
      ? [...slides.slice(0, closingIdx), newSlide, ...slides.slice(closingIdx)]
      : [...slides, newSlide]
    setSlides(next)
    setSelectedSlideId(newSlide.id)
  }

  const removeSlide = (id: string) => {
    const next = slides.filter(s => s.id !== id)
    setSlides(next)
    if (selectedSlideId === id) setSelectedSlideId(next[0]?.id ?? '')
  }

  const selectedSlide = slides.find(s => s.id === selectedSlideId)

  if (!post) {
    return <div className="flex items-center justify-center h-64 text-sm text-gray-400">불러오는 중...</div>
  }

  return (
    <div className="space-y-4">
      {/* Top: Template + Slide count */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Template */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">템플릿 선택</h3>
            <TemplateGrid selected={templateId} onSelect={setTemplateId} />
          </div>
          {/* Slide count */}
          <div className="md:w-52">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">슬라이드 수</h3>
            {post && (
              <p className="text-xs text-gray-400 mb-3">
                포스팅 {(post.finalContent ?? post.draft ?? '').replace(/#\S+/g, '').trim().length}자 기준 추천
              </p>
            )}
            <div className="flex flex-col gap-2">
              {(() => {
                const postContent = post?.finalContent ?? post?.draft ?? ''
                const contentLength = postContent.replace(/#\S+/g, '').trim().length
                const recommended = recommendSlideCount(contentLength)
                return SLIDE_COUNT_OPTIONS.map(opt => {
                  const isSelected = slideCount === opt.value
                  const isRecommended = opt.value === recommended
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSlideCountChange(opt.value)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all',
                        isSelected
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-blue'
                      )}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <div className="flex items-center gap-1.5">
                        {isRecommended && (
                          <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded font-medium',
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                          )}>
                            추천
                          </span>
                        )}
                        <span className={cn('text-xs', isSelected ? 'text-white/70' : 'text-gray-400')}>
                          {opt.description}
                        </span>
                      </div>
                    </button>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 3-panel editor */}
      {slides.length > 0 && (
        <div className="flex gap-3" style={{ height: '480px' }}>
          {/* Left: Slide list */}
          <div className="w-52 shrink-0 bg-white rounded-xl border border-gray-100 p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">슬라이드</p>
              <button onClick={resetSlides} title="처음부터" className="text-gray-400 hover:text-brand-navy">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <SlideList
              slides={slides}
              selectedId={selectedSlideId}
              onSelect={setSelectedSlideId}
              onReorder={setSlides}
              onAdd={addSlide}
              onRemove={removeSlide}
            />
          </div>

          {/* Center: Preview */}
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center p-4 overflow-hidden">
            {selectedSlide ? (
              <>
                <SlidePreview
                  slide={selectedSlide}
                  templateId={templateId}
                  companyName={settingsData.companyName}
                  scale={0.65}
                />
                <p className="text-xs text-gray-400 mt-3">
                  {slides.indexOf(selectedSlide) + 1} / {slides.length}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">슬라이드를 선택하세요</p>
            )}
          </div>

          {/* Right: Edit panel */}
          <div className="w-64 shrink-0 bg-white rounded-xl border border-gray-100 p-4 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">슬라이드 편집</p>
            {selectedSlide ? (
              <SlideEditPanel slide={selectedSlide} onChange={updateSlide} />
            ) : (
              <p className="text-sm text-gray-400">슬라이드를 선택하세요</p>
            )}
          </div>
        </div>
      )}

      {/* Download */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">PPT 다운로드</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {saving ? '자동 저장 중...' : '현재 편집 내용으로 .pptx 파일을 생성합니다'}
          </p>
        </div>
        <DownloadButton
          postId={postId}
          templateId={templateId}
          slideCount={slideCount}
          slides={slides}
          title={post.title}
        />
      </div>
    </div>
  )
}
