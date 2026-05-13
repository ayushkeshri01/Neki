"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Leaf, 
  GraduationCap, 
  HeartPulse, 
  Users2, 
  Star, 
  Trophy, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Categories", icon: null },
  { id: "environment", label: "Environment", icon: Leaf },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "community", label: "Community", icon: Users2 },
];

const featuredInitiative = {
  id: "featured-1",
  title: "Urban Canopy Restoration Project",
  category: "Environment",
  description: "Join our city-wide effort to plant 10,000 trees this quarter. Help us improve air quality, create green spaces, and foster community resilience.",
  image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop",
  points: 500,
  progress: 65,
  joinedCount: 243,
};

const otherInitiatives = [
  {
    id: "2",
    title: "Tech Literacy for Youth",
    category: "Education",
    description: "Volunteer 2 hours a week to mentor high school students in basic coding and digital literacy skills.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop",
    points: 200,
    icon: GraduationCap,
  },
  {
    id: "3",
    title: "Local Food Bank Drive",
    category: "Health",
    description: "Help sort and pack fresh produce for distribution to families facing food insecurity in our immediate community.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
    points: 150,
    icon: HeartPulse,
  },
  {
    id: "4",
    title: "Coastal Cleanup Day",
    category: "Environment",
    description: "Join the weekend team to remove plastic waste from local beaches. Equipment and transportation provided.",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80fafa5?q=80&w=2070&auto=format&fit=crop",
    points: 300,
    icon: Leaf,
  },
];

export function InitiativesContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInitiatives = otherInitiatives.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category.toLowerCase() === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-12 space-y-16">
      {/* Header & Search */}
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
              Every action earns Global Do-Gooder Credits (GDCs).
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full lg:w-96"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                className="pl-12 pr-4 py-6 bg-card border-border/40 rounded-full shadow-premium focus:ring-primary/20 transition-all text-lg"
                placeholder="Search causes or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 border",
                  isActive 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25" 
                    : "bg-card text-muted-foreground border-border/40 hover:border-primary/50 hover:text-foreground shadow-sm"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {cat.label}
              </button>
            );
          })}
        </motion.div>
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
              <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border-none">
                <Star className="h-3 w-3 fill-current mr-1.5 inline" /> Featured
              </Badge>
              <Badge className="bg-white/10 backdrop-blur-xl text-white border-white/20 font-bold text-[10px] uppercase tracking-widest px-4 py-1.5">
                {featuredInitiative.category}
              </Badge>
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
              <h3 className="font-display text-2xl font-black text-foreground">Current Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-muted-foreground">6,500 trees funded</span>
                  <span className="font-display text-2xl font-black text-primary">{featuredInitiative.progress}%</span>
                </div>
                <div className="w-full bg-white dark:bg-black/20 rounded-full h-4 p-1 border border-border/20 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${featuredInitiative.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-primary h-full rounded-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Users2 className="h-4 w-4" />
                {featuredInitiative.joinedCount} colleagues joined
              </div>
            </div>
          </div>

          <Button className="w-full bg-primary text-white hover:bg-primary/90 font-black text-sm uppercase tracking-widest py-8 rounded-2xl shadow-xl shadow-primary/20 relative z-10 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Join Initiative <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
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
            {filteredInitiatives.map((item, i) => (
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
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white/10 backdrop-blur-xl text-white border-white/20 font-bold text-[10px] uppercase tracking-widest px-4 py-1.5">
                        {item.icon && <item.icon className="h-3 w-3 mr-1.5 inline" />} {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-8 flex flex-col flex-grow space-y-4">
                    <h4 className="font-display text-2xl font-black group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground font-medium flex-grow leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-border/40">
                      <div className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10">
                        <Sparkles className="h-4 w-4 text-primary fill-current" />
                        <span className="text-primary font-black text-xs">+{item.points} GDCs</span>
                      </div>
                      <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 p-0">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-8"
        >
          <Button variant="outline" className="px-10 py-8 border-border/40 text-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-muted/50 transition-all">
            Load More Initiatives
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
