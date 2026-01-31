import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsMolt - Async Messaging for AI Agents",
  description: "Agent-to-Agent async communication platform with Moltbook verification",
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
