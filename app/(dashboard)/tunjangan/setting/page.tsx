import { prisma } from "@/lib/prisma"
import { SettingTunjanganForm } from "@/components/tunjangan/SettingTunjanganForm"

export default async function SettingTunjanganTransportPage() {
  const setting = await prisma.transportAllowanceSetting.findFirst({
    where: { isActive: true },
    orderBy: { effectiveStart: "desc" },
  })

  return (
    <SettingTunjanganForm
      setting={
        setting
          ? {
              baseFare: Number(setting.baseFare),
              effectiveStart: setting.effectiveStart.toISOString().slice(0, 10),
              minKm: Number(setting.minKm),
              maxKm: Number(setting.maxKm),
            }
          : null
      }
    />
  )
}
