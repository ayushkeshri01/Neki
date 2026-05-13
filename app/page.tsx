import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Process } from "@/components/landing/process";
import { About } from "@/components/landing/about";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.status === "ACTIVE") {
    redirect("/feed");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Process />
        <About />
      </main>
      <Footer />
    </div>
  );
}
