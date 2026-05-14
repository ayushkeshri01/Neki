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
    <section className="px-margin-mobile md:px-margin-desktop py-12 lg:py-32 max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="lg:w-1/2 flex flex-col items-start gap-6 lg:gap-8"
      >
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-primary/10 text-primary px-4 py-2 rounded-full font-display text-[10px] sm:text-xs uppercase tracking-widest inline-flex items-center gap-2 border border-primary/20"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Transform Workplace Giving
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight"
        >
          Do good.<br/>
          <span className="text-primary italic">Create a difference.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-base lg:text-xl text-muted-foreground max-w-lg leading-relaxed"
        >
          Join Neki, the platform that empowers teams to volunteer, track impact, and climb the corporate leaderboard for social good.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mt-2 lg:mt-4"
        >
          <Link href={isLoggedIn ? "/feed" : "/login"} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 py-7 text-lg font-semibold shadow-premium hover:shadow-premium-hover transition-all group">
              {isLoggedIn ? "Go to Feed" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/initiatives" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-7 text-lg font-semibold border-border hover:bg-muted transition-all">
              Explore Initiatives
            </Button>
          </Link>
        </motion.div>
        

      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="lg:w-1/2 relative w-full"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10 animate-pulse"></div>
        <div className="relative rounded-[2rem] overflow-hidden shadow-premium border border-border/40 aspect-[4/3] lg:aspect-square">
          <Image 
            src="/landing/tree-planting.png" 
            alt="People planting trees" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Floating Card - Rotating */}
        <div className="absolute -bottom-4 left-4 right-4 sm:right-auto sm:-left-6 h-20 sm:w-64">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-premium-hover border border-border/40 flex items-center gap-4 h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="w-6 h-6 fill-primary/20" />
              </div>
              <div className="overflow-hidden">
                <div className="font-display font-bold text-sm truncate">{currentDeed.title}</div>
                <div className="text-xs font-semibold text-primary">+{currentDeed.points} GDCs Earned</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
