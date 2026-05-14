import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Process } from "@/components/landing/process";
import { About } from "@/components/landing/about";
import { getGlobalStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getGlobalStats();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats data={stats} />
        <Process />
        <About />
      </main>
      <Footer />
    </div>
  );
}
