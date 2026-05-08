import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  return NextResponse.json({
    ok: true,
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: !!dbUrl,
    dbUrlHint: dbUrl
      ? dbUrl.replace(/:([^:@]+)@/, ':***@').slice(0, 80) + '...'
      : null,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    ts: new Date().toISOString(),
  })
}
