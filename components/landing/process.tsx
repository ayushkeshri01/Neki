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
    <section className="py-24 lg:py-40 px-margin-mobile md:px-margin-desktop relative overflow-hidden bg-background">
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-6 text-primary font-bold text-xs uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full border border-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Simple & Rewarding
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter"
          >
            How Neki <span className="text-primary italic">Works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed"
          >
            Empowering your team to make a difference is just four simple steps away.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[25%] left-0 w-full h-0.5 bg-border -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative mb-10 w-full aspect-square max-w-[240px] mx-auto">
                {/* Number Circle */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center font-display font-black text-xl z-20 shadow-lg group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  {i + 1}
                </div>
                
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] rotate-3 transition-transform group-hover:rotate-0 group-hover:bg-primary/10 duration-500" />
                <div className="relative h-full w-full bg-card rounded-[2.5rem] border border-border/40 shadow-premium overflow-hidden transition-all duration-500 group-hover:shadow-premium-hover group-hover:-translate-y-2">
                  <Image 
                    src={step.image} 
                    alt={step.title} 
                    fill 
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="space-y-4 px-4">
                <h3 className="font-display text-2xl font-black group-hover:text-primary transition-colors tracking-tight">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground font-medium leading-relaxed text-sm lg:text-base">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
