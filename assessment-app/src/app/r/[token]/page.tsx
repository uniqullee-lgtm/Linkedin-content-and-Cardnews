import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { DimensionScore } from '@/lib/scoring'
import RadarChart from '@/components/RadarChart'

export const dynamic = 'force-dynamic'

// 일반 차원: HIGH=강점(파랑) / 드레일먼트(isRisk): HIGH=위험(빨강)
function badgeClass(score: DimensionScore): string {
  if (score.isRisk) {
    if (score.band === 'HIGH') return 'bg-red-100 text-red-700'
    if (score.band === 'MID') return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
  }
  if (score.band === 'HIGH') return 'bg-brand-100 text-brand-700'
  if (score.band === 'MID') return 'bg-slate-100 text-slate-600'
  return 'bg-slate-100 text-slate-500'
}

function barClass(score: DimensionScore): string {
  if (score.isRisk) {
    if (score.band === 'HIGH') return 'bg-red-500'
    if (score.band === 'MID') return 'bg-amber-400'
    return 'bg-emerald-500'
  }
  return 'bg-brand-500'
}

export default async function ResultPage({ params }: { params: { token: string } }) {
  const response = await prisma.response.findUnique({
    where: { token: params.token },
    include: { assessment: { select: { title: true, scaleMin: true, scaleMax: true } } },
  })
  if (!response) notFound()

  const scores = response.scores as unknown as DimensionScore[]
  const { scaleMin, scaleMax } = response.assessment

  // scores는 차원 sortOrder 순 → 등장 순서대로 그룹핑
  const groups: { name: string; scores: DimensionScore[] }[] = []
  for (const s of scores) {
    const last = groups[groups.length - 1]
    if (last && last.name === s.group) last.scores.push(s)
    else groups.push({ name: s.group, scores: [s] })
  }

  const date = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(response.createdAt)

  return (
    <div className="space-y-10">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-brand-600">진단 결과 리포트</p>
        <h1 className="text-2xl font-bold tracking-tight">{response.assessment.title}</h1>
        <p className="text-sm text-slate-500">
          {response.respondentName ? `${response.respondentName} 님 · ` : ''}
          {date}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.name} className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {group.name}
            {group.scores[0]?.isRisk && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                탈선 위험 신호
              </span>
            )}
          </h2>

          {!group.scores[0]?.isRisk && group.scores.length >= 3 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <RadarChart
                data={group.scores.map((s) => ({ label: s.name, value: s.score }))}
                min={scaleMin}
                max={scaleMax}
              />
            </div>
          )}

          <div className="space-y-3">
            {group.scores.map((s) => (
              <article key={s.dimensionKey} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{s.name}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-bold tabular-nums">
                      {s.score.toFixed(1)}
                      <span className="font-normal text-slate-400">/{scaleMax}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(s)}`}>
                      {s.bandLabel}
                    </span>
                  </div>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barClass(s)}`}
                    style={{ width: `${((s.score - scaleMin) / (scaleMax - scaleMin)) * 100}%` }}
                  />
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{s.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl bg-brand-900 p-6 text-white">
        <h2 className="text-lg font-bold">더 깊이 이해하고 싶다면</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          차원 간 상호작용 분석, 상세 개발 가이드, 코칭 질문이 담긴 심층 리포트(PDF)를 준비하고
          있습니다. 기업 단위 진단(팀·리더십·조직)은 타피루즈그룹으로 문의해 주세요.
        </p>
      </section>

      <footer className="space-y-3 text-center text-xs text-slate-400">
        <p>이 결과는 본 링크를 아는 사람만 볼 수 있습니다. 링크 공유에 주의하세요.</p>
        <Link href="/" className="inline-block text-brand-600 underline">
          다른 진단 보기
        </Link>
      </footer>
    </div>
  )
}
