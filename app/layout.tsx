import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono, Geist } from "next/font/google";
import "./globals.css";
import LightRays from '@/components/LightRays';
import Navbar from "@/components/Navbar";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-Martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub For Every Dev Event You Mustn't Miss!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html
    lang="en"
  >
    <body className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen mt-0 antialiased`}>

      <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
      <LightRays
          raysOrigin="top-center-offset"
          raysColor="#5dfeca"
          raysSpeed={0.5}
          lightSpread={0.9}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.02}
          noiseAmount={0}
          distortion={0.01}
      />
    </div>
      <Navbar />
    {children}
    </body>
  </html>;
}
