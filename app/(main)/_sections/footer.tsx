"use client"

import * as React from "react"

interface FooterProps {
  brandName: string;
  brandLogo: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  socialTwitter: string;
}

export default function Footer({
  brandName,
  brandLogo,
  socialFacebook,
  socialInstagram,
  socialTiktok,
  socialTwitter,
}: FooterProps) {
  return (
    <footer className="bg-luxury-obsidian border-t border-luxury-gold/15 py-16 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogo}
                alt="Logo"
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <svg className="w-8 h-8 text-luxury-gold" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" strokeWidth="2" />
                <circle cx="50" cy="48" r="8" fill="#D4AF37" />
              </svg>
            )}
            <span className="font-serif text-lg tracking-[0.2em] text-luxury-cream uppercase font-semibold">
              {brandName.split(" ")[0]} <span className="text-luxury-gold">{brandName.split(" ").slice(1).join(" ")}</span>
            </span>
          </div>
          <p className="text-luxury-cream/50 text-xs leading-relaxed max-w-xs">
            Representing the finest beachfront resort suites, private sandy bays, and exclusive retreat properties globally. Crafted with golden luxury and premium hospitality.
          </p>
          <div className="flex gap-4 text-luxury-gold text-lg">
            <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href={socialTiktok} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">
              <i className="fa-brands fa-tiktok"></i>
            </a>
            <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">
              <i className="fa-brands fa-twitter"></i>
            </a>
          </div>
        </div>

        {/* exploration */}
        <div className="space-y-4">
          <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">The Portfolio</h4>
          <ul className="space-y-2 text-xs text-luxury-cream/60">
            <li>
              <a href="#about" className="hover:text-luxury-gold transition-colors">Resort Story</a>
            </li>
            <li>
              <a href="#villas" className="hover:text-luxury-gold transition-colors">Suites & Villas</a>
            </li>
            <li>
              <a href="#amenities" className="hover:text-luxury-gold transition-colors">Amenities</a>
            </li>
            <li>
              <a href="#campaign" className="hover:text-luxury-gold transition-colors">Cinematic Showcase</a>
            </li>
          </ul>
        </div>

        {/* locations */}
        <div className="space-y-4">
          <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">Resorts & Terraces</h4>
          <ul className="space-y-2 text-xs text-luxury-cream/60">
            <li>Mykonos, Greece</li>
            <li>Amalfi Coast, Italy</li>
            <li>Monaco Harbor Terraces</li>
            <li>Riviera Golden Heights</li>
          </ul>
        </div>

        {/* Secure channels */}
        <div className="space-y-4">
          <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">Guest Relations Office</h4>
          <div className="text-xs text-luxury-cream/60 space-y-2">
            <p>
              <i className="fa-solid fa-envelope text-luxury-gold mr-1"></i> relations@oceanhillresort.com
            </p>
            <p>
              <i className="fa-solid fa-phone-volume text-luxury-gold mr-1"></i> +30 210 555 9821
            </p>
            <p className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-semibold mt-4">
              <i className="fa-solid fa-headset"></i> 24/7 Dedicated Guest Relations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-luxury-gold/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-luxury-cream/40">
        <span>&copy; {new Date().getFullYear()} Ocean Hill Resort Group S.A. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-luxury-gold">Privacy Directives</a>
          <a href="#" className="hover:text-luxury-gold">VIP Disclosures</a>
          <a href="#" className="hover:text-luxury-gold">Lobbyists Registration</a>
        </div>
      </div>
    </footer>
  )
}
