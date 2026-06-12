import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DEFAULT_SCALE_LABELS } from '@/lib/constants'
import SurveyClient from './SurveyClient'

export const dynamic = 'force-dynamic'

export default async function SurveyPage({ params }: { params: { slug: string } }) {
  const assessment = await prisma.assessment.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      questions: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          text: true,
          dimension: { select: { group: true } },
        },
      },
    },
  })
  if (!assessment || assessment.questions.length === 0) notFound()

  const scaleLabels = Array.isArray(assessment.scaleLabels)
    ? (assessment.scaleLabels as string[])
    : [...DEFAULT_SCALE_LABELS]

  return (
    <SurveyClient
      slug={assessment.slug}
      title={assessment.title}
      scaleMin={assessment.scaleMin}
      scaleMax={assessment.scaleMax}
      scaleLabels={scaleLabels}
      questions={assessment.questions.map((q) => ({
        id: q.id,
        text: q.text,
        group: q.dimension.group,
      }))}
    />
  )
}
