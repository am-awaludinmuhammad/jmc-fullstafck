export async function getEmployeeToken() {
  const response = await fetch("/api/employees/auth/token", { method: "POST" })

  if (!response.ok) {
    throw new Error("Gagal mendapatkan akses, silakan login ulang")
  }

  const data = await response.json()
  return data.token as string
}
