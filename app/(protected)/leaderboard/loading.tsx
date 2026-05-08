import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
