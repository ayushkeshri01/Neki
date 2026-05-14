"use client";

import { motion } from "framer-motion";
import { Heart, ThumbsUp, Users } from "lucide-react";

interface StatData {
  label: string;
  value: string;
  raw: number;
}

interface StatsProps {
  data?: StatData[];
}

const iconMap = {
  "Good Deeds Shared": Heart,
  "Hearts Touched": ThumbsUp,
  "Volunteers Helping": Users,
};

export function Stats({ data }: StatsProps) {
  const displayStats = data || [
    { label: "Good Deeds Shared", value: "0", raw: 0 },
    { label: "Hearts Touched", value: "0", raw: 0 },
    { label: "Volunteers Helping", value: "0", raw: 0 },
  ];

  const statsWithIcons = displayStats.map((stat) => ({
    ...stat,
    icon: iconMap[stat.label as keyof typeof iconMap] || Heart,
    color: "bg-primary/10",
    textColor: "text-primary",
  }));

  return (
    <section className="bg-muted/30 py-24 lg:py-40 px-margin-mobile md:px-margin-desktop overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            Live Platform Stats
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-black mb-6 tracking-tight"
          >
            Real Impact, <span className="text-primary italic">Real Time.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            Numbers from our global community making a tangible difference every single day.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {statsWithIcons.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-card rounded-[3rem] p-10 lg:p-14 shadow-premium border border-border/40 flex flex-col items-center text-center transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2"
            >
              <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] ${stat.color} ${stat.textColor} flex items-center justify-center mb-8 lg:mb-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="w-10 h-10 lg:w-12 lg:h-12" />
              </div>
              <div className="font-display text-5xl lg:text-7xl font-black mb-3 tracking-tighter tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm lg:text-base font-bold text-muted-foreground uppercase tracking-[0.15em]">
                {stat.label}
              </div>
              
              <div className="mt-8 w-12 h-1 bg-primary/20 rounded-full group-hover:w-24 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
