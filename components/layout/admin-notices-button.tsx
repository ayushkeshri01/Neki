"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminNotice {
  id: string;
  title: string;
  body: string;
  noticeType: string;
  createdAt: string;
  acknowledgedAt: string | null;
}

export function AdminNoticesButton() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/me/notices");
      const data = await res.json();
      if (Array.isArray(data.notices)) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error("Failed to fetch admin notices:", err);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices();
  }, [fetchNotices]);

  const activeNotice = notices[0];

  async function acknowledgeNotice(noticeId: string) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds: [noticeId] }),
      });

      if (!res.ok) throw new Error();
      const now = new Date().toISOString();
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? { ...n, acknowledgedAt: now } : n))
      );
      // Re-fetch to ensure sync
      fetchNotices();
    } catch {
      toast.error("Failed to acknowledge");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function acknowledgeAllNotices() {
    const unreadNotices = notices.filter(n => !n.acknowledgedAt);
    if (isSubmitting || unreadNotices.length === 0) return;
    setIsSubmitting(true);

    try {
      const noticeIds = unreadNotices.map((n) => n.id);
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds }),
      });

      if (!res.ok) throw new Error();
      
      const now = new Date().toISOString();
      setNotices((prev) => 
        prev.map((n) => 
          noticeIds.includes(n.id) ? { ...n, acknowledgedAt: now } : n
        )
      );
      // Re-fetch to ensure sync
      fetchNotices();
    } catch {
      toast.error("Failed to acknowledge");
    } finally {
      setIsSubmitting(false);
    }
  }

  const unreadCount = notices.filter(n => !n.acknowledgedAt).length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative ml-2"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeNotice?.title || "Notifications"}
            </DialogTitle>
            <DialogDescription>
              {activeNotice?.body || "You have new notifications"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={cn(
                  "rounded-lg border p-3 text-sm transition-colors",
                  !notice.acknowledgedAt ? "bg-primary/5 border-primary/50" : "opacity-70"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{notice.title}</p>
                  {!notice.acknowledgedAt && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{notice.body}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={acknowledgeAllNotices}
              disabled={isSubmitting || unreadCount === 0}
            >
              Acknowledge All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}