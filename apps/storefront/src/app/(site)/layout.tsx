import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HaydenGoSeek | Original Art & Fine Art Prints",
  description:
    "Original artworks, museum-quality fine art prints and handcrafted framing by Hayden Andrews. Gold Coast, Australia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
