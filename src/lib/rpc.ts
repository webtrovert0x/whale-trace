// Utility to make direct JSON-RPC calls to BOT Chain Testnet

const DEFAULT_RPC = "https://rpc.bohr.life";

export async function rpcCall(method: string, params: any[] = [], customRpc?: string): Promise<any> {
  const payload = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  };

  // Try direct RPC endpoint first if specified or fallback to API proxy
  const endpoints = customRpc
    ? [customRpc]
    : typeof window !== "undefined"
    ? ["https://rpc.bohr.life", "/api/rpc"]
    : [DEFAULT_RPC];

  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        continue;
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error.message || JSON.stringify(json.error));
      }

      return json.result;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed RPC call [${method}] on BOT Chain Testnet`);
}

export async function getLatestBlockNumber(): Promise<number> {
  const hex = await rpcCall("eth_blockNumber");
  return parseInt(hex, 16);
}

export async function getBlockByNumber(blockNum: number, fullTx: boolean = true): Promise<any> {
  const hex = "0x" + blockNum.toString(16);
  return await rpcCall("eth_getBlockByNumber", [hex, fullTx]);
}

export async function getLogs(params: {
  fromBlock: number;
  toBlock: number;
  address?: string;
  topics?: (string | string[] | null)[];
}): Promise<any[]> {
  const formattedParams: any = {
    fromBlock: "0x" + params.fromBlock.toString(16),
    toBlock: "0x" + params.toBlock.toString(16),
  };
  if (params.address) {
    formattedParams.address = params.address;
  }
  if (params.topics) {
    formattedParams.topics = params.topics;
  }

  return await rpcCall("eth_getLogs", [formattedParams]);
}

// ERC-20 helper queries
export async function getERC20Metadata(tokenAddress: string): Promise<{
  symbol: string;
  name: string;
  decimals: number;
}> {
  let decimals = 18;
  let symbol = "TOKEN";
  let name = "ERC-20 Token";

  try {
    const decimalsHex = await rpcCall("eth_call", [
      { to: tokenAddress, data: "0x313ce567" },
      "latest",
    ]);
    if (decimalsHex && decimalsHex !== "0x") {
      decimals = parseInt(decimalsHex, 16);
    }
  } catch (err) {
    console.warn("Failed to fetch decimals, defaulting to 18", err);
  }

  try {
    const symbolHex = await rpcCall("eth_call", [
      { to: tokenAddress, data: "0x95d89b41" },
      "latest",
    ]);
    if (symbolHex && symbolHex !== "0x") {
      symbol = decodeAbiString(symbolHex) || symbol;
    }
  } catch (err) {
    console.warn("Failed to fetch symbol", err);
  }

  try {
    const nameHex = await rpcCall("eth_call", [
      { to: tokenAddress, data: "0x06fdde03" },
      "latest",
    ]);
    if (nameHex && nameHex !== "0x") {
      name = decodeAbiString(nameHex) || name;
    }
  } catch (err) {
    console.warn("Failed to fetch name", err);
  }

  return { decimals, symbol, name };
}

function decodeAbiString(hex: string): string {
  try {
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (cleanHex.length <= 64) {
      const str = Buffer.from(cleanHex, "hex").toString("utf8").replace(/\0/g, "").trim();
      return str || "";
    }
    const length = parseInt(cleanHex.slice(64, 128), 16);
    const dataHex = cleanHex.slice(128, 128 + length * 2);
    return Buffer.from(dataHex, "hex").toString("utf8");
  } catch {
    return "";
  }
}
