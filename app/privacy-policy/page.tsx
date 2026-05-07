import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Review how Neki handles account details, community activity, moderation records, and platform security data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Last updated: 20 April 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Neki collects account profile details, authentication metadata, and community activity
              (posts, likes, and moderation outcomes) to operate the platform safely.
            </p>
            <p>
              We use this information to provide community features, enforce platform rules,
              detect abuse, and keep an auditable record of moderation decisions.
            </p>
            <p>
              If your account is moderated, we may store notices and audit entries describing the action
              and reason. These records are retained to support security and compliance.
            </p>
            <p>
              By using Neki, you agree that your data may be processed for account security,
              fraud prevention, and community governance.
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
