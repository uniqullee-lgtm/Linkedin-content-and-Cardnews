import type { SlideContent } from '@/types/cardnews'

/**
 * LinkedIn 포스팅 본문을 슬라이드 배열로 파싱합니다.
 *
 * 카드뉴스 제작 가이드 원칙:
 * - 원칙 2: Hook → 핵심 내용 → CTA 구조 (커버·내용·클로징)
 * - 원칙 3: 슬라이드 = 하나의 메시지 (제목이 곧 메시지)
 * - 스크립트 규칙 1: 내용 밀도 — 슬라이드당 핵심 정보 2~3개
 * - 스크립트 규칙 3: 슬라이드 수 — ≤500자: 5~6장, 500~1500자: 7~9장, ≥1500자: 10~13장
 */
export function parsePostToSlides(content: string, slideCount: number): SlideContent[] {
  const targetCount = Math.max(4, Math.min(15, Math.round(slideCount)))

  // 해시태그 제거 및 공백 정리
  const cleaned = content
    .replace(/#\S+/g, '')
    .replace(/^\s+|\s+$/g, '')

  // 이중 줄바꿈으로 문단 분리
  const paras = cleaned
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  if (paras.length === 0) {
    return buildEmptySlides(targetCount)
  }

  // ── 커버 슬라이드 (Hook) ──────────────────────────────
  const coverSlide = buildCoverSlide(paras[0]!)

  // ── 클로징 슬라이드 (CTA) ─────────────────────────────
  const closingSlide = buildClosingSlide(paras[paras.length - 1]!)

  // ── 내용 슬라이드 분배 ────────────────────────────────
  const contentSlideCount = Math.max(1, targetCount - 2)

  // 중간 문단 추출 (첫·끝 문단 제외)
  const midParas: string[] = paras.length >= 3
    ? paras.slice(1, -1)
    : paras.length === 2
      ? [paras[0]!, paras[1]!] // 두 문단만 있으면 둘 다 사용
      : [paras[0]!]             // 문단 하나밖에 없으면 그것 사용

  // 문단을 최소 의미 단위(원자)로 분해
  const atoms = extractContentAtoms(midParas)

  // 원자를 슬라이드 수에 맞게 그룹화
  const groups = groupAtomsIntoSlides(atoms, contentSlideCount)

  const contentSlides: SlideContent[] = groups.map((group, i) => ({
    id: `slide-content-${i + 1}`,
    type: 'content' as const,
    title: deriveTitleFromGroup(group, i + 1),
    bulletPoints: group.slice(0, 3).map(a => truncateText(a, 100)),
    slideNumber: i + 1,
  }))

  return [coverSlide, ...contentSlides, closingSlide]
}

// ── 슬라이드 빌더 ────────────────────────────────────────────────────────────

function buildCoverSlide(firstPara: string): SlideContent {
  const lines = firstPara.split('\n').map(l => l.trim()).filter(Boolean)

  // Hook 제목: 첫 줄 (짧고 강렬하게)
  const titleLine = lines[0] ?? firstPara
  const title = titleLine.length > 55
    ? titleLine.slice(0, 52) + '...'
    : titleLine

  // 서브타이틀: 나머지 줄 합침 (맥락/전제 설명)
  const subtitle = lines.slice(1).join(' ').trim()

  return {
    id: 'slide-cover',
    type: 'cover',
    title,
    body: subtitle ? truncateText(subtitle, 120) : '',
  }
}

function buildClosingSlide(lastPara: string): SlideContent {
  return {
    id: 'slide-closing',
    type: 'closing',
    title: deriveCtaTitle(lastPara),
    body: truncateText(lastPara, 200),
  }
}

function deriveCtaTitle(para: string): string {
  const ctaMap: [string, string][] = [
    ['문의', '궁금하신 점이 있으신가요?'],
    ['연락', '언제든 연락 주세요'],
    ['함께', '함께 성장해요'],
    ['지금', '지금 바로 시작하세요'],
    ['경험', '직접 경험해 보세요'],
    ['공유', '주변에 공유해 주세요'],
    ['도움', '도움이 필요하시면'],
    ['시작', '지금 시작하세요'],
    ['질문', '질문은 언제든 환영해요'],
  ]

  for (const [keyword, title] of ctaMap) {
    if (para.includes(keyword)) return title
  }

  const first = para.split(/[.!?]/)[0]?.trim() ?? ''
  if (first.length >= 5 && first.length <= 30) return first
  if (first.length > 30) return first.slice(0, 27) + '...'
  return '함께 성장해요'
}

// ── 원자(Atom) 추출 ──────────────────────────────────────────────────────────

/**
 * 여러 문단을 슬라이드 불릿 포인트의 최소 단위(원자)로 분해합니다.
 *
 * 가이드 원칙:
 * - 목록형: 각 항목이 하나의 원자 (1~2문장 설명 포함)
 * - 서술형: 각 문장 또는 줄이 하나의 원자
 */
function extractContentAtoms(paragraphs: string[]): string[] {
  const atoms: string[] = []

  for (const para of paragraphs) {
    if (!para.trim()) continue

    const lines = para.split('\n').map(l => l.trim()).filter(Boolean)

    // 목록형 감지: 줄이 2개 이상이고 목록 기호로 시작
    const isListStyle = lines.length >= 2 && lines.some(l =>
      /^[-•·▶▸►*①②③④⑤\d.]/.test(l)
    )

    if (isListStyle) {
      // 목록형: 각 항목을 원자로 (기호 제거)
      for (const line of lines) {
        const cleanLine = line.replace(/^[-•·▶▸►*①②③④⑤\d.]+\s*/, '').trim()
        if (cleanLine.length > 3) atoms.push(cleanLine)
      }
    } else if (lines.length >= 2) {
      // 여러 줄 서술형: 각 줄을 원자로
      atoms.push(...lines.filter(l => l.length > 5))
    } else {
      // 단일 블록: 문장 단위로 분리
      const sentences = splitSentences(para)
      if (sentences.length >= 2) {
        atoms.push(...sentences)
      } else {
        atoms.push(para)
      }
    }
  }

  return atoms.filter(a => a.length > 3)
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5)
}

