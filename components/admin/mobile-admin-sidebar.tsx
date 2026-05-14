"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden rounded-xl border-border/40 hover:bg-muted/50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Admin Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 rounded-r-[2rem] border-r-border/20">
        <SheetHeader className="p-8 border-b border-border/10">
          <SheetTitle className="flex items-center gap-3 font-display text-2xl font-black">
            <Shield className="h-6 w-6 text-primary" />
            Admin Menu
          </SheetTitle>
        </SheetHeader>
        <div className="py-6 px-4">
          <SidebarNav className="pr-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
