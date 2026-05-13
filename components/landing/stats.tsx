"use client";

import { motion } from "framer-motion";
import { Heart, Building2, Clock } from "lucide-react";

const stats = [
  {
    label: "Good Deeds Done",
    value: "245k+",
    icon: Heart,
    color: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    label: "Companies Joined",
    value: "1,250+",
    icon: Building2,
    color: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    label: "Hours Volunteered",
    value: "75k+",
    icon: Clock,
    color: "bg-primary/10",
    textColor: "text-primary",
  },
];

export function Stats() {
  return (
    <section className="bg-muted/30 py-24 lg:py-32 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl lg:text-5xl font-bold mb-4"
          >
            The Impact We&apos;re Creating Together
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Real numbers from real people making a tangible difference in their communities.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-card rounded-[2.5rem] p-10 shadow-premium border border-border/40 flex flex-col items-center text-center transition-shadow hover:shadow-premium-hover"
            >
              <div className={`w-20 h-20 rounded-2xl ${stat.color} ${stat.textColor} flex items-center justify-center mb-8`}>
                <stat.icon className="w-10 h-10" />
              </div>
              <div className="font-display text-5xl font-extrabold mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
