"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const steps = [
  {
    title: "Join Your Community",
    description: "Sign up with your company email and instantly connect with your colleagues in your exclusive community.",
    image: "/images/landing/step1_v2.png",
  },
  {
    title: "Take Initiative",
    description: "Browse volunteer opportunities, impact drives, and community projects that match your interests.",
    image: "/images/landing/step2_v2.png",
  },
  {
    title: "Share Your Impact",
    description: "Post about your contributions, share photos, and inspire others. Every deed counts towards your score.",
    image: "/images/landing/step3_v2.png",
  },
  {
    title: "Earn & Climb",
    description: "Accumulate Good Deed Credits (GDCs) and see your name rise on the leaderboard as a top impact maker.",
    image: "/images/landing/step4_v2.png",
  },
];

export function Process() {
  return (
    <section className="py-24 lg:py-32 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
      {/* Subtle Doodle Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Image 
          src="/images/landing/doodle.png" 
          alt="Doodle Background" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 lg:mb-24 gap-8">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4 text-primary font-black text-xs uppercase tracking-widest"
            >
              <Sparkles className="h-4 w-4" />
              The Journey to Impact
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-7xl font-black mb-6 leading-tight"
            >
              How Neki <span className="text-primary italic">Works</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground font-medium max-w-xl"
            >
              Building a culture of impact is a rewarding adventure. Follow these simple steps to start creating a difference.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block pb-2"
          >
            <div className="flex gap-2 bg-primary/5 p-3 rounded-2xl border border-primary/10">
              <div className="w-12 h-1.5 bg-primary rounded-full"></div>
              <div className="w-4 h-1.5 bg-primary/20 rounded-full"></div>
              <div className="w-4 h-1.5 bg-primary/20 rounded-full"></div>
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-premium hover:shadow-premium-hover transition-all duration-500"
            >
              <div className="relative mb-8 h-44 sm:h-48 w-full">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-6 transition-transform group-hover:rotate-0" />
                <div className="absolute inset-0 bg-white dark:bg-black/20 rounded-3xl border border-border/40 shadow-inner overflow-hidden">
                  <Image 
                    src={step.image} 
                    alt={step.title} 
                    fill 
                    className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-2xl font-black group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                  {step.description}
                </p>
                
                <motion.div 
                  className="w-0 h-1.5 bg-primary rounded-full"
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
