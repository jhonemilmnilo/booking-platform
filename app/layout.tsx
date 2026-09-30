import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getSystemSettingsAction } from "@/app/auth/actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings;
  try {
    settings = await getSystemSettingsAction();
  } catch {
    settings = {
      brandName: "MIGS THE SHORE",
      brandLogo: "",
      heroDescription: "Nestled along the pristine sands of the coastline, our luxury resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation."
    };
  }

  const brandName = settings.brandName || "MIGS THE SHORE";
  const pageTitle = `${brandName} | Bespoke Luxury Escape`;
  const pageDescription = settings.heroDescription || "Nestled along the pristine sands of the coastline, our luxury resort features sprawling lagoon pools.";
  const themeColorPrimary = settings.themeColorPrimary || "#D4AF37";
  const themeColorSecondary = settings.themeColorSecondary || "#FFFFFF";
  const themeColorAccent = settings.themeColorAccent || "#1C1A17";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/icon" sizes="any" />

        {/* Dynamic theme style overrides */}
        <style
          id="system-theme-variables"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --theme-color-primary: ${themeColorPrimary};
                --theme-color-primary-light: color-mix(in srgb, ${themeColorPrimary} 55%, white);
                --theme-color-primary-dark: color-mix(in srgb, ${themeColorPrimary} 70%, black);
                --theme-color-secondary: ${themeColorSecondary};
                --theme-color-accent: ${themeColorAccent};
                --color-luxury-gold: ${themeColorPrimary};
                --color-luxury-lightGold: color-mix(in srgb, ${themeColorPrimary} 55%, white);
                --color-luxury-darkGold: color-mix(in srgb, ${themeColorPrimary} 70%, black);
                --color-luxury-obsidian: ${themeColorSecondary};
                --color-luxury-charcoal: #F7F5F0;
                --color-luxury-cream: ${themeColorAccent};
                --primary: ${themeColorPrimary};
              }
            `,
          }}
        />

        {/* Pre-hydration script to instantly apply cached theme changes without flash or DOM attribute mismatch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Inject server-side settings for instant client access (no extra network round-trip)
              window.__SYSTEM_SETTINGS__ = ${JSON.stringify(settings)};

              try {
                var isAdminPath = window.location.pathname.indexOf("/admin") === 0;
                if (isAdminPath) {
                  var adminTheme = localStorage.getItem("admin_theme_mode");
                  if (adminTheme === "light") {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.classList.add("light", "admin-light");
                  } else {
                    document.documentElement.classList.remove("light", "admin-light");
                    document.documentElement.classList.add("dark");
                  }
                } else {
                  document.documentElement.classList.remove("dark", "light", "admin-light");
                }

                var raw = localStorage.getItem("sanctuary_settings_cache_v2");
                if (raw) {
                  var data = JSON.parse(raw).data;
                  if (data && data.themeColorPrimary) {
                    var p = data.themeColorPrimary;
                    var s = data.themeColorSecondary || "#FFFFFF";
                    var a = data.themeColorAccent || "#1C1A17";
                    var root = document.documentElement;
                    root.style.setProperty("--theme-color-primary", p);
                    root.style.setProperty("--theme-color-primary-light", "color-mix(in srgb, " + p + " 55%, white)");
                    root.style.setProperty("--theme-color-primary-dark", "color-mix(in srgb, " + p + " 70%, black)");
                    root.style.setProperty("--theme-color-secondary", s);
                    root.style.setProperty("--theme-color-accent", a);
                    root.style.setProperty("--color-luxury-gold", p);
                    root.style.setProperty("--color-luxury-lightGold", "color-mix(in srgb, " + p + " 55%, white)");
                    root.style.setProperty("--color-luxury-darkGold", "color-mix(in srgb, " + p + " 70%, black)");
                    root.style.setProperty("--color-luxury-obsidian", s);
                    root.style.setProperty("--color-luxury-charcoal", "#F7F5F0");
                    root.style.setProperty("--color-luxury-cream", a);
                    root.style.setProperty("--primary", p);
                  }
                }
              } catch(e) {}
            `,
          }}
        />

        {/* Google Fonts: Playfair Display & Montserrat - loaded via link tag for App Router compatibility */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;1,300&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" closeButton />
      </body>
    </html>
  );
}

