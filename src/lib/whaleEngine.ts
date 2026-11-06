import {
  WhaleTransfer,
  WhaleAnalysisResult,
  AddressActivity,
  VolumeDataPoint,
} from "@/types";
import { getBlockByNumber, getLogs, getERC20Metadata } from "./rpc";

export interface WhaleScanOptions {
  tokenAddress?: string; // empty or 0x0 for native BOT
  minimumAmount: number; // e.g. 10000
  fromBlock: number;
  toBlock: number;
  filterWallet?: string;
  onProgress?: (currentBlock: number, totalBlocks: number, status: string) => void;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function analyzeWhales(
  options: WhaleScanOptions
): Promise<WhaleAnalysisResult> {
  const {
    minimumAmount,
    fromBlock,
    toBlock,
    filterWallet,
    onProgress,
  } = options;

  const isNative =
    !options.tokenAddress ||
    options.tokenAddress.trim() === "" ||
    options.tokenAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase();

  let tokenSymbol = "BOT";
  let tokenDecimals = 18;
  const tokenAddress = isNative ? ZERO_ADDRESS : options.tokenAddress!.trim();

  if (!isNative) {
    onProgress?.(fromBlock, toBlock, `Fetching metadata for token ${tokenAddress}...`);
    const meta = await getERC20Metadata(tokenAddress);
    tokenSymbol = meta.symbol || "TOKEN";
    tokenDecimals = meta.decimals || 18;
  }

  // Convert minimum threshold to raw BigInt units
  const minRawBigInt = parseUnitsToBigInt(minimumAmount, tokenDecimals);
  const minRawString = minRawBigInt.toString();

  const transfers: WhaleTransfer[] = [];
  const normalizedFilterWallet = filterWallet?.trim().toLowerCase();

  if (isNative) {
    // Scan native BOT transfers from blocks
    const totalBlocks = Math.max(1, toBlock - fromBlock + 1);

    for (let b = fromBlock; b <= toBlock; b++) {
      onProgress?.(b, toBlock, `Scanning block #${b} for native ${tokenSymbol} transfers...`);
      try {
        const block = await getBlockByNumber(b, true);
        if (block && block.transactions) {
          const timestamp = parseInt(block.timestamp, 16) || Math.floor(Date.now() / 1000);

          for (const tx of block.transactions) {
            if (!tx.value || tx.value === "0x0" || tx.value === "0x") continue;

            const valBigInt = BigInt(tx.value);
            if (valBigInt >= minRawBigInt) {
              const from = (tx.from || "").toLowerCase();
              const to = (tx.to || "").toLowerCase();

              // If wallet filter is present, match either sender or recipient
              if (normalizedFilterWallet) {
                if (from !== normalizedFilterWallet && to !== normalizedFilterWallet) {
                  continue;
                }
              }

              const formattedVal = formatUnitsToNumber(valBigInt, tokenDecimals);

              transfers.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || "Contract Creation",
                valueRaw: valBigInt.toString(),
                valueFormatted: formattedVal,
                valueString: formattedVal.toLocaleString("en-US", { maximumFractionDigits: 4 }),
                tokenSymbol,
                tokenAddress: ZERO_ADDRESS,
                decimals: tokenDecimals,
                blockNumber: b,
                timestamp,
                isNative: true,
              });
            }
          }
        }
      } catch (err) {
        console.warn(`Error scanning block ${b}:`, err);
      }
    }
  } else {
    // Scan ERC-20 Transfer events via eth_getLogs
    onProgress?.(fromBlock, toBlock, `Scanning ERC-20 ${tokenSymbol} Transfer logs...`);
    
    // Topic0 for Transfer(address,address,uint256)
    const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    
    let topics: (string | null)[] = [TRANSFER_TOPIC];
    if (normalizedFilterWallet) {
      // Padded to 32 bytes
      // We can query either topic1 (from) or topic2 (to) or scan all and filter in memory
      topics = [TRANSFER_TOPIC];
    }

    try {
      const logs = await getLogs({
        fromBlock,
        toBlock,
        address: tokenAddress,
        topics,
      });

      // Cache block timestamps
      const blockTimestampCache: Record<number, number> = {};

      for (const log of logs) {
        if (!log.data || log.topics.length < 3) continue;

        const valBigInt = BigInt(log.data);
        if (valBigInt >= minRawBigInt) {
          const from = "0x" + log.topics[1].slice(26).toLowerCase();
          const to = "0x" + log.topics[2].slice(26).toLowerCase();

          if (normalizedFilterWallet) {
            if (from !== normalizedFilterWallet && to !== normalizedFilterWallet) {
              continue;
            }
          }

          const blockNumber = parseInt(log.blockNumber, 16);
          let timestamp = blockTimestampCache[blockNumber];
          if (!timestamp) {
            try {
              const blk = await getBlockByNumber(blockNumber, false);
              timestamp = parseInt(blk.timestamp, 16) || Math.floor(Date.now() / 1000);
              blockTimestampCache[blockNumber] = timestamp;
            } catch {
              timestamp = Math.floor(Date.now() / 1000);
            }
          }

          const formattedVal = formatUnitsToNumber(valBigInt, tokenDecimals);

          transfers.push({
            hash: log.transactionHash,
            from: "0x" + log.topics[1].slice(26),
            to: "0x" + log.topics[2].slice(26),
            valueRaw: valBigInt.toString(),
            valueFormatted: formattedVal,
            valueString: formattedVal.toLocaleString("en-US", { maximumFractionDigits: 4 }),
            tokenSymbol,
            tokenAddress,
            decimals: tokenDecimals,
            blockNumber,
            timestamp,
            isNative: false,
          });
        }
      }
    } catch (err) {
      console.warn("Error fetching ERC-20 logs:", err);
    }
  }

  // Find Largest Transfer
  let largestTransfer: WhaleTransfer | null = null;
  for (const t of transfers) {
    if (!largestTransfer || BigInt(t.valueRaw) > BigInt(largestTransfer.valueRaw)) {
      largestTransfer = t;
    }
  }

  // Calculate sender and recipient statistics
  const addressStats: Record<string, AddressActivity> = {};

  const ensureAddress = (addr: string) => {
    const key = addr.toLowerCase();
    if (!addressStats[key]) {
      addressStats[key] = {
        address: addr,
        sentCount: 0,
        receivedCount: 0,
        totalTransfers: 0,
        volumeSent: 0,
        volumeReceived: 0,
        totalVolume: 0,
      };
    }
    return addressStats[key];
  };

  for (const t of transfers) {
    const sender = ensureAddress(t.from);
    sender.sentCount += 1;
    sender.totalTransfers += 1;
    sender.volumeSent += t.valueFormatted;
    sender.totalVolume += t.valueFormatted;

    const recipient = ensureAddress(t.to);
    recipient.receivedCount += 1;
    recipient.totalTransfers += 1;
    recipient.volumeReceived += t.valueFormatted;
    recipient.totalVolume += t.valueFormatted;
  }

  const allAddresses = Object.values(addressStats);

  // Top Sender by volume
  let topSenderData: { address: string; volume: number; count: number } | null = null;
  const sortedSenders = [...allAddresses].sort((a, b) => b.volumeSent - a.volumeSent);
  if (sortedSenders.length > 0 && sortedSenders[0].volumeSent > 0) {
    topSenderData = {
      address: sortedSenders[0].address,
      volume: sortedSenders[0].volumeSent,
      count: sortedSenders[0].sentCount,
    };
    sortedSenders[0].isTopSender = true;
  }

  // Top Recipient by volume
  let topRecipientData: { address: string; volume: number; count: number } | null = null;
  const sortedRecipients = [...allAddresses].sort((a, b) => b.volumeReceived - a.volumeReceived);
  if (sortedRecipients.length > 0 && sortedRecipients[0].volumeReceived > 0) {
    topRecipientData = {
      address: sortedRecipients[0].address,
      volume: sortedRecipients[0].volumeReceived,
      count: sortedRecipients[0].receivedCount,
    };
    sortedRecipients[0].isTopRecipient = true;
  }

  // Frequently active addresses (sorted by total transfer count, then total volume)
  const activeAddresses = [...allAddresses].sort((a, b) => {
    if (b.totalTransfers !== a.totalTransfers) {
      return b.totalTransfers - a.totalTransfers;
    }
    return b.totalVolume - a.totalVolume;
  });

  // Build Chronological Volume Chart Data
  const volumeMap: Record<number, { volume: number; count: number; timestamp: number }> = {};
  for (const t of transfers) {
    if (!volumeMap[t.blockNumber]) {
      volumeMap[t.blockNumber] = { volume: 0, count: 0, timestamp: t.timestamp };
    }
    volumeMap[t.blockNumber].volume += t.valueFormatted;
    volumeMap[t.blockNumber].count += 1;
  }

  const volumeChartData: VolumeDataPoint[] = Object.keys(volumeMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((blockNum) => ({
      blockNumber: blockNum,
      blockOrTime: `#${blockNum}`,
      volume: Number(volumeMap[blockNum].volume.toFixed(2)),
      count: volumeMap[blockNum].count,
    }));

  const thresholdExplanation = `Explicit Whale Threshold: Transfers ≥ ${minimumAmount.toLocaleString()} ${tokenSymbol} (converted using ${tokenDecimals} decimals to raw value ≥ ${minRawString}) analyzed between blocks #${fromBlock} and #${toBlock}.${
    filterWallet ? ` Filtered specifically for address: ${filterWallet}.` : ""
  } Identified addresses represent dominant liquidity flows and significant network holders within this window.`;

  return {
    tokenSymbol,
    tokenAddress,
    isNative,
    decimals: tokenDecimals,
    minimumAmount,
    minimumAmountRaw: minRawString,
    fromBlock,
    toBlock,
    filterWallet,
    scannedBlocksCount: toBlock - fromBlock + 1,
    largeTransfersFound: transfers.length,
    largestTransfer,
    topSender: topSenderData,
    topRecipient: topRecipientData,
    transfers: transfers.sort((a, b) => b.blockNumber - a.blockNumber),
    activeAddresses,
    volumeChartData,
    thresholdExplanation,
    analyzedAt: new Date().toISOString(),
  };
}

// Helpers for decimals conversion
function parseUnitsToBigInt(amount: number, decimals: number): bigint {
  const [intPart, decPart = ""] = amount.toString().split(".");
  const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
  const fullStr = intPart + paddedDec;
  return BigInt(fullStr);
}

function formatUnitsToNumber(valBigInt: bigint, decimals: number): number {
  const factor = 10 ** decimals;
  return Number(valBigInt) / factor;
}