// ── 그룹화 및 제목 추출 ──────────────────────────────────────────────────────

/**
 * 원자 배열을 슬라이드 수에 맞게 균등 분배합니다.
 * 가이드 원칙: 슬라이드당 핵심 정보 2~3개
 */
function groupAtomsIntoSlides(atoms: string[], slideCount: number): string[][] {
  if (slideCount <= 0) return []

  if (atoms.length === 0) {
    return Array.from({ length: slideCount }, () => ['내용을 입력해주세요.'])
  }

  const result: string[][] = Array.from({ length: slideCount }, () => [])

  // 비율 기반 균등 분배 (슬라이드당 2~3개 목표)
  atoms.forEach((atom, i) => {
    const slideIdx = Math.min(
      Math.floor((i * slideCount) / atoms.length),
      slideCount - 1
    )
    result[slideIdx]!.push(atom)
  })

  // 빈 슬라이드 처리: 앞 슬라이드에서 마지막 원자 가져오기
  for (let i = 0; i < slideCount; i++) {
    if (result[i]!.length === 0) {
      const fallback =
        result[i - 1]?.at(-1) ??
        result[0]?.at(-1) ??
        '내용을 입력해주세요.'
      result[i] = [fallback]
    }
  }

  return result
}

function deriveTitleFromGroup(atoms: string[], index: number): string {
  const first = atoms[0] ?? ''
  if (!first) return `포인트 ${index}`

  // 첫 원자의 첫 문장을 제목으로
  const firstSentence = first.split(/[.!?]/)[0]?.trim() ?? first

  if (firstSentence.length >= 5 && firstSentence.length <= 35) {
    return firstSentence
  }
  if (firstSentence.length > 35) {
    return firstSentence.slice(0, 32) + '...'
  }
  return truncateText(first, 35)
}

// ── 유틸리티 ────────────────────────────────────────────────────────────────

function buildEmptySlides(slideCount: number): SlideContent[] {
  const slides: SlideContent[] = [
    { id: 'slide-cover', type: 'cover', title: '제목을 입력해주세요', body: '' },
  ]

  for (let i = 1; i < slideCount - 1; i++) {
    slides.push({
      id: `slide-content-${i}`,
      type: 'content',
      title: `포인트 ${i}`,
      bulletPoints: ['내용을 입력해주세요.', '추가 내용을 입력해주세요.'],
      slideNumber: i,
    })
  }

  slides.push({
    id: 'slide-closing',
    type: 'closing',
    title: '함께 성장해요',
    body: '타피루즈그룹과 함께 성장하세요.',
  })

  return slides
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
