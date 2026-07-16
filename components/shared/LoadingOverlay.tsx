"use client"

import * as React from "react"

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  description?: string
}

export default function LoadingOverlay({
  isVisible,
  title = "Establishing Secure Gateway",
  description = "Please wait while we authenticate your sanctuary access...",
}: LoadingOverlayProps) {
  if (!isVisible) return null

  const letters = title.split("")

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/40 backdrop-blur-xl transition-all duration-300">
      {/* Dynamic Keyframes for Luxury Staggered Bounce */}
      <style>{`
        @keyframes luxury-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-char {
          animation: luxury-bounce 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-5 p-8 rounded-3xl bg-card/85 border border-border/80 shadow-[0_0_50px_rgba(212,175,55,0.12)] max-w-[340px] w-full animate-in fade-in zoom-in-95 duration-300">
        
        {/* Luxury Gold Sun & Waves Loader */}
        <div className="relative flex items-center justify-center h-20 w-20">
          {/* Ring of Sanctuary (Slow Spin) */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/30 animate-[spin_10s_linear_infinite]" />
          
          {/* Inner Container */}
          <div className="relative flex flex-col items-center justify-center bg-background/90 h-16 w-16 rounded-full border border-border/60 shadow-inner overflow-hidden">
            {/* The Golden Sun (glowing and pulsing) */}
            <div className="w-5 h-5 rounded-full bg-[#D4AF37] shadow-[0_0_15px_#D4AF37] animate-pulse mb-1.5" />
            
            {/* Abstract Ocean Waves */}
            <div className="absolute bottom-2.5 w-full flex flex-col items-center gap-0.5">
              {/* Wave 1 */}
              <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/75 to-transparent rounded-full animate-pulse" />
              {/* Wave 2 */}
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent rounded-full animate-pulse [animation-delay:0.3s]" />
            </div>
          </div>
        </div>

        {/* Text Container with Luxury Typography */}
        <div className="space-y-1.5 text-center font-sans">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] flex justify-center flex-wrap">
            {letters.map((char, index) => (
              <span
                key={index}
                className="inline-block animate-bounce-char"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  marginRight: char === " " ? "0.4em" : "0",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-normal">{description}</p>
        </div>
      </div>
    </div>
  )
}
