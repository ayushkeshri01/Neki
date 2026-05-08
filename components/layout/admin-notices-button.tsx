"use client";

import { useEffect, useState } from "react";
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

interface AdminNotice {
  id: string;
  title: string;
  body: string;
  noticeType: string;
  createdAt: string;
}

export function AdminNoticesButton() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/me/notices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      })
      .catch((err) => console.error("Failed to fetch admin notices:", err));
  }, [session?.user?.id]);

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
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch {
      toast.error("Failed to acknowledge");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function acknowledgeAllNotices() {
    if (isSubmitting || notices.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds: notices.map((n) => n.id) }),
      });

      if (!res.ok) throw new Error();
      setNotices([]);
    } catch {
      toast.error("Failed to acknowledge");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notices.length === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {notices.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {notices.length}
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
                className="rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">{notice.title}</p>
                <p className="text-muted-foreground">{notice.body}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={acknowledgeAllNotices}
              disabled={isSubmitting}
            >
              Acknowledge All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}