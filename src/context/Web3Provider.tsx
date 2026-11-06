"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { botchainTestnet } from "@/config/chain";

const queryClient = new QueryClient();

// Initial project ID (will use server REOWN_ID or fallback)
const projectId = process.env.REOWN_ID || "8d9607f2a143b8c349e59d9c394c8e71";

// Create base wagmi adapter for BOT Chain Testnet
export const wagmiAdapter = new WagmiAdapter({
  networks: [botchainTestnet],
  projectId,
});

export const config = wagmiAdapter.wagmiConfig;

// Initialize AppKit at module level so SSR and hooks never fail
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botchainTestnet],
  projectId,
  metadata: {
    name: "BOT WhaleTrace",
    description: "BOT Chain Large-Transfer Analysis Tool",
    url: "https://scan.bohr.life",
    icons: ["https://scan.bohr.life/favicon.ico"],
  },
  themeMode: "dark",
  features: {
    analytics: false,
  },
});

interface Web3ConfigContextType {
  reownId: string;
  isReady: boolean;
  contractAddress: string;
}

const Web3ConfigContext = createContext<Web3ConfigContextType>({
  reownId: "",
  isReady: false,
  contractAddress: "",
});

export const useWeb3Config = () => useContext(Web3ConfigContext);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [reownId, setReownId] = useState(projectId);
  const [contractAddress, setContractAddress] = useState("");

  useEffect(() => {
    setMounted(true);

    // Fetch REOWN_ID securely from server endpoint
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.reownId) {
          setReownId(data.reownId);
        }
        if (data.contractAddress) {
          setContractAddress(data.contractAddress);
        }
      })
      .catch((err) => console.warn("Failed to load config from server:", err));
  }, []);

  return (
    <Web3ConfigContext.Provider value={{ reownId, isReady: mounted, contractAddress }}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config as any}>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3ConfigContext.Provider>
  );
}
