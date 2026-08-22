import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RankForge SEO — Advanced Multi-Domain SEO Optimization Platform",
  description:
    "RankForge SEO is the most advanced SEO optimization suite. Track rankings, audit technical SEO, analyze backlinks, discover content gaps, and get AI-powered recommendations across multiple business domains.",
  keywords: [
    "SEO optimization",
    "rank tracking",
    "backlink analysis",
    "technical SEO audit",
    "content gap analysis",
    "keyword research",
    "SEO dashboard",
    "RankForge",
  ],
  authors: [{ name: "RankForge SEO" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "RankForge SEO — Advanced SEO Optimization Platform",
    description:
      "Multi-domain SEO command center with rank tracking, technical audits, backlink intelligence & AI insights.",
    siteName: "RankForge SEO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankForge SEO",
    description: "Advanced multi-domain SEO optimization platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
