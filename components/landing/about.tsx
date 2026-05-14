"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function About() {
  return (
    <section className="bg-primary/5 py-24 lg:py-32 px-margin-mobile md:px-margin-desktop overflow-hidden">
      <div className="max-w-container-max mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-5/12 relative"
        >
          <div className="absolute -inset-4 bg-background rounded-[2rem] -z-10 transform rotate-3" />
          <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-[4/5]">
            <Image 
              src="/landing/impact.png" 
              alt="Corporate employee helping community" 
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-7/12 flex flex-col items-start"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl lg:text-5xl font-bold mb-8"
          >
            About Neki
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg lg:text-xl text-muted-foreground mb-6 leading-relaxed"
          >
            Neki was born from a simple idea: that the workplace is a powerful engine for social change. We are on a mission to transform corporate giving from a passive annual deduction into an active, engaging, and community-driven movement.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mb-10 leading-relaxed"
          >
            By gamifying volunteerism through our unique Good Deed Credits (GDCs) system, we make doing good visible, measurable, and rewarding. We believe that when colleagues unite for a cause, they don&apos;t just build a better world—they build a better team.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/about">
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                Read Our Full Story
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
