import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      has_DATABASE_URL: !!process.env.DATABASE_URL,
      has_ANTHROPIC_KEY: !!process.env.ANTHROPIC_API_KEY,
      DATABASE_URL_prefix: process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@').slice(0, 80) + '...',
    },
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return NextResponse.json({ ...results, error: 'DATABASE_URL not set' }, { status: 500 })
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
  })

  try {
    const client = await pool.connect()
    try {
      const r1 = await client.query('SELECT current_database() as db, current_user as usr, version() as ver')
      results.pg_connection = {
        ok: true,
        db: r1.rows[0].db,
        user: r1.rows[0].usr,
        version: (r1.rows[0].ver as string)?.slice(0, 60),
      }

      const r2 = await client.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      )
      results.tables = r2.rows.map((r: { tablename: string }) => r.tablename)

      const tablesToCheck = ['Post', 'AppSettings', 'PostTag', 'Tag', 'Series', 'CardNews']
      const tableColumns: Record<string, string[]> = {}
      for (const tbl of tablesToCheck) {
        try {
          const rc = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
            [tbl]
          )
          tableColumns[tbl] = rc.rows.map((r: { column_name: string }) => r.column_name)
        } catch (e) {
          tableColumns[tbl] = [`ERROR: ${String(e)}`]
        }
      }
      results.table_columns = tableColumns

      try {
        const r3 = await client.query('SELECT id, "companyName", "anthropicApiKey" FROM "AppSettings" LIMIT 1')
        results.settings_read = { ok: true, rows: r3.rowCount, hasApiKey: !!r3.rows[0]?.anthropicApiKey }
      } catch (e) {
        results.settings_read = { ok: false, error: String(e) }
      }

      try {
        const r4 = await client.query('SELECT id FROM "Post" LIMIT 1')
        results.post_read = { ok: true, rows: r4.rowCount }
      } catch (e) {
        results.post_read = { ok: false, error: String(e) }
      }

      try {
        await client.query('BEGIN')
        await client.query(`
          INSERT INTO "AppSettings" (id, "companyName", "hashtagPresets", "preferredModel", "createdAt", "updatedAt")
          VALUES ('debug-test', '타피루즈그룹', '{}', 'sonnet', NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET "updatedAt" = NOW()
        `)
        await client.query('ROLLBACK')
        results.write_test = { ok: true }
      } catch (e) {
        try { await client.query('ROLLBACK') } catch {}
        results.write_test = { ok: false, error: String(e) }
      }

    } finally {
      client.release()
    }
  } catch (e) {
    results.pg_connection = { ok: false, error: String(e) }
  } finally {
    await pool.end().catch(() => {})
  }

  return NextResponse.json(results)
}
