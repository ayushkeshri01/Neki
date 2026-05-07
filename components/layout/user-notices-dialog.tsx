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

  const activeNotice = notices[0];

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

  if (!activeNotice) {
    return null;
  }

  return (
    <Dialog
      open={Boolean(activeNotice)}
      onOpenChange={(open) => {
        if (!open && activeNotice) {
          void acknowledgeNotice(activeNotice.id);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeNotice.title}</DialogTitle>
          <DialogDescription>{activeNotice.body}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => void acknowledgeNotice(activeNotice.id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Got it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
