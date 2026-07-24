import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button-variants"

import { transportAllowanceSetting } from "@/data/tunjangan"

export default function SettingTunjanganTransportPage() {
  return (
    <div className="max-w-xl">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="baseFare">Tarif (Rp)</Label>
            <Input
              id="baseFare"
              type="number"
              min={0}
              className="text-right"
              defaultValue={transportAllowanceSetting.baseFare}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="effectiveStart">Berlaku Mulai</Label>
            <Input
              id="effectiveStart"
              type="date"
              defaultValue={transportAllowanceSetting.effectiveStart}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="minKm">Minimum Kilometer</Label>
            <Input
              id="minKm"
              type="number"
              min={0}
              defaultValue={transportAllowanceSetting.minKm}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="maxKm">Maksimum Kilometer</Label>
            <Input
              id="maxKm"
              type="number"
              min={0}
              defaultValue={transportAllowanceSetting.maxKm}
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button type="button" className={buttonVariants()}>Simpan</button>
          <Link href="/tunjangan/transport" className={buttonVariants({ variant: "outline" })}>
            Kembali
          </Link>
        </div>
      </div>
    </div>
  )
}
