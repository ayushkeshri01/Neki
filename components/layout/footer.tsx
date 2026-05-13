import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-secondary-container dark:bg-on-secondary-container/10 mt-20 border-t border-border/40">
      <div className="max-w-container-max mx-auto px-margin-desktop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-on-secondary-container dark:text-muted-foreground">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="font-display text-2xl font-extrabold text-primary">
              Neki
            </Link>
            <p className="text-sm leading-relaxed opacity-80">
              © 2024 Neki. Transforming workplace giving through collective impact. Join us in making a difference, one deed at a time.
            </p>
          </div>
          
          {/* Links Column 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-foreground">Platform</h4>
            <Link href="/about" className="text-sm hover:text-primary transition-colors">About Us</Link>
            <Link href="/guidelines" className="text-sm hover:text-primary transition-colors">Community Guidelines</Link>
            <Link href="/impact" className="text-sm hover:text-primary transition-colors">Global Impact</Link>
          </div>
          
          {/* Links Column 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-foreground">Legal</h4>
            <Link href="/privacy" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-sm hover:text-primary transition-colors">Cookie Settings</Link>
          </div>
          
          {/* Contact Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display font-bold text-foreground">Support</h4>
            <Link href="/support" className="text-sm hover:text-primary transition-colors">Contact Support</Link>
            <Link href="/faq" className="text-sm hover:text-primary transition-colors">Help Center</Link>
            <div className="mt-2 flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/20 text-center text-xs opacity-60">
          <p>Handcrafted with ❤️ by the Neki Team</p>
        </div>
      </div>
    </footer>
  );
}
