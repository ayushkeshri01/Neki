import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
    <>
      {children}
    </>
  );
}
