import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PDF Content Generator",
  description: "Upload a PDF, add prompts, and generate a Word document with AI-powered content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F698X03T2D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F698X03T2D');
        `}
        </Script>

        <SessionProvider>
          {children}
        </SessionProvider>

        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
