import type { Band } from './constants'

export interface ScorableQuestion {
  id: string
  isReversed: boolean
  dimensionId: string
}

export interface ScorableDimension {
  id: string
  key: string
  group: string
  name: string
  isRisk: boolean
  sortOrder: number
  bands: { band: string; minScore: number; maxScore: number; label: string; summary: string }[]
}

export interface DimensionScore {
  dimensionKey: string
  group: string
  name: string
  isRisk: boolean
  score: number // 차원 평균 (scaleMin~scaleMax)
  band: Band
  bandLabel: string
  summary: string
}

/**
 * 차원별 평균 점수 계산 → 해석 구간(band) 매핑.
 * 역채점 문항은 (min + max - 응답값)으로 반전.
 */
export function scoreResponse(
  questions: ScorableQuestion[],
  dimensions: ScorableDimension[],
  answers: Record<string, number>,
  scaleMin: number,
  scaleMax: number
): DimensionScore[] {
  const byDimension = new Map<string, number[]>()

  for (const q of questions) {
    const raw = answers[q.id]
    if (raw === undefined) {
      throw new Error(`Missing answer for question ${q.id}`)
    }
    const value = q.isReversed ? scaleMin + scaleMax - raw : raw
    const list = byDimension.get(q.dimensionId) ?? []
    list.push(value)
    byDimension.set(q.dimensionId, list)
  }

  return [...dimensions]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((dim) => {
      const values = byDimension.get(dim.id)
      if (!values || values.length === 0) {
        throw new Error(`No answers for dimension ${dim.key}`)
      }
      const score = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
      const band =
        dim.bands.find((b) => score >= b.minScore && score <= b.maxScore) ??
        // 부동소수점 경계 보호: 가장 가까운 구간으로 폴백
        dim.bands.reduce((best, b) =>
          Math.min(Math.abs(score - b.minScore), Math.abs(score - b.maxScore)) <
          Math.min(Math.abs(score - best.minScore), Math.abs(score - best.maxScore))
            ? b
            : best
        )
      return {
        dimensionKey: dim.key,
        group: dim.group,
        name: dim.name,
        isRisk: dim.isRisk,
        score,
        band: band.band as Band,
        bandLabel: band.label,
        summary: band.summary,
      }
    })
}
