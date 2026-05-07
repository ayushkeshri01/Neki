import Link from "next/link";
import { Metadata } from "next";
import { Heart, Users, Trophy, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "About Us - Neki",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                NK
              </div>
              <span className="text-xl font-semibold">Neki</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle variant="outline" />
              <Link 
                href="/login" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We exist to transform workplace giving from occasional to cultural.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mt-8 p-8 rounded-xl bg-card border shadow-sm">
          <p className="text-lg leading-relaxed text-center">
            We believe that <span className="text-primary font-medium">every person has the power to make a difference</span>. 
            But too often, good intentions stay intentions — people want to give back, but don&apos;t know how, 
            don&apos;t have a platform, or don&apos;t see the impact of their contributions.
          </p>
        </div>

        {/* What We Do */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">What We Do</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-xl bg-card border shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Build Community</h3>
              <p className="text-sm text-muted-foreground">
                Join different communities within your organization and collaborate.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Share Your Impact</h3>
              <p className="text-sm text-muted-foreground">
                Post about your social work, donations, and volunteer activities. Inspire others.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Earn Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Earn Good Deed Credits (GDCs) for your contributions and compete on leaderboards.
              </p>
            </div>
          </div>
        </div>

        {/* Our Goal */}
        <div className="mt-12 p-8 rounded-xl bg-primary text-primary-foreground text-center">
          <h2 className="text-2xl font-bold mb-4">Our Goal</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Every organization becomes a community that gives back — not because they have to, 
            but because they want to.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Neki. Making a difference, together.</p>
        </footer>
      </div>
    </div>
  );
}