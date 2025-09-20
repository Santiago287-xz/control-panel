import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionCache = new Map<string, ReturnType<typeof drizzle>>()

const getPostgresClient = () => postgres('postgresql://admin:admin123@localhost:5432/saas_db', { 
  prepare: false,
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'saas_db'
})

export function getTenantDb(orgSlug: string) {
  if (connectionCache.has(orgSlug)) {
    return connectionCache.get(orgSlug)!
  }

  const client = getPostgresClient()
  const db = drizzle(client, { schema })

  // Configurar esquema usando SQL directo
  client.unsafe(`SET search_path TO "${orgSlug}", public`)
  
  connectionCache.set(orgSlug, db)
  return db
}

export function getPublicDb() {
  return getTenantDb('public')
}

import { db } from './index'
export { db as adminDb }