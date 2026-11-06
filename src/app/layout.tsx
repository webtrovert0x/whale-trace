import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "BOT WhaleTrace | BOT Chain Large-Transfer Analysis",
  description:
    "A BOT Chain large-transfer analysis tool that identifies significant token movements and displays the wallets involved.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <Web3Provider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="w-full bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
            BOT WhaleTrace &copy; {new Date().getFullYear()} &bull; BOT Chain Testnet (Chain ID: 968) &bull; RPC: https://rpc.bohr.life
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}

