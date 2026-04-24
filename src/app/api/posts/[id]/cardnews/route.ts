import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const SlideSchema = z.object({
  id: z.string(),
  type: z.enum(['cover', 'content', 'closing']),
  title: z.string(),
  body: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  slideNumber: z.number().optional(),
})

const CreateCardNewsSchema = z.object({
  templateId: z.string(),
  slideCount: z.number().int().min(4).max(15),
  slides: z.array(SlideSchema).optional(),
})

const UpdateSlidesSchema = z.object({
  slides: z.array(SlideSchema),
  templateId: z.string().optional(),
  slideCount: z.number().int().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cardNews = await prisma.cardNews.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(
      cardNews.map((cn: typeof cardNews[number]) => ({
        ...cn,
        slides: JSON.parse(cn.slides),
      }))
    )
  } catch (error) {
    console.error('CardNews GET error:', error)
    return NextResponse.json({ error: '카드뉴스를 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = CreateCardNewsSchema.parse(body)

    const cardNews = await prisma.cardNews.create({
      data: {
        postId: id,
        templateId: data.templateId,
        slideCount: data.slideCount,
        slides: JSON.stringify(data.slides ?? []),
      },
    })

    return NextResponse.json(
      { ...cardNews, slides: JSON.parse(cardNews.slides) },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('CardNews POST error:', error)
    return NextResponse.json({ error: '카드뉴스 생성에 실패했습니다.' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = UpdateSlidesSchema.parse(body)

    // 최신 카드뉴스 업데이트
    const existing = await prisma.cardNews.findFirst({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
    })

    if (!existing) {
      return NextResponse.json({ error: '카드뉴스가 없습니다.' }, { status: 404 })
    }

    const updated = await prisma.cardNews.update({
      where: { id: existing.id },
      data: {
        slides: JSON.stringify(data.slides),
        ...(data.templateId && { templateId: data.templateId }),
        ...(data.slideCount && { slideCount: data.slideCount }),
      },
    })

    return NextResponse.json({ ...updated, slides: JSON.parse(updated.slides) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('CardNews PUT error:', error)
    return NextResponse.json({ error: '카드뉴스 수정에 실패했습니다.' }, { status: 500 })
  }
}
