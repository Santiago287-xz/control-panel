import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Hardcoded connection
const client = postgres('postgresql://admin:admin123@localhost:5432/saas_db', { 
  prepare: false,
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'saas_db'
})

export const db = drizzle(client, { schema })
export type DB = typeof db