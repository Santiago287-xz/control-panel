// lib/db/tenant.ts - VERSION 1.1
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionCache = new Map<string, ReturnType<typeof drizzle>>()

const getPostgresClient = () => {
  return postgres('postgresql://admin:admin123@localhost:5432/saas_db', { 
    prepare: false,
    user: 'admin',
    password: 'admin123',
    host: 'localhost',
    port: 5432,
    database: 'saas_db'
  })
}

export function getTenantDb(orgSlug: string) {
  if (connectionCache.has(orgSlug)) {
    return connectionCache.get(orgSlug)!
  }

  const client = getPostgresClient()
  const db = drizzle(client, { schema })
  
  connectionCache.set(orgSlug, db)
  return db
}

// DB admin (schema público)
const adminClient = getPostgresClient()
export const adminDb = drizzle(adminClient, { schema })