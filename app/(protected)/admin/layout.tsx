import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Shield } from "lucide-react";
import { getUserAccessState } from "@/lib/user-access";
import { AdminNoticesButton } from "@/components/layout/admin-notices-button";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
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

  if (session.user.role !== "ADMIN") {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Panel
            <AdminNoticesButton />
          </h1>
          <p className="text-muted-foreground">Manage your Neki community</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-56 shrink-0">
            <SidebarNav />
          </nav>

          {/* Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
