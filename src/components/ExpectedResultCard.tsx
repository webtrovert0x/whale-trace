"use client";

import React from "react";
import { WhaleAnalysisResult } from "@/types";
import { Info, CheckCircle2, Copy } from "lucide-react";

interface ExpectedResultCardProps {
  result: WhaleAnalysisResult;
}

export function ExpectedResultCard({ result }: ExpectedResultCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-white uppercase font-mono">
            WHALE ANALYSIS
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Verified scan output on BOT Chain Testnet
          </p>
        </div>
        <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-200 rounded">
          Blocks #{result.fromBlock} - #{result.toBlock}
        </span>
      </div>

      {/* Main Analysis Cards matching Expected Result format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {/* Token & Min Amount */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Token Asset</div>
          <div className="text-lg font-bold text-white mt-1">
            {result.tokenSymbol}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Min Threshold:{" "}
            <span className="text-slate-200 font-semibold">
              {result.minimumAmount.toLocaleString()} {result.tokenSymbol}
            </span>
          </div>
        </div>

        {/* Large Transfers Found */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">
            Large Transfers Found
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {result.largeTransfersFound}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Across {result.scannedBlocksCount} scanned blocks
          </div>
        </div>

        {/* Largest Transfer */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 sm:col-span-2 lg:col-span-1">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">
            Largest Transfer
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {result.largestTransfer
              ? `${result.largestTransfer.valueString} ${result.tokenSymbol}`
              : "0 " + result.tokenSymbol}
          </div>
          <div className="text-xs text-slate-400 mt-2 truncate">
            {result.largestTransfer ? (
              <span>Tx: {result.largestTransfer.hash.slice(0, 14)}...</span>
            ) : (
              "None within threshold"
            )}
          </div>
        </div>

        {/* Top Sender */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Top Sender</div>
          {result.topSender ? (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {formatAddress(result.topSender.address)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.topSender!.address)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy full address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs text-slate-300 mt-1.5">
                Sent:{" "}
                <span className="font-semibold text-white">
                  {result.topSender.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  {result.tokenSymbol}
                </span>{" "}
                ({result.topSender.count} tx)
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 mt-2">No qualified sender</div>
          )}
        </div>

        {/* Top Recipient */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 sm:col-span-2">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">Top Recipient</div>
          {result.topRecipient ? (
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {formatAddress(result.topRecipient.address)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.topRecipient!.address)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy full address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs text-slate-300 mt-1.5">
                Received:{" "}
                <span className="font-semibold text-white">
                  {result.topRecipient.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  {result.tokenSymbol}
                </span>{" "}
                ({result.topRecipient.count} tx)
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 mt-2">No qualified recipient</div>
          )}
        </div>
      </div>

      {/* Threshold Explanation Box */}
      <div className="bg-slate-950 border border-slate-800 rounded p-4 text-xs">
        <div className="flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Whale Classification Threshold Logic:</span>
            <p className="text-slate-400 mt-1 leading-relaxed">
              {result.thresholdExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

