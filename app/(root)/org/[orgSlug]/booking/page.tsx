// app/(root)/org/[orgSlug]/booking/page.tsx
import { BookingDashboard } from "@/components/modules/booking/BookingDashboard"
import { use } from "react"

export default function BookingPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = use(params)
  return <BookingDashboard orgSlug={orgSlug} />
}