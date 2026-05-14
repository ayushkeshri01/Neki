"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Lock, 
  Database, 
  Eye, 
  ShieldCheck,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const sections = [
    {
      title: "Data Collection",
      content: "Neki collects account profile details, authentication metadata, and community activity (posts, likes, and moderation outcomes) to operate the platform safely.",
      icon: Database,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Usage & Purpose",
      content: "We use this information to provide community features, enforce platform rules, detect abuse, and keep an auditable record of moderation decisions.",
      icon: Eye,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Moderation Records",
      content: "If your account is moderated, we may store notices and audit entries describing the action and reason. These records are retained to support security and compliance.",
      icon: ShieldCheck,
      color: "bg-destructive/10 text-destructive"
    },
    {
      title: "Governance & Security",
      content: "By using Neki, you agree that your data may be processed for account security, fraud prevention, and community governance.",
      icon: Lock,
      color: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-32">
        {/* Header Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Your Data, Protected</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl lg:text-7xl font-black mb-8 leading-tight text-primary"
            >
              Privacy <span className="italic">Policy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground font-medium leading-relaxed"
            >
              At Neki, we are committed to transparency and the security of your information. 
              This policy explains how we handle your data to ensure a safe community experience.
            </motion.p>
          </div>
        </section>

        {/* Content Sections */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group p-12 rounded-[3rem] bg-card border border-border/40 shadow-premium hover:shadow-premium-hover transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <section.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-black mb-4 group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
