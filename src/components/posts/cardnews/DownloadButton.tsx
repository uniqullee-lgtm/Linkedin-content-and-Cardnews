'use client'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { downloadBlob } from '@/lib/utils'
import { showToast } from '@/components/shared/Toast'
import type { SlideContent } from '@/types/cardnews'
import type { CardTemplateId } from '@/lib/constants'

interface DownloadButtonProps {
  postId: string
  templateId: CardTemplateId
  slideCount: number
  slides: SlideContent[]
  title: string
}

export function DownloadButton({ postId, templateId, slideCount, slides, title }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const filename = `${title.replace(/[^가-힣a-zA-Z0-9]/g, '_').slice(0, 30)}_cardnews.pptx`
      await downloadBlob(
        `/api/posts/${postId}/cardnews/generate`,
        filename,
        JSON.stringify({ templateId, slideCount, slides })
      )
      showToast('다운로드가 시작되었습니다.', 'success')
    } catch (err) {
      showToast((err as Error).message || '다운로드 실패', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 disabled:opacity-70 transition-colors"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
      ) : (
        <><Download className="w-4 h-4" /> PPT 다운로드</>
      )}
    </button>
  )
}
