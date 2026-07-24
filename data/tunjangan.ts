// Mock data shaped after the `TransportAllowanceSetting`,
// `TransportAllowancePeriod`, and `TransportAllowanceDetail` models in
// prisma/schema.prisma. Static for now — will be replaced by a Prisma query
// once the backend is wired up.

export type TransportAllowanceSetting = {
  id: number
  baseFare: number
  effectiveStart: string
  minKm: number
  maxKm: number
  isActive: boolean
}

export const transportAllowanceSetting: TransportAllowanceSetting = {
  id: 1,
  baseFare: 15000,
  effectiveStart: "2026-01-01",
  minKm: 3,
  maxKm: 30,
  isActive: true,
}

export type TransportPeriodStatus = "draft" | "calculated" | "locked"

export type TransportAllowancePeriod = {
  id: number
  periodYear: number
  periodMonth: number
  totalRecipients: number
  totalAmount: number
  status: TransportPeriodStatus
}

export const transportAllowancePeriods: TransportAllowancePeriod[] = [
  { id: 1, periodYear: 2026, periodMonth: 1, totalRecipients: 121, totalAmount: 1532342000, status: "locked" },
  { id: 2, periodYear: 2026, periodMonth: 2, totalRecipients: 125, totalAmount: 1754321000, status: "locked" },
  { id: 3, periodYear: 2026, periodMonth: 3, totalRecipients: 122, totalAmount: 1536631000, status: "calculated" },
]

export type TransportAllowanceDetail = {
  id: number
  periodId: number
  employeeName: string
  roundedKm: number
  attendanceDays: number
  nominal: number
}

export const transportAllowanceDetails: TransportAllowanceDetail[] = [
  { id: 1, periodId: 1, employeeName: "Ahmad Hermawan", roundedKm: 12, attendanceDays: 22, nominal: 3960000 },
  { id: 2, periodId: 1, employeeName: "Riko Salim", roundedKm: 15, attendanceDays: 20, nominal: 4500000 },
  { id: 3, periodId: 1, employeeName: "Dhea Angela", roundedKm: 9, attendanceDays: 19, nominal: 2565000 },
]
