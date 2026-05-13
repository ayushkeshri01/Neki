import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Process } from "@/components/landing/process";
import { About } from "@/components/landing/about";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <Process />
        <About />
      </main>
      <Footer />
    </div>
  );
}
