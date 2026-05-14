"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function About() {
  return (
    <section className="bg-primary/5 py-24 lg:py-40 px-margin-mobile md:px-margin-desktop overflow-hidden relative">
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 relative"
        >
          <div className="absolute -inset-6 bg-background rounded-[4rem] -z-10 transform rotate-6 scale-95 opacity-50" />
          <div className="relative rounded-[3.5rem] overflow-hidden shadow-premium aspect-[4/5] lg:aspect-square border-8 border-white dark:border-black/40">
            <Image 
              src="/landing/impact.png" 
              alt="Community impact" 
              fill
              className="object-cover"
            />
          </div>
          
          {/* Decorative tag */}
          <div className="absolute top-10 -right-8 bg-primary text-white px-6 py-3 rounded-2xl font-display font-black text-sm shadow-xl rotate-12 hidden sm:block">
            Impact First
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 flex flex-col items-start"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-6"
          >
            Our Mission
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-black mb-10 leading-[0.95] tracking-tighter"
          >
            More than just <br/><span className="text-primary italic">Volunteering.</span>
          </motion.h2>
          
          <div className="space-y-6 lg:space-y-8">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium"
            >
              Neki turns workplace giving into a culture, not just a moment. We believe that when colleagues unite for a cause, they don&apos;t just build a better world—they build a better team.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base lg:text-lg text-muted-foreground leading-relaxed"
            >
              By gamifying volunteerism through our Good Deed Credits (GDCs) system, we make doing good visible, measurable, and deeply rewarding for everyone involved.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full sm:w-auto flex flex-col sm:flex-row gap-5 mt-12"
          >
            <Link href="/about" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto rounded-2xl h-16 px-10 text-lg font-bold shadow-premium hover:shadow-premium-hover">
                Our Story
              </Button>
            </Link>
            <Link href="/user-manual" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto rounded-2xl h-16 px-10 text-lg font-bold text-muted-foreground hover:text-primary hover:bg-primary/5">
                How to Use
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
