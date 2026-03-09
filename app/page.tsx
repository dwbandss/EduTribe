"use client";

import { useState, useEffect } from 'react';
import { Home, Users, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { TubelightNavbar } from '@/components/ui/tubelight-navbar';
import { HeroSection } from '@/components/ui/hero-section-1';
import TestimonialV2 from '@/components/ui/testimonial-v2';
import Footer from '@/components/ui/footer';
import { tribalEducationImages, tribalSchoolImages, volunteerImages } from '@/data/tribal-images';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = [
    { name: 'Home', url: '#home', icon: Home },
    { name: 'About', url: '#about', icon: BookOpen },
    { name: 'Schools', url: '#schools', icon: Users },
    { name: 'Volunteer', url: '#volunteer', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation
      <TubelightNavbar items={navItems} /> */}

      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* Schools Section */}
      <section id="schools" className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Partner Schools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover tribal schools across India that are part of our educational network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tribalSchoolImages.map((school) => (
              <div key={school.id} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={school.url} 
                  alt={school.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Tribal School {school.id}</h3>
                  <p className="text-muted-foreground text-sm">
                    Empowering tribal communities through quality education
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section id="volunteer" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Become a Volunteer</h2>
              <p className="text-muted-foreground mb-8">
                Join our mission to bring quality education to tribal communities. 
                Your time and skills can make a real difference in the lives of thousands of children.
              </p>
              <div className="space-y-4">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Volunteering
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {volunteerImages.map((volunteer) => (
                <div key={volunteer.id} className="relative rounded-lg overflow-hidden">
                  <img 
                    src={volunteer.url} 
                    alt={volunteer.alt}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">Volunteer Story {volunteer.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <TestimonialV2 />
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Together we're building a brighter future for tribal education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Tribal Schools</div>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Students Reached</div>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2,000+</div>
              <div className="text-muted-foreground">Volunteers</div>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-muted-foreground">Partner NGOs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
