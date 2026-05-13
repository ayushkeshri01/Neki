import { InitiativesContent } from "./initiatives-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Initiatives | Neki",
  description: "Discover and join impact-driven initiatives in your community.",
};

export default function InitiativesPage() {
  return <InitiativesContent />;
}
