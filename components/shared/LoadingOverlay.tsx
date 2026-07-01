"use client"

import * as React from "react"
import { Loader2, Compass } from "lucide-react"

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  description?: string
}

export default function LoadingOverlay({
  isVisible,
  title = "Connecting to Portal",
  description = "Please wait while we secure your connection...",
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border/60 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="relative">
          <Compass className="h-12 w-12 text-primary animate-spin-slow" />
          <Loader2 className="absolute inset-0 h-12 w-12 text-emerald-400 animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
          <p className="text-[11px] font-semibold text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
