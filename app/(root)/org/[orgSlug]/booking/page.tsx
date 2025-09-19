// app/org/[orgSlug]/booking/page.tsx
"use client"
import { useModuleAccess } from "@/lib/hooks/useModuleAccess"

export default function BookingPage() {
  const { canAccess } = useModuleAccess()
  
  if (!canAccess('booking', 'view')) {
    return <div>Sin acceso</div>
  }
  
  return <div>Booking content</div>
}