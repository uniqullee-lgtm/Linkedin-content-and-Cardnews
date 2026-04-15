import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SettingsSchema = z.object({
  anthropicApiKey: z.string().optional(),
  companyName: z.string().optional(),
  hashtagPresets: z.record(z.array(z.string())).optional(),
  styleProfile: z.string().optional(),
})

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'singleton' },
    })
    if (!settings) {
      return NextResponse.json({
        companyName: '타피루즈그룹',
        hashtagPresets: {},
        hasApiKey: false,
      })
    }
    return NextResponse.json({
      companyName: settings.companyName,
      hashtagPresets: settings.hashtagPresets ? JSON.parse(settings.hashtagPresets) : {},
      hasApiKey: !!settings.anthropicApiKey,
      styleProfile: settings.styleProfile ?? null,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: '설정을 불러오지 못했습니다.' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const data = SettingsSchema.parse(body)

    const updateData: Record<string, unknown> = {}
    if (data.companyName !== undefined) updateData.companyName = data.companyName
    if (data.anthropicApiKey !== undefined) updateData.anthropicApiKey = data.anthropicApiKey
    if (data.hashtagPresets !== undefined) updateData.hashtagPresets = JSON.stringify(data.hashtagPresets)
    if (data.styleProfile !== undefined) updateData.styleProfile = data.styleProfile

    const settings = await prisma.appSettings.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: {
        id: 'singleton',
        companyName: data.companyName ?? '타피루즈그룹',
        anthropicApiKey: data.anthropicApiKey ?? null,
        hashtagPresets: data.hashtagPresets ? JSON.stringify(data.hashtagPresets) : '{}',
      },
    })

    return NextResponse.json({
      companyName: settings.companyName,
      hashtagPresets: settings.hashtagPresets ? JSON.parse(settings.hashtagPresets) : {},
      hasApiKey: !!settings.anthropicApiKey,
      styleProfile: settings.styleProfile ?? null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 })
  }
}
