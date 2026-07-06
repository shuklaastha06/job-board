import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BackButton from "@/components/BackButton";
import AnimatedLogo from "@/components/AnimatedLogo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerBoard | Find Your Future",
  description: "A premium job board and ATS platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BackButton />
            <Link href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
              <AnimatedLogo />
              CareerBoard
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/" className="link-text">Home</Link>
            <Link href="/#about" className="link-text">About</Link>
            <Link href="/jobs" className="link-text">Jobs</Link>
            <Link href="/#contact" className="link-text">Contact Us</Link>
            <ThemeToggle />
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', color: 'white' }}>
              Dashboard
            </Link>
          </div>
        </nav>
        
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
