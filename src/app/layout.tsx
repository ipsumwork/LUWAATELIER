import type { Metadata } from "next";
import { Suspense } from "react";
import { Abhaya_Libre } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { EditorProvider } from "@/editor/components/EditorProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { getSiteConfig } from "@/sanity/lib/fetch";
import "./globals.css";

const abhayaLibre = Abhaya_Libre({
  variable: "--font-abhaya",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "LUWA — Portfolio",
  description: "Design portfolio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();

  return (
    <html lang="en">
      <body className={`${abhayaLibre.variable} ${GeistMono.variable} antialiased`}>
        <NavBar />
        <Suspense fallback={null}>
          <EditorProvider>
            <SmoothScroll>
              {children}
              <Footer siteConfig={siteConfig} />
            </SmoothScroll>
          </EditorProvider>
        </Suspense>
      </body>
    </html>
  );
}
