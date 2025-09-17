import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Conexión para queries
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })

// Conexión para migraciones
export const migrationClient = postgres(connectionString, { max: 1 })