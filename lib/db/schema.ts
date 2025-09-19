// lib/db/schema.ts - ACTUALIZADO
import { pgTable, uuid, text, boolean, timestamp, json, unique, integer, index } from 'drizzle-orm/pg-core'
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

// Super Administradores
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

// Páginas/subpáginas de módulos
export const modulePages = pgTable('module_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').references(() => modules.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(), // 'list', 'create', 'edit', 'dashboard'
  displayName: text('display_name').notNull(), // 'Lista', 'Crear', 'Editar'
  routePath: text('route_path').notNull(), // '/booking', '/booking/create'
  description: text('description'),
  icon: text('icon'),
  requiresId: boolean('requires_id').default(false), // true for edit/delete pages
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueModulePage: unique().on(table.moduleId, table.name),
  moduleIdIdx: index('idx_module_pages_module_id').on(table.moduleId),
  routePathIdx: index('idx_module_pages_route_path').on(table.routePath),
}))

// Módulos habilitados por organización (mantener compatibilidad)
export const organizationModules = pgTable('organization_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  moduleId: uuid('module_id').references(() => modules.id),
  isEnabled: boolean('is_enabled').default(true),
  config: json('config'),
  grantedAt: timestamp('granted_at').defaultNow(),
}, (table) => ({
  uniqueOrgModule: unique().on(table.organizationId, table.moduleId)
}))

// Permisos granulares por página de módulo para organizaciones
export const organizationModulePages = pgTable('organization_module_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  modulePageId: uuid('module_page_id').references(() => modulePages.id, { onDelete: 'cascade' }).notNull(),
  canRead: boolean('can_read').default(false),
  canWrite: boolean('can_write').default(false),
  canDelete: boolean('can_delete').default(false),
  grantedAt: timestamp('granted_at').defaultNow(),
  grantedBy: uuid('granted_by').references(() => users.id),
}, (table) => ({
  uniqueOrgModulePage: unique().on(table.organizationId, table.modulePageId),
  orgIdIdx: index('idx_organization_module_pages_org_id').on(table.organizationId),
}))

// Permisos de usuario por página (override organization permissions)
export const userModulePagePermissions = pgTable('user_module_page_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  modulePageId: uuid('module_page_id').references(() => modulePages.id, { onDelete: 'cascade' }).notNull(),
  canRead: boolean('can_read').default(false),
  canWrite: boolean('can_write').default(false),
  canDelete: boolean('can_delete').default(false),
  grantedAt: timestamp('granted_at').defaultNow(),
  grantedBy: uuid('granted_by').references(() => users.id),
}, (table) => ({
  uniqueUserModulePage: unique().on(table.userId, table.modulePageId),
  userIdIdx: index('idx_user_module_page_permissions_user_id').on(table.userId),
}))

// Tabla genérica para datos de cualquier módulo (mantener)
export const moduleData = pgTable('module_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  moduleType: text('module_type').notNull(),
  entityType: text('entity_type').notNull(),
  data: json('data').notNull(),
  status: text('status').default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Logs de auditoría (mantener)
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

// RELACIONES ACTUALIZADAS
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
  userModulePagePermissions: many(userModulePagePermissions),
}))

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  modules: many(organizationModules),
  data: many(moduleData),
  organizationModulePages: many(organizationModulePages),
}))

export const modulesRelations = relations(modules, ({ many }) => ({
  organizations: many(organizationModules),
  pages: many(modulePages),
}))

export const modulePagesRelations = relations(modulePages, ({ one, many }) => ({
  module: one(modules, {
    fields: [modulePages.moduleId],
    references: [modules.id],
  }),
  organizationPages: many(organizationModulePages),
  userPermissions: many(userModulePagePermissions),
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

export const organizationModulePagesRelations = relations(organizationModulePages, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationModulePages.organizationId],
    references: [organizations.id],
  }),
  modulePage: one(modulePages, {
    fields: [organizationModulePages.modulePageId],
    references: [modulePages.id],
  }),
  grantedByUser: one(users, {
    fields: [organizationModulePages.grantedBy],
    references: [users.id],
  }),
}))

export const userModulePagePermissionsRelations = relations(userModulePagePermissions, ({ one }) => ({
  user: one(users, {
    fields: [userModulePagePermissions.userId],
    references: [users.id],
  }),
  modulePage: one(modulePages, {
    fields: [userModulePagePermissions.modulePageId],
    references: [modulePages.id],
  }),
  grantedByUser: one(users, {
    fields: [userModulePagePermissions.grantedBy],
    references: [users.id],
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