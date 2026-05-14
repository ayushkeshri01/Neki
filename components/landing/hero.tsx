"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, PawPrint, Waves, Soup, Users, Droplets } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

const goodDeeds = [
  { title: "Tree Planting", points: 50, icon: Heart },
  { title: "Animal Rescue", points: 50, icon: PawPrint },
  { title: "Coastal Cleanup", points: 50, icon: Waves },
  { title: "Food Drive", points: 50, icon: Soup },
  { title: "Mentoring", points: 50, icon: Users },
  { title: "Blood Donation", points: 50, icon: Droplets },
];

export function Hero() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % goodDeeds.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentDeed = goodDeeds[currentIndex];
  const Icon = currentDeed.icon;

  return (
    <section className="relative px-margin-mobile md:px-margin-desktop py-16 lg:py-40 max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 overflow-visible">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full -z-10" />

      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="lg:w-1/2 flex flex-col items-start gap-8 lg:gap-10 relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-primary/10 text-primary px-5 py-2.5 rounded-full font-display text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] inline-flex items-center gap-3 border border-primary/20 backdrop-blur-sm"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          Next-Gen Workplace Giving
        </motion.div>
        
        <div className="space-y-4 lg:space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] tracking-[-0.04em]"
          >
            Do good.<br/>
            <span className="text-primary italic relative">
              Inspire change.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-lg lg:text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium"
          >
            Empowering teams to volunteer, track real-world impact, and climb the leaderboard for social good.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-col sm:flex-row w-full sm:w-auto gap-5 mt-4"
        >
          <Link href={isLoggedIn ? "/feed" : "/login"} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-2xl h-16 sm:h-20 px-10 text-xl font-bold shadow-premium hover:shadow-premium-hover transition-all group active:scale-95">
              {isLoggedIn ? "Go to Feed" : "Get Started"}
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1.5" />
            </Button>
          </Link>
          <Link href="/initiatives" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl h-16 sm:h-20 px-10 text-xl font-bold border-2 border-border hover:bg-muted hover:border-primary/20 transition-all active:scale-95">
              Initiatives
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="lg:w-1/2 relative w-full perspective-1000"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[80px] -z-10 opacity-50"></div>
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-[4/3] lg:aspect-[5/6] transform lg:hover:rotate-1 transition-transform duration-700">
          <Image 
            src="/landing/tree-planting.png" 
            alt="Impact in action" 
            fill
            className="object-cover scale-105 hover:scale-100 transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Floating Stat Card */}
        <div className="absolute -bottom-8 -left-4 sm:-left-12 h-24 sm:h-28 w-[90%] sm:w-72 z-20">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-card/80 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-5 h-full"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="overflow-hidden">
                <div className="font-display font-black text-base sm:text-lg truncate tracking-tight">{currentDeed.title}</div>
                <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                  +{currentDeed.points} GDCs
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
