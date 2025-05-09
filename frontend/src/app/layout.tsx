import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { LoadingProvider } from "@/lib/LoadingContext";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Theater - Book Your Tickets",
  description: "Book movie tickets for the latest movies showing in our theaters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans`}>
        <LoadingProvider>
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </LoadingProvider>
      </body>
    </html>
  );
}
