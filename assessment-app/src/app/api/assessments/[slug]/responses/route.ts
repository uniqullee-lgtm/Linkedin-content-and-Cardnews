import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { scoreResponse } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  name: z.string().trim().max(50).optional(),
  email: z.string().trim().email('이메일 형식이 올바르지 않습니다').optional(),
  consent: z.literal(true, { error: '개인정보 수집·이용 동의가 필요합니다' }),
  answers: z.record(z.string(), z.number().int()),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await req.json())
  } catch (e) {
    const message = e instanceof z.ZodError ? e.issues[0]?.message : '잘못된 요청입니다'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const assessment = await prisma.assessment.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      questions: { select: { id: true, isReversed: true, dimensionId: true } },
      dimensions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          bands: {
            select: { band: true, minScore: true, maxScore: true, label: true, summary: true },
          },
        },
      },
    },
  })
  if (!assessment) {
    return NextResponse.json({ error: '진단을 찾을 수 없습니다' }, { status: 404 })
  }

  // 모든 문항 응답 + 척도 범위 검증
  const missing = assessment.questions.filter((q) => body.answers[q.id] === undefined)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `미응답 문항이 ${missing.length}개 있습니다` },
      { status: 400 }
    )
  }
  const outOfRange = Object.values(body.answers).some(
    (v) => v < assessment.scaleMin || v > assessment.scaleMax
  )
  if (outOfRange) {
    return NextResponse.json({ error: '응답 값이 척도 범위를 벗어났습니다' }, { status: 400 })
  }

  const scores = scoreResponse(
    assessment.questions,
    assessment.dimensions,
    body.answers,
    assessment.scaleMin,
    assessment.scaleMax
  )

  const response = await prisma.response.create({
    data: {
      assessmentId: assessment.id,
      respondentName: body.name || null,
      respondentEmail: body.email || null,
      answers: body.answers,
      scores: JSON.parse(JSON.stringify(scores)),
      consentedAt: new Date(),
    },
    select: { token: true },
  })

  return NextResponse.json({ token: response.token }, { status: 201 })
}
