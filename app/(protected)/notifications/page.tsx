"use client";

import { useEffect, useState } from "react";
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
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    fetch("/api/me/notices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      })
      .catch(() => {
        toast.error("Failed to load notifications");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session?.user?.id]);

  const acknowledgeAll = async () => {
    if (submitting || notices.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      const noticeIds = notices.map((n) => n.id);
      const res = await fetch("/api/me/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeIds }),
      });

      if (res.ok) {
        setNotices([]);
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
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
      }
    } catch {
      toast.error("Failed to acknowledge");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
        </h1>
        {notices.length > 0 && (
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
            <Card key={notice.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeOne(notice.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notice.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}