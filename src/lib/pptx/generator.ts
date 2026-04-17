// Server-side only — never import on client
import PptxGenJS from 'pptxgenjs'
import type { CardTemplateId } from '@/lib/constants'
import type { SlideContent } from '@/types/cardnews'
import { parsePostToSlides } from './slide-builder'
import { applyProfessionalBlue } from './templates/professional-blue'
import { applyWarmOrange } from './templates/warm-orange'
import { applyModernMinimal } from './templates/modern-minimal'
import { applyDarkPremium } from './templates/dark-premium'

export interface GeneratePptxOptions {
  templateId: CardTemplateId
  slideCount: number
  slides?: SlideContent[]  // 사용자 편집 슬라이드 (없으면 자동 파싱)
  postContent: string
  companyName: string
  title: string
}

export async function generatePptx(options: GeneratePptxOptions): Promise<Buffer> {
  const { templateId, slideCount, postContent, companyName, title } = options

  const slides: SlideContent[] = options.slides && options.slides.length > 0
    ? options.slides
    : parsePostToSlides(postContent, slideCount)

  const pres = new PptxGenJS()
  pres.layout = 'LAYOUT_WIDE' // 16:9 (10" x 5.63")
  pres.author = companyName
  pres.company = companyName
  pres.title = title

  switch (templateId) {
    case 'professional-blue':
      applyProfessionalBlue(pres, slides, companyName)
      break
    case 'warm-orange':
      applyWarmOrange(pres, slides, companyName)
      break
    case 'modern-minimal':
      applyModernMinimal(pres, slides, companyName)
      break
    case 'dark-premium':
      applyDarkPremium(pres, slides, companyName)
      break
    default:
      applyProfessionalBlue(pres, slides, companyName)
  }

  const buf = await pres.write({ outputType: 'nodebuffer' })
  return buf as Buffer
}
