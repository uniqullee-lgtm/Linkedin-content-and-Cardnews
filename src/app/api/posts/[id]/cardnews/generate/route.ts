import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generatePptx } from '@/lib/pptx/generator'

const SlideSchema = z.object({
  id: z.string(),
  type: z.enum(['cover', 'content', 'closing']),
  title: z.string(),
  body: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  slideNumber: z.number().optional(),
})

const GenerateSchema = z.object({
  templateId: z.string(),
  slideCount: z.number().int().min(4).max(8),
  slides: z.array(SlideSchema).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = GenerateSchema.parse(body)

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: '포스팅을 찾을 수 없습니다.' }, { status: 404 })
    }

    const settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
    const companyName = settings?.companyName ?? '타피루즈그룹'

    const postContent = post.finalContent ?? post.draft ?? ''

    const buffer = await generatePptx({
      templateId: data.templateId as Parameters<typeof generatePptx>[0]['templateId'],
      slideCount: data.slideCount as 4 | 6 | 8,
      slides: data.slides,
      postContent,
      companyName,
      title: post.title,
    })

    // 슬라이드 DB 저장 (편집 상태 유지)
    if (data.slides && data.slides.length > 0) {
      const existing = await prisma.cardNews.findFirst({
        where: { postId: id },
        orderBy: { createdAt: 'desc' },
      })
      if (existing) {
        await prisma.cardNews.update({
          where: { id: existing.id },
          data: { slides: JSON.stringify(data.slides) },
        })
      }
    }

    const filename = `${post.title.replace(/[^가-힣a-zA-Z0-9]/g, '_').slice(0, 30)}_cardnews.pptx`

    // Buffer → Uint8Array (BodyInit 호환)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('CardNews generate error:', error)
    return NextResponse.json({ error: 'PPT 생성에 실패했습니다.' }, { status: 500 })
  }
}
