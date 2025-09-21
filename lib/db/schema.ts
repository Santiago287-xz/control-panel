// lib/db/schema.ts - SCHEMA PÚBLICO LIMPIO
import { pgTable, uuid, text, boolean, timestamp, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ESQUEMA PÚBLICO - Solo gestión del sistema
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  type: text('type').notNull(),
  domain: text('domain'),
  settings: json('settings'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Solo admins y super admins en público
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  role: text('role').notNull().default('admin'), // solo admin/super_admin
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const superAdmins = pgTable('super_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Catálogo de módulos disponibles
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  icon: text('icon'),
  category: text('category').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// Módulos habilitados por organización (sin datos específicos)
export const organizationModules = pgTable('organization_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  moduleId: uuid('module_id').references(() => modules.id),
  isEnabled: boolean('is_enabled').default(true),
  enabledAt: timestamp('enabled_at').defaultNow(),
})

// RELACIONES
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  superAdmin: one(superAdmins, {
    fields: [users.id],
    references: [superAdmins.userId],
  }),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  admins: many(users),
  modules: many(organizationModules),
}))

export const modulesRelations = relations(modules, ({ many }) => ({
  organizations: many(organizationModules),
}))

export const organizationModulesRelations = relations(organizationModules, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationModules.organizationId],
    references: [organizations.id],
  }),
  module: one(modules, {
    fields: [organizationModules.moduleId],
    references: [modules.id],
  }),
}))