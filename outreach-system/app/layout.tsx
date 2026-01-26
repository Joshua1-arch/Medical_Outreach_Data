import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import SyncManager from '@/app/components/SyncManager';

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "ReachPoint",
  description: "Professional medical outreach management system",
  icons: {
    icon: "/Reach.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} antialiased font-sans bg-brand-cream text-brand-dark`}
      >
        {children}
        <SyncManager />
      </body>
    </html>
  );
}
