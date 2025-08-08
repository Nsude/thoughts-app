import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "thoughts-app",
  description: "A companion for your thoughts",
};

const hostGrotesk = localFont({
  src: "../public/font/hg-Regular.ttf"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hostGrotesk.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
