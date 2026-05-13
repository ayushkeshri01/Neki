import { InitiativesContent } from "./initiatives-content";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Initiatives | Neki",
  description: "Discover and join impact-driven initiatives in your community.",
};

export default function InitiativesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <InitiativesContent />
      </main>
      <Footer />
    </div>
  );
}
