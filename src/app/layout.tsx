import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIGHER CANVAS",
  description: "For the higher channel",
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
