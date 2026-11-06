"use client";

import React, { useState } from "react";
import { AddressActivity } from "@/types";
import { ExternalLink, Copy, Check, Users } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";

interface ActiveAddressesTableProps {
  addresses: AddressActivity[];
  tokenSymbol: string;
}

export function ActiveAddressesTable({
  addresses,
  tokenSymbol,
}: ActiveAddressesTableProps) {
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const copy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const formatAddr = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Frequently Active Large-Transfer Addresses
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by transaction frequency and cumulative whale volume
            </p>
          </div>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
          {addresses.length} Identified Wallets
        </span>
      </div>

      {addresses.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No active large-transfer wallets identified for this query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank & Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Transfers (Sent / Recv)</th>
                <th className="py-3 px-4 text-right">Volume Sent</th>
                <th className="py-3 px-4 text-right">Volume Received</th>
                <th className="py-3 px-4 text-right">Total Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {addresses.map((item, index) => (
                <tr key={item.address} className="hover:bg-slate-800/60 transition-colors">
                  {/* Rank & Address */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 text-slate-500 text-right font-mono text-[11px]">
                        #{index + 1}
                      </span>
                      <a
                        href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${item.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 flex items-center space-x-1 font-semibold"
                        title={item.address}
                      >
                        <span>{formatAddr(item.address)}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <button
                        type="button"
                        onClick={() => copy(item.address)}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Copy Address"
                      >
                        {copiedAddr === item.address ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Role Tag */}
                  <td className="py-3 px-4 font-sans">
                    {item.isTopSender ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-900/60 border border-blue-700 text-blue-200 rounded">
                        Top Sender
                      </span>
                    ) : item.isTopRecipient ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-900/60 border border-emerald-700 text-emerald-200 rounded">
                        Top Recipient
                      </span>
                    ) : item.sentCount > 0 && item.receivedCount > 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300 rounded">
                        Two-way Whale
                      </span>
                    ) : item.sentCount > 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300 rounded">
                        Sender
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300 rounded">
                        Recipient
                      </span>
                    )}
                  </td>

                  {/* Counts */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-white font-bold">{item.totalTransfers}</span>{" "}
                    <span className="text-slate-500 text-[11px]">
                      ({item.sentCount} out / {item.receivedCount} in)
                    </span>
                  </td>

                  {/* Volume Sent */}
                  <td className="py-3 px-4 text-right">
                    {item.volumeSent > 0 ? (
                      <span className="text-slate-200">
                        {item.volumeSent.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                        {tokenSymbol}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Volume Received */}
                  <td className="py-3 px-4 text-right">
                    {item.volumeReceived > 0 ? (
                      <span className="text-emerald-400">
                        {item.volumeReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                        {tokenSymbol}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Total Volume */}
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {item.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                    {tokenSymbol}
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

