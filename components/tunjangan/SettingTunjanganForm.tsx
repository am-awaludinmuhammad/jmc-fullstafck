"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Setting = {
  baseFare: number
  effectiveStart: string
  minKm: number
  maxKm: number
}

function formatThousands(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return new Intl.NumberFormat("id-ID").format(Number(digits))
}

export function SettingTunjanganForm({ setting }: { setting: Setting | null }) {
  const router = useRouter()

  const [baseFare, setBaseFare] = useState(setting ? String(setting.baseFare) : "")
  const [effectiveStart, setEffectiveStart] = useState(setting?.effectiveStart ?? "")
  const [minKm, setMinKm] = useState(setting ? String(setting.minKm) : "")
  const [maxKm, setMaxKm] = useState(setting ? String(setting.maxKm) : "")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/tunjangan/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseFare, effectiveStart, minKm, maxKm }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? "Gagal menyimpan data")
        return
      }

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="baseFare">Tarif per Km</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input
                id="baseFare"
                type="text"
                inputMode="numeric"
                className="pl-9"
                value={formatThousands(baseFare)}
                onChange={(e) => setBaseFare(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="effectiveStart">Berlaku Mulai</Label>
            <Input
              id="effectiveStart"
              type="date"
              value={effectiveStart}
              onChange={(e) => setEffectiveStart(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="minKm">Minimum Kilometer</Label>
            <div className="relative">
              <Input
                id="minKm"
                type="number"
                min={0}
                className="pr-9"
                value={minKm}
                onChange={(e) => setMinKm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="maxKm">Maksimum Kilometer</Label>
            <div className="relative">
              <Input
                id="maxKm"
                type="number"
                min={0}
                className="pr-9"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
            </div>
          </div>

          {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
        </div>
        <div className="p-4 border-t flex gap-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  )
}
