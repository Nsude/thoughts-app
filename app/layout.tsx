import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ToastProvider } from "@/components/contexts/ToastContext";
import ShareThoughtProvider from "@/components/contexts/ShareThoughtContext";

export const metadata: Metadata = {
  title: "thoughts-app",
  description: "A companion for your thoughts",
};

const hostGrotesk = localFont({
  src: [
    {
      path: "../public/font/hg-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/font/hg-Bold.ttf",
      weight: "700",
      style: "normal"
    },
    {
      path: "../public/font/hg-ExtraBold.ttf",
      weight: "800",
      style: "normal"
    },
  ]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body className={`${hostGrotesk.className} antialiased`}>
          <ConvexClientProvider>
            <ShareThoughtProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ShareThoughtProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
