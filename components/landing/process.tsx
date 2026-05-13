"use client";

import { motion } from "framer-motion";
import { UserPlus, Briefcase, Coins, Trophy } from "lucide-react";

const steps = [
  {
    title: "1. Join",
    description: "Sign up with your corporate email and connect with your team.",
    icon: UserPlus,
  },
  {
    title: "2. Participate",
    description: "Discover and join local volunteer initiatives or start your own.",
    icon: Briefcase,
  },
  {
    title: "3. Earn GDCs",
    description: "Log your hours and actions to earn Good Deed Credits (GDCs).",
    icon: Coins,
  },
  {
    title: "4. Climb Leaderboard",
    description: "Compete with colleagues and other companies for top impact honors.",
    icon: Trophy,
  },
];

export function Process() {
  return (
    <section className="py-24 lg:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      <div className="text-center mb-20">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4 block"
        >
          Simple Process
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl lg:text-5xl font-bold"
        >
          How Neki Works
        </motion.h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-[40px] left-[12%] right-[12%] h-[2px] bg-border/40 -z-10" />
        
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 rounded-full bg-background border-4 border-muted shadow-premium flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary transition-all duration-300">
              <step.icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed px-4">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
