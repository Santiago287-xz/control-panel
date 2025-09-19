// lib/db/schema.ts
import { pgTable, uuid, text, boolean, timestamp, json, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Organizaciones
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

// Usuarios del sistema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  role: text('role').notNull().default('user'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Super Administradores (solo para gestión del sistema)
export const superAdmins = pgTable('super_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Módulos del sistema
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(), // 'booking', 'pos', 'users'
  displayName: text('display_name').notNull(),
  description: text('description'),
  icon: text('icon'),
  category: text('category').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// Módulos habilitados por organización
export const organizationModules = pgTable('organization_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  moduleId: uuid('module_id').references(() => modules.id),
  isEnabled: boolean('is_enabled').default(true),
  config: json('config'), // Configuración específica del módulo
  grantedAt: timestamp('granted_at').defaultNow(),
}, (table) => ({
  uniqueOrgModule: unique().on(table.organizationId, table.moduleId)
}))

// Tabla genérica para datos de cualquier módulo
export const moduleData = pgTable('module_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  moduleType: text('module_type').notNull(), // 'booking', 'pos', 'user', etc.
  entityType: text('entity_type').notNull(), // 'reservation', 'sale', 'customer', etc.
  data: json('data').notNull(),
  status: text('status').default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Logs de auditoría
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  module: text('module').notNull(),
  action: text('action').notNull(),
  resourceId: text('resource_id'),
  details: json('details'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow(),
})

// Relaciones
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  superAdmin: one(superAdmins, {
    fields: [users.id],
    references: [superAdmins.userId],
  }),
  createdData: many(moduleData, { relationName: 'createdBy' }),
  updatedData: many(moduleData, { relationName: 'updatedBy' }),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  modules: many(organizationModules),
  data: many(moduleData),
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

export const moduleDataRelations = relations(moduleData, ({ one }) => ({
  organization: one(organizations, {
    fields: [moduleData.organizationId],
    references: [organizations.id],
  }),
  createdByUser: one(users, {
    fields: [moduleData.createdBy],
    references: [users.id],
    relationName: 'createdBy'
  }),
  updatedByUser: one(users, {
    fields: [moduleData.updatedBy],
    references: [users.id],
    relationName: 'updatedBy'
  }),
}))