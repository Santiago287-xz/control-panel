// test-query.ts
import { adminDb } from '@/lib/db/tenant'
import { sql } from 'drizzle-orm'

async function testQuery() {
  const result = await adminDb.execute(sql`SELECT schema_name FROM information_schema.schemata LIMIT 1`)
  console.log('Estructura completa:', result)
  console.log('Tipo de rows:', typeof result.rows)
  console.log('Es array rows?:', Array.isArray(result.rows))
  console.log('Contenido:', result.rows)
}

testQuery()