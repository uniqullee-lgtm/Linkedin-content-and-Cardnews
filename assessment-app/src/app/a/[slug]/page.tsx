import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AssessmentIntroPage({ params }: { params: { slug: string } }) {
  const assessment = await prisma.assessment.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      dimensions: { orderBy: { sortOrder: 'asc' }, select: { group: true } },
      _count: { select: { questions: true } },
    },
  })
  if (!assessment) notFound()

  const groups = [...new Set(assessment.dimensions.map((d) => d.group))]

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
        {assessment.subtitle && <p className="text-brand-600">{assessment.subtitle}</p>}
        <p className="leading-relaxed text-slate-600">{assessment.description}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-500">측정 영역</h2>
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <span
              key={g}
              className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
            >
              {g}
            </span>
          ))}
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-center">
          <div>
            <dt className="text-xs text-slate-400">문항 수</dt>
            <dd className="mt-1 font-semibold">{assessment._count.questions}문항</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">소요 시간</dt>
            <dd className="mt-1 font-semibold">약 {assessment.durationMin}분</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">결과 확인</dt>
            <dd className="mt-1 font-semibold">즉시 · 무료</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 text-sm text-slate-500">
        <p>· 정답은 없습니다. 평소의 나에 가깝게, 너무 오래 고민하지 말고 응답하세요.</p>
        <p>· 결과는 응답 완료 즉시 확인할 수 있으며, 결과 링크는 본인만 보관하세요.</p>
      </section>

      <Link
        href={`/a/${assessment.slug}/survey`}
        className="block w-full rounded-xl bg-brand-600 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        진단 시작하기
      </Link>
    </div>
  )
}
