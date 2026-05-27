import type { Metadata } from "next";
import { Inter, Pixelify_Sans, JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Formz",
  description: "Dynamic Form Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${pixelify.variable} ${jetbrains.variable} ${vt323.variable} font-sans`}>
        {/* Global Minecraft repeating texture overlay */}
        <div 
          className="fixed inset-0 z-50 opacity-[0.03] bg-repeat pointer-events-none" 
          style={{ backgroundImage: "url('/assets/minecraft/blocks/Cobbled_Deepslate.png')", imageRendering: "pixelated" }}
        />
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
