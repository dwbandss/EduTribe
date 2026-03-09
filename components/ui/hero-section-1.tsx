"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { cn } from "@/lib/utils"

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as const

export function HeroSection() {
  return (
    <>
      <HeroHeader />

      <main className="overflow-hidden">
        <section id="home">
          <div className="relative pt-32 md:pt-40 bg-[radial-gradient(circle_at_top,#e6d7a8,transparent_60%)]">

            {/* soft tribal glow */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-40"
            >
              <div className="absolute left-0 top-0 h-[70rem] w-[35rem] -rotate-45 rounded-full bg-[radial-gradient(60%_60%_at_50%_50%,rgba(141,157,79,0.15),transparent)]"></div>
              <div className="absolute right-0 top-20 h-[70rem] w-[30rem] rotate-45 rounded-full bg-[radial-gradient(60%_60%_at_50%_50%,rgba(141,157,79,0.1),transparent)]"></div>
            </div>

            <div className="mx-auto max-w-7xl px-6">
              <div className="grid lg:grid-cols-2 items-center gap-16">

                {/* LEFT TEXT */}
                <div className="text-center lg:text-left">

                  <AnimatedGroup variants={transitionVariants}>
                    <Link
                      href="#schools"
                      className="hover:bg-background bg-muted group mx-auto lg:mx-0 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md transition-all"
                    >
                      <span className="text-sm">Join 500+ Tribal Schools</span>
                      <ArrowRight className="size-4" />
                    </Link>

                    <h1 className="mt-8 text-5xl md:text-6xl xl:text-[4.5rem] font-bold text-foreground">
                      Empowering Tribal Education
                    </h1>

                    <p className="mt-6 text-lg max-w-xl">
                      Connecting tribal communities, volunteers and NGOs to build
                      a brighter future through quality education.
                    </p>
                  </AnimatedGroup>

                  <AnimatedGroup className="mt-10 flex flex-col lg:flex-row gap-3">
                    <Button asChild size="lg">
                      <Link href="#volunteer">
                        Become a Volunteer
                      </Link>
                    </Button>

                    <Button asChild variant="ghost" size="lg">
                      <Link href="#schools">
                        Explore Schools
                      </Link>
                    </Button>
                  </AnimatedGroup>

                </div>

                {/* RIGHT IMAGE CARD */}
                <div className="hidden lg:flex justify-center">

                  <div className="relative rounded-2xl border bg-card shadow-xl overflow-hidden max-w-lg">

                    <img
                      src="https://abbyindia2012.travellerspoint.com/41/"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* PARTNERS */}
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">

            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                href="#partners"
                className="block text-sm duration-150 hover:opacity-75"
              >
                Meet Our Partners
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-14">

              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex">
                  <img
                    className="mx-auto h-5 w-fit dark:invert"
                    src="https://images.unsplash.com/photo-1560264280-88b6832b1c0?w=100"
                    alt="Partner Logo"
                  />
                </div>
              ))}

            </div>
          </div>
        </section>

      </main>
    </>
  )
}

const menuItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Schools", href: "#schools" },
  { name: "Volunteer", href: "#volunteer" },
]

const HeroHeader = () => {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header>
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/70 max-w-4xl rounded-2xl border backdrop-blur-lg"
          )}
        >
          <div className="flex items-center justify-between py-4">

            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>

            <ul className="hidden lg:flex gap-8 text-sm">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>

              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <BookOpen className="w-5 h-5 text-primary-foreground" />
    </div>
    <span className="font-bold text-xl">EduTribe</span>
  </div>
)