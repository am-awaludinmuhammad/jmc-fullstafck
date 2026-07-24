"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_NAME } from "@/lib/env"

export default function LoginPage() {
  const router = useRouter()

  const [captcha, setCaptcha] = useState("")
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const [loginOtpId, setLoginOtpId] = useState<number | null>(null)
  const [sentTo, setSentTo] = useState("")
  const [otpCode, setOtpCode] = useState("")

  const loadCaptcha = async () => {
    const res = await fetch("/api/auth/captcha")
    const data = await res.json()
    setCaptcha(data.code)
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, captcha: captchaInput }),
    })
    const data = await res.json()
    setPending(false)

    if (!res.ok) {
      setError(data.error)
      setCaptchaInput("")
      loadCaptcha()
      return
    }

    setLoginOtpId(data.loginOtpId)
    setSentTo(data.sentTo)
    setStep("otp")
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginOtpId, code: otpCode, rememberMe }),
    })
    const data = await res.json()
    setPending(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center justify-center">
        <Image src="/logo/logo_jmc_black.png" height={20} width={80} alt="logo" />
        <CardTitle>{APP_NAME}</CardTitle>
      </CardHeader>
      <CardContent>
        {step === "credentials" ? (
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="identifier">Username / Email / No HP</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="captcha">Captcha</Label>
              <div className="flex items-center gap-2">
                <span className="select-none font-mono text-lg tracking-[0.3em] italic bg-muted px-3 py-1.5 rounded-md">
                  {captcha}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={loadCaptcha}>
                  Ganti
                </Button>
              </div>
              <Input
                id="captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="font-normal">Ingat saya</Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Memproses..." : "Login"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Kode OTP sudah dikirim ke {sentTo}. Berlaku 3 menit.
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="otp">Kode OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Memproses..." : "Verifikasi"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep("credentials")}>
              Kembali
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
