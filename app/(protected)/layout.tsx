import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
