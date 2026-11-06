"use client";

import React, { useState } from "react";
import { InspectionForm, InspectionFormValues } from "@/components/InspectionForm";
import { ExpectedResultCard } from "@/components/ExpectedResultCard";
import { TransferVolumeChart } from "@/components/TransferVolumeChart";
import { ActiveAddressesTable } from "@/components/ActiveAddressesTable";
import { TransactionDetailsTable } from "@/components/TransactionDetailsTable";
import { OnChainIntegration } from "@/components/OnChainIntegration";
import { WhaleAnalysisResult } from "@/types";
import { analyzeWhales } from "@/lib/whaleEngine";

// Illustrative benchmark sample data as specified in requirement
const ILLUSTRATIVE_SAMPLE_RESULT: WhaleAnalysisResult = {
  tokenSymbol: "BOT",
  tokenAddress: "0x0000000000000000000000000000000000000000",
  isNative: true,
  decimals: 18,
  minimumAmount: 10000,
  minimumAmountRaw: "10000000000000000000000",
  fromBlock: 128400,
  toBlock: 128900,
  scannedBlocksCount: 501,
  largeTransfersFound: 12,
  largestTransfer: {
    hash: "0x89f72c49a5b3a129d2b109e4a8109312b919a3b4820d9129e84b80a2b84910cf",
    from: "0x1234567890abcdef1234567890abcdef1234abcd",
    to: "0xabcd1234ef567890abcd1234ef567890abcd1234",
    valueRaw: "50000000000000000000000",
    valueFormatted: 50000,
    valueString: "50,000",
    tokenSymbol: "BOT",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    blockNumber: 128850,
    timestamp: Math.floor(Date.now() / 1000) - 1800,
    isNative: true,
  },
  topSender: {
    address: "0x1234567890abcdef1234567890abcdef1234abcd",
    volume: 85000,
    count: 3,
  },
  topRecipient: {
    address: "0xabcd1234ef567890abcd1234ef567890abcd1234",
    volume: 62000,
    count: 2,
  },
  transfers: [
    {
      hash: "0x89f72c49a5b3a129d2b109e4a8109312b919a3b4820d9129e84b80a2b84910cf",
      from: "0x1234567890abcdef1234567890abcdef1234abcd",
      to: "0xabcd1234ef567890abcd1234ef567890abcd1234",
      valueRaw: "50000000000000000000000",
      valueFormatted: 50000,
      valueString: "50,000",
      tokenSymbol: "BOT",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      blockNumber: 128850,
      timestamp: Math.floor(Date.now() / 1000) - 1800,
      isNative: true,
    },
    {
      hash: "0x34a1b8c2d9e0f31245780a1bcdef981234567890abcdef1234567890abcdef12",
      from: "0x1234567890abcdef1234567890abcdef1234abcd",
      to: "0x9876543210fedcba9876543210fedcba98765432",
      valueRaw: "20000000000000000000000",
      valueFormatted: 20000,
      valueString: "20,000",
      tokenSymbol: "BOT",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      blockNumber: 128790,
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      isNative: true,
    },
    {
      hash: "0x56b2c9d0e1f423567891b2cdef01234567890abcdef1234567890abcdef1234ab",
      from: "0x5555567890abcdef1234567890abcdef12345555",
      to: "0xabcd1234ef567890abcd1234ef567890abcd1234",
      valueRaw: "12000000000000000000000",
      valueFormatted: 12000,
      valueString: "12,000",
      tokenSymbol: "BOT",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      blockNumber: 128710,
      timestamp: Math.floor(Date.now() / 1000) - 5400,
      isNative: true,
    },
    {
      hash: "0x78c3d1e2f5053467892c3def1234567890abcdef1234567890abcdef1234bcde",
      from: "0x1234567890abcdef1234567890abcdef1234abcd",
      to: "0x7777567890abcdef1234567890abcdef12347777",
      valueRaw: "15000000000000000000000",
      valueFormatted: 15000,
      valueString: "15,000",
      tokenSymbol: "BOT",
      tokenAddress: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      blockNumber: 128640,
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      isNative: true,
    },
  ],
  activeAddresses: [
    {
      address: "0x1234567890abcdef1234567890abcdef1234abcd",
      sentCount: 3,
      receivedCount: 0,
      totalTransfers: 3,
      volumeSent: 85000,
      volumeReceived: 0,
      totalVolume: 85000,
      isTopSender: true,
    },
    {
      address: "0xabcd1234ef567890abcd1234ef567890abcd1234",
      sentCount: 0,
      receivedCount: 2,
      totalTransfers: 2,
      volumeSent: 0,
      volumeReceived: 62000,
      totalVolume: 62000,
      isTopRecipient: true,
    },
    {
      address: "0x9876543210fedcba9876543210fedcba98765432",
      sentCount: 0,
      receivedCount: 1,
      totalTransfers: 1,
      volumeSent: 0,
      volumeReceived: 20000,
      totalVolume: 20000,
    },
    {
      address: "0x7777567890abcdef1234567890abcdef12347777",
      sentCount: 0,
      receivedCount: 1,
      totalTransfers: 1,
      volumeSent: 0,
      volumeReceived: 15000,
      totalVolume: 15000,
    },
  ],
  volumeChartData: [
    { blockNumber: 128640, blockOrTime: "#128640", volume: 15000, count: 1 },
    { blockNumber: 128710, blockOrTime: "#128710", volume: 12000, count: 1 },
    { blockNumber: 128790, blockOrTime: "#128790", volume: 20000, count: 1 },
    { blockNumber: 128850, blockOrTime: "#128850", volume: 50000, count: 1 },
  ],
  thresholdExplanation:
    "Explicit Whale Threshold: Transfers ≥ 10,000 BOT (10000000000000000000000 base units, using 18 decimals) between block #128400 and #128900. Addresses are classified based on meeting or exceeding this liquidity threshold.",
  analyzedAt: new Date().toISOString(),
};

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<WhaleAnalysisResult | null>(
    ILLUSTRATIVE_SAMPLE_RESULT
  );
  const [isLoading, setIsLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");

  const handleAnalyze = async (values: InspectionFormValues) => {
    setIsLoading(true);
    setProgressStatus("Connecting to BOT Chain Testnet RPC...");

    try {
      const result = await analyzeWhales({
        tokenAddress: values.tokenAddress,
        minimumAmount: values.minimumAmount,
        fromBlock: values.fromBlock,
        toBlock: values.toBlock,
        filterWallet: values.filterWallet,
        onProgress: (curr, total, status) => {
          setProgressStatus(status);
        },
      });

      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Whale analysis failed:", err);
      alert(`Analysis error: ${err?.message || "Failed to query BOT Chain RPC"}`);
    } finally {
      setIsLoading(false);
      setProgressStatus("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h1 className="text-xl font-bold text-white tracking-tight">
          BOT Chain Large-Transfer Analysis Tool
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Inspect large BOT and ERC-20 token movements directly on BOT Chain Testnet (Chain ID: 968).
          Converts amounts using authentic token decimals, aggregates volume distributions,
          ranks dominant transacting wallets without arbitrary ungrounded labels, and verifies on-chain with <code className="text-slate-300">BOTWhaleTrace.sol</code>.
        </p>
      </div>

      {/* Inspection Form */}
      <InspectionForm
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        progressStatus={progressStatus}
      />

      {/* Smart Contract Interaction Section */}
      <OnChainIntegration currentAnalysis={analysisResult} />

      {/* Whale Dashboard Views */}
      <div className="space-y-6">
        {/* Expected Result Card */}
        {analysisResult && <ExpectedResultCard result={analysisResult} />}

        {/* Transfer Volume Charts */}
        {analysisResult && (
          <TransferVolumeChart
            data={analysisResult.volumeChartData}
            tokenSymbol={analysisResult.tokenSymbol}
          />
        )}

        {/* Frequently Active Large-Transfer Addresses */}
        {analysisResult && (
          <ActiveAddressesTable
            addresses={analysisResult.activeAddresses}
            tokenSymbol={analysisResult.tokenSymbol}
          />
        )}

        {/* Transaction Details Table */}
        {analysisResult && (
          <TransactionDetailsTable
            transfers={analysisResult.transfers}
            tokenSymbol={analysisResult.tokenSymbol}
          />
        )}
      </div>
    </div>
  );
}
