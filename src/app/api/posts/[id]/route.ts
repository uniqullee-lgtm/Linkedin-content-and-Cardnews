import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CONTENT_TYPES, POST_STATUSES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const UpdatePostSchema = z.object({
  title: z.string().min(1).optional(),
  topic: z.string().min(1).optional(),
  context: z.string().min(1).optional(),
  contentType: z.enum(CONTENT_TYPES).optional(),
  draft: z.string().nullable().optional(),
  finalContent: z.string().nullable().optional(),
  firstComment: z.string().nullable().optional(),
  status: z.enum(POST_STATUSES).optional(),
  seriesId: z.string().nullable().optional(),
  seriesOrder: z.number().int().nullable().optional(),
  scheduledFor: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, name: true, contentType: true } },
        _count: { select: { cardNews: true } },
      },
    })
    if (!post) {
      return NextResponse.json({ error: '포스팅을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('Post GET error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: '포스팅을 불러오지 못했습니다.', detail: msg }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = UpdatePostSchema.parse(body)

    const { tags, scheduledFor, ...postData } = data

    const updateData: Record<string, unknown> = { ...postData }
    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
    }
    if (postData.finalContent !== undefined) {
      updateData.characterCount = postData.finalContent?.length ?? null
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }),
      },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, name: true, contentType: true } },
        _count: { select: { cardNews: true } },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Post PUT error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: '포스팅 수정에 실패했습니다.', detail: msg }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post DELETE error:', error)
    return NextResponse.json({ error: '포스팅 삭제에 실패했습니다.' }, { status: 500 })
  }
}
