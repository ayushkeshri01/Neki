import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/providers/session-provider";
import { getUserAccessState } from "@/lib/user-access";
import { PageTransition } from "@/components/layout/page-transition";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.id) {
    redirect("/login");
  }

  const accessState = await getUserAccessState(session.user.id);

  if (!accessState.isActive) {
    redirect(
      `/login?error=${encodeURIComponent(
        accessState.blockMessage || "Blacklisted:Your account is restricted."
      )}`
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
