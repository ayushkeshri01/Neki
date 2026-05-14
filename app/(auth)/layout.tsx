import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageTransition } from "@/components/layout/page-transition";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user && session.user.status !== "BLACKLISTED" && session.user.status !== "REMOVED") {
    redirect("/feed");
  }

  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
