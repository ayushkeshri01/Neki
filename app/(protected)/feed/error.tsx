"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <FileX className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium">Failed to load posts</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong while loading the feed. Please try again.
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Try again
      </Button>
    </div>
  );
}
