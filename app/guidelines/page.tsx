"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  ShieldCheck, 
  MessageSquare, 
  Heart, 
  EyeOff, 
  Zap, 
  Scale,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function GuidelinesPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const guidelines = [
    {
      title: "Be Relevant & Impactful",
      description: "Keep your posts focused on social work, community initiatives, and positive contributions. Share stories that inspire action and highlight collective progress.",
      icon: Zap,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Zero Tolerance for Hate",
      description: "Neki is a safe space. Any form of hatred, discrimination, or religious intolerance is strictly prohibited and will result in immediate account suspension.",
      icon: ShieldCheck,
      color: "bg-destructive/10 text-destructive"
    },
    {
      title: "Respect Privacy",
      description: "Do not post sensitive personal information about yourself or others. Ensure you have consent before sharing photos of colleagues or community members.",
      icon: EyeOff,
      color: "bg-secondary/10 text-secondary"
    },
    {
      title: "Constructive Engagement",
      description: "Communicate with empathy and respect. Disagreements should be handled professionally. Avoid inflammatory language or harassment of any kind.",
      icon: MessageSquare,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Authentic Contributions",
      description: "Share real experiences and genuine initiatives. Spamming, misleading content, or promotional material unrelated to social good is not allowed.",
      icon: Heart,
      color: "bg-accent text-accent-foreground"
    },
    {
      title: "Fair Play",
      description: "Respect the points system and leaderboard. Any attempts to manipulate metrics or 'farm' GDCs through fake engagement will be moderated.",
      icon: Scale,
      color: "bg-muted text-muted-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-32">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Community First</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl lg:text-7xl font-black mb-8 leading-tight text-primary"
            >
              Community <span className="italic">Guidelines</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground font-medium leading-relaxed"
            >
              Neki is built on trust, empathy, and a shared goal of creating impact. 
              These guidelines ensure our platform remains a safe and inspiring space for everyone.
            </motion.p>
          </div>
        </section>

        {/* Guidelines Grid */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guidelines.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[2.5rem] bg-card border border-border/40 shadow-premium hover:shadow-premium-hover transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-black mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Moderation Alert */}
        <section className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop mt-24">
          <motion.div 
            {...fadeIn}
          className="p-12 rounded-[3rem] bg-destructive/5 border border-destructive/10 flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-3xl font-black text-destructive">Moderation Policy</h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-2xl">
              Our moderation team reviews reported content daily. Violating these guidelines may result in content removal, 
              point deduction, or permanent ban from the Neki platform. We reserve the right to act immediately on content 
              that threatens the safety or dignity of our community members.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
