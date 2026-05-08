import { NextResponse } from 'next/server'
import { Pool, type PoolClient } from 'pg'

export const dynamic = 'force-dynamic'

async function run(client: PoolClient, label: string, sql: string, log: string[]) {
  try {
    await client.query(sql)
    log.push(`✓ ${label}`)
    return true
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    log.push(`✗ ${label}: ${msg}`)
    return false
  }
}

export async function GET() {
  const connectionString = process.env.DATABASE_URL
  const dbUrlHint = connectionString
    ? connectionString.replace(/:([^:@]+)@/, ':***@').slice(0, 80) + '...'
    : null

  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL not set', dbUrlHint: null }, { status: 500 })
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 15000,
  })

  const log: string[] = []

  try {
    const client = await pool.connect()
    try {
      // 1. Create tables (idempotent)
      await run(client, 'CREATE TABLE Series', `
        CREATE TABLE IF NOT EXISTS "Series" (
          "id" TEXT NOT NULL, "name" TEXT NOT NULL, "contentType" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
        )`, log)

      await run(client, 'CREATE TABLE Post', `
        CREATE TABLE IF NOT EXISTS "Post" (
          "id" TEXT NOT NULL, "title" TEXT NOT NULL, "topic" TEXT NOT NULL,
          "context" TEXT NOT NULL, "contentType" TEXT NOT NULL,
          "draft" TEXT, "finalContent" TEXT, "firstComment" TEXT,
          "status" TEXT NOT NULL DEFAULT 'DRAFT', "scheduledFor" TIMESTAMP(3),
          "characterCount" INTEGER, "seriesId" TEXT, "seriesOrder" INTEGER,
          "isStyleReference" BOOLEAN NOT NULL DEFAULT false, "styleNotes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
        )`, log)

      await run(client, 'CREATE TABLE Tag', `
        CREATE TABLE IF NOT EXISTS "Tag" (
          "id" TEXT NOT NULL, "name" TEXT NOT NULL,
          CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
        )`, log)

      await run(client, 'CREATE TABLE PostTag', `
        CREATE TABLE IF NOT EXISTS "PostTag" (
          "postId" TEXT NOT NULL, "tagId" TEXT NOT NULL,
          CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
        )`, log)

      await run(client, 'CREATE TABLE CardNews', `
        CREATE TABLE IF NOT EXISTS "CardNews" (
          "id" TEXT NOT NULL, "postId" TEXT NOT NULL, "templateId" TEXT NOT NULL,
          "slideCount" INTEGER NOT NULL DEFAULT 6, "slides" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CardNews_pkey" PRIMARY KEY ("id")
        )`, log)

      await run(client, 'CREATE TABLE AppSettings', `
        CREATE TABLE IF NOT EXISTS "AppSettings" (
          "id" TEXT NOT NULL DEFAULT 'singleton',
          "anthropicApiKey" TEXT, "companyName" TEXT NOT NULL DEFAULT '타피루즈그룹',
          "companyTagline" TEXT NOT NULL DEFAULT 'HRD 컨설팅 전문 기업',
          "hashtagPresets" TEXT NOT NULL DEFAULT '{}', "styleProfile" TEXT,
          "preferredModel" TEXT NOT NULL DEFAULT 'sonnet',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
        )`, log)

      // 2. Indexes
      await run(client, 'CREATE INDEX Tag_name_key', `CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name")`, log)

      // 3. Add DEFAULT CURRENT_TIMESTAMP to updatedAt (fix for NOT NULL without default)
      await run(client, 'ALTER Post.updatedAt DEFAULT', `ALTER TABLE "Post" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`, log)
      await run(client, 'ALTER CardNews.updatedAt DEFAULT', `ALTER TABLE "CardNews" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`, log)
      await run(client, 'ALTER AppSettings.updatedAt DEFAULT', `ALTER TABLE "AppSettings" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`, log)

      // 4. Add missing columns if needed
      await run(client, 'Add Post.isStyleReference if missing', `
        ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isStyleReference" BOOLEAN NOT NULL DEFAULT false`, log)
      await run(client, 'Add Post.styleNotes if missing', `
        ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "styleNotes" TEXT`, log)
      await run(client, 'Add AppSettings.styleProfile if missing', `
        ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "styleProfile" TEXT`, log)
      await run(client, 'Add AppSettings.preferredModel if missing', `
        ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "preferredModel" TEXT NOT NULL DEFAULT 'sonnet'`, log)
      await run(client, 'Add AppSettings.companyTagline if missing', `
        ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "companyTagline" TEXT NOT NULL DEFAULT 'HRD 컨설팅 전문 기업'`, log)

      // 5. Foreign keys (ADD CONSTRAINT IF NOT EXISTS is PostgreSQL 9.5+)
      await run(client, 'FK Post->Series', `
        ALTER TABLE "Post" ADD CONSTRAINT "Post_seriesId_fkey"
        FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE`, log)
      await run(client, 'FK PostTag->Post', `
        ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey"
        FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE`, log)
      await run(client, 'FK PostTag->Tag', `
        ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey"
        FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`, log)
      await run(client, 'FK CardNews->Post', `
        ALTER TABLE "CardNews" ADD CONSTRAINT "CardNews_postId_fkey"
        FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE`, log)

      // 6. Disable RLS
      await run(client, 'DISABLE RLS Post', `ALTER TABLE "Post" DISABLE ROW LEVEL SECURITY`, log)
      await run(client, 'DISABLE RLS Series', `ALTER TABLE "Series" DISABLE ROW LEVEL SECURITY`, log)
      await run(client, 'DISABLE RLS Tag', `ALTER TABLE "Tag" DISABLE ROW LEVEL SECURITY`, log)
      await run(client, 'DISABLE RLS PostTag', `ALTER TABLE "PostTag" DISABLE ROW LEVEL SECURITY`, log)
      await run(client, 'DISABLE RLS CardNews', `ALTER TABLE "CardNews" DISABLE ROW LEVEL SECURITY`, log)
      await run(client, 'DISABLE RLS AppSettings', `ALTER TABLE "AppSettings" DISABLE ROW LEVEL SECURITY`, log)

      // 7. Verify final state
      const r = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
      const tables = r.rows.map((row: { tablename: string }) => row.tablename)
      const required = ['AppSettings', 'CardNews', 'Post', 'PostTag', 'Series', 'Tag']
      const allTablesExist = required.every(t => tables.includes(t))

      // 8. Write test
      let writeOk = false
      try {
        await client.query('BEGIN')
        await client.query(`
          INSERT INTO "AppSettings" (id, "companyName", "hashtagPresets", "preferredModel", "createdAt", "updatedAt")
          VALUES ('setup-test', '타피루즈그룹', '{}', 'sonnet', NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET "updatedAt" = NOW()
        `)
        await client.query('ROLLBACK')
        writeOk = true
        log.push('✓ Write test (ROLLBACK)')
      } catch (e) {
        try { await client.query('ROLLBACK') } catch {}
        log.push(`✗ Write test: ${e instanceof Error ? e.message : String(e)}`)
      }

      return NextResponse.json({ ok: allTablesExist && writeOk, tables, allTablesExist, writeOk, dbUrlHint, log })
    } finally {
      client.release()
    }
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      dbUrlHint,
      log,
    }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
