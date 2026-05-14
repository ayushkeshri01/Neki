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
    <section className="bg-muted/30 py-24 lg:py-32 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold mb-4"
          >
            The Impact We&apos;re Creating Together
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Real numbers from real people making a tangible difference in their communities.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statsWithIcons.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-card rounded-[2.5rem] p-8 sm:p-10 shadow-premium border border-border/40 flex flex-col items-center text-center transition-shadow hover:shadow-premium-hover"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${stat.color} ${stat.textColor} flex items-center justify-center mb-6 sm:mb-8`}>
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="font-display text-4xl sm:text-5xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
