export const ASSESSMENT_TYPES = ['SELF', 'MULTI_RATER'] as const
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number]

export const BANDS = ['LOW', 'MID', 'HIGH'] as const
export type Band = (typeof BANDS)[number]

export const RATER_ROLES = ['SELF', 'MANAGER', 'PEER', 'REPORT'] as const
export type RaterRole = (typeof RATER_ROLES)[number]

// 5점 리커트 기본 라벨
export const DEFAULT_SCALE_LABELS = [
  '전혀 그렇지 않다',
  '그렇지 않은 편이다',
  '보통이다',
  '그런 편이다',
  '매우 그렇다',
] as const

// 점수 구간 (1~5점 평균 기준). 초기에는 절대 기준, 응답 축적 후 자체 규준으로 전환 예정.
export const BAND_THRESHOLDS: Record<Band, { min: number; max: number }> = {
  LOW: { min: 1.0, max: 2.59 },
  MID: { min: 2.6, max: 3.79 },
  HIGH: { min: 3.8, max: 5.0 },
}
