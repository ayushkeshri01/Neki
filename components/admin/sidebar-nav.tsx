"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, FolderTree, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: Shield },
  { href: "/admin/communities", label: "Communities", icon: FolderTree },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

import { motion } from "framer-motion";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-24 space-y-2 pr-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all group",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
