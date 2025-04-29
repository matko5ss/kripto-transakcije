import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigacija from "@/components/Navigacija";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kripto Transakcije | Hrvatski blockchain explorer",
  description: "Pregledajte transakcije, blokove i adrese na Ethereum blockchain mreži na hrvatskom jeziku",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <Navigacija />
        <main className="container mx-auto py-6 px-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-bold">Kripto Transakcije</p>
                <p className="text-sm text-gray-400">Hrvatski blockchain explorer</p>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().getFullYear()} Kripto Transakcije. Sva prava pridržana.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
