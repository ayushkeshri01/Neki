"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  body: string;
  noticeType: string;
  createdAt: string;
  acknowledgedAt: string | null;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch("/api/me/notices");
        const data = await res.json();
        if (Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [session?.user?.id]);

  const acknowledgeAll = async () => {
    const unreadIds = notices.filter(n => !n.acknowledgedAt).map(n => n.id);
    if (submitting || unreadIds.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds: unreadIds }),
      });

      if (res.ok) {
        setNotices(prev => prev.map(n => ({ ...n, acknowledgedAt: n.acknowledgedAt || new Date().toISOString() })));
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to acknowledge notifications");
      }
    } catch {
      toast.error("Failed to acknowledge notifications");
    } finally {
      setSubmitting(false);
    }
  };

  const acknowledgeOne = async (noticeId: string) => {
    try {
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds: [noticeId] }),
      });

      if (res.ok) {
        setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedAt: new Date().toISOString() } : n));
      }
    } catch {
      toast.error("Failed to acknowledge");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-margin-mobile md:px-margin-desktop py-10 text-center">
        Loading...
      </div>
    );
  }

  const unreadCount = notices.filter(n => !n.acknowledgedAt).length;

  return (
    <div className="mx-auto max-w-2xl px-margin-mobile md:px-margin-desktop py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
              {unreadCount} unread
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={acknowledgeAll}
            disabled={submitting}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No notifications
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className={!notice.acknowledgedAt ? "border-primary/50 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{notice.title}</CardTitle>
                    {!notice.acknowledgedAt && (
                      <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">New</span>
                    )}
                  </div>
                  {!notice.acknowledgedAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeOne(notice.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notice.body}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(notice.createdAt).toLocaleString()}
                  </p>
                  {notice.acknowledgedAt && (
                    <p className="text-[10px] text-muted-foreground/40 italic">
                      Read on {new Date(notice.acknowledgedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}