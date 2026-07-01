"use client"

import Link from "next/link"
import { Compass, Menu, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Compass className="h-6 w-6 text-primary transition-transform group-hover:rotate-45" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Tala <span className="text-secondary">Resort</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#rooms"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Our Rooms
          </Link>
          <Link
            href="#amenities"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Amenities
          </Link>
          <Link
            href="#gallery"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Gallery
          </Link>
        </nav>

        {/* Contact/CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="flex items-center gap-1.5 text-sm">
            <PhoneCall className="h-4 w-4" />
            +63 (917) 123 4567
          </Button>
          <Link href="/auth/login">
            <Button variant="outline">
              Sign In
            </Button>
          </Link>
          <Link href="#rooms">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/95">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg text-foreground hover:bg-muted/30 p-2 cursor-pointer transition-colors outline-none h-9 w-9">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                <Link
                  href="#rooms"
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Rooms
                </Link>
                <Link
                  href="#amenities"
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Amenities
                </Link>
                <Link
                  href="#gallery"
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Gallery
                </Link>
                <div className="flex flex-col gap-4 mt-6 border-t pt-6 border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    +63 (917) 123 4567
                  </span>
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="#rooms" className="w-full">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
