// app/api/org/[orgId]/booking/route.ts  
import { createModuleMiddleware } from '@/lib/auth/middleware'

export const middleware = createModuleMiddleware('booking')

export async function GET() {
  // Tu lógica aquí
}