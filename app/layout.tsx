import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavigationRefresher } from "@/components/layout/navigation-refresher";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Neki | Community Social Work Platform",
    template: "%s | Neki"
  },
  description: "A platform for sharing and discovering social work and good deeds within communities.",
  keywords: ["social work", "community", "good deeds", "impact", "volunteering"],
  authors: [{ name: "Neki Team" }],
  creator: "Neki",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neki.community",
    title: "Neki | Community Social Work Platform",
    description: "A platform for sharing and discovering social work and good deeds.",
    siteName: "Neki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neki | Community Social Work Platform",
    description: "A platform for sharing and discovering social work and good deeds.",
    creator: "@neki_community",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, outfit.variable)}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <NavigationRefresher />
              {children}
            </div>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
