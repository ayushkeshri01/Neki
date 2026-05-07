import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user && session.user.status === "ACTIVE") {
    redirect("/feed");
  }

  return <>{children}</>;
}
