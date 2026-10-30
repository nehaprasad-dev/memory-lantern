import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Memory Lantern — turn memories into keepsakes",
    template: "%s · Memory Lantern",
  },
  description:
    "Preserve the small details of someone you love and turn them into a personal letter, a short story or a remembrance card, written with an open-weight AI model.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="candlelight flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
