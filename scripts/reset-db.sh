# scripts/reset-db.sh
#!/bin/bash

echo "🗑️  Limpiando base de datos..."

# Conectar a PostgreSQL y eliminar/recrear la DB
psql -h localhost -U admin -d postgres << EOF
DROP DATABASE IF EXISTS saas_db;
CREATE DATABASE saas_db;
GRANT ALL PRIVILEGES ON DATABASE saas_db TO admin;
EOF

echo "✅ Base de datos recreada"

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
npm run db:generate
npm run db:migrate

# Ejecutar seed
echo "🌱 Sembrando datos..."
npm run db:seed

echo "🎉 Base de datos lista!"