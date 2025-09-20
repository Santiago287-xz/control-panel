// lib/db/booking-tables.ts - CORREGIDO
import { sql } from "drizzle-orm";

export async function createBookingTables(db: any, orgId: string) {
	// Crear canchas
	await db.execute(sql`
    CREATE TABLE IF NOT EXISTS courts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL,
      organization_id uuid NOT NULL,
      is_active boolean DEFAULT true,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

	// Crear reservas
	await db.execute(sql`
    CREATE TABLE IF NOT EXISTS court_reservations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
      name text,
      phone text,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      status text DEFAULT 'confirmed',
      payment_method text DEFAULT 'pending',
      is_recurring boolean DEFAULT false,
      recurrence_end timestamp,
      paid_sessions text,
      last_payment_date timestamp,
      payment_notes text,
      current_account_id uuid,
      organization_id uuid NOT NULL,
      created_by uuid,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

	// Crear eventos
	await db.execute(sql`
    CREATE TABLE IF NOT EXISTS events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      date timestamp NOT NULL,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      court_ids json NOT NULL,
      organization_id uuid NOT NULL,
      created_by uuid,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

	// Índices para rendimiento
	await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_court_reservations_court_id ON court_reservations(court_id)`);
	await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_court_reservations_start_time ON court_reservations(start_time)`);
	await db.execute(
		sql`CREATE INDEX IF NOT EXISTS idx_court_reservations_org_id ON court_reservations(organization_id)`
	);
	await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`);
	await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organization_id)`);
	await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_courts_org_id ON courts(organization_id)`);

	// Insertar canchas de ejemplo usando queries separados
	await db.execute(sql`
      INSERT INTO courts (name, type, organization_id) VALUES 
      ('Cancha Fútbol 1', 'futbol', ${orgId}),
      ('Cancha Fútbol 2', 'futbol', ${orgId}),
      ('Cancha Pádel 1', 'padel', ${orgId}),
      ('Cancha Pádel 2', 'padel', ${orgId})
    `);
	console.log(`✅ Canchas de ejemplo creadas para organización ${orgId}`);

	console.log(`✅ Tablas de booking configuradas para organización ${orgId}`);
}
