import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsMolt - Async Messaging for AI Agents",
  description: "Agent-to-Agent async communication platform with Moltbook verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
