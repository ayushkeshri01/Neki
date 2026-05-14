"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, 
  GraduationCap, 
  HeartPulse, 
  Users2, 
  Star, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featuredInitiative = {
  id: "featured-1",
  title: "Urban Canopy Restoration Project",
  category: "Environment",
  description: "Join our city-wide effort to plant 10,000 trees this quarter. Help us improve air quality, create green spaces, and foster community resilience.",
  image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop",
  points: 500,
  joinedCount: 243,
};

const initialInitiatives = [
  {
    id: "2",
    title: "Tech Literacy for Youth",
    description: "Volunteer 2 hours a week to mentor high school students in basic coding and digital literacy skills.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Local Food Bank Drive",
    description: "Help sort and pack fresh produce for distribution to families facing food insecurity in our immediate community.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Coastal Cleanup Day",
    description: "Join the weekend team to remove plastic waste from local beaches. Equipment and transportation provided.",
    image: "/landing/coastal_cleanup.png",
  },
];

const moreInitiatives = [
  {
    id: "5",
    title: "Senior Companion Program",
    description: "Visit local senior centers to provide companionship and assistance with daily tasks.",
    image: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Animal Shelter Support",
    description: "Help our local animal shelter with walking dogs, cleaning facilities, and socializing animals.",
    image: "/landing/animal_shelter.png",
  },
  {
    id: "7",
    title: "Community Garden Maintenance",
    description: "Help maintain our neighborhood garden. Tasks include weeding, planting, and seasonal harvesting.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2070&auto=format&fit=crop",
  },
];

export function InitiativesContent() {
  const [initiatives, setInitiatives] = useState(initialInitiatives);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const handleLoadMore = () => {
    setInitiatives([...initialInitiatives, ...moreInitiatives]);
    setHasLoadedMore(true);
  };

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-12 space-y-16">
      {/* Header */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 max-w-3xl"
          >
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Discover <span className="text-primary italic">Initiatives</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              Find causes that matter to you and join your colleagues in making a tangible difference. 
              Every action earns Good Deed Credits (GDCs).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Bento Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <Card className="lg:col-span-8 bg-card rounded-[2.5rem] border-border/40 shadow-premium overflow-hidden group cursor-pointer relative min-h-[500px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
            style={{ backgroundImage: `url(${featuredInitiative.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-10 flex flex-col justify-end">
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="text-xs font-black uppercase tracking-widest text-white/80">Featured Initiative</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {featuredInitiative.title}
            </h2>
            <p className="text-lg text-gray-200 font-medium max-w-2xl">
              {featuredInitiative.description}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-4 bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] p-10 border-border/40 shadow-premium flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-start">
              <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Impact Reward</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="font-display text-3xl font-black text-foreground">+{featuredInitiative.points}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GDCs</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-lg mt-8">
                <Users2 className="h-5 w-5" />
                {featuredInitiative.joinedCount} colleagues joined
              </div>
            </div>
          </div>

          <Link href="/login" className="w-full">
            <Button className="w-full bg-primary text-white hover:bg-primary/90 font-black text-sm uppercase tracking-widest py-8 rounded-2xl shadow-xl shadow-primary/20 relative z-10 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Join Initiative <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </motion.section>

      {/* Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-3xl font-black text-foreground">More Ways to <span className="text-primary italic">Impact</span></h3>
          <div className="hidden md:flex gap-2">
             <div className="h-1 w-12 bg-primary rounded-full" />
             <div className="h-1 w-4 bg-primary/20 rounded-full" />
             <div className="h-1 w-4 bg-primary/20 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {initiatives.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group bg-card border-border/40 shadow-premium rounded-[2.5rem] overflow-hidden hover:shadow-premium-hover transition-all duration-500 h-full flex flex-col">
                  <div className="h-56 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <CardContent className="p-8 flex flex-col flex-grow space-y-4">
                    <h4 className="font-display text-2xl font-black group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground font-medium flex-grow leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!hasLoadedMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center pt-8"
          >
            <Button 
              onClick={handleLoadMore}
              variant="outline" 
              className="px-10 py-8 border-border/40 text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-muted/50 transition-all cursor-pointer"
            >
              Load More Initiatives
            </Button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
