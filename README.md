mi problema actual es ejecutar el seed.ts, me dice:

{
  severity_local: 'NOTICE',
  severity: 'NOTICE',
  code: '42P07',
  message: 'relation "courts" already exists, skipping',
  file: 'parse_utilcmd.c',
  line: '207',
  routine: 'transformCreateStmt'
}
📊 Insertando datos de prueba...
❌ Error en seed: TypeError: Cannot read properties of undefined (reading 'length')
    at seedBookingData (F:\Programación\control-panel\lib\db\seed.ts:222:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async seed (F:\Programación\control-panel\lib\db\seed.ts:137:5)


https://claude.ai/chat/68651abb-3037-4239-8f05-dc8b253abe5e

estoy intentado ejecutar:
npm run db:drop
npm run db:generate 
npm run db:migrate
npm run db:seed


empezo a tirar el error de Safab, que es el nombre de usuario del sistema

El problema supuestamente está en lib/db/tenant.ts. Está creando conexiones nuevas sin la configuración explícita