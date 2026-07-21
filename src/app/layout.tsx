import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import "./zynema-overlay.css";
import { OverlayProvider } from "@/components/overlay/OverlayProvider";
import { TopNav } from "@/components/site/TopNav";
import { Footer } from "@/components/site/Footer";

// Display / headings — animesaga uses Outfit (800wt, tight tracking)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Body — Inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zynema - Watch Movies & Series Online Free",
  description:
    "Stream your favorite series and movies in HD, free on Zynema.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OverlayProvider>
          <Suspense fallback={null}>
            <TopNav />
          </Suspense>
          {children}
          <Footer />
        </OverlayProvider>
      </body>
    </html>
  );
}
