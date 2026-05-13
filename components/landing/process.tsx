"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Join Your Community",
    description: "Sign up with your company email and instantly connect with your colleagues in your exclusive community.",
  },
  {
    number: "02",
    title: "Take Initiative",
    description: "Browse volunteer opportunities, donation drives, and community projects that match your interests.",
  },
  {
    number: "03",
    title: "Share Your Impact",
    description: "Post about your contributions, share photos, and inspire others. Every deed counts towards your impact score.",
  },
  {
    number: "04",
    title: "Earn & Climb",
    description: "Accumulate Good Deed Credits (GDCs) and see your name rise on the leaderboard as a top impact maker.",
  },
];

export function Process() {
  return (
    <section className="py-24 lg:py-32 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 lg:mb-24 gap-8">
          <div className="lg:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-6xl font-bold mb-6"
            >
              How Neki Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Building a culture of impact is easier than you think. Follow these simple steps to start creating a difference today.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block pb-2"
          >
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-primary rounded-full"></div>
              <div className="w-4 h-1 bg-primary/20 rounded-full"></div>
              <div className="w-4 h-1 bg-primary/20 rounded-full"></div>
            </div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="text-8xl font-display font-black text-primary/5 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-bold mb-4 mt-6 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <motion.div 
                className="w-0 h-1 bg-primary mt-8 rounded-full"
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
