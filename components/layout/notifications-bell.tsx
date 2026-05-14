"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/me/notices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.notices)) {
          const unread = data.notices.filter((n: any) => !n.acknowledgedAt).length;
          setUnreadCount(unread);
          
          // Browser integration
          const title = document.title.replace(/^\(\d+\)\s*/, "");
          if (unread > 0) {
            document.title = `(${unread}) ${title}`;
            if ("setAppBadge" in navigator) {
              (navigator as any).setAppBadge(unread).catch(() => {});
            }
          } else {
            document.title = title;
            if ("clearAppBadge" in navigator) {
              (navigator as any).clearAppBadge().catch(() => {});
            }
          }
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
