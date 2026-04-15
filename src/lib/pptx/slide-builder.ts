import type { SlideContent } from '@/types/cardnews'

/**
 * LinkedIn 포스팅 본문을 슬라이드 배열로 파싱합니다.
 * 슬라이드 구성: 커버(1) + 내용(n-2) + 클로징(1)
 */
export function parsePostToSlides(content: string, slideCount: 4 | 6 | 8): SlideContent[] {
  // 해시태그 제거 후 본문만 추출
  const withoutHashtags = content.replace(/#\S+/g, '').trim()

  // 빈 줄로 문단 분리
  const paragraphs = withoutHashtags
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)

  const contentSlideCount = slideCount - 2 // 커버 + 클로징 제외

  // 커버 슬라이드: 첫 문장이 제목
  const firstParagraph = paragraphs[0] ?? ''
  const coverTitle = firstParagraph.length > 60
    ? firstParagraph.slice(0, 57) + '...'
    : firstParagraph

  const slides: SlideContent[] = [
    {
      id: `slide-cover`,
      type: 'cover',
      title: coverTitle,
      body: '',
    },
  ]

  // 내용 슬라이드: 남은 문단을 균등 분배
  const bodyParagraphs = paragraphs.slice(1, paragraphs.length - 1)
  const contentSlides = distributeToSlides(bodyParagraphs, contentSlideCount)

  contentSlides.forEach((slideData, i) => {
    slides.push({
      id: `slide-content-${i + 1}`,
      type: 'content',
      title: generateSlideTitle(slideData, i + 1),
      bulletPoints: slideData.map(p => truncateText(p, 120)),
      slideNumber: i + 1,
    })
  })

  // 클로징 슬라이드: 마지막 문단 + CTA
  const lastParagraph = paragraphs[paragraphs.length - 1] ?? ''
  slides.push({
    id: `slide-closing`,
    type: 'closing',
    title: '핵심 메시지',
    body: truncateText(lastParagraph.replace(/여러분.*?$/, '').trim() || '타피루즈그룹과 함께 성장하세요', 150),
  })

  return slides
}

/**
 * 문단 배열을 슬라이드 수에 맞게 균등 분배합니다.
 */
function distributeToSlides(paragraphs: string[], slideCount: number): string[][] {
  if (paragraphs.length === 0) {
    return Array.from({ length: slideCount }, () => ['내용을 입력해주세요.'])
  }

  const result: string[][] = Array.from({ length: slideCount }, () => [])
  paragraphs.forEach((p, i) => {
    result[i % slideCount]!.push(p)
  })

  // 빈 슬라이드 채우기
  return result.map((slide, i) =>
    slide.length > 0 ? slide : [`슬라이드 ${i + 1} 내용을 입력해주세요.`]
  )
}

/**
 * 슬라이드 내용에서 짧은 제목을 자동 생성합니다.
 */
function generateSlideTitle(paragraphs: string[], index: number): string {
  const first = paragraphs[0] ?? ''
  // 첫 문장에서 동사/핵심어 추출 시도
  const firstSentence = first.split(/[.。!?]/)[0] ?? ''
  if (firstSentence.length > 0 && firstSentence.length <= 30) {
    return firstSentence
  }
  // 너무 길면 앞 30자
  if (firstSentence.length > 30) {
    return firstSentence.slice(0, 28) + '...'
  }
  return `포인트 ${index}`
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
