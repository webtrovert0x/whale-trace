"use client";

import React, { useState } from "react";
import { WhaleTransfer } from "@/types";
import { ExternalLink, Copy, Check, ArrowRight } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";

interface TransactionDetailsTableProps {
  transfers: WhaleTransfer[];
  tokenSymbol: string;
}

export function TransactionDetailsTable({
  transfers,
  tokenSymbol,
}: TransactionDetailsTableProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatAddr = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Transaction Details</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual movements meeting the minimum whale transfer threshold
          </p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
          {transfers.length} Transactions
        </span>
      </div>

      {transfers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          No transfers found above the threshold in the specified block range.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tx Hash</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Block</th>
                <th className="py-3 px-4">Transfer Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {transfers.map((tx) => (
                <tr key={tx.hash} className="hover:bg-slate-800/60 transition-colors">
                  {/* Tx Hash */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      <a
                        href={`${BOT_CHAIN_CONFIG.explorerUrl}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                        title="View on BOTScan"
                      >
                        <span>{tx.hash.slice(0, 10)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => copy(tx.hash)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Copy Hash"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Sender */}
                  <td className="py-3 px-4">
                    <a
                      href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${tx.from}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white"
                      title={tx.from}
                    >
                      {formatAddr(tx.from)}
                    </a>
                  </td>

                  {/* Flow Arrow */}
                  <td className="py-3 px-1 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </td>

                  {/* Recipient */}
                  <td className="py-3 px-4">
                    <a
                      href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${tx.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white"
                      title={tx.to}
                    >
                      {formatAddr(tx.to)}
                    </a>
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {tx.valueFormatted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>

                  {/* Token */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded">
                      {tx.tokenSymbol}
                    </span>
                  </td>

                  {/* Block Number */}
                  <td className="py-3 px-4">
                    <a
                      href={`${BOT_CHAIN_CONFIG.explorerUrl}/block/${tx.blockNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-200"
                    >
                      #{tx.blockNumber}
                    </a>
                  </td>

                  {/* Transfer Time */}
                  <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

