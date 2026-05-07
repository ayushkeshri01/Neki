import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the rules and moderation expectations for using the Neki community platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
            <CardDescription>Last updated: 20 April 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Neki is a company community platform. You must use accurate account details and
              comply with all community and organizational policies while posting.
            </p>
            <p>
              Administrators can hide or remove posts, restrict accounts, and apply moderation controls
              to maintain a safe and lawful environment.
            </p>
            <p>
              Abuse, fraud, harassment, or policy violations may result in account blacklisting
              or removal, with corresponding audit records retained by the platform.
            </p>
            <p>
              Continued use of Neki indicates acceptance of these terms and future policy updates.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
