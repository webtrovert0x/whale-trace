import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Returns server configuration securely to the client session
  return NextResponse.json({
    reownId: process.env.REOWN_ID || "",
    rpcUrl: process.env.RPC_URL || "https://rpc.bohr.life",
    chainId: Number(process.env.CHAIN_ID) || 968,
    explorerUrl: process.env.EXPLORER_URL || "https://scan.bohr.life",
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  });
}

