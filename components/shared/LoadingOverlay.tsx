"use client"

import * as React from "react"
import { getSystemSettingsAction } from "@/app/auth/actions"

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  description?: string
}

export default function LoadingOverlay({
  isVisible,
  title,
  description = "Establishing a secure connection to your sanctuary gateway.",
}: LoadingOverlayProps) {
  const [dbBrandName, setDbBrandName] = React.useState(() => {
    if (typeof window !== "undefined" && (window as any).__BRAND_NAME__) {
      return (window as any).__BRAND_NAME__
    }
    return ""
  })

  React.useEffect(() => {
    if (title || dbBrandName) return

    let isMounted = true
    getSystemSettingsAction()
      .then((settings) => {
        if (isMounted && settings?.brandName) {
          setDbBrandName(settings.brandName)
        }
      })
      .catch((err) => {
        console.error("[LoadingOverlay] Failed to fetch brand name from database:", err)
      })

    return () => {
      isMounted = false
    }
  }, [title, dbBrandName])

  if (!isVisible) return null

  const displayTitle = title || dbBrandName || "OceanHilling"
  const letters = displayTitle.split("")

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-2xl transition-all duration-500 ease-in-out">
      {/* Premium Keyframes for Luxury Organic Motion */}
      <style>{`
        @keyframes sanctuary-breath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.35;
          }
        }
        @keyframes sun-glow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.4));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.8));
          }
        }
        @keyframes text-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-sanctuary-breath {
          animation: sanctuary-breath 4s ease-in-out infinite;
        }
        .animate-sun-glow {
          animation: sun-glow 3s ease-in-out infinite;
        }
        .animate-letter-flow {
          animation: text-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="flex flex-col items-center gap-7 p-10 rounded-[2rem] bg-card/70 border border-border/40 shadow-[0_24px_64px_rgba(30,63,32,0.06)] max-w-[400px] w-full animate-in fade-in zoom-in-95 duration-500">
        
        {/* Animated Sanctuary Emblem */}
        <div className="relative flex items-center justify-center h-28 w-28">
          {/* Outer Breathing Circle (Forest Theme) */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-sanctuary-breath" />
          
          {/* Middle Slow Spinning Dashed Ring (Sanctuary Orbit) */}
          <div className="absolute inset-2 rounded-full border border-dashed border-[#D4AF37]/25 animate-[spin_20s_linear_infinite]" />
          
          {/* Fast Reverse Ring (Ocean Ripple Effect) */}
          <div className="absolute inset-4 rounded-full border-t-2 border-r border-transparent border-t-secondary/60 border-r-secondary/20 animate-[spin_2.5s_linear_infinite_reverse]" />

          {/* Forward Ring (Light Shore Wave Ripple) */}
          <div className="absolute inset-6 rounded-full border-b-2 border-l border-transparent border-b-[#D4AF37]/50 border-l-[#D4AF37]/10 animate-[spin_3s_linear_infinite]" />
          
          {/* Inner Golden Sun Pearl (Centerpiece) */}
          <div className="relative flex items-center justify-center bg-background h-12 w-12 rounded-full border border-border/80 shadow-md">
            <div className="w-4 h-4 rounded-full bg-gold-gradient animate-sun-glow" />
          </div>
        </div>

        {/* Text Container with Luxury Typography */}
        <div className="space-y-3.5 text-center">
          <h3 className="font-serif text-sm font-semibold tracking-[0.15em] text-gold-gradient flex justify-center flex-wrap min-h-[1.5rem]">
            {letters.map((char: string, index: number) => (
              <span
                key={index}
                className="inline-block opacity-0 animate-letter-flow"
                style={{
                  animationDelay: `${index * 0.03}s`,
                  marginRight: char === " " ? "0.35em" : "0",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h3>
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80 leading-relaxed max-w-[280px] mx-auto">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

