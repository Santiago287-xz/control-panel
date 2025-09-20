-------- Todo

layout global en [orgSlug] 🟢
limpieza tablas innecesarias 🟡
limpiar hooks(hay 400 versiones que hacen lo mismo)
cuando se crean las organizaciones se tiene que crear un schema
cuando se activa un modulo se tienen que crear las tablas correspondientes
migrar booking y probar schemas funcionales
crear usuarios roles, dentro de cada organizacion

-------- Aclaracion

Parece que actualmente funcionan los tenant, se puede ver el https://local.drizzle.studio/
seleccionado el schema correspondiente, pero no hay ningun dato... ni usuarios, todavia
no hay nada integrado...

-------- Comandos

# Parar contenedor
docker stop saas_postgres

# Eliminar contenedor y volumen
docker rm saas_postgres
docker volume rm control-panel_postgres_data

# Recrear desde cero
docker-compose up -d

# Ver tablas
docker exec saas_postgres psql -U admin -d saas_db -c "\dt"

--------

Prompt:

Contexto del Sistema: Estoy desarrollando un sistema SaaS multi-tenant que permite a diferentes organizaciones (gimnasios, spas, clínicas, etc.) gestionar sus operaciones mediante módulos dinámicos. El sistema tiene una arquitectura modular donde los desarrolladores pueden crear nuevos módulos simplemente agregando carpetas de código, sin modificar la base. Arquitectura Actual: El sistema tiene tres niveles de usuarios:  Super Administradores: Gestionan el sistema completo, registran módulos disponibles y los asignan a organizaciones  Administradores de Organización: Gestionan su organización específica * Usuarios Finales: Utilizan los módulos según sus permisos. Todo el codigo enviado en caso de 
ser una modificación NO CAMBIAR NOMBRES, no utilizar librerias a no ser de necesario completamente, mantener la simpleza.

Se utiliza RLS para la db