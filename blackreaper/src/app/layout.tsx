import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BlackReaper | Unleash Your Inner Ghoul",
  description: "Transform your productivity with the ultimate gaming-productivity hybrid. Earn RC Cells, battle other players, and switch between Human and Ghoul modes.",
  keywords: ["productivity", "gaming", "ghoul", "tokyo ghoul", "pomodoro", "focus"],
  authors: [{ name: "BlackReaper Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
