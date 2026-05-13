"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Sprout, Handshake, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const doodleSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuC3tCWdLvRVzJjTdJFa4wgUnQKzUsh-0GqU0YJFvvza_5ewGo6Xfj6Qtg7zl7QsQd_xB2ovYbXzP1-KUZ_e3fRqgXOj_aZeml6wDIoebtI6YwYIu3MM0OSRLsOLGRaNX_9vlLa2OWjhd93b4YWJt2c81fg0Sn4tE9gO4xlDDl00dSIMxSBfzj8ZN07KV7CVpDQC7qZCkxKJUwXJScojLp6nDj5N3WbC5hW2_SxK8qm1IBucIcMXHG671XG2F69labKGqnif3rokfD0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden pt-12 lg:pt-24 pb-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
            <div className="lg:col-span-6 z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-6 text-primary font-black text-xs uppercase tracking-widest"
              >
                <Sparkles className="h-4 w-4" />
                Our Mission
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl lg:text-8xl font-black mb-8 leading-[1.1] text-primary"
              >
                From Intentions to <span className="text-primary italic">Impact</span>.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-xl font-medium leading-relaxed"
              >
                Transforming workplace giving from an occasional event into a vibrant company culture.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-premium hover:shadow-premium-hover flex items-center gap-2 group">
                    Join the Movement
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="lg:col-span-6 relative h-[400px] lg:h-[600px] w-full"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3 translate-x-6 translate-y-6" />
              <div className="relative z-10 h-full w-full rounded-[3rem] overflow-hidden border border-border/40 shadow-2xl">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6FvEXxupURGRED_HUFpyZUrIe2uit_3CNKewYmdzqYPYhNtpASJ94vGkRIhbhql8XnWgMcuSMrsV8efchySmlXP3-Fq4VJ5jAOSSmpg_2A-qObmAEldhhiiMbgVLesNhChfr9RyQgltfwJwGr4_nWDKKz-Os0_1i0EcFjJNLQ8lH9CKoHsf-V4ZJTKR9RdLRcDH7KGGPsFiRcJ2B8ge3p0At_WM4PjUtki740oyhwwyucLXKFIE7UO4xQ_BhDKKda3OZ-XF96y0c"
                  alt="Neki Team Impact"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Narrative Section */}
        <section className="py-24 relative overflow-hidden bg-primary/[0.02]">
          {/* Decorative Doodle: Heart */}
          <div className="absolute top-10 right-[10%] opacity-10 pointer-events-none w-48 h-48 transform rotate-12 overflow-hidden">
            <Image 
              src={doodleSrc} 
              alt="Heart Doodle" 
              fill
              className="object-contain"
              style={{ clipPath: 'inset(0 0 50% 50%)', scale: '2', transformOrigin: 'top left' }}
            />
          </div>

          <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center relative z-10">
            <motion.div 
              {...fadeIn}
              className="inline-block px-4 py-1 bg-primary/10 rounded-full mb-8"
            >
              <span className="text-xs font-black uppercase tracking-widest text-primary">Our Philosophy</span>
            </motion.div>
            
            <div className="relative py-8">
              {/* Decorative Doodle: Sprout */}
              <div className="absolute -left-12 top-0 opacity-10 w-32 h-32 hidden lg:block overflow-hidden">
                <Image 
                  src={doodleSrc} 
                  alt="Sprout Doodle" 
                  fill
                  className="object-contain"
                  style={{ clipPath: 'inset(0 50% 50% 0)', scale: '2', transformOrigin: 'top right' }}
                />
              </div>
              
              <motion.p 
                {...fadeIn}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl lg:text-6xl font-black text-primary leading-tight mb-12"
              >
                We believe every person has the power to <span className="text-primary italic">make a difference</span>.
              </motion.p>
              
              <motion.p 
                {...fadeIn}
                transition={{ delay: 0.2 }}
                className="text-xl lg:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed"
              >
                But too often, good intentions stay intentions. People want to give back, but they lack the platform or the visibility to see their collective impact. Neki bridges that gap, making social good accessible, engaging, and deeply rooted in everyday work life.
              </motion.p>

              {/* Decorative Doodle: Handshake */}
              <div className="absolute -right-12 bottom-0 opacity-10 w-40 h-40 hidden lg:block overflow-hidden">
                <Image 
                  src={doodleSrc} 
                  alt="Handshake Doodle" 
                  fill
                  className="object-contain"
                  style={{ clipPath: 'inset(50% 0 0 0)', scale: '2', transformOrigin: 'bottom left' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Goal Banner */}
        <section className="w-full">
          <div className="bg-primary text-white py-24 lg:py-40 px-margin-mobile md:px-margin-desktop text-center relative overflow-hidden">
            {/* Background Texture/Doodles */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Image 
                src="/images/landing/doodle.png" 
                alt="Background Texture" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="max-w-container-max mx-auto relative z-10">
              <motion.span 
                {...fadeIn}
                className="text-xs font-black uppercase tracking-widest text-white/60 mb-6 block"
              >
                The Big Vision
              </motion.span>
              <motion.h2 
                {...fadeIn}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl lg:text-7xl font-black mb-10 leading-tight"
              >
                Our Goal: Every organization becomes a community that gives back.
              </motion.h2>
              <motion.p 
                {...fadeIn}
                transition={{ delay: 0.2 }}
                className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto font-medium"
              >
                Not because they have to, but because they want to. Creating a world where corporate social responsibility is part of the collective DNA.
              </motion.p>
            </div>

            {/* Large Decorative Trophy Doodle */}
            <div className="absolute right-[-5%] bottom-[-5%] opacity-20 w-80 h-80 pointer-events-none overflow-hidden">
              <Image 
                src={doodleSrc} 
                alt="Trophy Doodle" 
                fill
                className="object-contain"
                style={{ clipPath: 'inset(70% 0 0 70%)', scale: '3', transformOrigin: 'bottom right' }}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 lg:py-32 text-center bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile relative">
            <motion.h3 
              {...fadeIn}
              className="font-display text-4xl lg:text-6xl font-black text-primary mb-12"
            >
              Ready to transform your culture?
            </motion.h3>
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.1 }}
            >
              <Link href="/register">
                <Button size="lg" className="rounded-full px-12 h-16 text-xl font-bold shadow-premium hover:shadow-premium-hover flex items-center gap-2 mx-auto transition-transform hover:scale-105 active:scale-95 group">
                  Get Started
                  <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/40 bg-card">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-display text-2xl font-black text-primary">Neki</span>
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            © {new Date().getFullYear()} Neki. Making a difference, together.
          </p>
        </div>
      </footer>
    </div>
  );
}