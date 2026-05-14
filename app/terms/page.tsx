"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Gavel, 
  UserCheck, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  ArrowLeft,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const sections = [
    {
      title: "Account Responsibilities",
      content: "Neki is a dedicated company community platform. Users must provide accurate account details and maintain the security of their credentials. You are responsible for all activities that occur under your account.",
      icon: UserCheck,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Content & Conduct",
      content: "All contributions must comply with our Community Guidelines and organizational policies. We strictly prohibit harassment, fraud, and the distribution of unauthorized or illegal content.",
      icon: FileCheck,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Moderation Authority",
      content: "Administrators reserve the right to hide, remove, or modify any content. We may also restrict or terminate accounts that violate our terms or pose a risk to the community's integrity.",
      icon: ShieldAlert,
      color: "bg-destructive/10 text-destructive"
    },
    {
      title: "Platform Evolution",
      content: "We continuously improve Neki. Your continued use of the platform indicates acceptance of these terms and any future updates. We will notify users of significant changes to our policies.",
      icon: RefreshCw,
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
              <span className="text-xs font-black uppercase tracking-widest text-primary">Platform Agreement</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl lg:text-7xl font-black mb-8 leading-tight text-primary"
            >
              Terms of <span className="italic">Service</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground font-medium leading-relaxed"
            >
              Please review the rules and expectations for using Neki. 
              These terms govern our relationship and ensure a fair experience for all changemakers.
            </motion.p>
          </div>
        </section>

        {/* Terms Grid */}
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

        {/* Acceptance Section */}
        <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop mt-24 text-center">
          <motion.div 
            {...fadeIn}
            className="p-12 rounded-[3rem] bg-primary/[0.03] border border-primary/10"
          >
            <Gavel className="h-10 w-10 text-primary mx-auto mb-6" />
            <p className="text-muted-foreground font-bold text-lg leading-relaxed mb-10">
              By accessing Neki, you acknowledge that you have read, understood, and agreed to be bound by these terms. 
              Abuse of the platform may result in immediate account termination.
            </p>
            <Link href="/login">
              <Button variant="ghost" className="rounded-full gap-2 font-bold group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
