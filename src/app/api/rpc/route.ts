import { NextRequest, NextResponse } from "next/server";

const BOT_RPC_URL = process.env.RPC_URL || "https://rpc.bohr.life";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(BOT_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "BOTWhaleTrace/1.0",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32603, message: text } },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("RPC proxy error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: error?.message || "Internal RPC proxy error" },
      },
      { status: 500 }
    );
  }
}
