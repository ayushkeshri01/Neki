"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop py-20 lg:py-32 max-w-container-max mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="lg:w-1/2 flex flex-col items-start gap-8"
      >
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-primary/10 text-primary px-4 py-2 rounded-full font-display text-xs uppercase tracking-widest inline-flex items-center gap-2 border border-primary/20"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Transform Workplace Giving
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1]"
        >
          Do good.<br/>
          <span className="text-primary italic">Create a difference.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed"
        >
          Join Neki, the platform that empowers teams to volunteer, track impact, and climb the corporate leaderboard for social good.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-4 mt-4"
        >
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8 py-7 text-lg font-semibold shadow-premium hover:shadow-premium-hover transition-all group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="rounded-full px-8 py-7 text-lg font-semibold border-border hover:bg-muted transition-all">
              Explore Initiatives
            </Button>
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-8 flex items-center gap-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden relative">
                <Image 
                  src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                  alt="User" 
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-background bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container z-10 relative">
              +2k
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Active changemakers</span>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="lg:w-1/2 relative"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10 animate-pulse"></div>
        <div className="relative rounded-[2rem] overflow-hidden shadow-premium border border-border/20 aspect-[4/3] lg:aspect-square">
          <Image 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
            alt="Team collaborating" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Floating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-premium-hover border border-border/40 flex items-center gap-4 max-w-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Heart className="w-6 h-6 fill-primary" />
          </div>
          <div>
            <div className="font-display font-bold text-sm">Tree Planting</div>
            <div className="text-xs font-semibold text-primary">+50 GDCs Earned</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
