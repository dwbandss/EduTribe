"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Youtube,
  Facebook,
  Instagram,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const footerConfig = {
  description:
    "EduTribe connects tribal schools, volunteers, NGOs, donors, and students to bring quality education to rural communities. Together we're building a brighter future for tribal education.",
  logo: {
    dark: "https://images.unsplash.com/photo-1577896851231-70ef188817c1?auto=format&fit=crop&w=180&h=50&q=80",
    light: "https://images.unsplash.com/photo-1577896851231-70ef188817c1?auto=format&fit=crop&w=180&h=50&q=80",
  },
  contact: {
    email: "support@edutribe.org",
    phone: "+91 98765 43210",
  },
  socials: [
    { icon: Github, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Instagram, href: "#" },
  ],
  columns: [
    {
      title: "About EduTribe",
      links: [
        { label: "Our Mission", href: "#" },
        { label: "Our Story", href: "#" },
        { label: "Impact", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Our Team", href: "#" },
        { label: "Events", href: "#" },
      ],
    },
    {
      title: "Get Involved",
      links: [
        { label: "Become a Volunteer", href: "#" },
        { label: "Partner Schools", href: "#" },
        { label: "Donate", href: "#" },
        { label: "NGO Partnerships", href: "#" },
        { label: "Corporate Support", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Educational Materials", href: "#" },
        { label: "Teacher Training", href: "#" },
        { label: "School Programs", href: "#" },
        { label: "Success Stories", href: "#" },
        { label: "Research & Reports", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "FAQ", href: "#" },
        { label: "Technical Support", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Code of Conduct", href: "#" },
      ],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background text-foreground px-6 py-14 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Logo and Description */}
        <div className="mb-12">
          {/* Logo with dark/light mode support */}
          <div className="relative mb-6">
            <Image
              src={footerConfig.logo.dark}
              alt="EduTribe Logo"
              width={180}
              height={50}
              className="h-auto w-10 dark:block hidden rounded-lg"
            />
            <Image
              src={footerConfig.logo.light}
              alt="EduTribe Logo"
              width={180}
              height={50}
              className="h-auto w-10 dark:hidden block rounded-lg"
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {footerConfig.description}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
          {/* Left Side: Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 flex-1">
            {footerConfig.columns.map((col, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-medium mb-3 text-foreground">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-[0.85rem] text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Side: Newsletter and Contact */}
          <div className="lg:w-1/4">
            {/* Contact */}
            <Card className="shadow-none border-none mb-4">
              <CardContent className="p-0 space-y-3">
                <p className="text-sm font-medium">For Schools & Partners</p>
                <form className="flex flex-col gap-3">
                  <Button variant="default" type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Partner With Us
                  </Button>
                </form>
              </CardContent>
            </Card>
            {/* Quick Links & Resources */}
            <Card className="shadow-none border-none mb-4">
              <CardContent className="p-0">
                <p className="text-sm font-medium mb-3">
                  Quick Links
                </p>
                <div className="space-y-2">
                  <Link href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Volunteer Portal
                  </Link>
                  <Link href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    School Directory
                  </Link>
                  <Link href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Donation Center
                  </Link>
                  <Link href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Educational Resources
                  </Link>
                  <Link href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Impact Dashboard
                  </Link>
                </div>
                
                {/* Social Links */}
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-sm font-medium mb-2">Follow Us</p>
                  <div className="flex gap-3">
                    {footerConfig.socials.map(({ icon: Icon, href }, idx) => (
                      <Link key={idx} href={href} className="text-muted-foreground hover:text-primary transition-colors">
                        <Icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} EduTribe. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
