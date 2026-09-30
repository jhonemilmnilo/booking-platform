"use client"

export interface SystemSettingsCache {
  brandName?: string
  brandLogo?: string
  socialFacebook?: string
  socialInstagram?: string
  socialTiktok?: string
  socialTwitter?: string
  themeColorPrimary?: string
  themeColorSecondary?: string
  themeColorAccent?: string
  heroSubtitle?: string
  heroTitleLine1?: string
  heroTitleLine2?: string
  heroDescription?: string
  heroVideoUrl?: string
  heroVideoUrlMobile?: string
  touristSpots?: string
  resortLatitude?: string
  resortLongitude?: string
  resortLocationTitleLine1?: string
  resortLocationTitleLine2?: string
  resortLocationDescription?: string
  resortRegion?: string
  resortAmenities?: string
  [key: string]: unknown
}

export interface CachedVideoUrls {
  desktopUrl: string
  mobileUrl: string
}

const SETTINGS_KEY = "sanctuary_settings_cache_v2"
const ROOMS_KEY = "sanctuary_rooms_cache_v2"
const VIDEO_KEY = "sanctuary_video_cache_v2"

export function getClientCachedSettings(): SystemSettingsCache | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.data || null
  } catch {
    return null
  }
}

export function setClientCachedSettings(settings: SystemSettingsCache): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        data: settings,
        timestamp: Date.now(),
      })
    )
  } catch {}
}

export function getClientCachedRooms<T = unknown>(): T[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(ROOMS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.data) && parsed.data.length > 0 ? (parsed.data as T[]) : null
  } catch {
    return null
  }
}

export function setClientCachedRooms(rooms: unknown[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      ROOMS_KEY,
      JSON.stringify({
        data: rooms,
        timestamp: Date.now(),
      })
    )
  } catch {}
}

export function getClientCachedVideoUrls(): CachedVideoUrls | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(VIDEO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.data || null
  } catch {
    return null
  }
}

export function setClientCachedVideoUrls(urls: CachedVideoUrls): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      VIDEO_KEY,
      JSON.stringify({
        data: urls,
        timestamp: Date.now(),
      })
    )
  } catch {}
}
