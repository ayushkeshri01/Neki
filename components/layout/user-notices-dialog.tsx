"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserNotice {
  id: string;
  title: string;
  body: string;
  noticeType: string;
  createdAt: string;
}

export async function acknowledgeNoticeRequest(
  noticeId: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetchImpl("/api/me/notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noticeIds: [noticeId] }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: data?.error || "Failed to acknowledge notices",
    };
  }

  return { ok: true };
}

export function UserNoticesDialog() {
  const { data: session } = useSession();
  const [notices, setNotices] = useState<UserNotice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    let isMounted = true;

    fetch("/api/me/notices")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotices([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  async function acknowledgeNotice(noticeId: string) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await acknowledgeNoticeRequest(noticeId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setNotices((prev) => prev.filter((notice) => notice.id !== noticeId));
    } catch {
      toast.error("Failed to acknowledge notices");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notices.length === 0 || dismissed) {
    return null;
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) setDismissed(true);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notices</DialogTitle>
          <DialogDescription>
            You have {notices.length} notice{notices.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-60 space-y-2 overflow-y-auto">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-lg border p-3">
              <p className="font-medium">{notice.title}</p>
              <p className="text-sm text-muted-foreground">{notice.body}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => void acknowledgeNotice(notice.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Acknowledging..." : "Acknowledge"}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
