// lib/db/schema-manager.ts - VERSION 1.1
import { sql } from 'drizzle-orm'
import { adminDb } from './tenant'

export async function createTenantSchema(orgSlug: string, adminData?: {
  email: string;
  name: string;
  hashedPassword: string;
}) {
  try {
    console.log(`🏗️ Creando schema para ${orgSlug}...`)
    
    // 1. Crear schema
    await adminDb.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(orgSlug)}`)
    
    // 2. Crear tablas de usuarios en el schema específico
    await adminDb.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        name text NOT NULL,
        hashed_password text,
        role text NOT NULL DEFAULT 'user',
        phone text,
        is_active boolean DEFAULT true,
        last_login_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        created_by uuid
      )
    `)

    // 3. Crear tabla de permisos en el schema específico
    await adminDb.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.user_permissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES ${sql.identifier(orgSlug)}.users(id) ON DELETE CASCADE,
        module_name text NOT NULL,
        can_read boolean DEFAULT false,
        can_write boolean DEFAULT false,
        can_delete boolean DEFAULT false,
        granted_at timestamp DEFAULT now(),
        granted_by uuid
      )
    `)

    // 4. Crear índices
    await adminDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON ${sql.identifier(orgSlug)}.users(email)
    `)
    await adminDb.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_permissions_user 
      ON ${sql.identifier(orgSlug)}.user_permissions(user_id)
    `)

    // 5. Crear admin inicial si se proporciona
    if (adminData) {
      await adminDb.execute(sql`
        INSERT INTO ${sql.identifier(orgSlug)}.users (email, name, hashed_password, role) 
        VALUES (${adminData.email}, ${adminData.name}, ${adminData.hashedPassword}, 'admin')
        ON CONFLICT (email) DO NOTHING
      `)
      console.log(`✅ Admin tenant creado: ${adminData.email}`)
    }

    console.log(`✅ Schema ${orgSlug} creado correctamente`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Error creando schema ${orgSlug}:`, error)
    throw error
  }
}

export async function enableModuleForTenant(orgSlug: string, moduleName: string) {
  try {
    console.log(`📦 Habilitando módulo ${moduleName} para ${orgSlug}...`)
    
    // Crear tablas según el módulo en el schema específico
    switch (moduleName) {
      case 'booking':
        await createBookingTablesInSchema(orgSlug)
        await seedBookingDataInSchema(orgSlug)
        break
      case 'pos':
        await createPOSTablesInSchema(orgSlug)
        break
      default:
        console.log(`⚠️ Módulo ${moduleName} no tiene tablas específicas`)
    }
    
    console.log(`✅ Módulo ${moduleName} habilitado para ${orgSlug}`)
  } catch (error) {
    console.error(`❌ Error habilitando módulo:`, error)
    throw error
  }
}

// Crear tablas de booking en schema específico
async function createBookingTablesInSchema(orgSlug: string) {
  // Canchas
  await adminDb.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.courts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL,
      is_active boolean DEFAULT true,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now(),
      created_by uuid
    )
  `)

  // Reservas
  await adminDb.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.court_reservations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      court_id uuid NOT NULL REFERENCES ${sql.identifier(orgSlug)}.courts(id) ON DELETE CASCADE,
      name text,
      phone text,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      status text DEFAULT 'confirmed',
      payment_method text DEFAULT 'pending',
      is_recurring boolean DEFAULT false,
      recurrence_end timestamp,
      paid_sessions text,
      payment_notes text,
      created_by uuid,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)

  // Eventos
  await adminDb.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      date timestamp NOT NULL,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      court_ids json NOT NULL,
      created_by uuid,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `)

  // Índices
  await adminDb.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_court_reservations_court_id 
    ON ${sql.identifier(orgSlug)}.court_reservations(court_id)
  `)
  await adminDb.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_court_reservations_start_time 
    ON ${sql.identifier(orgSlug)}.court_reservations(start_time)
  `)
  await adminDb.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_events_date 
    ON ${sql.identifier(orgSlug)}.events(date)
  `)

  console.log(`✅ Tablas de booking creadas en ${orgSlug}`)
}

// Seed de datos de booking
async function seedBookingDataInSchema(orgSlug: string) {
  await adminDb.execute(sql`
    INSERT INTO ${sql.identifier(orgSlug)}.courts (name, type) VALUES 
    ('Cancha Fútbol 1', 'futbol'),
    ('Cancha Fútbol 2', 'futbol'),
    ('Cancha Pádel 1', 'padel'),
    ('Cancha Pádel 2', 'padel')
    ON CONFLICT DO NOTHING
  `)
  console.log(`✅ Datos de booking creados en ${orgSlug}`)
}

// Crear tablas POS en schema específico
async function createPOSTablesInSchema(orgSlug: string) {
  await adminDb.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      price decimal(10,2) NOT NULL,
      sku text UNIQUE,
      stock integer DEFAULT 0,
      is_active boolean DEFAULT true,
      created_at timestamp DEFAULT now()
    )
  `)
  
  await adminDb.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(orgSlug)}.sales (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      items json NOT NULL,
      total decimal(10,2) NOT NULL,
      payment_method text,
      created_by uuid,
      created_at timestamp DEFAULT now()
    )
  `)
  
  console.log(`✅ Tablas POS creadas en ${orgSlug}`)
}

export async function dropTenantSchema(orgSlug: string) {
  try {
    await adminDb.execute(sql`DROP SCHEMA IF EXISTS ${sql.identifier(orgSlug)} CASCADE`)
    console.log(`🗑️ Schema ${orgSlug} eliminado`)
  } catch (error) {
    console.error(`❌ Error eliminando schema:`, error)
    throw error
  }
}