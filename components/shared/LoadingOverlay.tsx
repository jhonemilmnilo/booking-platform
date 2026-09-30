"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getSystemSettingsAction } from "@/app/auth/actions"

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  description?: string
  solid?: boolean
}

export default function LoadingOverlay({
  isVisible,
  title,
  description = "Establishing a secure connection to your sanctuary gateway.",
  solid = false,
}: LoadingOverlayProps) {
  const [dbBrandName, setDbBrandName] = React.useState("")

  React.useEffect(() => {
    // Check if settings are already injected in the window
    interface SettingsWindow { brandName?: string }
    const injected = (window as Window & { __SYSTEM_SETTINGS__?: SettingsWindow }).__SYSTEM_SETTINGS__
    if (injected?.brandName) {
      const cachedName = injected.brandName
      // Defer state update to next microtask to prevent synchronous cascading renders warning
      Promise.resolve().then(() => {
        setDbBrandName(cachedName)
      })
      return
    }

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

  // Resolve the title to display — fall back to fetched brand name or a default
  const displayTitle = title || dbBrandName || "Sanctuary"

  // Ensure "Gateway" moves cleanly to the 2nd line and prevents mid-word breaks
  const formattedTitle = displayTitle.includes("\n")
    ? displayTitle
    : displayTitle === "Establishing Secure Gateway"
      ? "Establishing Secure\nGateway"
      : displayTitle.endsWith(" Gateway")
        ? displayTitle.replace(/ Gateway$/, "\nGateway")
        : displayTitle

  const lines = formattedTitle.split("\n")
  let globalCharIndex = 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-300 ${solid
              ? "bg-[#07080A]"
              : "bg-background/40 backdrop-blur-xl"
            }`}
        >
          {/* Ambient Gold Radial Glow if Solid */}
          {solid && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
          )}

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

          <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl bg-[#0e1015]/90 border border-luxury-gold/25 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-[360px] w-full animate-in fade-in zoom-in-95 duration-300 backdrop-blur-md">
            {/* Luxury Sun & Waves Loader */}
            <div className="relative flex items-center justify-center h-20 w-20">
              {/* Ring of Sanctuary (Slow Spin) */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-luxury-gold/40 animate-[spin_10s_linear_infinite]" />

              {/* Inner Container */}
              <div className="relative flex flex-col items-center justify-center bg-[#07080A] h-16 w-16 rounded-full border border-luxury-gold/30 shadow-inner overflow-hidden">
                {/* The Sun (glowing and pulsing) */}
                <div className="w-5 h-5 rounded-full bg-luxury-gold shadow-[0_0_15px_var(--theme-color-primary,#D4AF37)] animate-pulse mb-1.5" />

                {/* Abstract Ocean Waves */}
                <div className="absolute bottom-2.5 w-full flex flex-col items-center gap-0.5">
                  {/* Wave 1 */}
                  <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-luxury-gold/80 to-transparent rounded-full animate-pulse" />
                  {/* Wave 2 */}
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent rounded-full animate-pulse [animation-delay:0.3s]" />
                </div>
              </div>
            </div>

            {/* Text Container with Luxury Typography */}
            <div className="space-y-2 text-center font-sans max-w-xs">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold flex flex-col items-center justify-center gap-1">
                {lines.map((line, lineIndex) => (
                  <div key={lineIndex} className="flex justify-center items-center flex-wrap gap-x-2">
                    {line.split(" ").filter(Boolean).map((word, wordIndex) => (
                      <span key={wordIndex} className="inline-flex whitespace-nowrap">
                        {word.split("").map((char) => {
                          const currentIndex = globalCharIndex++
                          return (
                            <span
                              key={currentIndex}
                              className="inline-block animate-bounce-char"
                              style={{
                                animationDelay: `${currentIndex * 0.05}s`,
                              }}
                            >
                              {char}
                            </span>
                          )
                        })}
                      </span>
                    ))}
                  </div>
                ))}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 leading-normal">
                {description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

