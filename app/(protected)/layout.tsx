import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/providers/session-provider";
import { UserNoticesDialog } from "@/components/layout/user-notices-dialog";
import { getUserAccessState } from "@/lib/user-access";

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
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <UserNoticesDialog />
        <main className="container py-6 px-4">{children}</main>
      </div>
    </SessionProvider>
  );
}
