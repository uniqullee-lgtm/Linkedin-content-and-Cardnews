import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CONTENT_TYPES, POST_STATUSES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const CreatePostSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  context: z.string().min(1),
  contentType: z.enum(CONTENT_TYPES),
  draft: z.string().optional(),
  finalContent: z.string().optional(),
  firstComment: z.string().optional(),
  status: z.enum(POST_STATUSES).optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.number().int().optional(),
  scheduledFor: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const contentType = searchParams.get('contentType')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const seriesId = searchParams.get('seriesId')

    const where: Record<string, unknown> = {}
    if (contentType) where.contentType = contentType
    if (status) where.status = status
    if (seriesId) where.seriesId = seriesId
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { topic: { contains: search } },
      ]
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, name: true, contentType: true } },
        _count: { select: { cardNews: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts GET error:', error)
    return NextResponse.json({ error: '포스팅 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = CreatePostSchema.parse(body)

    const { tags, scheduledFor, ...postData } = data

    const post = await prisma.post.create({
      data: {
        ...postData,
        status: postData.status ?? 'DRAFT',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        characterCount: postData.finalContent?.length ?? postData.draft?.length ?? null,
        tags: tags && tags.length > 0
          ? {
              create: tags.map(tagName => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, name: true, contentType: true } },
        _count: { select: { cardNews: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Posts POST error:', error)
    return NextResponse.json({ error: '포스팅 생성에 실패했습니다.' }, { status: 500 })
  }
}
