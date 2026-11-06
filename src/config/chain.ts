import { defineChain } from "viem";

export const botchainTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
    public: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOTScan",
      url: "https://scan.bohr.life",
    },
  },
  testnet: true,
});

export const BOT_CHAIN_CONFIG = {
  chainId: 968,
  chainName: "BOT Chain Testnet",
  rpcUrl: "https://rpc.bohr.life",
  explorerUrl: "https://scan.bohr.life",
  nativeToken: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  // Address zero or special constant for native BOT
  NATIVE_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
};

