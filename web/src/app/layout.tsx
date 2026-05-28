import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArteSana | Catálogo Natural",
  description: "Catálogo de productos artesanales ArteSana con control de pedidos e inventario.",
  metadataBase: new URL(process.env.URL || "http://localhost:3000"),
  openGraph: {
    title: "ArteSana | Bienestar Natural",
    description: "Productos artesanales para el cuidado de la piel, el cabello y el equilibrio diario. Pedidos por WhatsApp.",
    siteName: "ArteSana",
    locale: "es_BO",
    type: "website",
    images: [
      {
        url: "/catalog/logo.png",
        width: 512,
        height: 512,
        alt: "ArteSana Logo",
      },
    ],
  },
  icons: {
    icon: "/catalog/logo-small.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
