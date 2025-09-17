import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Configuración explícita para evitar conflictos con variables del sistema
const client = postgres(connectionString, { 
  prepare: false,
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'saas_db'
})
export const db = drizzle(client, { schema })

export type DB = typeof db