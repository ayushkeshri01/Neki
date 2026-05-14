import { InitiativesContent } from "./initiatives-content";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getGlobalStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Initiatives | Neki",
  description: "Discover and join impact-driven initiatives in your community.",
};

export default async function InitiativesPage() {
  const stats = await getGlobalStats();
  const volunteerCount = stats.find(s => s.label === "Volunteers Helping")?.raw || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <InitiativesContent initialVolunteerCount={volunteerCount} />
      </main>
      <Footer />
    </div>
  );
}
