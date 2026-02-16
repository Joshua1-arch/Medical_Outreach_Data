import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SyncManager from '@/app/components/SyncManager';
import { getSiteConfig } from "@/app/admin/settings/actions";
import { SiteConfigProvider } from "@/app/context/SiteConfigProvider";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
    icon: "/Reach.png?v=3",
    shortcut: "/Reach.png?v=3",
    apple: "/Reach.png?v=3",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();
  const session = await auth();
  const headersList = await headers();
  // We need the middleware to set this header for server components to know the path
  const currentPath = headersList.get("x-pathname") || "/";

  // MAINTENANCE MODE LOGIC
  if (siteConfig?.maintenanceMode) {
    const isAdmin = session?.user?.role === 'admin';
    const isMaintenancePage = currentPath === '/maintenance';
    const isLoginPage = currentPath.startsWith('/login') || currentPath.startsWith('/api/auth'); 
    
    // Allow static assets too? Usually handled by middleware exclusion, but if we are here, we are in layout.
    // If not admin, and not on safe pages, redirect.
    if (!isAdmin && !isMaintenancePage && !isLoginPage) {
       // redirect('/maintenance'); 
       // We cannot redirect in RootLayout easily without causing loops if middleware doesn't help.
       // The best place for this logic IS middleware.
       // But I can't access DB in middleware.
       
       // If I redirect here:
       // 1. User visits / -> currentPath="/" -> Redirect /maintenance
       // 2. User visits /maintenance -> currentPath="/maintenance" -> No redirect. Renders children.
       
       // Validation of loop prevention:
       // "if (!isMaintenancePage)" prevents loop.
       
       redirect('/maintenance');
    }
  } else {
     // If active, redirect away from maintenance
     if (currentPath === '/maintenance') {
         redirect('/');
     }
  }

  const themeVariables = {
    '--brand-primary': siteConfig?.primaryColor || '#0f172a',
    '--brand-secondary': siteConfig?.secondaryColor || '#fbbf24',
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeVariables}>
      <body
        className={`${playfair.variable} ${lato.variable} antialiased font-sans bg-brand-cream text-brand-dark`}
      >
        <SiteConfigProvider initialConfig={siteConfig}>
          {children}
          <SyncManager />
          <SpeedInsights />
        </SiteConfigProvider>
      </body>
    </html>
  );
}
