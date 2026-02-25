'use client'

import Image from "next/image"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfigGoogleSheets } from "@/components/config-google-sheets"

interface AppHeaderProps {
  onLogout: () => void
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  return (
    <header className="no-print sticky top-0 z-50 shadow-md" style={{ background: "#0B6B2E" }}>
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0 bg-white flex items-center justify-center"
            style={{ borderColor: "#D4AF37" }}>
            <Image
              src="/logo.png"
              alt="Escudo E.E.S.T. N° 6"
              width={38}
              height={38}
              className="object-cover"
              loading="eager"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-serif font-bold text-white text-sm leading-tight">
              E.E.S.T. N° 6 – Banfield
            </p>
            <p className="text-xs leading-tight" style={{ color: "#D4AF37" }}>
              Sistema de Gestión de Horarios
            </p>
          </div>
        </div>

        {/* Divider line in gold */}
        <div className="hidden md:block flex-1 mx-8">
          <div className="h-px opacity-30" style={{ background: "#D4AF37" }} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ConfigGoogleSheets />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
