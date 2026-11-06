export interface WhaleTransfer {
  hash: string;
  from: string;
  to: string;
  valueRaw: string;
  valueFormatted: number;
  valueString: string;
  tokenSymbol: string;
  tokenAddress: string;
  decimals: number;
  blockNumber: number;
  timestamp: number;
  isNative: boolean;
}

export interface AddressActivity {
  address: string;
  sentCount: number;
  receivedCount: number;
  totalTransfers: number;
  volumeSent: number;
  volumeReceived: number;
  totalVolume: number;
  isTopSender?: boolean;
  isTopRecipient?: boolean;
}

export interface VolumeDataPoint {
  blockOrTime: string;
  blockNumber: number;
  volume: number;
  count: number;
}

export interface WhaleAnalysisResult {
  tokenSymbol: string;
  tokenAddress: string;
  isNative: boolean;
  decimals: number;
  minimumAmount: number;
  minimumAmountRaw: string;
  fromBlock: number;
  toBlock: number;
  filterWallet?: string;
  scannedBlocksCount: number;
  largeTransfersFound: number;
  largestTransfer: WhaleTransfer | null;
  topSender: {
    address: string;
    volume: number;
    count: number;
  } | null;
  topRecipient: {
    address: string;
    volume: number;
    count: number;
  } | null;
  transfers: WhaleTransfer[];
  activeAddresses: AddressActivity[];
  volumeChartData: VolumeDataPoint[];
  thresholdExplanation: string;
  analyzedAt: string;
}

export interface AnalysisRequestOnChain {
  id: string;
  requester: string;
  token: string;
  minimumAmount: bigint;
  fromBlock: bigint;
  toBlock: bigint;
  reportHash: string;
  isResolved: boolean;
  requestedAt: bigint;
  resolvedAt: bigint;
}

