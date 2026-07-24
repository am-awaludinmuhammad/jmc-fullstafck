// Reference/master data — shaped after the `Position`, `Department`, `Province`,
// `Regency`, `District` models in prisma/schema.prisma. Static for now; will be
// swapped for real queries once the backend is wired up.

export type PositionType = "manager" | "staf" | "magang"

export const positions = [
  { id: 1, code: "PRG", name: "Programmer", positionType: "staf" as PositionType },
  { id: 2, code: "SAN", name: "System Analyst", positionType: "staf" as PositionType },
  { id: 3, code: "AKT", name: "Akuntan", positionType: "staf" as PositionType },
  { id: 4, code: "MGR-PRD", name: "Manager Produksi", positionType: "manager" as PositionType },
  { id: 5, code: "MGR", name: "Manager", positionType: "manager" as PositionType },
]

export const departments = [
  { id: 1, code: "PRD", name: "Produksi" },
  { id: 2, code: "MKT", name: "Marketing" },
  { id: 3, code: "FIN", name: "Finance" },
]

export const provinces = [
  { id: 1, code: "34", name: "D.I. Yogyakarta" },
  { id: 2, code: "33", name: "Jawa Tengah" },
  { id: 3, code: "35", name: "Jawa Timur" },
  { id: 4, code: "32", name: "Jawa Barat" },
  { id: 5, code: "31", name: "DKI Jakarta" },
]

export const regencies = [
  { id: 1, provinceId: 1, code: "3402", name: "Bantul" },
  { id: 2, provinceId: 1, code: "3404", name: "Sleman" },
  { id: 3, provinceId: 1, code: "3403", name: "Gunung Kidul" },
  { id: 4, provinceId: 1, code: "3401", name: "Kulon Progo" },
  { id: 5, provinceId: 1, code: "3471", name: "Yogyakarta" },
]

export const districts = [
  { id: 1, regencyId: 5, code: "347101", name: "Danurejan" },
  { id: 2, regencyId: 5, code: "347102", name: "Gedongtengen" },
  { id: 3, regencyId: 5, code: "347103", name: "Gondokusuman" },
  { id: 4, regencyId: 5, code: "347104", name: "Jetis" },
  { id: 5, regencyId: 1, code: "340201", name: "Kasihan" },
]
