import { NextResponse } from 'next/server'
import { z } from 'zod'
import { CONTENT_TYPES } from '@/lib/constants'
import { streamLinkedInPost, type StyleExample, type ClaudeModel } from '@/lib/claude'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const maxDuration = 60

const CLAUDE_MODELS = ['haiku', 'sonnet', 'opus-s', 'opus'] as const

const GenerateSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  context: z.string().min(1),
  contentType: z.enum(CONTENT_TYPES),
  seriesInfo: z.string().optional(),
  additionalInstructions: z.string().optional(),
  // 모델 선택: 미지정 시 설정값(preferredModel) 사용, 설정값도 없으면 'sonnet'
  model: z.enum(CLAUDE_MODELS).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = GenerateSchema.parse(body)

    // API 키: 환경변수 → DB 저장값 순서로 fallback
    let apiKey = process.env.ANTHROPIC_API_KEY || ''
    const settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
    if (!apiKey) apiKey = settings?.anthropicApiKey ?? ''

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 설정 페이지에서 Anthropic API 키를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 모델: 요청 파라미터 > 설정값 > 기본값(sonnet)
    const model: ClaudeModel = input.model ?? (settings?.preferredModel as ClaudeModel | undefined) ?? 'sonnet'

    // 스타일 참조 포스팅 최대 3개 가져오기 (같은 contentType 우선)
    const styleRefPosts = await prisma.post.findMany({
      where: {
        isStyleReference: true,
        finalContent: { not: null },
      },
      orderBy: [
        { contentType: 'asc' },
        { updatedAt: 'desc' },
      ],
      take: 5,
      select: { title: true, finalContent: true, contentType: true, styleNotes: true },
    })

    // 같은 contentType 우선 정렬 후 최대 3개
    const sameType = styleRefPosts.filter(p => p.contentType === input.contentType)
    const others = styleRefPosts.filter(p => p.contentType !== input.contentType)
    const selected = [...sameType, ...others].slice(0, 3)

    const styleExamples: StyleExample[] = selected
      .filter(p => p.finalContent && p.finalContent.trim().length > 0)
      .map(p => ({
        title: p.title,
        content: p.finalContent!,
        contentType: p.contentType,
        styleNotes: p.styleNotes ?? undefined,
      }))

    const styleProfile = settings?.styleProfile ?? undefined

    // Streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamLinkedInPost(input, apiKey, styleExamples, styleProfile, model)) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (err) {
          const message = err instanceof Error ? err.message : '생성 중 오류가 발생했습니다.'
          controller.enqueue(encoder.encode(`\n[ERROR] ${message}`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'X-Style-Refs': String(styleExamples.length),
        'X-Model': model,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Generate POST error:', error)
    return NextResponse.json({ error: '생성 요청에 실패했습니다.' }, { status: 500 })
  }
}
