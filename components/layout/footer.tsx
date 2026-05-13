"use client";

import Link from "next/link";

const footerLinks = {
  platform: [
    { label: "About Us", href: "/about" },
    { label: "Contact Support", href: "/support" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  community: [
    { label: "Community Guidelines", href: "/guidelines" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-secondary-container/30 border-t border-border/40 mt-section-gap w-full">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-gutter">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="font-display text-3xl font-extrabold text-primary">
              Neki
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Transforming workplace giving through collective impact and meaningful community engagement.
            </p>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Neki. All rights reserved.
            </div>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-display font-bold text-foreground mb-6">Platform</h4>
              <ul className="space-y-4">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-foreground mb-6">Legal</h4>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-foreground mb-6">Community</h4>
              <ul className="space-y-4">
                {footerLinks.community.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
