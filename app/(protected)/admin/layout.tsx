import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Shield, LayoutDashboard } from "lucide-react";
import { getUserAccessState } from "@/lib/user-access";
import { AdminNoticesButton } from "@/components/layout/admin-notices-button";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { MobileAdminSidebar } from "@/components/admin/mobile-admin-sidebar";
import { PageTransition } from "@/components/layout/page-transition";

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
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <MobileAdminSidebar />
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black flex items-center gap-3 tracking-tight">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Admin Panel
                <AdminNoticesButton />
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">Manage your Neki community impact</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-[2.5rem] p-6 shadow-premium border border-border/40 sticky top-24">
              <h3 className="px-4 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigation</h3>
              <SidebarNav className="pr-0" />
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1 min-w-0">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
