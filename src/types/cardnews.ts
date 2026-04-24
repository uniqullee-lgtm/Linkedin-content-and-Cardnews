import type { CardTemplateId } from '@/lib/constants'

export interface SlideContent {
  id: string
  type: 'cover' | 'content' | 'closing'
  title: string
  body?: string
  bulletPoints?: string[]
  slideNumber?: number
}

export interface CardNewsData {
  id: string
  postId: string
  templateId: CardTemplateId
  slideCount: number
  slides: SlideContent[]
  createdAt: string
  updatedAt: string
}

export interface GenerateCardNewsRequest {
  templateId: CardTemplateId
  slideCount: number
  slides?: SlideContent[] // 사용자 편집 슬라이드 (없으면 포스팅 본문 자동 파싱)
}
