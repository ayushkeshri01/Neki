"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Trophy,
  PlusCircle,
  User,
  LogOut,
  Menu,
  Shield,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { motion } from "framer-motion";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/initiatives", label: "Initiatives", icon: Shield },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

interface ProfileIdentityUpdate {
  id: string;
  name: string | null;
  image: string | null;
}

const PROFILE_UPDATED_EVENT = "neki:profile-updated";



export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileIdentity, setProfileIdentity] = useState<ProfileIdentityUpdate | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    function handleProfileUpdate(event: Event) {
      const detail = (event as CustomEvent<ProfileIdentityUpdate>).detail;

      if (!detail?.id || detail.id !== session?.user?.id) {
        return;
      }

      setProfileIdentity(detail);
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener(
        PROFILE_UPDATED_EVENT,
        handleProfileUpdate as EventListener
      );
    };
  }, [session?.user?.id]);

  const displayUser =
    session?.user && profileIdentity?.id === session.user.id
      ? {
          ...session.user,
          name: profileIdentity.name,
          image: profileIdentity.image,
        }
      : session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-margin-desktop max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link 
          href="/feed" 
          className="font-display text-2xl font-extrabold text-primary transition-opacity hover:opacity-80"
        >
          Neki
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex items-center h-full px-1 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {displayUser ? (
            <div className="flex items-center gap-4">
              <NotificationsBell />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative h-10 w-10 rounded-full border border-border/40 overflow-hidden"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={displayUser.image || ""} alt={displayUser.name || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayUser.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayUser.name}</p>
                      <p className="w-48 truncate text-xs text-muted-foreground">
                        {displayUser.email}
                      </p>
                      <p className="text-xs text-primary font-semibold">
                         {displayUser.points} GDCs
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link href="/create-post" className="hidden sm:block">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="rounded-full px-6 font-semibold shadow-premium hover:shadow-premium-hover">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-full px-6">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 shadow-premium hover:shadow-premium-hover">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display text-left">Neki</SheetTitle>
                <SheetDescription className="hidden">Navigation menu for mobile devices.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 pt-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center py-4 px-4 rounded-xl text-lg font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
