import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/page-transition";
import { NavigationRefresher } from "@/components/layout/navigation-refresher";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/lib/auth";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Neki | Community Social Work Platform",
    template: "%s | Neki",
  },
  description:
    "Join your company's community to share social work and make a positive impact together. Earn Good Deed Credits (GDCs), climb the leaderboard, and inspire others.",
  keywords: [
    "social work",
    "community",
    "volunteer",
    "company",
    "team building",
    "corporate social responsibility",
    "csr",
  ],
  authors: [{ name: "Neki Team" }],
  creator: "Neki Team",
  publisher: "Neki",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Neki",
    title: "Neki | Community Social Work Platform",
    description:
      "Join your company's community to share social work and make a positive impact together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neki | Community Social Work Platform",
    description:
      "Join your company's community to share social work and make a positive impact together.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", plusJakarta.variable, inter.variable)}>
      <body suppressHydrationWarning className={cn("min-h-screen bg-background font-sans antialiased")}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <NavigationRefresher />
              <PageTransition>
                {children}
              </PageTransition>
            </div>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
