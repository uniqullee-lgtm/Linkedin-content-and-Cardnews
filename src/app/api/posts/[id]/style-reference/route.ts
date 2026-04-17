import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStyleProfile } from '@/lib/claude'

export const dynamic = 'force-dynamic'

/** POST: 스타일 참조 마크 토글 + 프로필 자동 재생성 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { isStyleReference, styleNotes } = body as { isStyleReference: boolean; styleNotes?: string }

    await prisma.post.update({
      where: { id },
      data: { isStyleReference, styleNotes: styleNotes ?? null },
    })

    // 스타일 참조 포스팅이 추가/변경됐으면 프로필 자동 재생성
    if (isStyleReference) {
      const styleRefPosts = await prisma.post.findMany({
        where: { isStyleReference: true, finalContent: { not: null } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { title: true, finalContent: true, contentType: true, styleNotes: true },
      })

      const settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
      const apiKey = process.env.ANTHROPIC_API_KEY || settings?.anthropicApiKey || ''

      if (apiKey && styleRefPosts.length > 0) {
        try {
          const newProfile = await generateStyleProfile(
            styleRefPosts
              .filter(p => p.finalContent && p.finalContent.trim().length > 0)
              .map(p => ({
                title: p.title,
                content: p.finalContent!,
                contentType: p.contentType,
                styleNotes: p.styleNotes ?? undefined,
              })),
            apiKey
          )
          await prisma.appSettings.upsert({
            where: { id: 'singleton' },
            update: { styleProfile: newProfile },
            create: { id: 'singleton', companyName: '타피루즈그룹', styleProfile: newProfile },
          })
        } catch {
          // 프로필 재생성 실패는 무시 (토글 자체는 성공)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Style reference toggle error:', error)
    return NextResponse.json({ error: '스타일 참조 설정에 실패했습니다.' }, { status: 500 })
  }
}
