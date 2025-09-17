import { pgTable, uuid, text, boolean, timestamp, json, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Tipos TypeScript
export interface OrganizationSettings {
  theme?: string
  logo?: string
  timezone?: string
  features?: string[]
}

// Organizaciones (gimnasios, restaurantes, etc.)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  type: text('type').notNull(), // 'gym', 'restaurant', 'clinic'
  domain: text('domain'), // Subdominio asignado
  dbConnectionString: text('db_connection_string'), // Para DB separada (opcional)
  settings: json('settings').$type<OrganizationSettings>(),
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
  googleId: text('google_id'), // Para OAuth futuro
  organizationId: uuid('organization_id').references(() => organizations.id),
  isOrgAdmin: boolean('is_org_admin').default(false),
  accessToken: text('access_token').unique(),
  tokenExpiry: timestamp('token_expiry'),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Super Administradores del Sistema
export const superAdmins = pgTable('super_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique(),
  level: integer('level').default(1), // 1: básico, 2: avanzado, 3: root
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Módulos disponibles del sistema
export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(), // 'user_management', 'sales', 'courts'
  displayName: text('display_name').notNull(), // 'Gestión de Usuarios'
  description: text('description'),
  icon: text('icon'), // Nombre del icono
  category: text('category').notNull(), // 'core', 'business', 'analytics'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// Permisos por módulo para organizaciones
export const organizationModules = pgTable('organization_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  moduleId: uuid('module_id').references(() => modules.id),
  isEnabled: boolean('is_enabled').default(true),
  config: json('config'), // Configuración específica del módulo
  grantedBy: uuid('granted_by').references(() => users.id), // Super admin que lo otorgó
  grantedAt: timestamp('granted_at').defaultNow(),
})

// Permisos específicos de usuarios en módulos
export const userModulePermissions = pgTable('user_module_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  organizationModuleId: uuid('organization_module_id').references(() => organizationModules.id),
  canRead: boolean('can_read').default(true),
  canWrite: boolean('can_write').default(false),
  canDelete: boolean('can_delete').default(false),
  canManage: boolean('can_manage').default(false), // Gestionar otros usuarios del módulo
  grantedBy: uuid('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at').defaultNow(),
})

// Logs de auditoría completos
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  action: text('action').notNull(), // 'login', 'create_user', 'grant_permission'
  resource: text('resource').notNull(), // 'user', 'organization', 'module'
  resourceId: text('resource_id'), // ID del recurso afectado
  details: json('details'), // Detalles adicionales
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  success: boolean('success').default(true),
  timestamp: timestamp('timestamp').defaultNow(),
})

// Relaciones para Drizzle ORM
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  superAdmin: one(superAdmins, {
    fields: [users.id],
    references: [superAdmins.userId],
  }),
  modulePermissions: many(userModulePermissions),
  auditLogs: many(auditLogs),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  modules: many(organizationModules),
  auditLogs: many(auditLogs),
}))

export const modulesRelations = relations(modules, ({ many }) => ({
  organizations: many(organizationModules),
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
  userPermissions: many(userModulePermissions),
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