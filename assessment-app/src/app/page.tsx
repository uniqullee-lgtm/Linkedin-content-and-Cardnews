import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const assessments = await prisma.assessment.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      durationMin: true,
      _count: { select: { questions: true } },
    },
  })

  return (
    <div className="space-y-8">
      <section className="space-y-3 pt-4">
        <h1 className="text-3xl font-bold leading-snug tracking-tight">
          일하는 나를,
          <br />
          데이터로 이해하다
        </h1>
        <p className="text-slate-600">
          HRD 전문기업 타피루즈그룹이 만든 온라인 진단입니다. 응답 즉시 무료 해설을
          확인할 수 있습니다.
        </p>
      </section>

      <section className="space-y-4">
        {assessments.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            현재 진행 중인 진단이 없습니다.
          </p>
        )}
        {assessments.map((a) => (
          <Link
            key={a.slug}
            href={`/a/${a.slug}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold">{a.title}</h2>
                {a.subtitle && <p className="text-sm text-brand-600">{a.subtitle}</p>}
                <p className="line-clamp-2 text-sm text-slate-500">{a.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                무료
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {a._count.questions}문항 · 약 {a.durationMin}분
            </p>
          </Link>
        ))}
      </section>
    </div>
  )
}
