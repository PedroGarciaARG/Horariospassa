"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginProps {
  onLogin: (password: string) => boolean
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setTimeout(() => {
      const ok = onLogin(password)
      if (!ok) {
        setError("Contraseña incorrecta. Por favor, intente nuevamente.")
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0B6B2E 0%, #0E8A3A 50%, #1a5c35 100%)" }}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px"
        }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Gold top bar */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #D4AF37, #F0D060, #D4AF37)" }} />

          <div className="p-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 overflow-hidden shadow-lg flex items-center justify-center bg-white"
                style={{ borderColor: "#D4AF37" }}>
                <Image
                  src="/logo.png"
                  alt="Escudo E.E.S.T. N° 6"
                  width={88}
                  height={88}
                  className="object-cover"
                  loading="eager"
                  priority
                />
              </div>
              <div className="text-center">
                <h1 className="font-serif text-2xl font-bold leading-tight text-foreground text-balance">
                  Sistema de Gestión de Horarios
                </h1>
                <p className="text-sm font-medium mt-1" style={{ color: "#0B6B2E" }}>
                  E.E.S.T. N° 6 – Banfield
                </p>
                <div className="mt-2 h-px w-16 mx-auto" style={{ background: "#D4AF37" }} />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Contraseña de acceso
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-border focus:ring-2 focus:ring-primary/30"
                    placeholder="Ingrese la contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !password}
                className="h-11 w-full font-semibold text-base shadow-md transition-all"
                style={{ background: "#0B6B2E", color: "#fff" }}
              >
                {loading ? "Verificando..." : "Ingresar al Sistema"}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-10 pb-6 text-center">
            <p className="text-xs text-muted-foreground">
              Dirección General de Cultura y Educación – Prov. de Buenos Aires
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
