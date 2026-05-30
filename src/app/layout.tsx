import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraNotes",
  description: "A simple collaborative note-taking shell for AstraNotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}