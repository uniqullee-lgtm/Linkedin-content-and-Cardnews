// ─── ContentType ─────────────────────────────────────────────────
export const CONTENT_TYPES = [
  'COURSE_DEVELOPMENT',
  'WORK_STYLE',
  'DIAGNOSIS_DEVELOPMENT',
  'PROJECT_EXPERIENCE',
  'BOOKLET_WEBINAR',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  COURSE_DEVELOPMENT: '과정개발',
  WORK_STYLE: '일하는방식',
  DIAGNOSIS_DEVELOPMENT: '진단개발',
  PROJECT_EXPERIENCE: '프로젝트 경험',
  BOOKLET_WEBINAR: '소책자/웨비나',
}

// ─── PostStatus ───────────────────────────────────────────────────
export const POST_STATUSES = ['DRAFT', 'REVIEW', 'FINAL', 'PUBLISHED'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: '초안',
  REVIEW: '검토 중',
  FINAL: '완료',
  PUBLISHED: '게시됨',
}

// ─── 해시태그 프리셋 ──────────────────────────────────────────────
export const HASHTAG_PRESETS: Record<ContentType, string[]> = {
  COURSE_DEVELOPMENT: ['#HRD', '#과정개발', '#조직개발', '#리더십', '#팀장'],
  WORK_STYLE: ['#일하는방식', '#업무효율', '#조직문화', '#팀협업', '#HRD'],
  DIAGNOSIS_DEVELOPMENT: ['#진단개발', '#조직진단', '#역량진단', '#HRD', '#조직개발'],
  PROJECT_EXPERIENCE: ['#HRD', '#조직개발', '#컨설팅', '#리더십', '#팀장'],
  BOOKLET_WEBINAR: ['#HRD', '#리더십', '#팀장', '#조직개발', '#무료자료'],
}

// ─── 카드뉴스 템플릿 ──────────────────────────────────────────────
export const CARD_TEMPLATES = [
  {
    id: 'professional-blue',
    nameKo: '프로페셔널 블루',
    description: '남색 배경, 전문적인 기업 스타일',
    colors: {
      primary: '#1E3A5F',
      secondary: '#4A9EDB',
      background: '#1E3A5F',
      text: '#FFFFFF',
      textLight: '#B0C9E0',
    },
  },
  {
    id: 'warm-orange',
    nameKo: '웜 오렌지',
    description: '흰 배경, 따뜻하고 친근한 스타일',
    colors: {
      primary: '#F26522',
      secondary: '#FFB347',
      background: '#FFFFFF',
      text: '#1A1A1A',
      textLight: '#666666',
    },
  },
  {
    id: 'modern-minimal',
    nameKo: '모던 미니멀',
    description: '밝은 배경, 타이포그래피 중심',
    colors: {
      primary: '#111111',
      secondary: '#555555',
      background: '#FAFAFA',
      text: '#111111',
      textLight: '#888888',
    },
  },
  {
    id: 'dark-premium',
    nameKo: '다크 프리미엄',
    description: '다크 배경, 골드 포인트의 프리미엄 스타일',
    colors: {
      primary: '#C9A84C',
      secondary: '#E8C96A',
      background: '#1A1A1A',
      text: '#FFFFFF',
      textLight: '#AAAAAA',
    },
  },
] as const

export type CardTemplateId = (typeof CARD_TEMPLATES)[number]['id']

// ─── LinkedIn 포스팅 설정 ─────────────────────────────────────────
export const LINKEDIN_CHAR_MIN = 700
export const LINKEDIN_CHAR_MAX = 1200
export const LINKEDIN_PREVIEW_CUTOFF = 210 // "더 보기" 버튼 기준

// ─── 슬라이드 수 옵션 ─────────────────────────────────────────────
export const SLIDE_COUNT_OPTIONS = [
  { value: 4, label: '4장', description: '간결' },
  { value: 6, label: '6장', description: '표준', default: true },
  { value: 8, label: '8장', description: '상세' },
] as const
