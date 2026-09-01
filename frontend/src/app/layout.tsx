import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Midnight zk-Bounty — Zero-Knowledge Bounty Protocol",
  description:
    "Decentralized, anonymous bounty platform built on the Midnight Network. Client-side witnesses, Halo2 zk-SNARK proofs, and shielded tDUST escrow.",
  keywords: ["Midnight Network", "Zero-Knowledge", "zk-SNARK", "Compact", "Cardano", "Privacy", "Bounty"],
  authors: [{ name: "Midnight zk-Bounty Team" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Midnight zk-Bounty — Zero-Knowledge Bounty Protocol",
    description: "Shielded bounty escrow with client-side zk proof generation on Midnight Network.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#07090e] text-slate-100 antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-300`}
      >
        {children}
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}
