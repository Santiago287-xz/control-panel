import { pgTable, uuid, text, boolean, timestamp, json, integer, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Tipos TypeScript
export interface OrganizationSettings {
  theme?: string
  allowRegistration?: boolean
  maxUsers?: number
  features?: string[]
}

// Organizaciones
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  type: text('type').notNull(), // 'gym', 'restaurant', 'clinic'
  domain: text('domain'),
  dbConnectionString: text('db_connection_string'),
  settings: json('settings').$type<OrganizationSettings>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Usuarios
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: text('name').notNull(),
  hashedPassword: text('hashed_password'),
  googleId: text('google_id'),
  organizationId: uuid('organization_id'),
  isOrgAdmin: boolean('is_org_admin').default(false),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry'),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Super Administradores
export const superAdmins = pgTable('super_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull(),
  level: integer('level').default(1), // 1: básico, 2: avanzado, 3: root
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Módulos
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  icon: text('icon'),
  category: text('category').notNull(), // 'core', 'business', 'analytics'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Permisos por módulo para organizaciones
export const organizationModules = pgTable('organization_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  moduleId: uuid('module_id').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  config: json('config'),
  grantedBy: uuid('granted_by').notNull(),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
})

// Permisos de usuarios en módulos
export const userModulePermissions = pgTable('user_module_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  organizationModuleId: uuid('organization_module_id').notNull(),
  canRead: boolean('can_read').default(true),
  canWrite: boolean('can_write').default(false),
  canDelete: boolean('can_delete').default(false),
  canManage: boolean('can_manage').default(false),
  grantedBy: uuid('granted_by').notNull(),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
})

// Logs de auditoría
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  organizationId: uuid('organization_id'),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  details: json('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  success: boolean('success').default(true),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

// Relaciones
export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users: many(users),
  organizationModules: many(organizationModules),
  auditLogs: many(auditLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  superAdmin: one(superAdmins, {
    fields: [users.id],
    references: [superAdmins.userId],
  }),
  userModulePermissions: many(userModulePermissions),
  auditLogs: many(auditLogs),
}))

export const superAdminsRelations = relations(superAdmins, ({ one }) => ({
  user: one(users, {
    fields: [superAdmins.userId],
    references: [users.id],
  }),
}))

export const modulesRelations = relations(modules, ({ many }) => ({
  organizationModules: many(organizationModules),
}))

export const organizationModulesRelations = relations(organizationModules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [organizationModules.organizationId],
    references: [organizations.id],
  }),
  module: one(modules, {
    fields: [organizationModules.moduleId],
    references: [modules.id],
  }),
  userModulePermissions: many(userModulePermissions),
}))

export const userModulePermissionsRelations = relations(userModulePermissions, ({ one }) => ({
  user: one(users, {
    fields: [userModulePermissions.userId],
    references: [users.id],
  }),
  organizationModule: one(organizationModules, {
    fields: [userModulePermissions.organizationModuleId],
    references: [organizationModules.id],
  }),
}))