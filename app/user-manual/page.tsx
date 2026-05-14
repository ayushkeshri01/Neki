"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Book, CheckCircle2, UserPlus, Heart, Trophy, Users, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UserManualPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: UserPlus,
      steps: [
        "Sign up using your official company email address.",
        "Verify your account through the OTP sent to your inbox.",
        "Complete your profile by adding a picture and a short bio.",
      ]
    },
    {
      title: "How Neki Works",
      icon: Heart,
      steps: [
        "Neki is based on 'Good Deeds'. A good deed can be anything from volunteering at a local shelter to helping a colleague.",
        "Share your impact by creating a post with photos and a description.",
        "Each verified post earns you Good Deed Credits (GDCs).",
      ]
    },
    {
      title: "Communities & Teams",
      icon: Users,
      steps: [
        "Join specific communities based on your department, location, or interests.",
        "Collaborate on community-wide initiatives and donation drives.",
        "Engage with colleagues by liking and commenting on their impact posts.",
      ]
    },
    {
      title: "GDCs & Leaderboard",
      icon: Trophy,
      steps: [
        "GDCs are the platform's currency for social good.",
        "The more impact you share, the higher you climb on the company leaderboard.",
        "Top contributors are recognized with special badges and monthly rewards.",
      ]
    },
    {
      title: "Platform Guidelines",
      icon: Shield,
      steps: [
        "Be authentic: Only post real social work and initiatives.",
        "Be respectful: Maintain a positive and supportive environment for all colleagues.",
        "Privacy: Ensure you have permission before posting photos of others.",
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Book className="w-6 h-6" />
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight">User Manual</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="https://drive.google.com/file/d/1tXUzi8ipSDE3c12BW0PRTAZR8X7IKKwT/view?usp=sharing" target="_blank">
                <Button variant="outline" className="rounded-full border-primary/20 hover:border-primary/50 gap-2 font-bold transition-all">
                  <ExternalLink className="w-4 h-4" />
                  View Document Version
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-12 max-w-2xl"
          >
            Everything you need to know to start making an impact with Neki. Learn how to share your good deeds, earn credits, and climb the leaderboard.
          </motion.p>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/40 shadow-premium overflow-hidden hover:border-primary/20 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 bg-muted/30 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/40">
                        <div className="w-16 h-16 rounded-2xl bg-background shadow-premium-sm flex items-center justify-center text-primary mb-4">
                          <section.icon className="w-8 h-8" />
                        </div>
                        <h2 className="font-display text-xl font-bold">{section.title}</h2>
                      </div>
                      <div className="md:w-2/3 p-8">
                        <ul className="space-y-4">
                          {section.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex gap-4 text-muted-foreground">
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-[2rem] bg-primary text-primary-foreground text-center shadow-premium"
          >
            <h3 className="font-display text-2xl font-bold mb-4">Ready to make a difference?</h3>
            <p className="opacity-90 mb-8 max-w-lg mx-auto">
              Start your journey today and join thousands of colleagues already creating a positive impact.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/feed">
                <button className="bg-background text-primary px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg">
                  Go to Feed
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
