import "~/styles/globals.css";
import type { Viewport } from 'next'
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Lantern",
  description: "Talk to Your Money",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  maximumScale: 1,
  viewportFit: 'cover',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} overflow-hidden dark`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}

